from rest_framework import serializers
from guio_core.models import (
    Dimension,
    Factor,
    Subfactor,
    Recomendacion,
    Evaluacion,
    ResultadoFactor,
    ResultadoSubfactor,
    ResultadoFoda,
)


# ==============================================================================
# SERIALIZERS DEL CATÁLOGO OFICIAL 
# ==============================================================================
class SubfactorCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subfactor
        fields = ["id", "codigo", "descripcion", "activo"]


class FactorCatalogoSerializer(serializers.ModelSerializer):
    subfactores = SubfactorCatalogoSerializer(many=True, read_only=True)
    total_subfactores = serializers.IntegerField(source="subfactores.count", read_only=True)

    class Meta:
        model = Factor
        fields = [
            "id",
            "nombre",
            "descripcion",
            "id_dimension",
            "importancia_literatura",
            "alcance",
            "activo",
            "total_subfactores",
            "subfactores",
        ]


class DimensionCatalogoSerializer(serializers.ModelSerializer):
    factores = FactorCatalogoSerializer(many=True, read_only=True)
    total_factores = serializers.IntegerField(source="factores.count", read_only=True)

    class Meta:
        model = Dimension
        fields = [
            "id",
            "nombre",
            "activo",
            "total_factores",
            "factores",
        ]


class RecomendacionCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recomendacion
        fields = [
            "id",
            "tipo",
            "titulo",
            "descripcion_regla",
            "texto_orientador",
            "activo",
        ]


# ==============================================================================
# SERIALIZERS DE EVALUACIÓN Y PASO 1 
# ==============================================================================
class ResultadoFactorSerializer(serializers.ModelSerializer):
    id_factor_nombre = serializers.CharField(source="id_factor.nombre", read_only=True)
    dimension_nombre = serializers.CharField(source="id_factor.id_dimension.nombre", read_only=True)
    importancia_literatura = serializers.IntegerField(source="id_factor.importancia_literatura", read_only=True)
    es_relevante = serializers.SerializerMethodField()

    class Meta:
        model = ResultadoFactor
        fields = [
            "id",
            "id_evaluacion",
            "id_factor",
            "id_factor_nombre",
            "dimension_nombre",
            "nombre_factor",
            "importancia_literatura",
            "importancia_decisor",
            "importancia_relativa",
            "alcance_aplicado",
            "es_relevante",
        ]
        read_only_fields = ["id", "id_evaluacion", "nombre_factor", "importancia_relativa"]

    def get_es_relevante(self, obj):
        # Relevante sii IR > 1 (Opcional, Importante o Fundamental)
        return obj.importancia_relativa != ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE


class EvaluacionItemPaso1Serializer(serializers.Serializer):
    """Elemento individual para enviar en la lista del Paso 1."""
    id_factor = serializers.IntegerField(required=True)
    importancia_decisor = serializers.IntegerField(required=True, min_value=1, max_value=4)
    alcance_aplicado = serializers.ChoiceField(
        choices=Factor.AlcanceFactor.choices,
        required=False,
        allow_null=True,
    )


class GuardarPaso1Serializer(serializers.Serializer):
    """Payload completo para guardar los 18 factores en el Paso 1."""
    factores = EvaluacionItemPaso1Serializer(many=True, required=True)

    def validate_factores(self, factores):
        if not factores:
            raise serializers.ValidationError("Debe enviar las valoraciones de los factores.")

        factor_ids = [f["id_factor"] for f in factores]
        if len(factor_ids) != len(set(factor_ids)):
            raise serializers.ValidationError("No puede enviar factores duplicados en la evaluación.")

        # Verificar que existan todos en la base de datos
        factores_db = Factor.objects.filter(id__in=factor_ids, activo=True)
        if factores_db.count() != len(factor_ids):
            raise serializers.ValidationError("Uno o más factores especificados no existen o están inactivos.")

        return factores


class ResultadoSubfactorSerializer(serializers.ModelSerializer):
    codigo = serializers.CharField(source="id_subfactor.codigo", read_only=True)
    descripcion = serializers.CharField(source="id_subfactor.descripcion", read_only=True)
    id_factor = serializers.IntegerField(source="id_subfactor.id_factor_id", read_only=True)

    class Meta:
        model = ResultadoSubfactor
        fields = [
            "id",
            "id_evaluacion",
            "id_subfactor",
            "codigo",
            "descripcion",
            "id_factor",
            "calificacion",
            "observacion",
        ]
        read_only_fields = ["id", "id_evaluacion"]


class ResultadoFodaSerializer(serializers.ModelSerializer):
    nombre_factor = serializers.CharField(source="id_factor.nombre", read_only=True)
    dimension = serializers.CharField(source="id_factor.id_dimension.nombre", read_only=True)

    class Meta:
        model = ResultadoFoda
        fields = [
            "id",
            "id_evaluacion",
            "id_factor",
            "nombre_factor",
            "dimension",
            "ponderacion_media",
            "categoria",
            "critico",
        ]
        read_only_fields = ["id", "id_evaluacion"]


class EvaluacionDetalleSerializer(serializers.ModelSerializer):
    evaluador_nombre = serializers.CharField(source="id_usuario.nombre", read_only=True)
    evaluador_email = serializers.CharField(source="id_usuario.email", read_only=True)
    recomendacion = RecomendacionCatalogoSerializer(source="id_recomendacion", read_only=True)
    resultados_factor = ResultadoFactorSerializer(many=True, read_only=True)
    resultados_foda = ResultadoFodaSerializer(many=True, read_only=True)

    total_factores_relevantes = serializers.SerializerMethodField()
    total_factores_irrelevantes = serializers.SerializerMethodField()
    resumen_foda = serializers.SerializerMethodField()
    progreso_porcentaje = serializers.SerializerMethodField()

    class Meta:
        model = Evaluacion
        fields = [
            "id",
            "nombre_software",
            "id_usuario",
            "evaluador_nombre",
            "evaluador_email",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "id_recomendacion",
            "recomendacion",
            "indice_viabilidad",
            "nivel_confianza",
            "dictamen_texto",
            "total_factores_relevantes",
            "total_factores_irrelevantes",
            "resumen_foda",
            "progreso_porcentaje",
            "resultados_factor",
            "resultados_foda",
        ]
        read_only_fields = [
            "id",
            "id_usuario",
            "fecha_inicio",
            "fecha_fin",
            "estado",
            "id_recomendacion",
            "indice_viabilidad",
            "nivel_confianza",
            "dictamen_texto",
        ]

    def get_total_factores_relevantes(self, obj):
        return obj.resultados_factor.exclude(
            importancia_relativa=ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE
        ).count()

    def get_total_factores_irrelevantes(self, obj):
        return obj.resultados_factor.filter(
            importancia_relativa=ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE
        ).count()

    def get_resumen_foda(self, obj):
        fodas = list(obj.resultados_foda.all())
        if not fodas:
            return None
        return {
            "fortalezas": sum(1 for f in fodas if f.categoria == ResultadoFoda.CategoriaFoda.FORTALEZA),
            "oportunidades": sum(1 for f in fodas if f.categoria == ResultadoFoda.CategoriaFoda.OPORTUNIDAD),
            "debilidades": sum(1 for f in fodas if f.categoria == ResultadoFoda.CategoriaFoda.DEBILIDAD),
            "amenazas": sum(1 for f in fodas if f.categoria == ResultadoFoda.CategoriaFoda.AMENAZA),
            "criticos": sum(1 for f in fodas if f.critico),
            "total_clasificados": len(fodas),
        }

    def get_progreso_porcentaje(self, obj):
        if obj.estado == Evaluacion.EstadoEvaluacion.COMPLETADA:
            return 100
        total_factores = obj.resultados_factor.count()
        if total_factores == 0:
            return 10  
        total_subfactores_calificados = obj.resultados_subfactor.filter(
            calificacion__isnull=False
        ).count()
        if total_subfactores_calificados == 0:
            return 40  # Paso 1 completado
        # Paso 2 en progreso o listo para dictamen
        return min(95, 40 + int((total_subfactores_calificados / 61.0) * 55))


class CrearEvaluacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluacion
        fields = ["id", "nombre_software"]

    def create(self, validated_data):
        user = self.context["request"].user
        evaluacion = Evaluacion.objects.create(
            nombre_software=validated_data["nombre_software"],
            id_usuario=user,
            estado=Evaluacion.EstadoEvaluacion.EN_PROGRESO,
        )
        return evaluacion


# ==============================================================================
# SERIALIZERS DEL PASO 2 (SUBFACTORES) Y PASO 3 (FODA Y DICTAMEN)
# ==============================================================================
class EvaluacionItemPaso2Serializer(serializers.Serializer):
    """Calificación individual de un subfactor (1 a 4) con observación."""
    id_subfactor = serializers.IntegerField(required=True)
    calificacion = serializers.IntegerField(required=True, min_value=1, max_value=4)
    observacion = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class GuardarPaso2Serializer(serializers.Serializer):
    """Payload para calificar uno o múltiples subfactores."""
    subfactores = EvaluacionItemPaso2Serializer(many=True, required=True)

    def validate_subfactores(self, subfactores):
        if not subfactores:
            raise serializers.ValidationError("Debe enviar las calificaciones de los subfactores.")
        sf_ids = [s["id_subfactor"] for s in subfactores]
        if len(sf_ids) != len(set(sf_ids)):
            raise serializers.ValidationError("No puede enviar subfactores duplicados en el lote.")
        return subfactores

