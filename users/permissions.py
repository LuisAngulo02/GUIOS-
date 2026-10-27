from rest_framework import permissions
from guio_core.models import Rol


class EsAdministrador(permissions.BasePermission):
    """Permite el acceso únicamente a usuarios con rol 'administrador'."""
    message = "Se requieren privilegios de Administrador para realizar esta acción."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return (
            request.user.is_superuser
            or (request.user.id_rol and request.user.id_rol.nombre == Rol.TipoRol.ADMINISTRADOR)
        )
