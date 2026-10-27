from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


# ==============================================================================
# 1. ROL
# ==============================================================================
class Rol(models.Model):
    """Roles de acceso del sistema (Administrador, Evaluador)."""
    class TipoRol(models.TextChoices):
        ADMINISTRADOR = "administrador", "Administrador"
        EVALUADOR = "evaluador", "Evaluador"

    nombre = models.CharField(
        max_length=50,
        unique=True,
        choices=TipoRol.choices,
        verbose_name="Nombre del Rol"
    )

    class Meta:
        db_table = "rol"
        verbose_name = "Rol"
        verbose_name_plural = "Roles"

    def __str__(self):
        return self.get_nombre_display()


# ==============================================================================
# 2. USUARIO (Compatible con AUTH_USER_MODEL de Django y Bcrypt)
# ==============================================================================
class UsuarioManager(BaseUserManager):
    """Manager personalizado para autenticación mediante Email."""
    def create_user(self, email, nombre, password=None, **extra_fields):
        if not email:
            raise ValueError("El correo electrónico es obligatorio.")
        email = self.normalize_email(email)
        user = self.model(email=email, nombre=nombre, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nombre, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("activo", True)

        # Asignar o crear rol administrador por defecto si no viene
        rol_admin, _ = Rol.objects.get_or_create(nombre=Rol.TipoRol.ADMINISTRADOR)
        extra_fields.setdefault("id_rol", rol_admin)

        return self.create_user(email, nombre, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Usuario del sistema con soporte para baja lógica, bloqueo de seguridad
    y autenticación por email con hashing de contraseña (Bcrypt).
    """
    nombre = models.CharField(max_length=150, verbose_name="Nombre Completo")
    email = models.EmailField(max_length=255, unique=True, verbose_name="Correo Electrónico")
    id_rol = models.ForeignKey(
        Rol,
        on_delete=models.RESTRICT,
        related_name="usuarios",
        db_column="id_rol",
        verbose_name="Rol Asignado"
    )
    activo = models.BooleanField(default=True, verbose_name="Activo (Baja Lógica)")
    intentos_fallidos = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Intentos Fallidos de Inicio de Sesión"
    )
    bloqueado_hasta = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Bloqueado Hasta"
    )
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Creación"
    )

    # Campos técnicos para compatibilidad con el Admin y permisos de Django
    is_staff = models.BooleanField(default=False, verbose_name="Es Staff de Admin")

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre"]

    class Meta:
        db_table = "usuario"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        indexes = [
            models.Index(fields=["email"], name="idx_usuario_email"),
            models.Index(fields=["activo"], name="idx_usuario_activo"),
        ]

    @property
    def is_active(self):
        """Mapeo para compatibilidad con Django auth."""
        if not self.activo:
            return False
        if self.bloqueado_hasta and self.bloqueado_hasta > timezone.now():
            return False
        return True

    def __str__(self):
        return f"{self.nombre} ({self.email})"


# ==============================================================================
# 3. DIMENSION
# ==============================================================================
class Dimension(models.Model):
    """Dimensiones de análisis GUIOS (Tecnológica, Organizacional, Económica)."""
    class NombreDimension(models.TextChoices):
        TECNOLOGICA = "Tecnológica", "Tecnológica"
        ORGANIZACIONAL = "Organizacional", "Organizacional"
        ECONOMICA = "Económica", "Económica"

    nombre = models.CharField(
        max_length=100,
        unique=True,
        choices=NombreDimension.choices,
        verbose_name="Nombre de la Dimensión"
    )
    activo = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        db_table = "dimension"
        verbose_name = "Dimensión"
        verbose_name_plural = "Dimensiones"

    def __str__(self):
        return self.nombre


# ==============================================================================
# 4. FACTOR
# ==============================================================================
class Factor(models.Model):
    """Factores de influencia para la adopción de soluciones FLOSS."""
    class AlcanceFactor(models.TextChoices):
        INTERNO = "Interno", "Interno"
        EXTERNO = "Externo", "Externo"
        AMBOS = "Ambos", "Ambos"

    nombre = models.CharField(max_length=150, unique=True, verbose_name="Nombre del Factor")
    descripcion = models.TextField(blank=True, default="", verbose_name="Descripción")
    id_dimension = models.ForeignKey(
        Dimension,
        on_delete=models.RESTRICT,
        related_name="factores",
        db_column="id_dimension",
        verbose_name="Dimensión"
    )
    importancia_literatura = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        help_text="Importancia sugerida por la literatura científica (1 a 4)",
        verbose_name="Importancia Literatura (IS)"
    )
    alcance = models.CharField(
        max_length=20,
        choices=AlcanceFactor.choices,
        default=AlcanceFactor.INTERNO,
        verbose_name="Alcance (FODA)"
    )
    activo = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        db_table = "factor"
        verbose_name = "Factor"
        verbose_name_plural = "Factores"
        indexes = [
            models.Index(fields=["id_dimension"], name="idx_factor_dimension"),
        ]

    def __str__(self):
        return self.nombre


# ==============================================================================
# 5. SUBFACTOR
# ==============================================================================
class Subfactor(models.Model):
    """Subfactores / reactivos específicos (SF-01 a SF-61)."""
    codigo = models.CharField(
        max_length=10,
        unique=True,
        verbose_name="Código (SF-01 a SF-61)"
    )
    descripcion = models.TextField(verbose_name="Descripción / Reactivo")
    id_factor = models.ForeignKey(
        Factor,
        on_delete=models.RESTRICT,
        related_name="subfactores",
        db_column="id_factor",
        verbose_name="Factor Padre"
    )
    activo = models.BooleanField(default=True, verbose_name="Activo")

    class Meta:
        db_table = "subfactor"
        verbose_name = "Subfactor"
        verbose_name_plural = "Subfactores"
        indexes = [
            models.Index(fields=["id_factor"], name="idx_subfactor_factor"),
        ]

    def __str__(self):
        return f"{self.codigo} - {self.descripcion[:60]}..."


# ==============================================================================
# 6. RECOMENDACION
# ==============================================================================
class Recomendacion(models.Model):
    """Catálogo de tipos de recomendación final y dictámenes según la tesis."""
    class TipoRecomendacion(models.TextChoices):
        TIPO_A = "A", "Recomendación A (Crítico / No Viable)"
        TIPO_B = "B", "Recomendación B (Viable con Reservas)"
        TIPO_C = "C", "Recomendación C (Favorable / Plenamente Viable)"

    tipo = models.CharField(
        max_length=5,
        unique=True,
        choices=TipoRecomendacion.choices,
        verbose_name="Tipo de Recomendación"
    )
    titulo = models.CharField(max_length=200, verbose_name="Título del Dictamen")
    descripcion_regla = models.TextField(verbose_name="Descripción de la Regla de Inferencia")
    texto_orientador = models.TextField(verbose_name="Texto Orientador para el Decisor")
    activo = models.BooleanField(default=True, verbose_name="Activo")
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")

    class Meta:
        db_table = "recomendacion"
        verbose_name = "Recomendación"
        verbose_name_plural = "Recomendaciones"

    def __str__(self):
        return f"Tipo {self.tipo}: {self.titulo}"


# ==============================================================================
# 7. EVALUACION
# ==============================================================================
class Evaluacion(models.Model):
    """Instancia de evaluación de adopción de una solución de software libre."""
    class EstadoEvaluacion(models.TextChoices):
        EN_PROGRESO = "en_progreso", "En Progreso"
        COMPLETADA = "completada", "Completada"
        CANCELADA = "cancelada", "Cancelada"

    class NivelConfianza(models.TextChoices):
        ALTO = "Alto", "Alto"
        MEDIO = "Medio", "Medio"
        BAJO = "Bajo", "Bajo"

    nombre_software = models.CharField(
        max_length=150,
        verbose_name="Nombre de la Solución FLOSS"
    )
    id_usuario = models.ForeignKey(
        Usuario,
        on_delete=models.RESTRICT,
        related_name="evaluaciones",
        db_column="id_usuario",
        verbose_name="Evaluador Responsable"
    )
    fecha_inicio = models.DateTimeField(default=timezone.now, verbose_name="Fecha de Inicio")
    fecha_fin = models.DateTimeField(null=True, blank=True, verbose_name="Fecha de Finalización")
    estado = models.CharField(
        max_length=20,
        choices=EstadoEvaluacion.choices,
        default=EstadoEvaluacion.EN_PROGRESO,
        verbose_name="Estado"
    )
    id_recomendacion = models.ForeignKey(
        Recomendacion,
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        related_name="evaluaciones",
        db_column="id_recomendacion",
        verbose_name="Recomendación Obtenida"
    )
    indice_viabilidad = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Índice de Viabilidad (%)"
    )
    nivel_confianza = models.CharField(
        max_length=10,
        choices=NivelConfianza.choices,
        null=True,
        blank=True,
        verbose_name="Nivel de Confianza (Alto, Medio, Bajo)"
    )
    dictamen_texto = models.TextField(
        null=True,
        blank=True,
        help_text="Copia congelada e inmutable del dictamen al momento de completarse la evaluación",
        verbose_name="Dictamen (Snapshot)"
    )

    class Meta:
        db_table = "evaluacion"
        verbose_name = "Evaluación"
        verbose_name_plural = "Evaluaciones"
        indexes = [
            models.Index(fields=["id_usuario"], name="idx_evaluacion_usuario"),
            models.Index(fields=["estado"], name="idx_evaluacion_estado"),
        ]

    def __str__(self):
        return f"{self.nombre_software} - {self.id_usuario.nombre} ({self.get_estado_display()})"


# ==============================================================================
# 8. RESULTADO FACTOR
# ==============================================================================
class ResultadoFactor(models.Model):
    """Paso 1 y 2: Importancia decisor, importancia relativa y alcance congelado."""
    class ImportanciaRelativaTexto(models.TextChoices):
        IRRELEVANTE = "Irrelevante", "Irrelevante (1)"
        OPCIONAL = "Opcional", "Opcional (2)"
        IMPORTANTE = "Importante", "Importante (3)"
        FUNDAMENTAL = "Fundamental", "Fundamental (4)"

    id_evaluacion = models.ForeignKey(
        Evaluacion,
        on_delete=models.CASCADE,
        related_name="resultados_factor",
        db_column="id_evaluacion",
        verbose_name="Evaluación"
    )
    id_factor = models.ForeignKey(
        Factor,
        on_delete=models.RESTRICT,
        related_name="evaluaciones_factor",
        db_column="id_factor",
        verbose_name="Factor Evaluado"
    )
    nombre_factor = models.CharField(
        max_length=150,
        verbose_name="Nombre Factor (Copia Congelada)"
    )
    importancia_decisor = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        verbose_name="Importancia Decisor (ID: 1 a 4)"
    )
    importancia_relativa = models.CharField(
        max_length=15,
        choices=ImportanciaRelativaTexto.choices,
        default=ImportanciaRelativaTexto.IRRELEVANTE,
        verbose_name="Importancia Relativa (IR)"
    )
    alcance_aplicado = models.CharField(
        max_length=20,
        choices=Factor.AlcanceFactor.choices,
        null=True,
        blank=True,
        verbose_name="Alcance Aplicado"
    )

    class Meta:
        db_table = "resultado_factor"
        verbose_name = "Resultado por Factor"
        verbose_name_plural = "Resultados por Factor"
        constraints = [
            models.UniqueConstraint(
                fields=["id_evaluacion", "id_factor"],
                name="unique_resultado_factor_por_evaluacion"
            )
        ]

    def __str__(self):
        return f"Eval #{self.id_evaluacion_id} - Factor: {self.nombre_factor} (IR: {self.importancia_relativa})"


# ==============================================================================
# 9. RESULTADO SUBFACTOR
# ==============================================================================
class ResultadoSubfactor(models.Model):
    """Paso 3 y 4: Calificación de reactivos/subfactores (1 a 4) y observaciones."""
    id_evaluacion = models.ForeignKey(
        Evaluacion,
        on_delete=models.CASCADE,
        related_name="resultados_subfactor",
        db_column="id_evaluacion",
        verbose_name="Evaluación"
    )
    id_subfactor = models.ForeignKey(
        Subfactor,
        on_delete=models.RESTRICT,
        related_name="evaluaciones_subfactor",
        db_column="id_subfactor",
        verbose_name="Subfactor Calificado"
    )
    calificacion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(4)],
        verbose_name="Calificación (1 a 4)"
    )
    observacion = models.TextField(
        null=True,
        blank=True,
        help_text="Observación y justificación técnica del evaluador para este reactivo (RF-08 / HU-05)",
        verbose_name="Observación"
    )

    class Meta:
        db_table = "resultado_subfactor"
        verbose_name = "Resultado por Subfactor"
        verbose_name_plural = "Resultados por Subfactor"
        constraints = [
            models.UniqueConstraint(
                fields=["id_evaluacion", "id_subfactor"],
                name="unique_resultado_subfactor_por_evaluacion"
            )
        ]

    def __str__(self):
        return f"Eval #{self.id_evaluacion_id} - Subfactor #{self.id_subfactor_id}: Nota {self.calificacion}"


# ==============================================================================
# 10. RESULTADO FODA
# ==============================================================================
class ResultadoFoda(models.Model):
    """Paso 5: Diagnóstico FODA/DAFO por factor y detección de puntos críticos."""
    class CategoriaFoda(models.TextChoices):
        FORTALEZA = "fortaleza", "Fortaleza"
        DEBILIDAD = "debilidad", "Debilidad"
        OPORTUNIDAD = "oportunidad", "Oportunidad"
        AMENAZA = "amenaza", "Amenaza"

    id_evaluacion = models.ForeignKey(
        Evaluacion,
        on_delete=models.CASCADE,
        related_name="resultados_foda",
        db_column="id_evaluacion",
        verbose_name="Evaluación"
    )
    id_factor = models.ForeignKey(
        Factor,
        on_delete=models.RESTRICT,
        related_name="evaluaciones_foda",
        db_column="id_factor",
        verbose_name="Factor Asociado"
    )
    ponderacion_media = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        verbose_name="Ponderación Media (PM)"
    )
    categoria = models.CharField(
        max_length=20,
        choices=CategoriaFoda.choices,
        verbose_name="Categoría FODA"
    )
    critico = models.BooleanField(
        default=False,
        help_text="True si representa debilidad o amenaza en factor importante/fundamental",
        verbose_name="¿Es Crítico?"
    )

    class Meta:
        db_table = "resultado_foda"
        verbose_name = "Resultado FODA"
        verbose_name_plural = "Resultados FODA"
        constraints = [
            models.UniqueConstraint(
                fields=["id_evaluacion", "id_factor"],
                name="unique_resultado_foda_por_evaluacion"
            )
        ]

    def __str__(self):
        return f"Eval #{self.id_evaluacion_id} - Factor #{self.id_factor_id}: {self.categoria} (PM: {self.ponderacion_media})"


# ==============================================================================
# 11. LOG AUDITORIA
# ==============================================================================
class LogAuditoria(models.Model):
    """Trazabilidad y registro de acciones administrativas y operativas."""
    id_usuario = models.ForeignKey(
        Usuario,
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        related_name="logs_auditoria",
        db_column="id_usuario",
        verbose_name="Usuario Ejecutor"
    )
    accion = models.CharField(max_length=100, verbose_name="Acción Realizada")
    entidad = models.CharField(max_length=100, verbose_name="Entidad Afectada")
    id_entidad = models.CharField(max_length=50, verbose_name="ID de la Entidad Afectada")
    detalle = models.TextField(blank=True, default="", verbose_name="Detalle del Evento")
    fecha = models.DateTimeField(default=timezone.now, verbose_name="Fecha y Hora")

    class Meta:
        db_table = "log_auditoria"
        verbose_name = "Log de Auditoría"
        verbose_name_plural = "Logs de Auditoría"
        indexes = [
            models.Index(fields=["id_usuario"], name="idx_log_usuario"),
            models.Index(fields=["entidad", "id_entidad"], name="idx_log_entidad"),
            models.Index(fields=["fecha"], name="idx_log_fecha"),
        ]

    def __str__(self):
        return f"[{self.fecha.strftime('%Y-%m-%d %H:%M:%S')}] {self.accion} sobre {self.entidad} #{self.id_entidad}"
