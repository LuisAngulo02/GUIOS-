from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from guio_core.models import Usuario, Rol, LogAuditoria


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ["id", "nombre"]


class UsuarioPerfilSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source="id_rol.nombre", read_only=True)

    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "rol",
            "id_rol",
            "activo",
            "fecha_creacion",
        ]
        read_only_fields = ["id", "rol", "fecha_creacion"]


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={"input_type": "password"},
        error_messages={"min_length": "La contraseña debe tener al menos 8 caracteres."}
    )

    class Meta:
        model = Usuario
        fields = ["id", "nombre", "email", "password"]

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con este correo electrónico.")
        return value.lower()

    def create(self, validated_data):
        # Asigna el rol 'evaluador' por defecto según la HU-01
        rol_evaluador, _ = Rol.objects.get_or_create(
            nombre=Rol.TipoRol.EVALUADOR
        )
        usuario = Usuario.objects.create_user(
            email=validated_data["email"],
            nombre=validated_data["nombre"],
            password=validated_data["password"],
            id_rol=rol_evaluador,
            activo=True,
        )
        return usuario


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        email = attrs.get("email", "").lower().strip()
        password = attrs.get("password")

        try:
            usuario = Usuario.objects.get(email__iexact=email)
        except Usuario.DoesNotExist:
            raise serializers.ValidationError({"detail": "Credenciales inválidas."})

        # 1. Comprobar baja lógica
        if not usuario.activo:
            raise serializers.ValidationError(
                {"detail": "Esta cuenta ha sido desactivada. Comuníquese con el administrador."}
            )

        # 2. Comprobar bloqueo temporal de seguridad (RNF-02)
        ahora = timezone.now()
        if usuario.bloqueado_hasta and usuario.bloqueado_hasta > ahora:
            minutos_restantes = max(1, int((usuario.bloqueado_hasta - ahora).total_seconds() // 60))
            raise serializers.ValidationError(
                {
                    "detail": (
                        f"Cuenta bloqueada temporalmente por seguridad tras 5 intentos fallidos. "
                        f"Intente nuevamente en {minutos_restantes} minuto(s)."
                    )
                }
            )

        # 3. Validar contraseña cifrada con Bcrypt
        if not usuario.check_password(password):
            usuario.intentos_fallidos += 1
            if usuario.intentos_fallidos >= 5:
                # Bloqueo temporal por 15 minutos (RNF-02)
                usuario.bloqueado_hasta = ahora + timedelta(minutes=15)
                usuario.save(update_fields=["intentos_fallidos", "bloqueado_hasta"])
                raise serializers.ValidationError(
                    {
                        "detail": (
                            "Ha superado el límite de 5 intentos fallidos consecutivos. "
                            "La cuenta ha sido bloqueada temporalmente por 15 minutos."
                        )
                    }
                )
            else:
                usuario.save(update_fields=["intentos_fallidos"])
                intentos_restantes = 5 - usuario.intentos_fallidos
                raise serializers.ValidationError(
                    {
                        "detail": f"Credenciales inválidas. Le quedan {intentos_restantes} intento(s) antes del bloqueo."
                    }
                )

        # 4. Éxito: restablecer intentos fallidos y bloqueo
        if usuario.intentos_fallidos > 0 or usuario.bloqueado_hasta is not None:
            usuario.intentos_fallidos = 0
            usuario.bloqueado_hasta = None
            usuario.save(update_fields=["intentos_fallidos", "bloqueado_hasta"])

        # Generar tokens JWT
        refresh = RefreshToken.for_user(usuario)
        refresh["nombre"] = usuario.nombre
        refresh["email"] = usuario.email
        refresh["rol"] = usuario.id_rol.nombre

        return {
            "user": UsuarioPerfilSerializer(usuario).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class AdminUsuarioSerializer(serializers.ModelSerializer):
    """Serializer para el panel de administración de usuarios (HU-02)."""
    rol_nombre = serializers.CharField(source="id_rol.nombre", read_only=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=8,
        error_messages={"min_length": "La contraseña debe tener al menos 8 caracteres."}
    )

    class Meta:
        model = Usuario
        fields = [
            "id",
            "nombre",
            "email",
            "password",
            "id_rol",
            "rol_nombre",
            "activo",
            "intentos_fallidos",
            "bloqueado_hasta",
            "fecha_creacion",
        ]
        read_only_fields = ["id", "fecha_creacion", "intentos_fallidos", "bloqueado_hasta"]

    def validate_email(self, value):
        user_id = self.instance.id if self.instance else None
        if Usuario.objects.filter(email__iexact=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("Ya existe un usuario registrado con este correo electrónico.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario.objects.create(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password("Guios2026!")
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LogAuditoriaSerializer(serializers.ModelSerializer):
    """Serializer para la bitácora de auditoría administrativa (HU-02)."""
    usuario_email = serializers.CharField(source="id_usuario.email", default="Sistema", read_only=True)
    usuario_nombre = serializers.CharField(source="id_usuario.nombre", default="Sistema", read_only=True)

    class Meta:
        model = LogAuditoria
        fields = [
            "id",
            "id_usuario",
            "usuario_email",
            "usuario_nombre",
            "accion",
            "entidad",
            "id_entidad",
            "detalle",
            "fecha",
        ]
        read_only_fields = fields
