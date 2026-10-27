from django.urls import path, include
from rest_framework.routers import DefaultRouter
from guio_core.views import CatalogoView, EvaluacionViewSet

app_name = "guio_core"

router = DefaultRouter()
router.register(r"evaluations", EvaluacionViewSet, basename="evaluaciones")

urlpatterns = [
    # Catálogo de dimensiones, factores, subfactores y recomendaciones
    path("catalog/", CatalogoView.as_view(), name="catalogo"),

    # Rutas del ViewSet de evaluaciones y sus acciones (paso1, etc.)
    path("", include(router.urls)),
]
