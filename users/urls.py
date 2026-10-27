from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import (
    LoginView,
    RegistroView,
    PerfilView,
    AdminUsuariosViewSet,
    RolesListView,
)

app_name = "users"

router = DefaultRouter()
router.register(r"admin/cuentas", AdminUsuariosViewSet, basename="admin-usuarios")

urlpatterns = [
    # HU-01: Autenticación JWT
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/register/", RegistroView.as_view(), name="register"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", PerfilView.as_view(), name="perfil"),

    # HU-02: Gestión administrativa de roles y usuarios
    path("admin/roles/", RolesListView.as_view(), name="roles-list"),
    path("", include(router.urls)),
]
