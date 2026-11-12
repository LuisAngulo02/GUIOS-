"""
Servicio de asistencia inteligente para pre-calificación ágil de subfactores (HU-05 / Tarea 6).
Permite sugerir calificaciones Likert (1 a 4) y observaciones técnicas preliminares
para los 61 reactivos de la tesis doctoral GUIOS (Víctor Hugo Rea Sánchez, 2022)
utilizando Google Gemini (gemini-3.5-flash-lite) con respaldo experto determinista.
"""
import json
import logging
import urllib.parse
import urllib.request
from typing import Dict, Any, List, Optional
from django.conf import settings
from guio_core.models import Subfactor, Factor

logger = logging.getLogger(__name__)

# Base de conocimiento experta para soluciones FLOSS reconocidas y heurística GUIOS
CONOCIMIENTO_FLOSS_COMUN: Dict[str, Dict[str, Dict[str, Any]]] = {
    "libreoffice": {
        "SF-01": {"calificacion": 3, "observacion": "Existen soluciones en nube derivadas como Collabora Online y Nextcloud Office."},
        "SF-02": {"calificacion": 3, "observacion": "Importa y exporta formatos propietarios OOXML (.docx, .xlsx, .pptx) con diferencias menores en macros complejas."},
        "SF-03": {"calificacion": 3, "observacion": "Se integra con suites propietarias y sistemas de gestión mediante ODBC y extensiones."},
        "SF-04": {"calificacion": 4, "observacion": "Ampliamente certificado y estándar de facto en ofimática pública internacional."},
        "SF-05": {"calificacion": 4, "observacion": "Satisface plenamente procesador de textos, hoja de cálculo, presentaciones y diagramación."},
        "SF-06": {"calificacion": 4, "observacion": "Soporta arquitecturas x86, x86_64, ARM y periféricos estándar."},
        "SF-07": {"calificacion": 4, "observacion": "Referente primordial en implementación del estándar ISO/IEC OpenDocument (ODF)."},
        "SF-08": {"calificacion": 4, "observacion": "Multiplataforma nativo en GNU/Linux, Microsoft Windows y macOS."},
        "SF-09": {"calificacion": 4, "observacion": "El acceso al código C++ bajo licencia MPL 2.0 asegura soberanía e independencia."},
        "SF-10": {"calificacion": 3, "observacion": "Requiere equipo con dominio en C++ y entorno de compilación de LibreOffice Core."},
        "SF-11": {"calificacion": 4, "observacion": "Ciclo semestral regular de versiones mayores con soporte de The Document Foundation."},
        "SF-12": {"calificacion": 4, "observacion": "Personalizable mediante plantillas, estilos, barras de herramientas y configuración de usuario."},
        "SF-13": {"calificacion": 4, "observacion": "Ecosistema robusto de módulos independientes (Writer, Calc, Impress, Draw, Base, Math)."},
        "SF-14": {"calificacion": 4, "observacion": "Repositorio público oficial de extensiones y plantillas en extensions.libreoffice.org."},
        "SF-15": {"calificacion": 4, "observacion": "Instaladores estándar .msi, .deb, .rpm y formatos portables AppImage/Flatpak."},
        "SF-16": {"calificacion": 4, "observacion": "Historial de seguridad transparente con auditorías y boletines periódicos de CVEs."},
        "SF-17": {"calificacion": 4, "observacion": "Estabilidad demostrada en despliegues con millones de puestos de trabajo en el sector público."},
        "SF-18": {"calificacion": 4, "observacion": "Elevada flexibilidad en interoperabilidad de formatos libres y parametrización."},
        "SF-19": {"calificacion": 3, "observacion": "Fiabilidad comparable al software propietario en entornos administrativos estándar."},
        "SF-20": {"calificacion": 3, "observacion": "Control de acceso a nivel de cifrado de documentos con clave AES y firmas digitales."},
        "SF-21": {"calificacion": 3, "observacion": "Licencia MPL 2.0 permite integración y distribución comercial con módulos propietarios."},
        "SF-22": {"calificacion": 3, "observacion": "Proporciona SDK y APIs UNO (Universal Network Objects) para integración como biblioteca."},
        "SF-23": {"calificacion": 4, "observacion": "Interfaz gráfica completa con modos clásico, Ribbon (NotebookBar) y barras compactas."},
        "SF-24": {"calificacion": 3, "observacion": "Curva de usabilidad amigable, muy similar a versiones tradicionales de ofimática."},
        "SF-25": {"calificacion": 3, "observacion": "Fácil de aprender para usuarios que ya dominan procesadores de texto y hojas de cálculo."},
        "SF-26": {"calificacion": 3, "observacion": "Reduce el descontento por costes de licencias recurrentes y restricciones de vendor lock-in."},
        "SF-27": {"calificacion": 4, "observacion": "Mantenimiento activo y continuo con una de las comunidades más dinámicas del ecosistema FLOSS."},
        "SF-28": {"calificacion": 3, "observacion": "Visores móviles disponibles para Android/iOS mediante Collabora Office."},
        "SF-29": {"calificacion": 4, "observacion": "Base soporta múltiples motores: Firebird nativo, PostgreSQL, MySQL, SQLite y ODBC/JDBC."},
        "SF-30": {"calificacion": 3, "observacion": "Documentación técnica para desarrolladores disponible en wiki.documentfoundation.org."},
        "SF-31": {"calificacion": 4, "observacion": "Manuales completos de usuario para cada uno de los programas de la suite."},
        "SF-32": {"calificacion": 4, "observacion": "Disponible en PDF, web en línea, ayuda integrada offline y formatos impresos."},
        "SF-33": {"calificacion": 4, "observacion": "Redacción clara con capturas de pantalla y ejemplos paso a paso."},
        "SF-34": {"calificacion": 4, "observacion": "Guías actualizadas con cada lanzamiento mayor de la suite."},
        "SF-35": {"calificacion": 3, "observacion": "Equipo internacional de documentación integrado por redactores técnicos de la comunidad."},
        "SF-36": {"calificacion": 4, "observacion": "Alta calidad formal y pedagógica en las guías oficiales."},
        "SF-37": {"calificacion": 3, "observacion": "Incluye documentación del modelo de componentes UNO y desarrollo de macros."},
        "SF-38": {"calificacion": 4, "observacion": "Guías oficiales de usuario descargables gratuitamente en español."},
        "SF-39": {"calificacion": 4, "observacion": "Cobertura exhaustiva de funciones, fórmulas matemáticas y estilos de formato."},
        "SF-40": {"calificacion": 4, "observacion": "Especificaciones completas y abiertas del estándar OASIS OpenDocument."},
        "SF-41": {"calificacion": 3, "observacion": "Fomenta el desarrollo de competencias digitales en formatos abiertos y estándares ISO."},
        "SF-42": {"calificacion": 3, "observacion": "Los usuarios finales se adaptan con facilidad mediante autoaprendizaje y guías rápidas."},
        "SF-43": {"calificacion": 3, "observacion": "El equipo de soporte informático puede resolver la gran mayoría de incidentes de operación."},
        "SF-44": {"calificacion": 3, "observacion": "Materiales formativos, cursos MOOC y tutoriales ampliamente accesibles en la web."},
        "SF-45": {"calificacion": 4, "observacion": "Despliegue automatizable mediante directivas de grupo (GPO), SCCM, Ansible o scripts."},
        "SF-46": {"calificacion": 3, "observacion": "Tiempo de adopción moderado condicionado a la sustitución de macros institucionales complejas."},
        "SF-47": {"calificacion": 4, "observacion": "Casos de éxito documentados internacionalmente (Administración Pública de Múnich, Gendarmería Francesa, Ministerios en España y Brasil)."},
        "SF-48": {"calificacion": 3, "observacion": "Proporciona un entorno productivo estandarizado e interoperable."},
        "SF-49": {"calificacion": 3, "observacion": "La distribución centralizada de paquetes y plantillas institucionales agiliza la adopción."},
        "SF-50": {"calificacion": 3, "observacion": "Requiere impulso directivo explícito para respaldar la política de estándares abiertos."},
        "SF-51": {"calificacion": 4, "observacion": "Elimina totalmente la dependencia exclusiva de licenciamiento de proveedores propietarios."},
        "SF-52": {"calificacion": 4, "observacion": "Comunidad global activa con foros de soporte en español (Ask LibreOffice)."},
        "SF-53": {"calificacion": 3, "observacion": "Disponibilidad de empresas certificadas por The Document Foundation para consultoría de migración."},
        "SF-54": {"calificacion": 3, "observacion": "Soporte comercial disponible mediante partners certificados (Collabora, allotropia, Adfinis)."},
        "SF-55": {"calificacion": 3, "observacion": "Administradores de sistemas con experiencia en ofimática y Linux cubren las demandas operativas."},
        "SF-56": {"calificacion": 2, "observacion": "Conocimiento de programación sobre el núcleo C++ de LibreOffice suele ser limitado internamente."},
        "SF-57": {"calificacion": 3, "observacion": "Existen proveedores que ofrecen personalización de empaquetados e integración corporativa."},
        "SF-58": {"calificacion": 3, "observacion": "El personal técnico apoya el ahorro de costes y la estandarización técnica."},
        "SF-59": {"calificacion": 2, "observacion": "Resistencia natural de usuarios habituados a la interfaz y automatizaciones del software privativo."},
        "SF-60": {"calificacion": 3, "observacion": "Costes asociados a capacitación inicial y conversión de macros deben ser presupuestados."},
        "SF-61": {"calificacion": 4, "observacion": "Cero coste de adquisición de licencias por puesto, reduciendo drásticamente el TCO a mediano plazo."},
    }
}

# Heurística universal de base para cualquier software FLOSS
REGLAS_HEURISTICAS_UNIVERSALES: Dict[str, Dict[str, Any]] = {
    # Tecnológicos
    "SF-01": {"calificacion": 3, "observacion": "Disponibilidad de despliegue en entornos virtualizados o contenedores estándar."},
    "SF-02": {"calificacion": 3, "observacion": "Capacidad de interoperabilidad con formatos del mercado."},
    "SF-03": {"calificacion": 3, "observacion": "Integrable con la infraestructura técnica y bases de datos existentes."},
    "SF-04": {"calificacion": 3, "observacion": "Reconocido en su segmento tecnológico."},
    "SF-05": {"calificacion": 4, "observacion": "Cubre las funcionalidades clave y casos de uso requeridos."},
    "SF-06": {"calificacion": 4, "observacion": "Compatible con hardware estándar de servidor y puesto de trabajo."},
    "SF-07": {"calificacion": 4, "observacion": "Implementa protocolos y estándares abiertos y documentados."},
    "SF-08": {"calificacion": 4, "observacion": "Disponible para múltiples plataformas operativas."},
    "SF-09": {"calificacion": 4, "observacion": "El acceso al código fuente permite auditoría, seguridad y soberanía tecnológica."},
    "SF-10": {"calificacion": 3, "observacion": "El código abierto permite extender y adaptar la herramienta a necesidades particulares."},
    "SF-11": {"calificacion": 3, "observacion": "Desarrollo con versiones periódicas y mejoras evolutivas."},
    "SF-12": {"calificacion": 3, "observacion": "Parametrizable mediante panel de administración o archivos de configuración."},
    "SF-13": {"calificacion": 3, "observacion": "Arquitectura modular que facilita incorporar funcionalidades adicionales."},
    "SF-14": {"calificacion": 3, "observacion": "Ecosistema de módulos, plugins o extensiones públicas disponibles."},
    "SF-15": {"calificacion": 3, "observacion": "Fácil instalación y despliegue en ambientes de prueba o laboratorio."},
    "SF-16": {"calificacion": 3, "observacion": "Trazabilidad pública de vulnerabilidades y corrección oportuna de fallos."},
    "SF-17": {"calificacion": 3, "observacion": "Solución estable y madura para entornos operativos."},
    "SF-18": {"calificacion": 3, "observacion": "Ofrece mayor flexibilidad de configuración que las opciones cerradas."},
    "SF-19": {"calificacion": 3, "observacion": "Fiabilidad adecuada para el propósito previsto."},
    "SF-20": {"calificacion": 3, "observacion": "Gestión de permisos y perfiles de acceso configurable."},
    "SF-21": {"calificacion": 3, "observacion": "Licenciamiento libre que concede plenas libertades de uso e integración."},
    "SF-22": {"calificacion": 3, "observacion": "Proporciona APIs o librerías para interconexión de sistemas."},
    "SF-23": {"calificacion": 4, "observacion": "Dispone de interfaz gráfica intuitiva para el usuario final."},
    "SF-24": {"calificacion": 3, "observacion": "Nivel de usabilidad competitivo frente a herramientas propietarias."},
    "SF-25": {"calificacion": 3, "observacion": "Curva de aprendizaje moderada para perfiles estándar."},
    "SF-26": {"calificacion": 3, "observacion": "Alternativa viable frente a restricciones del software propietario."},
    "SF-27": {"calificacion": 3, "observacion": "Mantenimiento activo por parte de comunidad o mantenedores."},
    "SF-28": {"calificacion": 2, "observacion": "Requiere verificar disponibilidad de interfaz móvil nativa o adaptada."},
    "SF-29": {"calificacion": 4, "observacion": "Arquitectura desacoplada de motores de persistencia propietarios."},
    "SF-30": {"calificacion": 3, "observacion": "Documentación técnica de desarrollo y APIs disponible."},
    "SF-31": {"calificacion": 3, "observacion": "Buena documentación general sobre instalación y operación."},
    "SF-32": {"calificacion": 3, "observacion": "Documentación disponible en formatos web, wiki y descargables."},
    "SF-33": {"calificacion": 3, "observacion": "Guías redactadas con claridad técnica."},
    "SF-34": {"calificacion": 3, "observacion": "Documentación actualizada conforme a las últimas versiones."},
    "SF-35": {"calificacion": 3, "observacion": "Participación de redactores técnicos y colaboradores de la comunidad."},
    "SF-36": {"calificacion": 3, "observacion": "Calidad adecuada de la documentación oficial."},
    "SF-37": {"calificacion": 3, "observacion": "Manuales de referencia para programadores y administradores."},
    "SF-38": {"calificacion": 4, "observacion": "Guías de usuario accesibles sin coste de suscripción."},
    "SF-39": {"calificacion": 3, "observacion": "Cubre las principales opciones de trabajo y configuración."},
    "SF-40": {"calificacion": 4, "observacion": "Estructuras y esquemas de datos transparentes y abiertos."},
    # Organizacionales
    "SF-41": {"calificacion": 3, "observacion": "Fomenta la adquisición de competencias tecnológicas internas."},
    "SF-42": {"calificacion": 3, "observacion": "Capacidad de autoformación con tutoriales y recursos online."},
    "SF-43": {"calificacion": 3, "observacion": "Personal técnico capacitado para dar soporte de primer nivel."},
    "SF-44": {"calificacion": 3, "observacion": "Existencia de temarios y recursos formativos comunitarios."},
    "SF-45": {"calificacion": 3, "observacion": "Requisitos técnicos factibles de cubrir en la infraestructura actual."},
    "SF-46": {"calificacion": 3, "observacion": "Periodo de transición e implantación dentro de tiempos razonables."},
    "SF-47": {"calificacion": 3, "observacion": "Referencias de adopción en organizaciones del sector público o académico."},
    "SF-48": {"calificacion": 3, "observacion": "Aporte positivo a la modernización tecnológica del entorno institucional."},
    "SF-49": {"calificacion": 3, "observacion": "Alineable con la infraestructura centralizada de la institución."},
    "SF-50": {"calificacion": 3, "observacion": "Alineado con directrices de eficiencia presupuestaria e independencia."},
    "SF-51": {"calificacion": 4, "observacion": "Mitiga drásticamente el bloqueo o cautiverio de proveedores privativos."},
    "SF-52": {"calificacion": 4, "observacion": "Existencia de comunidad de usuarios, foros y listas de soporte."},
    "SF-53": {"calificacion": 3, "observacion": "Disponibilidad de consultoría técnica externa si se requiere."},
    "SF-54": {"calificacion": 3, "observacion": "Opciones de soporte comercial empresarial disponibles en el mercado."},
    "SF-55": {"calificacion": 3, "observacion": "Perfiles tecnológicos en el mercado con conocimientos del stack libre."},
    "SF-56": {"calificacion": 2, "observacion": "Requiere identificar personal interno con experiencia en el código específico."},
    "SF-57": {"calificacion": 3, "observacion": "Posibilidad de contratar adaptaciones técnicas o integraciones puntuales."},
    "SF-58": {"calificacion": 3, "observacion": "Buena disposición del personal de TI hacia tecnologías de fuentes abiertas."},
    "SF-59": {"calificacion": 2, "observacion": "Se aconseja plan de gestión del cambio para acompañar a los usuarios finales."},
    # Económicos
    "SF-60": {"calificacion": 3, "observacion": "Bajos costes imprevistos al no existir cargos por licencias recurrentes."},
    "SF-61": {"calificacion": 4, "observacion": "Coste global significativamente inferior al licenciamiento comercial propietario."},
}


def _resolver_calificaciones_heuristicas(
    nombre_software: str,
    subfactores_solicitados: List[Dict[str, Any]]
) -> Dict[str, Dict[str, Any]]:
    """Genera calificaciones expertas y fundamentadas a partir del catálogo de conocimiento."""
    software_key = (nombre_software or "").strip().lower()
    base_especifica = CONOCIMIENTO_FLOSS_COMUN.get(software_key, {})

    sugerencias = {}
    for sf in subfactores_solicitados:
        cod = sf.get("codigo")
        if not cod:
            continue
        
        # 1. Base específica del software si existe
        if cod in base_especifica:
            sugerencias[cod] = base_especifica[cod]
            continue
        
        # 2. Heurística universal de la tesis GUIOS
        if cod in REGLAS_HEURISTICAS_UNIVERSALES:
            plantilla = REGLAS_HEURISTICAS_UNIVERSALES[cod]
            obs = plantilla["observacion"]
            if nombre_software and "este software" in obs:
                obs = obs.replace("este software", nombre_software)
            sugerencias[cod] = {
                "calificacion": plantilla["calificacion"],
                "observacion": obs,
            }
        else:
            sugerencias[cod] = {
                "calificacion": 3,
                "observacion": f"Cumplimiento parcial estándar para {nombre_software or 'la solución FLOSS'}.",
            }

    return sugerencias


def precalificar_subfactores_ia(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Somete a evaluación los reactivos solicitados ante Google Gemini o el motor heurístico experto.
    Retorna un diccionario con calificaciones (1-4) y observaciones técnicas justificadas.
    """
    nombre_software = payload.get("nombre_software") or "Software FLOSS"
    contexto_uso = payload.get("contexto_uso") or "Organización institucional"
    descripcion_caso = payload.get("descripcion_caso") or "Evaluación de viabilidad y madurez tecnológica"
    subfactores = payload.get("subfactores") or []

    # Si no se suministraron subfactores en el payload, cargar todos los activos de la BD
    if not subfactores:
        sfs_qs = Subfactor.objects.filter(activo=True).select_related("id_factor").order_by("codigo")
        subfactores = [
            {
                "codigo": sf.codigo,
                "factor_id": sf.id_factor_id,
                "factor_nombre": sf.id_factor.nombre,
                "descripcion": sf.descripcion,
            }
            for sf in sfs_qs
        ]

    # Respaldo determinista garantizado
    sugerencias_base = _resolver_calificaciones_heuristicas(nombre_software, subfactores)

    api_key = getattr(settings, "GEMINI_API_KEY", "").strip()
    if not api_key:
        return {
            "estado": "exito",
            "motor": "heuristica_experta",
            "nombre_software": nombre_software,
            "total_sugeridos": len(sugerencias_base),
            "sugerencias": sugerencias_base,
        }

    # Llamada a Gemini con prompt estructurado y acotado
    model = getattr(settings, "GEMINI_MODEL", "gemini-3.5-flash-lite") or "gemini-3.5-flash-lite"
    endpoint = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        f"?key={urllib.parse.quote(api_key)}"
    )

    lista_reactivos_prompt = "\n".join([
        f"- [{sf.get('codigo')}] ({sf.get('factor_nombre', '')}): {sf.get('descripcion')}"
        for sf in subfactores[:40]  # Limitamos tamaño para respuesta inmediata y confiable
    ])

    prompt = (
        f"Eres un evaluador senior de software libre y código abierto bajo la metodología GUIOS (Doctorado en Informática).\n"
        f"Evalúa objetivamente la solución FLOSS '{nombre_software}' para el caso '{contexto_uso}'. {descripcion_caso}\n\n"
        f"Para cada uno de los siguientes reactivos, asigna una calificación Likert de 1 a 4:\n"
        f"  1 = No cumple el requisito\n"
        f"  2 = Desconozco si cumple el requisito\n"
        f"  3 = Cumple parcialmente el requisito\n"
        f"  4 = Cumple el requisito\n"
        f"y una observación técnica concisa (1 o 2 oraciones) justificando la nota según las características reales de {nombre_software}.\n\n"
        f"Reactivos a calificar:\n{lista_reactivos_prompt}\n\n"
        f"Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:\n"
        f'{{"sugerencias": {{"SF-01": {{"calificacion": 3, "observacion": "Justificación..."}}}}}}'
    )

    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2,
            "maxOutputTokens": 2048,
        },
    }

    try:
        req = urllib.request.Request(
            endpoint,
            data=json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status == 200:
                raw_json = json.loads(response.read().decode("utf-8"))
                text_content = (
                    raw_json.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                parsed = json.loads(text_content)
                sugerencias_ia = parsed.get("sugerencias", {})

                # Fusión segura: validar formato y rangos 1..4
                resultado_fusion = dict(sugerencias_base)
                for cod, data in sugerencias_ia.items():
                    if isinstance(data, dict):
                        calif = data.get("calificacion")
                        if isinstance(calif, int) and 1 <= calif <= 4:
                            resultado_fusion[cod] = {
                                "calificacion": calif,
                                "observacion": str(data.get("observacion") or "").strip(),
                            }

                return {
                    "estado": "exito",
                    "motor": "gemini",
                    "nombre_software": nombre_software,
                    "total_sugeridos": len(resultado_fusion),
                    "sugerencias": resultado_fusion,
                }
    except Exception as e:
        logger.warning("Fallo en consulta Gemini para precalificación subfactores: %s", str(e))

    # En caso de fallo o timeout, retornar la base experta infalible
    return {
        "estado": "exito",
        "motor": "heuristica_experta_reserva",
        "nombre_software": nombre_software,
        "total_sugeridos": len(sugerencias_base),
        "sugerencias": sugerencias_base,
    }

