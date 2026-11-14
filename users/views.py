import logging
from rest_framework import status, views, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.db import transaction
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from guio_core.models import Usuario, Rol, LogAuditoria

logger = logging.getLogger(__name__)
from users.serializers import (
    LoginSerializer,
    RegistroUsuarioSerializer,
    UsuarioPerfilSerializer,
    AdminUsuarioSerializer,
    RolSerializer,
    LogAuditoriaSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from users.permissions import EsAdministrador


class LoginView(views.APIView):
    """
    HU-01: Autenticación de usuario con email y contraseña (Bcrypt).
    Maneja límite de 5 intentos fallidos y bloqueo temporal (RNF-02).
    Rate-limiting aplicado para mitigar ataques de fuerza bruta y DoS de bloqueo.
    """
    permission_classes = [AllowAny]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    """
    Cierre de sesión seguro con invalidación de Refresh Token en SimpleJWT blacklist.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Se requiere el refresh token para cerrar sesión."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Sesión cerrada e invalidada exitosamente."},
                status=status.HTTP_200_OK,
            )
        except TokenError:
            return Response(
                {"detail": "Token inválido o ya revocado."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RegistroView(views.APIView):
    """
    HU-01: Registro público de evaluadores.
    Asigna rol 'evaluador' por defecto y hashea con Bcrypt.
    Rate-limiting aplicado para mitigar spam de cuentas.
    """
    permission_classes = [AllowAny]
    throttle_scope = "auth_register"

    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()

        # Registrar log de auditoría
        LogAuditoria.objects.create(
            id_usuario=usuario,
            accion="registro_usuario",
            entidad="usuario",
            id_entidad=str(usuario.id),
            detalle=f"Registro de nuevo usuario evaluador: {usuario.email}",
        )

        return Response(
            {
                "message": "Usuario registrado exitosamente.",
                "user": UsuarioPerfilSerializer(usuario).data,
            },
            status=status.HTTP_201_CREATED,
        )


class PerfilView(views.APIView):
    """Obtiene los datos del usuario autenticado."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioPerfilSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUsuariosViewSet(viewsets.ModelViewSet):
    """
    HU-02: Gestión de usuarios por el Administrador.
    Permite listado, cambio de rol, reactivación y baja lógica con registro en log_auditoria.
    """
    permission_classes = [IsAuthenticated, EsAdministrador]
    queryset = Usuario.objects.select_related("id_rol").order_by("-fecha_creacion")
    serializer_class = AdminUsuarioSerializer

    def perform_create(self, serializer):
        """Registra la creación de usuario en el log de auditoría."""
        usuario = serializer.save()
        LogAuditoria.objects.create(
            id_usuario=self.request.user,
            accion="crear_usuario",
            entidad="usuario",
            id_entidad=str(usuario.id),
            detalle=f"Creación administrativa de usuario {usuario.email} con rol {usuario.id_rol.nombre}",
        )

    def perform_destroy(self, instance):
        """Implementa baja lógica en lugar de borrado físico (RNF de persistencia)."""
        if instance.id == self.request.user.id:
            raise serializers.ValidationError(
                {"detail": "No puedes desactivar tu propia cuenta de administrador activo."}
            )

        if instance.id_rol.nombre == Rol.TipoRol.ADMINISTRADOR and instance.activo:
            otros_admins = Usuario.objects.filter(
                id_rol__nombre=Rol.TipoRol.ADMINISTRADOR,
                activo=True
            ).exclude(id=instance.id).count()
            if otros_admins == 0:
                raise serializers.ValidationError(
                    {"detail": "No se puede desactivar al único Administrador activo del sistema."}
                )

        instance.activo = False
        instance.save(update_fields=["activo"])

        LogAuditoria.objects.create(
            id_usuario=self.request.user,
            accion="desactivar_usuario",
            entidad="usuario",
            id_entidad=str(instance.id),
            detalle=f"Baja lógica aplicada al usuario {instance.email}",
        )

    @action(detail=True, methods=["post"], url_path="cambiar-estado")
    def cambiar_estado(self, request, pk=None):
        """Activar o desactivar cuenta de usuario."""
        usuario = self.get_object()
        if usuario.id == request.user.id:
            return Response(
                {"detail": "No puedes modificar el estado de tu propia cuenta."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nuevo_estado = not usuario.activo

        # Si se va a desactivar a un administrador, asegurar que quede al menos uno activo
        if not nuevo_estado and usuario.id_rol.nombre == Rol.TipoRol.ADMINISTRADOR:
            otros_admins = Usuario.objects.filter(
                id_rol__nombre=Rol.TipoRol.ADMINISTRADOR,
                activo=True
            ).exclude(id=usuario.id).count()
            if otros_admins == 0:
                return Response(
                    {"detail": "No se puede desactivar al único Administrador activo del sistema."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        usuario.activo = nuevo_estado
        if nuevo_estado:
            # Si se reactiva, desbloquear y limpiar intentos fallidos
            usuario.intentos_fallidos = 0
            usuario.bloqueado_hasta = None
            usuario.save(update_fields=["activo", "intentos_fallidos", "bloqueado_hasta"])
        else:
            usuario.save(update_fields=["activo"])

        LogAuditoria.objects.create(
            id_usuario=request.user,
            accion="activar_usuario" if nuevo_estado else "desactivar_usuario",
            entidad="usuario",
            id_entidad=str(usuario.id),
            detalle=f"Estado del usuario {usuario.email} cambiado a: {'Activo' if nuevo_estado else 'Inactivo'}",
        )

        return Response(
            {
                "message": f"Usuario {'activado' if nuevo_estado else 'desactivado'} con éxito.",
                "user": AdminUsuarioSerializer(usuario).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="cambiar-rol")
    def cambiar_rol(self, request, pk=None):
        """Cambia el rol del usuario (ej. de evaluador a administrador o viceversa)."""
        usuario = self.get_object()
        id_rol = request.data.get("id_rol")

        try:
            rol = Rol.objects.get(id=id_rol)
        except Rol.DoesNotExist:
            return Response(
                {"detail": "El rol especificado no existe."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevenir auto-degradación de privilegios de administrador
        if usuario.id == request.user.id and rol.nombre != Rol.TipoRol.ADMINISTRADOR:
            return Response(
                {"detail": "No puedes revocar tus propios privilegios de Administrador."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevenir degradar al último administrador activo del sistema
        if usuario.id_rol.nombre == Rol.TipoRol.ADMINISTRADOR and rol.nombre != Rol.TipoRol.ADMINISTRADOR:
            otros_admins = Usuario.objects.filter(
                id_rol__nombre=Rol.TipoRol.ADMINISTRADOR,
                activo=True
            ).exclude(id=usuario.id).count()
            if otros_admins == 0:
                return Response(
                    {"detail": "No se puede degradar al único Administrador activo del sistema."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        rol_anterior = usuario.id_rol.nombre
        usuario.id_rol = rol
        usuario.save(update_fields=["id_rol"])

        LogAuditoria.objects.create(
            id_usuario=request.user,
            accion="cambiar_rol_usuario",
            entidad="usuario",
            id_entidad=str(usuario.id),
            detalle=f"Cambio de rol para {usuario.email}: {rol_anterior} -> {rol.nombre}",
        )

        return Response(
            {
                "message": f"Rol de usuario actualizado a {rol.get_nombre_display()}.",
                "user": AdminUsuarioSerializer(usuario).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="desbloquear")
    def desbloquear(self, request, pk=None):
        """Desbloquea una cuenta bloqueada por exceso de intentos fallidos (RNF-02)."""
        usuario = self.get_object()
        usuario.intentos_fallidos = 0
        usuario.bloqueado_hasta = None
        usuario.save(update_fields=["intentos_fallidos", "bloqueado_hasta"])

        LogAuditoria.objects.create(
            id_usuario=request.user,
            accion="desbloquear_usuario",
            entidad="usuario",
            id_entidad=str(usuario.id),
            detalle=f"Desbloqueo de seguridad aplicado al usuario {usuario.email}",
        )

        return Response(
            {
                "message": f"Cuenta de {usuario.email} desbloqueada exitosamente.",
                "user": AdminUsuarioSerializer(usuario).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="auditoria")
    def logs_auditoria(self, request):
        """Bitácora en log_auditoria de eventos administrativos (HU-02)."""
        logs = LogAuditoria.objects.select_related("id_usuario").order_by("-fecha")[:60]
        return Response(LogAuditoriaSerializer(logs, many=True).data, status=status.HTTP_200_OK)


class RolesListView(views.APIView):
    """Lista los roles disponibles para el panel administrativo."""
    permission_classes = [IsAuthenticated, EsAdministrador]

    def get(self, request):
        roles = Rol.objects.all()
        return Response(RolSerializer(roles, many=True).data, status=status.HTTP_200_OK)


class PasswordResetRequestView(views.APIView):
    """
    Solicitud de restablecimiento de contraseña.
    Genera un token firmado con PasswordResetTokenGenerator y envía enlace seguro al email.
    Aplica protección contra enumeración de usuarios respondiendo siempre un mensaje genérico.
    """
    permission_classes = [AllowAny]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        # Buscar usuario activo
        user = Usuario.objects.filter(email__iexact=email, activo=True).first()
        reset_url = ""
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            asunto = "Recuperación de contraseña — GUIOS+"
            mensaje_texto = (
                f"Hola {user.nombre},\n\n"
                f"Hemos recibido una solicitud para restablecer tu contraseña en la plataforma GUIOS+.\n\n"
                f"Para definir una nueva contraseña, haz clic en el siguiente enlace o cópialo en tu navegador:\n"
                f"{reset_url}\n\n"
                f"Este enlace es válido durante 1 hora y puede utilizarse una sola vez.\n"
                f"Si tú no solicitaste este cambio, puedes ignorar este correo; tu cuenta seguirá protegida.\n\n"
                f"Atentamente,\n"
                f"El equipo de GUIOS+"
            )
            mensaje_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{asunto}</title>
  <style>
    body {{ margin: 0; padding: 24px 0; background-color: #F3F6F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; -webkit-font-smoothing: antialiased; }}
    .container {{ max-width: 540px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #DDE7E1; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }}
    .header {{ background: linear-gradient(135deg, #2F5444 0%, #1E382D 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }}
    .logo-badge {{ display: inline-block; width: 44px; height: 44px; line-height: 44px; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.3); border-radius: 12px; font-weight: 800; font-size: 18px; margin-bottom: 8px; }}
    .brand-title {{ font-size: 22px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }}
    .brand-sub {{ font-size: 12px; color: #D1E2D9; margin-top: 4px; }}
    .content {{ padding: 32px 28px; line-height: 1.6; font-size: 14px; color: #374151; }}
    .greeting {{ font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 12px; }}
    .btn-container {{ text-align: center; margin: 28px 0; }}
    .btn {{ display: inline-block; background-color: #2F5444; color: #FFFFFF !important; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 6px rgba(47,84,68,0.35); }}
    .note-box {{ background-color: #F8FAF9; border-left: 3px solid #3F6F58; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #4B5563; margin-top: 20px; }}
    .footer {{ padding: 22px 28px; background-color: #FAFCFA; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; text-align: center; }}
    .url-text {{ word-break: break-all; font-size: 11px; color: #2F5444; text-decoration: underline; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">G+</div>
      <div class="brand-title">GUIOS+</div>
      <div class="brand-sub">Evaluación inteligente para adopción FLOSS</div>
    </div>
    <div class="content">
      <div class="greeting">Hola {user.nombre},</div>
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta institucional en <strong>GUIOS+</strong>.</p>
      <p>Para crear una nueva clave y acceder a tu cuenta, haz clic en el siguiente botón:</p>
      <div class="btn-container">
        <a href="{reset_url}" class="btn" target="_blank" rel="noopener noreferrer">Restablecer mi contraseña</a>
      </div>
      <div class="note-box">
        <strong>Vigencia del enlace:</strong> Este enlace es de uso único y expirará automáticamente en <strong>1 hora</strong> por motivos de seguridad.
      </div>
      <p style="margin-top: 24px; font-size: 12px; color: #6B7280;">
        Si el botón anterior no responde, copia y pega el siguiente enlace directo en tu navegador web:<br>
        <a href="{reset_url}" class="url-text">{reset_url}</a>
      </p>
      <p style="font-size: 11px; color: #9CA3AF; margin-top: 20px; border-top: 1px dashed #E5E7EB; pt: 16px;">
        Si tú no solicitaste este cambio, no es necesario realizar ninguna acción. Tu contraseña actual seguirá siendo segura y tu cuenta permanecerá protegida.
      </p>
    </div>
    <div class="footer">
      © {user.fecha_creacion.year if hasattr(user, 'fecha_creacion') and user.fecha_creacion else 2026} GUIOS+ · Plataforma de Adopción de Software Libre. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>"""

            try:
                send_mail(
                    subject=asunto,
                    message=mensaje_texto,
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "GUIOS+ <no-reply@guiosplus.org>"),
                    recipient_list=[user.email],
                    fail_silently=False,
                    html_message=mensaje_html,
                )
            except Exception as e:
                logger.error("Error al enviar correo de recuperación a %s: %s", user.email, e, exc_info=True)

            LogAuditoria.objects.create(
                id_usuario=user,
                accion="solicitar_reset_password",
                entidad="usuario",
                id_entidad=str(user.id),
                detalle=f"Solicitud de restablecimiento de contraseña para {user.email}",
            )

        resp_data = {
            "message": "Si el correo electrónico está registrado en el sistema, recibirás un enlace de recuperación en breve. Revisa tu bandeja de entrada o carpeta de spam.",
        }

        return Response(resp_data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(views.APIView):
    """
    Confirmación de nueva contraseña mediante UID y Token.
    Valida firma criptográfica, vigencia temporal y actualiza la contraseña de forma segura.
    """
    permission_classes = [AllowAny]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid_b64 = serializer.validated_data["uid"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            uid = force_str(urlsafe_base64_decode(uid_b64))
            user = Usuario.objects.get(pk=uid, activo=True)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response(
                {"detail": "El enlace de restablecimiento es inválido o el usuario no existe."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "El enlace de restablecimiento ha expirado o ya fue utilizado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Actualizar contraseña de forma segura
        user.set_password(new_password)
        # Desbloquear usuario si estaba bloqueado por intentos fallidos
        user.intentos_fallidos = 0
        user.bloqueado_hasta = None
        user.save(update_fields=["password", "intentos_fallidos", "bloqueado_hasta"])

        LogAuditoria.objects.create(
            id_usuario=user,
            accion="confirmar_reset_password",
            entidad="usuario",
            id_entidad=str(user.id),
            detalle=f"Contraseña restablecida exitosamente para {user.email}",
        )

        return Response(
            {"message": "Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."},
            status=status.HTTP_200_OK,
        )
