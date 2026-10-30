from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from guio_core.models import Usuario, Rol, LogAuditoria


class AdminUsuariosHU02TestCase(TestCase):
    """Pruebas unitarias para HU-02: Gestión de Roles y Usuarios por el Administrador."""

    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre=Rol.TipoRol.ADMINISTRADOR)
        self.rol_eval = Rol.objects.create(nombre=Rol.TipoRol.EVALUADOR)

        self.admin = Usuario.objects.create_user(
            email="admin@test.com",
            nombre="Admin Test",
            password="AdminPassword123!",
            id_rol=self.rol_admin,
        )

        self.evaluador = Usuario.objects.create_user(
            email="eval@test.com",
            nombre="Evaluador Test",
            password="EvalPassword123!",
            id_rol=self.rol_eval,
        )

    def test_listar_usuarios_como_admin(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/v1/users/admin/cuentas/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 2)

    def test_evaluador_no_puede_administrar_usuarios(self):
        self.client.force_authenticate(user=self.evaluador)
        resp = self.client.get("/api/v1/users/admin/cuentas/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_cambiar_rol_usuario(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(
            f"/api/v1/users/admin/cuentas/{self.evaluador.id}/cambiar-rol/",
            {"id_rol": self.rol_admin.id},
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.evaluador.refresh_from_db()
        self.assertEqual(self.evaluador.id_rol.nombre, Rol.TipoRol.ADMINISTRADOR)
        # Verificar log de auditoría
        log = LogAuditoria.objects.filter(accion="cambiar_rol_usuario", id_entidad=str(self.evaluador.id)).first()
        self.assertIsNotNone(log)

    def test_baja_logica_y_prevencion_auto_desactivacion(self):
        self.client.force_authenticate(user=self.admin)
        # Intentar desactivar al propio admin debe fallar
        resp_self = self.client.delete(f"/api/v1/users/admin/cuentas/{self.admin.id}/")
        self.assertEqual(resp_self.status_code, status.HTTP_400_BAD_REQUEST)

        # Desactivar a otro usuario (baja lógica)
        resp_eval = self.client.delete(f"/api/v1/users/admin/cuentas/{self.evaluador.id}/")
        self.assertEqual(resp_eval.status_code, status.HTTP_204_NO_CONTENT)
        self.evaluador.refresh_from_db()
        self.assertFalse(self.evaluador.activo)
        # El usuario no se borra físicamente
        self.assertTrue(Usuario.objects.filter(id=self.evaluador.id).exists())

    def test_reactivar_y_desbloquear_cuenta(self):
        self.client.force_authenticate(user=self.admin)
        self.evaluador.intentos_fallidos = 5
        self.evaluador.activo = False
        self.evaluador.save()

        # Desbloquear
        resp_desbloquear = self.client.post(f"/api/v1/users/admin/cuentas/{self.evaluador.id}/desbloquear/")
        self.assertEqual(resp_desbloquear.status_code, status.HTTP_200_OK)
        self.evaluador.refresh_from_db()
        self.assertEqual(self.evaluador.intentos_fallidos, 0)

        # Reactivar
        resp_activar = self.client.post(f"/api/v1/users/admin/cuentas/{self.evaluador.id}/cambiar-estado/")
        self.assertEqual(resp_activar.status_code, status.HTTP_200_OK)
        self.evaluador.refresh_from_db()
        self.assertTrue(self.evaluador.activo)

    def test_bitacora_auditoria(self):
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/v1/users/admin/cuentas/auditoria/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)
