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
# SERIALIZERS DEL CATÁLOGO OFICIAL (3 Dimensiones, 18 Factores, 61 Subfactores)
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
# SERIALIZERS DE EVALUACIÓN Y PASO 1 (FACTORES RELEVANTES)
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


class EvaluacionDetalleSerializer(serializers.ModelSerializer):
    evaluador_nombre = serializers.CharField(source="id_usuario.nombre", read_only=True)
    evaluador_email = serializers.CharField(source="id_usuario.email", read_only=True)
    recomendacion = RecomendacionCatalogoSerializer(source="id_recomendacion", read_only=True)
    resultados_factor = ResultadoFactorSerializer(many=True, read_only=True)

    total_factores_relevantes = serializers.SerializerMethodField()
    total_factores_irrelevantes = serializers.SerializerMethodField()

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
            "resultados_factor",
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
