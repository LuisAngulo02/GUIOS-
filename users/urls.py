from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import (
    LoginView,
    LogoutView,
    RegistroView,
    PerfilView,
    AdminUsuariosViewSet,
    RolesListView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

app_name = "users"

router = DefaultRouter()
router.register(r"admin/cuentas", AdminUsuariosViewSet, basename="admin-usuarios")

urlpatterns = [
    # HU-01: Autenticación JWT y revocación
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/register/", RegistroView.as_view(), name="register"),
    path("auth/registro/", RegistroView.as_view(), name="registro_alias"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", PerfilView.as_view(), name="perfil"),

    # Recuperación segura de contraseña
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("auth/password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),

    # HU-02: Gestión administrativa de roles y usuarios
    path("admin/roles/", RolesListView.as_view(), name="roles-list"),
    path("", include(router.urls)),
]
