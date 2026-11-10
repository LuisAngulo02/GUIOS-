from django.urls import path, include
from rest_framework.routers import DefaultRouter
from guio_core.views import (
    CatalogoView,
    EvaluacionViewSet,
    AdminDimensionesViewSet,
    AdminFactoresViewSet,
    AdminSubfactoresViewSet,
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

    # Rutas del ViewSet de evaluaciones y administración del catálogo
    path("", include(router.urls)),
]
