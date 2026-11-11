from unittest.mock import patch
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
    ConsultaEvidencia,
    EvidenciaFactor,
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

    def test_hu08_exportar_informe_pdf(self):
        """Valida HU-08 (RF-13): Generación y descarga oficial del informe en PDF."""
        # 1. Crear y completar una evaluación
        res_crear = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "PostgreSQL Live Test"})
        eval_id = res_crear.data["id"]

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso1/", {
            "factores": [
                {"id_factor": self.f_compat.id, "importancia_decisor": 4, "alcance_aplicado": "Externo"},
            ]
        }, format="json")

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso2/", {
            "subfactores": [
                {"id_subfactor": self.sf1.id, "calificacion": 4, "observacion": "Cumple plenamente"},
                {"id_subfactor": self.sf2.id, "calificacion": 4, "observacion": "Estándar abierto"},
            ]
        }, format="json")

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/resultado/")

        # 2. Descargar PDF oficial
        res_pdf = self.client.get(f"/api/v1/guios/evaluations/{eval_id}/pdf/")
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)
        self.assertEqual(res_pdf["Content-Type"], "application/pdf")
        self.assertIn("attachment; filename=", res_pdf["Content-Disposition"])
        self.assertTrue(len(res_pdf.content) > 1000)
        self.assertTrue(res_pdf.content.startswith(b"%PDF"))

    def test_rechazo_resultado_si_faltan_subfactores(self):
        """No se debe permitir calcular resultado si faltan subfactores por calificar en factores relevantes."""
        res_crear = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "Linux Kernel"})
        eval_id = res_crear.data["id"]

        # Paso 1: marcar compatibilidad como relevante
        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso1/", {
            "factores": [
                {"id_factor": self.f_compat.id, "importancia_decisor": 4, "alcance_aplicado": "Externo"},
            ]
        }, format="json")

        # Intentar calcular resultado SIN haber calificado los subfactores sf1 y sf2
        res_calc = self.client.post(f"/api/v1/guios/evaluations/{eval_id}/resultado/")
        self.assertEqual(res_calc.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("incompleta", res_calc.data["detail"].lower())

    def test_inmutabilidad_evaluacion_completada(self):
        """Una evaluación completada no puede ser recalculada ni modificada."""
        res_crear = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "Nginx"})
        eval_id = res_crear.data["id"]

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso1/", {
            "factores": [
                {"id_factor": self.f_compat.id, "importancia_decisor": 4, "alcance_aplicado": "Externo"},
            ]
        }, format="json")

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso2/", {
            "subfactores": [
                {"id_subfactor": self.sf1.id, "calificacion": 4, "observacion": "Optimo"},
                {"id_subfactor": self.sf2.id, "calificacion": 4, "observacion": "Optimo"},
            ]
        }, format="json")

        res_calc1 = self.client.post(f"/api/v1/guios/evaluations/{eval_id}/resultado/")
        self.assertEqual(res_calc1.status_code, status.HTTP_200_OK)

        # Intentar recalcular debe ser bloqueado por inmutabilidad
        res_calc2 = self.client.post(f"/api/v1/guios/evaluations/{eval_id}/resultado/")
        self.assertEqual(res_calc2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("congelada", res_calc2.data["detail"].lower())

    def test_exportar_pdf_con_caracteres_especiales_y_tags(self):
        """Verifica que caracteres como <, >, &, y comillas no causen excepciones XML en ReportLab ni corrompan el header."""
        res_crear = self.client.post("/api/v1/guios/evaluations/", {"nombre_software": "App <script>alert(1)</script> & \"Tools\""})
        eval_id = res_crear.data["id"]

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso1/", {
            "factores": [
                {"id_factor": self.f_compat.id, "importancia_decisor": 4, "alcance_aplicado": "Externo"},
            ]
        }, format="json")

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/paso2/", {
            "subfactores": [
                {"id_subfactor": self.sf1.id, "calificacion": 4, "observacion": "Latencia < 10ms & escalabilidad > 99%"},
                {"id_subfactor": self.sf2.id, "calificacion": 4, "observacion": "Cumple con formato JSON & XML <tag>"},
            ]
        }, format="json")

        self.client.post(f"/api/v1/guios/evaluations/{eval_id}/resultado/")

        res_pdf = self.client.get(f"/api/v1/guios/evaluations/{eval_id}/pdf/")
        self.assertEqual(res_pdf.status_code, status.HTTP_200_OK)
        self.assertTrue(res_pdf.content.startswith(b"%PDF"))
        # El nombre del archivo en Content-Disposition debe estar saneado sin comillas intermedias
        content_disp = res_pdf["Content-Disposition"]
        self.assertNotIn("<script>", content_disp)
        self.assertIn("attachment; filename=", content_disp)


class AdminCatalogoHU03TestCase(TestCase):
    """Pruebas unitarias para HU-03: Gestión del Catálogo de Evaluación (RF-03, RF-04)."""

    def setUp(self):
        self.client = APIClient()
        self.rol_admin = Rol.objects.create(nombre=Rol.TipoRol.ADMINISTRADOR)
        self.rol_eval = Rol.objects.create(nombre=Rol.TipoRol.EVALUADOR)

        self.admin = Usuario.objects.create_user(
            email="admin.catalogo@guiosplus.org",
            nombre="Admin Catalogo",
            password="AdminPassword123!",
            id_rol=self.rol_admin,
        )

        self.evaluador = Usuario.objects.create_user(
            email="eval.catalogo@guiosplus.org",
            nombre="Eval Catalogo",
            password="EvalPassword123!",
            id_rol=self.rol_eval,
        )

        self.dim = Dimension.objects.create(nombre="Tecnológica")
        self.factor = Factor.objects.create(
            nombre="Compatibilidad",
            id_dimension=self.dim,
            importancia_literatura=3,
            alcance="Externo",
        )
        self.sf = Subfactor.objects.create(
            codigo="SF-01",
            descripcion="Prueba subfactor",
            id_factor=self.factor,
        )

    def test_evaluador_no_puede_modificar_catalogo(self):
        """Un evaluador no debe tener acceso a crear o editar factores."""
        self.client.force_authenticate(user=self.evaluador)
        resp = self.client.post("/api/v1/guios/admin/factores/", {
            "nombre": "Nuevo Factor Malicioso",
            "id_dimension": self.dim.id,
            "importancia_literatura": 3,
            "alcance": "Interno",
        }, format="json")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_crear_editar_baja_logica_factor(self):
        """El administrador puede crear, editar y aplicar baja lógica a un factor."""
        self.client.force_authenticate(user=self.admin)

        # 1. Crear nuevo factor
        resp_crear = self.client.post("/api/v1/guios/admin/factores/", {
            "nombre": "Seguridad en la Nube",
            "descripcion": "Evaluación de cifrado y controles cloud.",
            "id_dimension": self.dim.id,
            "importancia_literatura": 4,
            "alcance": "Externo",
        }, format="json")
        self.assertEqual(resp_crear.status_code, status.HTTP_201_CREATED)
        factor_id = resp_crear.data["id"]

        # 2. Editar factor
        resp_edit = self.client.patch(f"/api/v1/guios/admin/factores/{factor_id}/", {
            "importancia_literatura": 3,
        }, format="json")
        self.assertEqual(resp_edit.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_edit.data["importancia_literatura"], 3)

        # 3. Baja lógica mediante cambiar-estado
        resp_toggle = self.client.post(f"/api/v1/guios/admin/factores/{factor_id}/cambiar-estado/")
        self.assertEqual(resp_toggle.status_code, status.HTTP_200_OK)
        self.assertFalse(resp_toggle.data["data"]["activo"])

        # Verificar persistencia en base de datos
        factor_db = Factor.objects.get(id=factor_id)
        self.assertFalse(factor_db.activo)

    def test_admin_crear_y_baja_logica_subfactor(self):
        """El administrador puede crear y desactivar subfactores con código único."""
        self.client.force_authenticate(user=self.admin)

        # 1. Crear subfactor
        resp_crear = self.client.post("/api/v1/guios/admin/subfactores/", {
            "codigo": "SF-99",
            "descripcion": "El software soporta autenticación OAuth2 / SAML.",
            "id_factor": self.factor.id,
        }, format="json")
        self.assertEqual(resp_crear.status_code, status.HTTP_201_CREATED)
        sf_id = resp_crear.data["id"]

        # 2. Rechazar duplicado de código
        resp_dup = self.client.post("/api/v1/guios/admin/subfactores/", {
            "codigo": "SF-99",
            "descripcion": "Duplicado",
            "id_factor": self.factor.id,
        }, format="json")
        self.assertEqual(resp_dup.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Baja lógica
        resp_delete = self.client.delete(f"/api/v1/guios/admin/subfactores/{sf_id}/")
        self.assertEqual(resp_delete.status_code, status.HTTP_204_NO_CONTENT)
        sf_db = Subfactor.objects.get(id=sf_id)
        self.assertFalse(sf_db.activo)

    def test_admin_gestionar_keywords_factor(self):
        """HU-03 / RF-14: El administrador puede consultar y persistir keywords por factor."""
        # 1. Evaluador es rechazado con 403
        self.client.force_authenticate(user=self.evaluador)
        resp_eval = self.client.post("/api/v1/guios/admin/factores/keywords/", {
            "id_factor": self.factor.id,
            "keywords": ["interoperability", "cloud ready"],
            "usar_sinonimos": True,
        }, format="json")
        self.assertEqual(resp_eval.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Administrador puede guardar keywords
        self.client.force_authenticate(user=self.admin)
        resp_admin = self.client.post("/api/v1/guios/admin/factores/keywords/", {
            "id_factor": self.factor.id,
            "keywords": ["interoperability", "cloud ready", "cross-platform"],
            "usar_sinonimos": True,
        }, format="json")
        self.assertEqual(resp_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp_admin.data["data"]["keywords"]), 3)

        # 3. Administrador puede consultar keywords
        resp_get = self.client.get("/api/v1/guios/admin/factores/keywords/")
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)
        self.assertIn(str(self.factor.id), resp_get.data)
        self.assertEqual(
            resp_get.data[str(self.factor.id)]["keywords"],
            ["interoperability", "cloud ready", "cross-platform"],
        )

    @patch("guio_core.services.academic_ai_service._http_json")
    def test_paso0_calcular_consultar_y_restaurar_evidencia(self, mock_http_json):
        """RF-14: El Paso 0 consulta OpenAlex, calcula IL/IS, persiste evidencia y permite restaurar."""
        def fake_http(url, method="GET", payload=None, headers=None, timeout=10):
            if "api.openalex.org" in url:
                return {
                    "meta": {"count": 15},
                    "results": [
                        {
                            "id": "https://openalex.org/W123",
                            "doi": "https://doi.org/10.1000/test",
                            "display_name": "Open Source LMS Adoption Study",
                            "publication_year": 2024,
                            "cited_by_count": 42,
                            "authorships": [{"author": {"display_name": "Garcia, A."}}],
                            "primary_location": {"source": {"display_name": "IEEE Access"}},
                        }
                    ],
                }
            return None

        mock_http_json.side_effect = fake_http

        self.client.force_authenticate(user=self.evaluador)
        ev = Evaluacion.objects.create(nombre_software="Moodle", id_usuario=self.evaluador)

        # 1. Calcular Paso 0
        resp_calc = self.client.post("/api/v1/guios/evidencia/calcular/", {
            "evaluacion_id": ev.id,
            "nombre_software": "Moodle",
            "contexto_uso": "Educación",
            "fuentes": {"scopus": True, "openAlex": True, "semanticScholar": False},
        }, format="json")
        self.assertEqual(resp_calc.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_calc.data["software"], "Moodle")
        self.assertGreater(resp_calc.data["kpis"]["documentos"], 0)
        self.assertTrue(ConsultaEvidencia.objects.filter(id_evaluacion=ev).exists())
        self.assertEqual(EvidenciaFactor.objects.filter(id_consulta__id_evaluacion=ev).count(), 1)

        # 2. Consultar evidencia guardada
        resp_get = self.client.get(f"/api/v1/guios/evidencia/?evaluacion_id={ev.id}")
        self.assertEqual(resp_get.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_get.data["items"][0]["documentos"], 15)
        self.assertEqual(resp_get.data["items"][0]["citas"], 42)
        self.assertIn("IS", resp_get.data["items"][0])

        # 3. Probar consulta de un factor como evaluador (403) y como admin (200)
        resp_prob_eval = self.client.post("/api/v1/guios/admin/factores/probar-consulta/", {
            "id_factor": self.factor.id,
            "nombre_software": "Moodle",
        }, format="json")
        self.assertEqual(resp_prob_eval.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        resp_prob_admin = self.client.post("/api/v1/guios/admin/factores/probar-consulta/", {
            "id_factor": self.factor.id,
            "nombre_software": "Moodle",
            "usar_sinonimos": False,
        }, format="json")
        self.assertEqual(resp_prob_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_prob_admin.data["documentos"], 15)

        # 4. Restaurar valores originales de la tesis
        self.client.force_authenticate(user=self.evaluador)
        resp_rest = self.client.post("/api/v1/guios/evidencia/restaurar/", {
            "evaluacion_id": ev.id,
        }, format="json")
        self.assertEqual(resp_rest.status_code, status.HTTP_200_OK)
        self.assertFalse(ConsultaEvidencia.objects.filter(id_evaluacion=ev).exists())

    @patch("guio_core.services.recommendation_ai_service._http_json")
    def test_paso3_recomendaciones_ia_y_fallback(self, mock_http_json):
        """Paso 3: Genera recomendaciones personalizadas según calificaciones y las persiste."""
        mock_http_json.return_value = None  # Probar respaldo determinístico sobre calificaciones reales

        self.client.force_authenticate(user=self.evaluador)
        ev = Evaluacion.objects.create(nombre_software="LibreOffice", id_usuario=self.evaluador)

        payload = {
            "evaluacion_id": ev.id,
            "nombre_software": "LibreOffice",
            "contexto_uso": "Universidad pública",
            "recomendacion": "C",
            "viabilidad": 50,
            "nivel_confianza": "Medio",
            "factores": [
                {
                    "id": 1,
                    "nombre": "Compatibilidad",
                    "foda": "Amenaza",
                    "alcance": "Externo",
                    "isCritical": True,
                    "PM": 2.0,
                    "IR": "3 · Importante",
                }
            ],
            "subfactores": {
                "1": [
                    {
                        "codigo": "SF-02",
                        "descripcion": "Exportar formatos propietarios",
                        "calificacion": 1,
                        "observacion": "Pérdida de formato en macros DOCX complejos",
                    },
                    {
                        "codigo": "SF-04",
                        "descripcion": "Certificado en su nicho",
                        "calificacion": 2,
                        "observacion": "",
                    },
                ]
            },
        }

        resp = self.client.post("/api/v1/guios/recomendaciones-ia/", payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("LibreOffice", resp.data["diagnostico_ejecutivo"])
        self.assertGreater(len(resp.data["recomendaciones_priorizadas"]), 0)
        self.assertEqual(resp.data["recomendaciones_priorizadas"][0]["factor"], "Compatibilidad")
        self.assertGreater(len(resp.data["plan_desconocimiento"]), 0)

        ev.refresh_from_db()
        self.assertIsNotNone(ev.recomendacion_ia)
        self.assertEqual(ev.recomendacion_ia["recomendaciones_priorizadas"][0]["factor"], "Compatibilidad")



