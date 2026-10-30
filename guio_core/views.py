from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from guio_core.models import (
    Dimension,
    Factor,
    Subfactor,
    Recomendacion,
    Evaluacion,
    ResultadoFactor,
    ResultadoSubfactor,
    ResultadoFoda,
    LogAuditoria,
)
from guio_core.serializers import (
    DimensionCatalogoSerializer,
    FactorCatalogoSerializer,
    RecomendacionCatalogoSerializer,
    EvaluacionDetalleSerializer,
    CrearEvaluacionSerializer,
    GuardarPaso1Serializer,
    GuardarPaso2Serializer,
    ResultadoFactorSerializer,
    ResultadoSubfactorSerializer,
    ResultadoFodaSerializer,
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
            "resultados_factor__id_factor",
            "resultados_foda__id_factor",
            "resultados_subfactor__id_subfactor",
        )
        if not (user.is_superuser or (user.id_rol and user.id_rol.nombre == "administrador")):
            qs = qs.filter(id_usuario=user)

        # Filtros opcionales por query parameters (HU-07)
        estado = self.request.query_params.get("estado")
        if estado and estado != "todos":
            qs = qs.filter(estado=estado)

        busqueda = self.request.query_params.get("search") or self.request.query_params.get("software")
        if busqueda:
            qs = qs.filter(nombre_software__icontains=busqueda.strip())

        return qs.order_by("-fecha_inicio")

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

    @action(detail=True, methods=["get", "post"], url_path="paso2")
    def paso2(self, request, pk=None):
        """
        HU-05 (Paso 2): Calificación de Subfactores y Ponderación Media.
        GET: Retorna los subfactores de los factores relevantes y sus notas actuales.
        POST: Guarda o actualiza calificaciones (1-4) y observaciones de subfactores.
        """
        evaluacion = self.get_object()

        # Obtener factores relevantes de la evaluación
        relevantes_rf = evaluacion.resultados_factor.exclude(
            importancia_relativa=ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE
        ).select_related("id_factor", "id_factor__id_dimension")

        if not relevantes_rf.exists():
            return Response(
                {"detail": "No hay factores relevantes en esta evaluación. Complete el Paso 1 primero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if request.method == "POST":
            if evaluacion.estado == Evaluacion.EstadoEvaluacion.COMPLETADA:
                return Response(
                    {"detail": "Esta evaluación ya fue completada y está congelada contra modificaciones."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer = GuardarPaso2Serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            items_subfactores = serializer.validated_data["subfactores"]

            sf_ids = [item["id_subfactor"] for item in items_subfactores]
            subfactores_dict = {
                sf.id: sf for sf in Subfactor.objects.filter(id__in=sf_ids, activo=True)
            }

            with transaction.atomic():
                for item in items_subfactores:
                    sf_obj = subfactores_dict.get(item["id_subfactor"])
                    if not sf_obj:
                        continue
                    ResultadoSubfactor.objects.update_or_create(
                        id_evaluacion=evaluacion,
                        id_subfactor=sf_obj,
                        defaults={
                            "calificacion": item["calificacion"],
                            "observacion": item.get("observacion") or "",
                        },
                    )

                LogAuditoria.objects.create(
                    id_usuario=request.user,
                    accion="evaluacion_paso2",
                    entidad="evaluacion",
                    id_entidad=str(evaluacion.id),
                    detalle=f"Guardadas {len(items_subfactores)} calificaciones de subfactores.",
                )

        # Mapear estado y calificaciones actuales
        calificaciones_existentes = {
            rs.id_subfactor_id: {
                "calificacion": rs.calificacion,
                "observacion": rs.observacion or "",
            }
            for rs in evaluacion.resultados_subfactor.select_related("id_subfactor").all()
        }

        factores_detalle = []
        total_sfs_relevantes = 0
        total_sfs_calificados = 0

        for rf in relevantes_rf:
            factor = rf.id_factor
            sfs_del_factor = factor.subfactores.filter(activo=True).order_by("codigo")
            total_sfs_relevantes += sfs_del_factor.count()

            notas = []
            sfs_data = []
            for sf in sfs_del_factor:
                calif_data = calificaciones_existentes.get(sf.id)
                calif_val = calif_data["calificacion"] if calif_data else None
                obs_val = calif_data["observacion"] if calif_data else ""

                if calif_val is not None:
                    notas.append(calif_val)
                    total_sfs_calificados += 1

                sfs_data.append({
                    "id": sf.id,
                    "codigo": sf.codigo,
                    "descripcion": sf.descripcion,
                    "calificacion": calif_val,
                    "observacion": obs_val,
                })

            pm = round(sum(notas) / len(notas), 2) if notas else 0.0

            factores_detalle.append({
                "id_factor": factor.id,
                "nombre": factor.nombre,
                "descripcion": factor.descripcion,
                "dimension": factor.id_dimension.nombre,
                "alcance": rf.alcance_aplicado or factor.alcance,
                "importancia_relativa": rf.importancia_relativa,
                "total_subfactores": sfs_del_factor.count(),
                "calificados": len(notas),
                "completo": len(notas) == sfs_del_factor.count(),
                "ponderacion_media": float(pm),
                "subfactores": sfs_data,
            })

        puede_avanzar = (
            total_sfs_relevantes > 0 and total_sfs_calificados == total_sfs_relevantes
        )

        return Response(
            {
                "evaluacion_id": evaluacion.id,
                "software": evaluacion.nombre_software,
                "total_relevantes": relevantes_rf.count(),
                "total_subfactores_relevantes": total_sfs_relevantes,
                "total_subfactores_calificados": total_sfs_calificados,
                "puede_avanzar_paso3": puede_avanzar,
                "factores": factores_detalle,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"], url_path="resultado")
    def calcular_resultado(self, request, pk=None):
        """
        HU-06 (Paso 3): Clasificación FODA y Dictamen Final (Regla de Oro de la Tesis).
        - Clasifica cada factor relevante en Fortaleza / Oportunidad / Debilidad / Amenaza (umbral PM=3.00).
        - Detecta factores Críticos (Debilidad/Amenaza con IR=Importante o Fundamental).
        - Determina recomendación A, B o C y genera dictamen con factores causantes.
        - Calcula Índice de Viabilidad (%) y Nivel de Confianza (Alto/Medio/Bajo).
        - Congela dictamen_texto y marca la evaluación como completada.
        """
        evaluacion = self.get_object()

        relevantes_rf = evaluacion.resultados_factor.exclude(
            importancia_relativa=ResultadoFactor.ImportanciaRelativaTexto.IRRELEVANTE
        ).select_related("id_factor", "id_factor__id_dimension")

        if not relevantes_rf.exists():
            return Response(
                {"detail": "No hay factores relevantes en esta evaluación para emitir un dictamen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        calificaciones_map = {
            rs.id_subfactor_id: rs.calificacion
            for rs in evaluacion.resultados_subfactor.all()
        }

        foda_registros = []
        factores_criticos = []
        factores_opcionales_da = []
        positivos_count = 0
        total_calificados = len(calificaciones_map)
        no_se_count = sum(1 for c in calificaciones_map.values() if c == 2)

        with transaction.atomic():
            # Limpiar resultados FODA previos si se recalcula
            ResultadoFoda.objects.filter(id_evaluacion=evaluacion).delete()

            for rf in relevantes_rf:
                factor = rf.id_factor
                sfs = factor.subfactores.filter(activo=True)
                notas = [calificaciones_map[sf.id] for sf in sfs if sf.id in calificaciones_map]

                if len(notas) < sfs.count():
                    return Response(
                        {
                            "detail": (
                                f"Faltan reactivos por calificar en el factor relevante '{factor.nombre}'. "
                                f"({len(notas)} de {sfs.count()} completados)."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                pm = round(sum(notas) / len(notas), 2)
                alcance = rf.alcance_aplicado or factor.alcance
                es_interno = (alcance == Factor.AlcanceFactor.INTERNO)
                es_positivo = (pm >= 3.00)

                if es_positivo:
                    categoria = (
                        ResultadoFoda.CategoriaFoda.FORTALEZA
                        if es_interno
                        else ResultadoFoda.CategoriaFoda.OPORTUNIDAD
                    )
                    positivos_count += 1
                    es_critico = False
                else:
                    categoria = (
                        ResultadoFoda.CategoriaFoda.DEBILIDAD
                        if es_interno
                        else ResultadoFoda.CategoriaFoda.AMENAZA
                    )
                    # Crítico sii IR es Importante o Fundamental
                    es_critico = rf.importancia_relativa in (
                        ResultadoFactor.ImportanciaRelativaTexto.IMPORTANTE,
                        ResultadoFactor.ImportanciaRelativaTexto.FUNDAMENTAL,
                    )
                    if es_critico:
                        factores_criticos.append(factor.nombre)
                    else:
                        factores_opcionales_da.append(factor.nombre)

                rfoda = ResultadoFoda.objects.create(
                    id_evaluacion=evaluacion,
                    id_factor=factor,
                    ponderacion_media=pm,
                    categoria=categoria,
                    critico=es_critico,
                )
                foda_registros.append(rfoda)

            total_relevantes = relevantes_rf.count()
            indice_viabilidad = round((positivos_count / total_relevantes) * 100, 2)

            # Nivel de confianza: % de respuestas != 2 ("Desconozco")
            if total_calificados > 0:
                pct_certeza = ((total_calificados - no_se_count) / total_calificados) * 100
            else:
                pct_certeza = 100.0

            if pct_certeza >= 90.0:
                nivel_confianza = Evaluacion.NivelConfianza.ALTO
            elif pct_certeza >= 60.0:
                nivel_confianza = Evaluacion.NivelConfianza.MEDIO
            else:
                nivel_confianza = Evaluacion.NivelConfianza.BAJO

            # Determinación de recomendación A, B o C
            if not factores_criticos and not factores_opcionales_da:
                tipo_rec = "A"
                rec_obj = Recomendacion.objects.filter(tipo="A").first()
                dictamen_texto = (
                    "Recomendación A: Adoptar. Todos los factores relevantes han sido identificados "
                    "como Oportunidades y/o Fortalezas. La organización cumple satisfactoriamente "
                    "con los requisitos técnicos y organizacionales para adoptar la solución FLOSS."
                )
            elif not factores_criticos:
                tipo_rec = "B"
                rec_obj = Recomendacion.objects.filter(tipo="B").first()
                obs_factores = ", ".join(factores_opcionales_da)
                dictamen_texto = (
                    f"Recomendación B: Es posible adoptar con observaciones en factores opcionales: {obs_factores}. "
                    "Se sugiere revisar los subfactores que no cumplen con el óptimo antes o durante la implantación."
                )
            else:
                tipo_rec = "C"
                rec_obj = Recomendacion.objects.filter(tipo="C").first()
                criticos_str = ", ".join(factores_criticos)
                opcionales_str = (
                    f" Observaciones en factores opcionales: {', '.join(factores_opcionales_da)}."
                    if factores_opcionales_da
                    else ""
                )
                dictamen_texto = (
                    f"Recomendación C: Requiere recursos antes de adoptar. Factores críticos detectados: {criticos_str}.{opcionales_str} "
                    "La organización debe destinar recursos de ingeniería si son factores externos, "
                    "o fortalecer capacidades si son factores internos, antes de autorizar la adopción."
                )

            # Congelar en evaluación
            evaluacion.id_recomendacion = rec_obj
            evaluacion.indice_viabilidad = indice_viabilidad
            evaluacion.nivel_confianza = nivel_confianza
            evaluacion.dictamen_texto = dictamen_texto
            evaluacion.estado = Evaluacion.EstadoEvaluacion.COMPLETADA
            evaluacion.fecha_fin = timezone.now()
            evaluacion.save()

            LogAuditoria.objects.create(
                id_usuario=request.user,
                accion="evaluacion_completada",
                entidad="evaluacion",
                id_entidad=str(evaluacion.id),
                detalle=(
                    f"Dictamen emitido para '{evaluacion.nombre_software}': "
                    f"Recomendación {tipo_rec} (Viabilidad: {indice_viabilidad}%, Confianza: {nivel_confianza})."
                ),
            )

        return Response(
            {
                "message": "Evaluación calculada y completada exitosamente.",
                "recomendacion_tipo": tipo_rec,
                "recomendacion_titulo": rec_obj.titulo if rec_obj else "",
                "dictamen_texto": dictamen_texto,
                "indice_viabilidad": float(indice_viabilidad),
                "nivel_confianza": nivel_confianza,
                "estado": evaluacion.estado,
                "total_factores_evaluados": len(foda_registros),
                "foda": ResultadoFodaSerializer(foda_registros, many=True).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="comparar")
    def comparar(self, request):
        """
        HU-07: Comparación en paralelo de dos evaluaciones (Side-by-Side Comparison).
        Parámetros requeridos en query: ?eval1=<id>&eval2=<id>
        Retorna las métricas globales, FODA y desglose comparativo de factores.
        """
        eval1_id = request.query_params.get("eval1")
        eval2_id = request.query_params.get("eval2")

        if not eval1_id or not eval2_id:
            return Response(
                {"detail": "Debe especificar los parámetros 'eval1' y 'eval2' para realizar la comparación."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if eval1_id == eval2_id:
            return Response(
                {"detail": "Seleccione dos evaluaciones distintas para comparar."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = self.get_queryset()
        eval1 = get_object_or_404(qs, id=eval1_id)
        eval2 = get_object_or_404(qs, id=eval2_id)

        ser1 = EvaluacionDetalleSerializer(eval1).data
        ser2 = EvaluacionDetalleSerializer(eval2).data

        # Mapear factores de ambas evaluaciones
        mapa_rf1 = {rf["id_factor"]: rf for rf in ser1.get("resultados_factor", [])}
        mapa_rf2 = {rf["id_factor"]: rf for rf in ser2.get("resultados_factor", [])}
        mapa_foda1 = {f["id_factor"]: f for f in ser1.get("resultados_foda", [])}
        mapa_foda2 = {f["id_factor"]: f for f in ser2.get("resultados_foda", [])}

        factores_catalogo = Factor.objects.filter(activo=True).select_related("id_dimension").order_by("id")
        comparativa_factores = []

        for f in factores_catalogo:
            rf1 = mapa_rf1.get(f.id, {})
            rf2 = mapa_rf2.get(f.id, {})
            fd1 = mapa_foda1.get(f.id, {})
            fd2 = mapa_foda2.get(f.id, {})

            comparativa_factores.append({
                "id_factor": f.id,
                "nombre_factor": f.nombre,
                "dimension": f.id_dimension.nombre,
                "alcance_base": f.alcance,
                "eval1": {
                    "importancia_decisor": rf1.get("importancia_decisor"),
                    "importancia_relativa": rf1.get("importancia_relativa", "—"),
                    "alcance": rf1.get("alcance_aplicado") or f.alcance,
                    "foda": fd1.get("categoria", "—"),
                    "pm": fd1.get("ponderacion_media"),
                    "critico": fd1.get("critico", False),
                },
                "eval2": {
                    "importancia_decisor": rf2.get("importancia_decisor"),
                    "importancia_relativa": rf2.get("importancia_relativa", "—"),
                    "alcance": rf2.get("alcance_aplicado") or f.alcance,
                    "foda": fd2.get("categoria", "—"),
                    "pm": fd2.get("ponderacion_media"),
                    "critico": fd2.get("critico", False),
                },
            })

        # Resumen comparativo de ventajas relativas
        v1 = float(eval1.indice_viabilidad or 0)
        v2 = float(eval2.indice_viabilidad or 0)
        crit1 = sum(1 for f in mapa_foda1.values() if f.get("critico"))
        crit2 = sum(1 for f in mapa_foda2.values() if f.get("critico"))

        diferencias = []
        if v1 > v2:
            diferencias.append(f"{eval1.nombre_software} tiene mayor índice de viabilidad ({v1:.1f}% vs {v2:.1f}%).")
        elif v2 > v1:
            diferencias.append(f"{eval2.nombre_software} tiene mayor índice de viabilidad ({v2:.1f}% vs {v1:.1f}%).")
        else:
            diferencias.append("Ambas soluciones presentan el mismo índice de viabilidad.")

        if crit1 < crit2:
            diferencias.append(f"{eval1.nombre_software} tiene menos factores críticos ({crit1} vs {crit2}).")
        elif crit2 < crit1:
            diferencias.append(f"{eval2.nombre_software} tiene menos factores críticos ({crit2} vs {crit1}).")

        return Response({
            "evaluacion_1": ser1,
            "evaluacion_2": ser2,
            "comparativa_factores": comparativa_factores,
            "resumen_diferencias": diferencias,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"], url_path="cargar_activa")
    def cargar_activa(self, request, pk=None):
        """
        Carga el estado completo de una evaluación para reanudarla en el frontend.
        """
        evaluacion = self.get_object()
        serializer = EvaluacionDetalleSerializer(evaluacion)

        # Mapeo de subfactores calificados
        subfactores_calificados = ResultadoSubfactorSerializer(
            evaluacion.resultados_subfactor.all(), many=True
        ).data

        return Response({
            "evaluacion": serializer.data,
            "subfactores": subfactores_calificados,
        }, status=status.HTTP_200_OK)


