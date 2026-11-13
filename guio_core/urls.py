from django.urls import path, include
from rest_framework.routers import DefaultRouter
from guio_core.views import (
    CatalogoView,
    EvaluacionViewSet,
    AdminDimensionesViewSet,
    AdminFactoresViewSet,
    AdminSubfactoresViewSet,
    EvidenciaView,
    CalcularEvidenciaView,
    RestaurarEvidenciaView,
    RecomendacionesIAView,
    PrecalificarSubfactoresIAView,
    CargarCasoUNEMIView,
    AdminHistorialConsultasView,
    AdminParametrosCalculoView,
)

app_name = "guio_core"

router = DefaultRouter()
router.register(r"evaluations", EvaluacionViewSet, basename="evaluaciones")
router.register(r"admin/dimensiones", AdminDimensionesViewSet, basename="admin-dimensiones")
router.register(r"admin/factores", AdminFactoresViewSet, basename="admin-factores")
router.register(r"admin/subfactores", AdminSubfactoresViewSet, basename="admin-subfactores")

urlpatterns = [
    # Catálogo de dimensiones, factores, subfactores y recomendaciones
    path("catalog/", CatalogoView.as_view(), name="catalogo"),

    # Paso 0 y Evidencia Bibliográfica Real (RF-14)
    path("evidencia/", EvidenciaView.as_view(), name="evidencia-detalle"),
    path("evidencia/calcular/", CalcularEvidenciaView.as_view(), name="evidencia-calcular"),
    path("evidencia/restaurar/", RestaurarEvidenciaView.as_view(), name="evidencia-restaurar"),

    # Paso 2 (Tarea 6): Asistente de precalificación ágil con IA para subfactores
    path("precalificar-subfactores/", PrecalificarSubfactoresIAView.as_view(), name="precalificar-subfactores"),

    # Tarea 5: Precarga oficial del Caso de Estudio UNEMI / LibreOffice (Tesis Doctoral Cap. 6)
    path("evaluations/caso-unemi/", CargarCasoUNEMIView.as_view(), name="caso-unemi"),

    # Paso 3: Recomendaciones personalizadas con IA según calificaciones
    path("recomendaciones-ia/", RecomendacionesIAView.as_view(), name="recomendaciones-ia"),

    # HU-03 / Figma: Historial de consultas y parámetros de cálculo
    path("admin/historial-consultas/", AdminHistorialConsultasView.as_view(), name="admin-historial-consultas"),
    path("admin/parametros-calculo/", AdminParametrosCalculoView.as_view(), name="admin-parametros-calculo"),

    # Rutas del ViewSet de evaluaciones y administración del catálogo
    path("", include(router.urls)),
]
