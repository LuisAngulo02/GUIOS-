from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from guio_core.models import (
    Dimension,
    Factor,
    Subfactor,
    Recomendacion,
    Evaluacion,
    ResultadoFactor,
    ResultadoSubfactor,
    ResultadoFoda,
    Rol,
)

Usuario = get_user_model()


class EvaluacionApiFlowTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Crear Rol y Usuario de prueba
        self.rol_evaluador = Rol.objects.create(nombre="evaluador")
        self.user = Usuario.objects.create_user(
            email="evaluador.test@guiosplus.org",
            nombre="Evaluador Test",
            password="Password123!",
            id_rol=self.rol_evaluador,
        )
        self.client.force_authenticate(user=self.user)

        # Crear Dimensiones
        self.dim_tec = Dimension.objects.create(nombre="Tecnológica")
        self.dim_org = Dimension.objects.create(nombre="Organizacional")

        # Crear Factores
        self.f_compat = Factor.objects.create(
            nombre="Compatibilidad",
            id_dimension=self.dim_tec,
            importancia_literatura=3,
            alcance="Externo",
        )
        self.f_soporte = Factor.objects.create(
            nombre="Soporte",
            id_dimension=self.dim_org,
            importancia_literatura=3,
            alcance="Ambos",
        )

        # Subfactores de Compatibilidad
        self.sf1 = Subfactor.objects.create(codigo="SF-01", descripcion="Nube", id_factor=self.f_compat)
        self.sf2 = Subfactor.objects.create(codigo="SF-02", descripcion="Formatos", id_factor=self.f_compat)

        # Subfactores de Soporte
        self.sf3 = Subfactor.objects.create(codigo="SF-52", descripcion="Comunidad", id_factor=self.f_soporte)

        # Recomendaciones A, B, C
        self.rec_a = Recomendacion.objects.create(
            tipo="A", titulo="Adoptar", descripcion_regla="Regla A", texto_orientador="Orientador A"
        )
        self.rec_b = Recomendacion.objects.create(
            tipo="B", titulo="Es posible adoptar", descripcion_regla="Regla B", texto_orientador="Orientador B"
        )
        self.rec_c = Recomendacion.objects.create(
            tipo="C", titulo="Requiere recursos", descripcion_regla="Regla C", texto_orientador="Orientador C"
        )

    def test_flujo_completo_evaluacion(self):
        # 1. Crear Evaluación (Paso 0)
        res_crear = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "Moodle 4.x"})
        self.assertEqual(res_crear.status_code, status.HTTP_201_CREATED)
        eval_id = res_crear.data["id"]

        # 2. Guardar Paso 1: Factores Relevantes
        # Compatibilidad: IS=3, ID=4 -> IR = floor((3+4)/2) = 3 (Importante) -> Relevante
        # Soporte: IS=3, ID=3 -> IR = floor((3+3)/2) = 3 (Importante) -> Relevante con alcance Interno
        payload_paso1 = {
            "factores": [
                {"id_factor": self.f_compat.id, "importancia_decisor": 4, "alcance_aplicado": "Externo"},
                {"id_factor": self.f_soporte.id, "importancia_decisor": 3, "alcance_aplicado": "Interno"},
            ]
        }
        res_p1 = self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso1/", payload_paso1, format="json")
        self.assertEqual(res_p1.status_code, status.HTTP_200_OK)
        self.assertEqual(res_p1.data["total_relevantes"], 2)

        # 3. Guardar Paso 2: Calificar Subfactores
        payload_paso2 = {
            "subfactores": [
                {"id_subfactor": self.sf1.id, "calificacion": 4, "observacion": "Excelente soporte nube"},
                {"id_subfactor": self.sf2.id, "calificacion": 4, "observacion": "Formatos estándar"},
                {"id_subfactor": self.sf3.id, "calificacion": 4, "observacion": "Soporte comunitario activo"},
            ]
        }
        res_p2 = self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso2/", payload_paso2, format="json")
        self.assertEqual(res_p2.status_code, status.HTTP_200_OK)
        self.assertTrue(res_p2.data["puede_avanzar_paso3"])

        # 4. Calcular Resultado (Paso 3)
        res_p3 = self.client.post(f"/api/v1/guios/evaluations/{eval_id}/resultado/")
        self.assertEqual(res_p3.status_code, status.HTTP_200_OK)
        # Todos con PM = 4.0 >= 3.0 -> Todos Oportunidad/Fortaleza -> Recomendación A
        self.assertEqual(res_p3.data["recomendacion_tipo"], "A")
        self.assertEqual(res_p3.data["indice_viabilidad"], 100.0)
        self.assertEqual(res_p3.data["estado"], "completada")

    def test_hu07_historial_y_comparador(self):
        """Valida HU-07: Listado filtrable de evaluaciones y comparativa en paralelo."""
        # 1. Crear 2 evaluaciones
        res1 = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "Moodle 4.x"})
        id1 = res1.data["id"]

        res2 = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "Canvas LMS"})
        id2 = res2.data["id"]

        # 2. Listar historial con filtros
        list_res = self.client.get("/api/v1/guios/evaluations/?estado=en_progreso")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        nombres = [e["nombre_software"] for e in list_res.data]
        self.assertIn("Moodle 4.x", nombres)
        self.assertIn("Canvas LMS", nombres)

        # Filtro por software
        filter_res = self.client.get("/api/v1/guios/evaluations/?software=Canvas")
        self.assertEqual(filter_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filter_res.data), 1)
        self.assertEqual(filter_res.data[0]["nombre_software"], "Canvas LMS")

        # 3. Comparador lado a lado
        compare_res = self.client.get(f"/api/v1/guios/evaluations/comparar/?eval1={id1}&eval2={id2}")
        self.assertEqual(compare_res.status_code, status.HTTP_200_OK)
        self.assertIn("evaluacion_1", compare_res.data)
        self.assertIn("evaluacion_2", compare_res.data)
        self.assertIn("comparativa_factores", compare_res.data)
        self.assertEqual(compare_res.data["evaluacion_1"]["nombre_software"], "Moodle 4.x")
        self.assertEqual(compare_res.data["evaluacion_2"]["nombre_software"], "Canvas LMS")

