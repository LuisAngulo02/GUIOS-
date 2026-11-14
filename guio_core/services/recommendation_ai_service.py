"""
Servicio de Recomendaciones Personalizadas con IA (Paso 3 / Dictamen GUIOS+).

Genera diagnósticos ejecutivos, chips de acción, planes de mitigación
y protocolos de verificación técnicos a partir de las calificaciones reales de factores,
subfactores (1-4), clasificación FODA y observaciones del evaluador.

Respeta la Regla de Oro metodológica:
- NO altera la letra oficial del dictamen (A, B o C).
- NO altera los umbrales matemáticos (FODA 3.0, IR, PM).
- Traduce los puntajes numéricos y brechas detectadas en una hoja de ruta accionable
  para el comité decisor de TI.
"""
import json
import logging
import urllib.parse
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.utils import timezone

from guio_core.services.academic_ai_service import _http_json

logger = logging.getLogger(__name__)


# Catálogo experto metodológico para cada factor de la tesis doctoral GUIOSPRO
CATALOGO_EXPERTO_FACTORES: Dict[str, Dict[str, Any]] = {
    "Compatibilidad": {
        "accion": "Diseñar una capa de interoperabilidad y validar la compatibilidad de formatos de datos abiertos.",
        "pasos": [
            "Auditar las interfaces y formatos de datos actualmente en uso frente a estándares abiertos (ISO/IEC 26300, OASIS, REST/JSON).",
            "Desarrollar scripts o adaptadores de migración para evitar la pérdida de interoperabilidad con sistemas legados.",
            "Ejecutar pruebas de carga cruzadas en los sistemas operativos y entornos de red de la institución.",
        ],
        "entregable": "Matriz de interoperabilidad y adaptadores de migración certificados.",
        "plazo": "Semanas 1 a 4",
    },
    "Personalización": {
        "accion": "Establecer una arquitectura modular para extensiones locales sin desalinearse del repositorio upstream.",
        "pasos": [
            "Revisar las APIs públicas, hooks y mecanismos de extensión del software antes de modificar el núcleo.",
            "Crear un repositorio interno de control de versiones con integración continua para empaquetar adaptaciones institucionales.",
            "Documentar los lineamientos de codificación y pruebas de regresión para mantener compatibilidad con futuras versiones upstream.",
        ],
        "entregable": "Guía de desarrollo de extensiones y repositorio institucional versionado.",
        "plazo": "Semanas 2 a 6",
    },
    "Prueba": {
        "accion": "Implementar un banco de pruebas automatizado (staging) antes del paso a producción.",
        "pasos": [
            "Desplegar un entorno espejo (sandbox) idéntico a la infraestructura de producción.",
            "Diseñar suites de pruebas automatizadas que cubran casos de uso críticos, rendimiento y estrés.",
            "Definir criterios de aceptación formal firmados por los líderes técnicos antes del despliegue masivo.",
        ],
        "entregable": "Informe de cobertura de pruebas y entorno de staging homologado.",
        "plazo": "Semanas 2 a 4",
    },
    "Fiabilidad": {
        "accion": "Configurar esquemas de alta disponibilidad, monitoreo proactivo y respaldo institucional.",
        "pasos": [
            "Definir acuerdos de nivel de servicio (SLAs) internos con metas de disponibilidad (e.g. 99.5%).",
            "Implementar monitoreo continuo de recursos (CPU, memoria, latencia) y alertas automatizadas.",
            "Diseñar y ensayar un plan de recuperación ante desastres (DRP) con políticas estrictas de respaldo y restauración periódica.",
        ],
        "entregable": "Plan de continuidad operativa (DRP) y tablero de monitoreo de disponibilidad.",
        "plazo": "Semanas 1 a 3",
    },
    "Seguridad": {
        "accion": "Ejecutar análisis de vulnerabilidades, auditoría de dependencias y endurecimiento de configuración.",
        "pasos": [
            "Ejecutar escaneo estático de código (SAST) y análisis de vulnerabilidades conocidas (CVEs) en dependencias.",
            "Aplicar guías de endurecimiento (hardening) en servidores, base de datos y protocolos de comunicación cifrada (TLS 1.3).",
            "Establecer un protocolo institucional de actualización periódica y gestión de parches de seguridad críticos.",
        ],
        "entregable": "Informe de auditoría de seguridad y matriz de mitigación de vulnerabilidades.",
        "plazo": "Semanas 1 a 2 (Inmediato)",
    },
    "Reusabilidad": {
        "accion": "Auditar licenciamiento de componentes y definir arquitectura de servicios reutilizables.",
        "pasos": [
            "Revisar las licencias de todas las bibliotecas dependientes para confirmar compatibilidad con el marco legal institucional.",
            "Empaquetar módulos comunes como microservicios o bibliotecas compartidas reutilizables por otras áreas.",
            "Publicar el catálogo de APIs y esquemas de datos internos en el repositorio de la institución.",
        ],
        "entregable": "Dictamen legal de licencias y catálogo de servicios reutilizables.",
        "plazo": "Semanas 3 a 5",
    },
    "Usabilidad": {
        "accion": "Realizar pruebas de experiencia de usuario (UX) y diseñar guías visuales de rápida adopción.",
        "pasos": [
            "Efectuar pruebas heurísticas de usabilidad con grupos representativos de usuarios finales.",
            "Identificar las fricciones más comunes respecto a la herramienta previa y configurar personalizaciones visuales simplificadas.",
            "Publicar guías rápidas de usuario (hojas de atajos y videotutoriales breves de tareas frecuentes).",
        ],
        "entregable": "Informe de usabilidad heurística y kit de guías de usuario en formato digital.",
        "plazo": "Semanas 2 a 4",
    },
    "Documentación": {
        "accion": "Elaborar la base de conocimientos técnica y operativa centralizada.",
        "pasos": [
            "Consolidar la documentación oficial en una wiki institucional accesible para administradores y soporte.",
            "Elaborar manuales paso a paso de instalación, configuración, resolución de fallas y procedimientos de contingencia.",
            "Establecer un proceso de actualización continua de la documentación ante cada cambio de versión.",
        ],
        "entregable": "Portal wiki institucional de documentación técnica y procedimientos operativos.",
        "plazo": "Semanas 2 a 3",
    },
    "Comunidad": {
        "accion": "Vincular a la institución con los canales comunitarios oficiales y evaluar convenios de soporte L2/L3.",
        "pasos": [
            "Suscribir a los ingenieros institucionales a las listas de correo, foros y repositorios oficiales del proyecto.",
            "Monitorear la frecuencia de lanzamientos, parches y velocidad de respuesta a incidencias en el repositorio upstream.",
            "Evaluar proveedores locales o firmas especializadas que ofrezcan pólizas comerciales de soporte L2/L3 para contingencias críticas.",
        ],
        "entregable": "Protocolo de escalamiento a soporte comunitario y evaluación de proveedores de soporte.",
        "plazo": "Semanas 1 a 3",
    },
    "Capacitación": {
        "accion": "Estructurar un programa formal de formación técnica y entrenamiento de usuarios finales.",
        "pasos": [
            "Segmentar las necesidades formativas en dos niveles: administradores de sistemas y usuarios finales.",
            "Diseñar talleres prácticos basados en los flujos de trabajo cotidianos de la institución.",
            "Formar multiplicadores internos ('champions') que brinden apoyo de primera línea a sus compañeros.",
        ],
        "entregable": "Cronograma de talleres de formación, material didáctico y evaluaciones de competencia.",
        "plazo": "Semanas 2 a 6",
    },
    "Costos": {
        "accion": "Consolidar el modelo de Costo Total de Propiedad (TCO) proyectado a 3 y 5 años.",
        "pasos": [
            "Calcular los costos directos e indirectos: servidores, almacenamiento, migración de datos, formación y soporte.",
            "Comparar el TCO frente a los costos recurrentes de licenciamiento privativo y penalidades de vendor lock-in.",
            "Establecer la partida presupuestaria de sostenimiento para el software libre adoptado.",
        ],
        "entregable": "Modelo financiero de TCO comparativo y presupuesto de sostenimiento plurianual.",
        "plazo": "Semanas 1 a 3",
    },
    "Cultura": {
        "accion": "Implementar una estrategia de gestión del cambio institucional para mitigar la resistencia a la adopción.",
        "pasos": [
            "Comunicar las razones estratégicas y beneficios institucionales de la transición hacia estándares abiertos.",
            "Involucrar tempranamente a los líderes departamentales en las decisiones de configuración del nuevo entorno.",
            "Habilitar canales de retroalimentación donde los usuarios expresen dudas y reporten mejoras operativas.",
        ],
        "entregable": "Plan de gestión del cambio institucional y protocolo de comunicación interna.",
        "plazo": "Semanas 1 a 4",
    },
}


def _extraer_resumen_calificaciones(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Construye un resumen compacto y estructurado con los factores críticos,
    debilidades, amenazas, subfactores reprobados (nota 1), inciertos (nota 2)
    y observaciones registradas.
    """
    factores = payload.get("factores") or []
    subfactores_map = payload.get("subfactores") or {}

    factores_negativos: List[Dict[str, Any]] = []
    factores_positivos: List[Dict[str, Any]] = []
    reactivos_no_cumple: List[Dict[str, Any]] = []
    reactivos_desconozco: List[Dict[str, Any]] = []

    for f in factores:
        foda = (f.get("foda") or "").strip()
        pm = f.get("PM") or f.get("PM_str") or 0
        alcance = f.get("alcance") or "Externo"
        critico = bool(f.get("isCritical") or f.get("critico"))
        f_id = str(f.get("id") or f.get("id_factor") or "")
        nombre_f = f.get("nombre") or f.get("nombre_factor") or "Factor"

        sfs = subfactores_map.get(f_id) or subfactores_map.get(int(f_id) if f_id.isdigit() else -1) or []
        sfs_bajos = []

        for sf in sfs:
            calif = sf.get("calificacion")
            cod = sf.get("codigo") or ""
            desc = sf.get("descripcion") or ""
            obs = (sf.get("observacion") or "").strip()

            if calif == 1:
                reactivos_no_cumple.append({
                    "factor": nombre_f,
                    "alcance": alcance,
                    "critico": critico,
                    "codigo": cod,
                    "descripcion": desc[:160],
                    "observacion": obs[:180],
                })
                sfs_bajos.append(f"{cod} (No cumple){': ' + obs if obs else ''}")
            elif calif == 2:
                reactivos_desconozco.append({
                    "factor": nombre_f,
                    "codigo": cod,
                    "descripcion": desc[:160],
                    "observacion": obs[:180],
                })
                sfs_bajos.append(f"{cod} (Desconozco)")
            elif calif == 3 and obs:
                sfs_bajos.append(f"{cod} (Parcial): {obs}")

        if foda in ("Debilidad", "Amenaza", "debilidad", "amenaza"):
            factores_negativos.append({
                "factor": nombre_f,
                "foda": foda,
                "alcance": alcance,
                "critico": critico,
                "PM": pm,
                "IR": f.get("IR") or "",
                "detalle_subfactores": sfs_bajos[:6],
            })
        else:
            factores_positivos.append({
                "factor": nombre_f,
                "foda": foda,
                "PM": pm,
            })

    # Ordenar: primero factores críticos, luego menor puntuación PM
    factores_negativos.sort(
        key=lambda x: (not x["critico"], float(str(x["PM"]).replace(",", ".") or 4))
    )

    raw_sw = (payload.get("nombre_software") or "").strip()
    nombre_sw = f"'{raw_sw}'" if raw_sw and raw_sw.lower() not in ("floss", "software", "ia") else (raw_sw or "el software FLOSS evaluado")

    return {
        "nombre_software": raw_sw or "Software FLOSS",
        "nombre_software_formato": nombre_sw,
        "contexto_uso": payload.get("contexto_uso") or "Organizacional / Institucional",
        "descripcion_caso": payload.get("descripcion_caso") or "",
        "recomendacion": payload.get("recomendacion") or "B",
        "dictamen_titulo": payload.get("dictamen_titulo") or "",
        "viabilidad": payload.get("viabilidad") or 0,
        "nivel_confianza": payload.get("nivel_confianza") or "Medio",
        "factores_negativos": factores_negativos,
        "factores_positivos": factores_positivos,
        "reactivos_no_cumple": reactivos_no_cumple[:12],
        "reactivos_desconozco": reactivos_desconozco[:10],
    }


def _obtener_conocimiento_factor(nombre_factor: str) -> Dict[str, Any]:
    """Busca en el catálogo metodológico experto por coincidencia parcial de nombre."""
    for key, data in CATALOGO_EXPERTO_FACTORES.items():
        if key.lower() in nombre_factor.lower() or nombre_factor.lower() in key.lower():
            return data
    return {
        "accion": f"Asignar recursos especializados para subsanar los reactivos comprometidos en {nombre_factor}.",
        "pasos": [
            f"Auditar técnicamente los requisitos incumplidos del factor {nombre_factor}.",
            "Desarrollar un plan de trabajo correctivo con responsables y fechas fijadas.",
            "Validar la solución mediante pruebas de aceptación en entorno controlado.",
        ],
        "entregable": f"Informe de mitigación y plan de trabajo para {nombre_factor}.",
        "plazo": "Semanas 2 a 4",
    }


def _generar_fallback_determinista(resumen: Dict[str, Any]) -> Dict[str, Any]:
    """
    Respaldo determinístico experto basado en la tesis doctoral GUIOSPRO (Capítulo 6)
    y el catálogo metodológico institucional. Produce recomendaciones completas,
    estructuradas con pasos, entregables y plazos aún sin conexión con Gemini.
    """
    software_fmt = resumen["nombre_software_formato"]
    raw_sw = resumen["nombre_software"]
    rec = resumen["recomendacion"]
    viab = resumen["viabilidad"]
    conf = resumen["nivel_confianza"]
    negativos = resumen["factores_negativos"]
    no_cumple = resumen["reactivos_no_cumple"]
    desconozco = resumen["reactivos_desconozco"]

    criticos = [f for f in negativos if f["critico"]]
    internos_neg = [f for f in negativos if f["alcance"] == "Interno"]
    externos_neg = [f for f in negativos if f["alcance"] == "Externo"]

    if rec == "A":
        diagnostico = (
            f"Adopción de {software_fmt} plenamente viable ({viab}% de viabilidad). "
            f"Todos los factores relevantes evaluados satisfacen los umbrales de éxito sin bloqueadores críticos."
        )
    elif rec == "B":
        nombres_opc = ", ".join(f["factor"] for f in negativos[:3]) or "factores no críticos"
        diagnostico = (
            f"Adopción de {software_fmt} viable con reservas ({viab}% de viabilidad). "
            f"No hay bloqueadores críticos; se detectaron brechas únicamente en factores opcionales ({nombres_opc})."
        )
    else:
        nombres_crit = ", ".join(f["factor"] for f in criticos[:3]) or "factores críticos"
        diagnostico = (
            f"Adopción de {software_fmt} condicionada a mitigación previa ({viab}% de viabilidad). "
            f"Factores críticos comprometidos: {nombres_crit}."
        )

    acciones = []
    for f in negativos[:4]:
        sfs_cods = [
            r["codigo"] for r in no_cumple + desconozco
            if r["factor"] == f["factor"] and r["codigo"]
        ][:3]
        es_critico = f["critico"]
        info_experta = _obtener_conocimiento_factor(f["factor"])

        acciones.append({
            "prioridad": "Alta" if es_critico or float(str(f["PM"]).replace(",", ".") or 3) < 2.0 else "Media",
            "factor": f["factor"],
            "alcance": f"{f['alcance']} ({'Organizacional' if f['alcance'] == 'Interno' else 'Tecnológico'})",
            "criticidad": "Crítico" if es_critico else "Opcional",
            "subfactores_clave": sfs_cods or f.get("detalle_subfactores", [])[:3],
            "accion": info_experta["accion"],
            "pasos": info_experta.get("pasos", [])[:2],
            "entregable": info_experta["entregable"],
            "plazo": info_experta["plazo"],
            "justificacion": f"{f['foda']} · PM {f['PM']}/4.0 · IR {f['IR'] or 'Opcional'}",
        })

    # Protocolos de comprobación concisos para reactivos marcados con nota 2
    plan_incertidumbre = []
    for d in desconozco[:4]:
        cod = d["codigo"]
        desc = d["descripcion"]
        factor_nom = d["factor"]

        if any(w in desc.lower() for w in ("licencia", "propietari", "legal", "código")):
            rol = "Auditor de Software"
            proto = f"Auditar encabezados de licencia y compatibilidad en el repositorio oficial de {raw_sw}."
        elif any(w in desc.lower() for w in ("gui", "interfaz", "fácil", "usabilidad", "usuario")):
            rol = "Líder UX"
            proto = f"Realizar prueba piloto con usuarios finales en tareas típicas de {raw_sw}."
        elif any(w in desc.lower() for w in ("biblioteca", "marco", "framework", "api", "extensión")):
            rol = "Arquitecto de Software"
            proto = f"Ejecutar prueba de concepto (PoC) sobre APIs o módulos de integración de {raw_sw}."
        else:
            rol = "Especialista TI"
            proto = f"Validar en laboratorio técnico: '{desc[:75]}'."

        plan_incertidumbre.append({
            "codigo": cod,
            "factor": factor_nom,
            "reactivo": desc[:90],
            "protocolo": proto,
            "rol_responsable": rol,
        })

    chips = []
    if criticos:
        chips.append(f"Mitigar {len(criticos)} factor(es) crítico(s)")
    if externos_neg:
        chips.append("Ingeniería FLOSS (Tecnológico)")
    if internos_neg:
        chips.append("Capacitación y Gestión Interna")
    if desconozco:
        chips.append(f"Validar {len(desconozco)} reactivo(s) incierto(s)")
    if not chips:
        chips = ["Despliegue gradual", "Monitoreo de SLAs", "Documentación operativa"]

    return {
        "diagnostico_ejecutivo": diagnostico,
        "chips_accion": chips[:4],
        "recomendaciones_priorizadas": acciones,
        "plan_desconocimiento": plan_incertidumbre,
        "generado_por_ia": False,
        "modelo": "Motor Metodológico GUIOS+ (Tesis Cap. 6)",
        "fecha_generacion": timezone.now().isoformat(),
    }


def generar_recomendaciones_ia(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Genera recomendaciones técnicas y organizacionales de alto nivel consultor usando Google Gemini
    a partir de las calificaciones exactas de factores y subfactores.
    Si no hay GEMINI_API_KEY o falla la red, retorna el análisis metodológico experto basado en los datos reales.
    """
    resumen = _extraer_resumen_calificaciones(payload)
    api_key = getattr(settings, "GEMINI_API_KEY", "").strip()

    if not api_key:
        return _generar_fallback_determinista(resumen)

    model = getattr(settings, "GEMINI_MODEL", "gemini-flash-lite-latest") or "gemini-flash-lite-latest"
    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={urllib.parse.quote(api_key)}"

    prompt = (
        "Eres un arquitecto de software senior y consultor FLOSS bajo la metodología GUIOS (Doctorado en Informática).\n"
        "A partir de los resultados de esta evaluación, genera un dictamen técnico DIRECTO, CONCISO y SIN RELLENO, "
        "enfocado en lo que un ingeniero de software y líder técnico necesita saber para actuar.\n\n"
        "REGLAS METODOLÓGICAS ESTRICTAS:\n"
        "1. REGLA DE ORO: NO alteres el dictamen oficial (Recomendación A, B o C).\n"
        "2. SINTÉTICO: Evita párrafos largos o teoría obvia. Cada recomendación debe ser una directiva técnica concreta.\n"
        "3. ALCANCE:\n"
        "   - Factores Externos (Tecnológicos): adaptadores, librerías, formatos, pruebas o ingeniería de software.\n"
        "   - Factores Internos (Organizacionales): capacitación, soporte interno, gobernanza o gestión del cambio.\n"
        "4. Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:\n"
        "{\n"
        '  "diagnostico_ejecutivo": "1 o 2 oraciones directas resumiendo la viabilidad, el dictamen y el principal bloqueador o condición.",\n'
        '  "chips_accion": ["Acción 1 (máx 3 palabras)", "Acción 2", "Acción 3"],\n'
        '  "recomendaciones_priorizadas": [\n'
        "    {\n"
        '      "prioridad": "Alta" | "Media",\n'
        '      "factor": "Nombre del factor",\n'
        '      "alcance": "Tecnológico" | "Organizacional",\n'
        '      "criticidad": "Crítico" | "Opcional",\n'
        '      "subfactores_clave": ["SF-01", "SF-02"],\n'
        '      "accion": "Directiva técnica concisa (1 o 2 oraciones claras).",\n'
        '      "entregable": "Artefacto o entregable concreto (ej. Adaptador ODF, Guía L2)",\n'
        '      "plazo": "e.g. 2 semanas"\n'
        "    }\n"
        "  ],\n"
        '  "plan_desconocimiento": [\n'
        "    {\n"
        '      "codigo": "SF-xx",\n'
        '      "factor": "Nombre del factor",\n'
        '      "reactivo": "Enunciado corto",\n'
        '      "protocolo": "Comprobación técnica en 1 línea.",\n'
        '      "rol_responsable": "Rol técnico sugerido"\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        f"DATOS DE LA EVALUACIÓN REAL:\n{json.dumps(resumen, ensure_ascii=False)}"
    )

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
        },
    }

    resp = _http_json(endpoint, method="POST", payload=body, timeout=22)
    if not resp:
        logger.warning("Respuesta vacía de Gemini al solicitar recomendaciones. Aplicando motor metodológico.")
        return _generar_fallback_determinista(resumen)

    try:
        raw_text = resp["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(raw_text)
        if not isinstance(parsed, dict) or not parsed.get("diagnostico_ejecutivo"):
            return _generar_fallback_determinista(resumen)

        # Normalizar plan_desconocimiento si vinieran strings simples
        plan_desc_raw = parsed.get("plan_desconocimiento") or []
        plan_desc_norm = []
        for item in plan_desc_raw:
            if isinstance(item, dict):
                plan_desc_norm.append(item)
            elif isinstance(item, str):
                plan_desc_norm.append({
                    "codigo": "SF",
                    "factor": "Evaluación",
                    "reactivo": item,
                    "protocolo": item,
                    "rol_responsable": "Comité de TI",
                })

        return {
            "diagnostico_ejecutivo": str(parsed.get("diagnostico_ejecutivo", "")),
            "chips_accion": list(parsed.get("chips_accion") or [])[:4],
            "recomendaciones_priorizadas": list(parsed.get("recomendaciones_priorizadas") or [])[:6],
            "plan_desconocimiento": plan_desc_norm[:5],
            "generado_por_ia": True,
            "modelo": f"Gemini ({model})",
            "fecha_generacion": timezone.now().isoformat(),
        }
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        logger.warning("Error parseando respuesta estructurada de Gemini: %s", exc)
        return _generar_fallback_determinista(resumen)
