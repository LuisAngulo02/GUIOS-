from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404

from guio_core.models import (
    Dimension,
    Factor,
    Subfactor,
    Recomendacion,
    Evaluacion,
    ResultadoFactor,
    LogAuditoria,
)
from guio_core.serializers import (
    DimensionCatalogoSerializer,
    FactorCatalogoSerializer,
    RecomendacionCatalogoSerializer,
    EvaluacionDetalleSerializer,
    CrearEvaluacionSerializer,
    GuardarPaso1Serializer,
    ResultadoFactorSerializer,
)


class CatalogoView(views.APIView):
    """
    GET /api/v1/guios/catalog/
    Retorna el catálogo maestro completo estructurado:
    Dimensiones -> Factores -> Subfactores (para alimentar la UI de GUIOS+ en React).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dimensiones = Dimension.objects.filter(activo=True).prefetch_related(
            "factores__subfactores"
        ).order_by("id")
        data = DimensionCatalogoSerializer(dimensiones, many=True).data

        recomendaciones = Recomendacion.objects.filter(activo=True).order_by("tipo")
        recomendaciones_data = RecomendacionCatalogoSerializer(recomendaciones, many=True).data

        return Response(
            {
                "total_dimensiones": len(data),
                "dimensiones": data,
                "recomendaciones": recomendaciones_data,
            },
            status=status.HTTP_200_OK,
        )


class EvaluacionViewSet(viewsets.ModelViewSet):
    """
    CRUD y flujo de evaluaciones de adopción FLOSS.
    Los evaluadores solo ven sus propias evaluaciones; los administradores pueden ver todas.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Evaluacion.objects.select_related("id_usuario", "id_recomendacion").prefetch_related(
            "resultados_factor__id_factor"
        )
        if user.is_superuser or (user.id_rol and user.id_rol.nombre == "administrador"):
            return qs.order_by("-fecha_inicio")
        return qs.filter(id_usuario=user).order_by("-fecha_inicio")

    def get_serializer_class(self):
        if self.action == "create":
            return CrearEvaluacionSerializer
        return EvaluacionDetalleSerializer

    def perform_create(self, serializer):
        evaluacion = serializer.save()
        LogAuditoria.objects.create(
            id_usuario=self.request.user,
            accion="crear_evaluacion",
            entidad="evaluacion",
            id_entidad=str(evaluacion.id),
            detalle=f"Inicio de evaluación para el software: {evaluacion.nombre_software}",
        )

    @action(detail=True, methods=["post"], url_path="paso1")
    def guardar_paso1(self, request, pk=None):
        """
        HU-04 (Paso 1): Factores Relevantes.
        Recibe las importancias del decisor (ID), calcula la Importancia Relativa:
        IR = floor((IS + ID) / 2)
        Valida que el factor Soporte ('Ambos') tenga alcance definido si es Relevante (IR > 1),
        y persiste los resultados en resultado_factor congelando el nombre del factor.
        """
        evaluacion = self.get_object()

        if evaluacion.estado == Evaluacion.EstadoEvaluacion.COMPLETADA:
            return Response(
                {"detail": "Esta evaluación ya fue completada y está congelada contra modificaciones."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = GuardarPaso1Serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items_factores = serializer.validated_data["factores"]

        # Mapeo de factores desde la BD
        factores_ids = [item["id_factor"] for item in items_factores]
        factores_dict = {f.id: f for f in Factor.objects.filter(id__in=factores_ids)}

        # Mapeo discreto de IR
        mapa_ir_texto = {
            1: ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE,
            2: ResultadoFactor.ImportanciaRelativaTexto.OPCIONAL,
            3: ResultadoFactor.ImportanciaRelativaTexto.IMPORTANTE,
            4: ResultadoFactor.ImportanciaRelativaTexto.FUNDAMENTAL,
        }

        resultados_guardados = []
        factores_relevantes_count = 0

        with transaction.atomic():
            for item in items_factores:
                f_obj = factores_dict[item["id_factor"]]
                id_val = item["importancia_decisor"]
                is_val = f_obj.importancia_literatura

                # Regla de oro de la tesis (Ecuación 5.2):
                # IR = floor((IS + ID) / 2)
                ir_num = (is_val + id_val) // 2
                ir_texto = mapa_ir_texto.get(ir_num, ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE)
                es_relevante = ir_num > 1

                # Determinación del alcance aplicado:
                if f_obj.alcance == Factor.AlcanceFactor.AMBOS:
                    alcance_req = item.get("alcance_aplicado")
                    if es_relevante:
                        if not alcance_req or alcance_req not in (Factor.AlcanceFactor.INTERNO, Factor.AlcanceFactor.EXTERNO):
                            return Response(
                                {
                                    "detail": (
                                        f"El factor '{f_obj.nombre}' tiene alcance 'Ambos'. Al resultar Relevante (IR={ir_texto}), "
                                        f"es obligatorio especificar si se evaluará como 'Interno' o 'Externo'."
                                    )
                                },
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                        alcance_aplicado = alcance_req
                    else:
                        alcance_aplicado = None
                else:
                    alcance_aplicado = f_obj.alcance

                if es_relevante:
                    factores_relevantes_count += 1

                # Guardar o actualizar resultado del factor (inmutabilidad/congelamiento de nombre)
                rf_obj, _ = ResultadoFactor.objects.update_or_create(
                    id_evaluacion=evaluacion,
                    id_factor=f_obj,
                    defaults={
                        "nombre_factor": f_obj.nombre,  # Copia congelada
                        "importancia_decisor": id_val,
                        "importancia_relativa": ir_texto,
                        "alcance_aplicado": alcance_aplicado,
                    },
                )
                resultados_guardados.append(rf_obj)

            LogAuditoria.objects.create(
                id_usuario=request.user,
                accion="evaluacion_paso1",
                entidad="evaluacion",
                id_entidad=str(evaluacion.id),
                detalle=(
                    f"Paso 1 completado para '{evaluacion.nombre_software}': "
                    f"{factores_relevantes_count} factores relevantes de {len(resultados_guardados)} procesados."
                ),
            )

        return Response(
            {
                "message": "Paso 1 guardado exitosamente.",
                "total_procesados": len(resultados_guardados),
                "total_relevantes": factores_relevantes_count,
                "puede_avanzar_paso2": factores_relevantes_count > 0,
                "resultados": ResultadoFactorSerializer(resultados_guardados, many=True).data,
            },
            status=status.HTTP_200_OK,
        )
