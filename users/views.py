from rest_framework import status, views, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from django.db import transaction

from guio_core.models import Usuario, Rol, LogAuditoria
from users.serializers import (
    LoginSerializer,
    RegistroUsuarioSerializer,
    UsuarioPerfilSerializer,
    AdminUsuarioSerializer,
    RolSerializer,
    LogAuditoriaSerializer,
)
from users.permissions import EsAdministrador


class LoginView(views.APIView):
    """
    HU-01: Autenticación de usuario con email y contraseña (Bcrypt).
    Maneja límite de 5 intentos fallidos y bloqueo temporal (RNF-02).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class RegistroView(views.APIView):
    """
    HU-01: Registro público de evaluadores.
    Asigna rol 'evaluador' por defecto y hashea con Bcrypt.
    """
    permission_classes = [AllowAny]

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
