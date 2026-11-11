import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Check,
  FileSpreadsheet,
  ChevronDown,
  Table,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";
import Badge from "../components/Badge";
import FodaQuadrant from "../components/FodaQuadrant";

/**
 * Pantalla: Paso 3 · Resultado y recomendación (/resultado)
 * Incluye:
 * 1. Tarjetas superiores de Dictamen y Explicación ajustadas a las capturas
 * 2. Matriz FODA 2x2 con conteos y factores clasificados
 * 3. Tabla "Resultados por factor" completa y detallada
 */
const CATALOGO_METODOLOGICO_LOCAL = {
  Compatibilidad: {
    accion: "Diseñar una capa de interoperabilidad y validar la compatibilidad de formatos de datos abiertos.",
    pasos: [
      "Auditar interfaces y formatos frente a estándares abiertos (ISO/IEC 26300, OASIS, REST).",
      "Desarrollar adaptadores y scripts de migración para evitar pérdida de interoperabilidad con sistemas legados.",
      "Ejecutar pruebas de carga cruzadas en sistemas operativos y plataformas de la institución."
    ],
    entregable: "Matriz de interoperabilidad y adaptadores de migración certificados.",
    plazo: "Semanas 1 a 4"
  },
  Personalización: {
    accion: "Establecer una arquitectura modular para extensiones locales sin desalinearse del repositorio upstream.",
    pasos: [
      "Revisar APIs públicas, hooks y mecanismos de extensión del software antes de modificar el núcleo.",
      "Crear un repositorio interno con integración continua para versionar adaptaciones locales.",
      "Documentar lineamientos de codificación para mantener compatibilidad con versiones futuras."
    ],
    entregable: "Guía de desarrollo de extensiones y repositorio institucional versionado.",
    plazo: "Semanas 2 a 6"
  },
  Prueba: {
    accion: "Implementar un banco de pruebas automatizado (staging) antes del paso a producción.",
    pasos: [
      "Desplegar un entorno espejo (sandbox) idéntico a la infraestructura institucional.",
      "Diseñar suites de pruebas automatizadas que cubran casos críticos, rendimiento y estrés.",
      "Definir criterios formales de aceptación técnica firmados previo al despliegue."
    ],
    entregable: "Informe de cobertura de pruebas y entorno de staging homologado.",
    plazo: "Semanas 2 a 4"
  },
  Fiabilidad: {
    accion: "Configurar esquemas de alta disponibilidad, monitoreo proactivo y plan de contingencia institucional.",
    pasos: [
      "Definir acuerdos de nivel de servicio (SLAs) internos con metas claras de disponibilidad.",
      "Implementar monitoreo continuo de recursos y alertas proactivas ante degradación del servicio.",
      "Diseñar y ensayar un plan de recuperación ante desastres (DRP) con políticas de respaldo periódico."
    ],
    entregable: "Plan de continuidad operativa (DRP) y tablero de monitoreo de disponibilidad.",
    plazo: "Semanas 1 a 3"
  },
  Seguridad: {
    accion: "Ejecutar análisis de vulnerabilidades, auditoría de dependencias y endurecimiento de configuración.",
    pasos: [
      "Ejecutar escaneo estático (SAST) y análisis de vulnerabilidades (CVEs) en dependencias.",
      "Aplicar guías de endurecimiento (hardening) en servidores, base de datos y cifrado TLS 1.3.",
      "Establecer un protocolo institucional de actualización periódica y gestión de parches críticos."
    ],
    entregable: "Informe de auditoría de seguridad y matriz de mitigación de vulnerabilidades.",
    plazo: "Semanas 1 a 2 (Inmediato)"
  },
  Reusabilidad: {
    accion: "Auditar licenciamiento de componentes y definir arquitectura de servicios reutilizables.",
    pasos: [
      "Revisar licencias de bibliotecas dependientes para confirmar compatibilidad legal institucional.",
      "Empaquetar módulos comunes como microservicios o bibliotecas compartidas.",
      "Publicar catálogo de APIs y esquemas de datos internos en el repositorio institucional."
    ],
    entregable: "Dictamen legal de licencias y catálogo de servicios reutilizables.",
    plazo: "Semanas 3 a 5"
  },
  Usabilidad: {
    accion: "Realizar pruebas de experiencia de usuario (UX) y diseñar guías visuales de rápida adopción.",
    pasos: [
      "Efectuar pruebas heurísticas de usabilidad con grupos representativos de usuarios finales.",
      "Identificar fricciones respecto a la herramienta previa y configurar interfaces simplificadas.",
      "Publicar guías rápidas de usuario con flujos paso a paso de las tareas más comunes."
    ],
    entregable: "Informe de usabilidad heurística y kit de guías digitales de usuario.",
    plazo: "Semanas 2 a 4"
  },
  Documentación: {
    accion: "Elaborar la base de conocimientos técnica y operativa centralizada.",
    pasos: [
      "Consolidar la documentación en una wiki institucional accesible para soporte y administradores.",
      "Elaborar manuales de instalación, configuración, resolución de incidentes y contingencias.",
      "Establecer un proceso de actualización continua ante cada actualización de versión."
    ],
    entregable: "Portal wiki institucional de documentación técnica y procedimientos operativos.",
    plazo: "Semanas 2 a 3"
  },
  Comunidad: {
    accion: "Vincular a la institución con los canales comunitarios oficiales y evaluar convenios de soporte L2/L3.",
    pasos: [
      "Suscribir a los ingenieros de soporte a listas de correo, foros y repositorios del proyecto.",
      "Monitorear la cadencia de lanzamientos, parches y velocidad de respuesta del proyecto upstream.",
      "Evaluar convenios o pólizas con empresas locales especializadas en soporte L2/L3."
    ],
    entregable: "Protocolo de escalamiento a soporte comunitario y evaluación de proveedores.",
    plazo: "Semanas 1 a 3"
  },
  Capacitación: {
    accion: "Estructurar un programa formal de formación técnica y entrenamiento de usuarios finales.",
    pasos: [
      "Segmentar necesidades formativas en administradores de sistemas y usuarios finales.",
      "Diseñar talleres prácticos basados en los flujos de trabajo cotidianos de la institución.",
      "Formar multiplicadores internos ('champions') para soporte de primera línea."
    ],
    entregable: "Cronograma de talleres de formación, material didáctico y evaluaciones de competencia.",
    plazo: "Semanas 2 a 6"
  },
  Costos: {
    accion: "Consolidar el modelo de Costo Total de Propiedad (TCO) proyectado a 3 y 5 años.",
    pasos: [
      "Calcular costos directos e indirectos: servidores, almacenamiento, migración y soporte.",
      "Comparar el TCO frente a las licencias privativas recurrentes y costos de vendor lock-in.",
      "Establecer la partida presupuestaria de sostenimiento para el software adoptado."
    ],
    entregable: "Modelo financiero de TCO comparativo y presupuesto de sostenimiento plurianual.",
    plazo: "Semanas 1 a 3"
  },
  Cultura: {
    accion: "Implementar una estrategia de gestión del cambio institucional para mitigar la resistencia al cambio.",
    pasos: [
      "Comunicar las razones estratégicas y beneficios institucionales de estándares abiertos.",
      "Involucrar tempranamente a líderes departamentales en la configuración del nuevo entorno.",
      "Habilitar canales de retroalimentación donde los usuarios reporten mejoras operativas."
    ],
    entregable: "Plan de gestión del cambio institucional y protocolo de comunicación interna.",
    plazo: "Semanas 1 a 4"
  }
};

function buscarConocimientoLocal(nombreFactor) {
  for (const [key, data] of Object.entries(CATALOGO_METODOLOGICO_LOCAL)) {
    if (key.toLowerCase().includes(nombreFactor.toLowerCase()) || nombreFactor.toLowerCase().includes(key.toLowerCase())) {
      return data;
    }
  }
  return {
    accion: `Asignar recursos especializados para subsanar los reactivos comprometidos en ${nombreFactor}.`,
    pasos: [
      `Auditar técnicamente los requisitos incumplidos del factor ${nombreFactor}.`,
      "Desarrollar un plan de trabajo correctivo con responsables y fechas fijadas.",
      "Validar la solución mediante pruebas de aceptación en entorno controlado."
    ],
    entregable: `Informe de mitigación y plan de trabajo para ${nombreFactor}.`,
    plazo: "Semanas 2 a 4"
  };
}

export const ResultadoDictamen = () => {
  const navigate = useNavigate();
  const {
    evaluacionId,
    setEvaluacionId,
    recomendacion,
    dictamenTitulo,
    viabilidad,
    nivelConfianza,
    factoresEvaluados,
    factores,
    subfactoresState,
    strengths,
    opportunities,
    weaknesses,
    threats,
    fetchEvaluaciones,
    setEstadoEvaluacionActiva,
    softwareActivo,
    contextoActivo,
    descripcionCaso,
    sincronizarEvaluacionCompletaConBackend,
  } = useEvaluation();

  const [finalizando, setFinalizando] = useState(false);
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const [menuCsvAbierto, setMenuCsvAbierto] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [analisisIA, setAnalisisIA] = useState(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState("");
  const menuRef = useRef(null);

  const generarRecomendacionesLocales = () => {
    const rawSw = (softwareActivo || "").trim();
    const swNom = rawSw && rawSw.length > 1 ? `'${rawSw}'` : "el software FLOSS evaluado";

    const negativos = (factoresEvaluados || []).filter(
      (f) => f.foda === "Debilidad" || f.foda === "Amenaza"
    );
    const criticos = negativos.filter((f) => f.isCritical || f.critico);
    const internos = negativos.filter((f) => f.alcance === "Interno");
    const externos = negativos.filter((f) => f.alcance === "Externo");

    const reactivosDesconozco = [];
    (factoresEvaluados || []).forEach((f) => {
      const sfs = subfactoresState[f.id] || [];
      sfs.forEach((sf) => {
        if (sf.calificacion === 2) {
          const desc = sf.descripcion || "";
          let rol = "Comité de TI / Evaluador";
          let proto = `Ejecutar un ensayo en entorno de laboratorio para verificar experimentalmente: '${desc.slice(0, 80)}'.`;
          const dLower = desc.toLowerCase();
          if (dLower.includes("licencia") || dLower.includes("propietari") || dLower.includes("legal")) {
            rol = "Asesor Legal / Auditor de Software";
            proto = `Revisar archivos LICENSE y avisos SPDX en el repositorio oficial de ${swNom} para contrastar con directrices OSI/FSF.`;
          } else if (dLower.includes("gui") || dLower.includes("interfaz") || dLower.includes("usabilidad")) {
            rol = "Especialista UX / Líder de Usuarios";
            proto = `Instalar ${swNom} en un entorno de pruebas y aplicar un test de tareas típicas con 3 usuarios finales.`;
          } else if (dLower.includes("biblioteca") || dLower.includes("api") || dLower.includes("marco")) {
            rol = "Arquitecto de Software / Desarrollador";
            proto = `Inspeccionar la documentación técnica y generar una prueba de concepto (PoC) invocando las APIs de ${swNom}.`;
          }

          reactivosDesconozco.push({
            codigo: sf.codigo,
            factor: f.nombre,
            reactivo: desc.slice(0, 130),
            protocolo: proto,
            rol_responsable: rol,
          });
        }
      });
    });

    let diag = "";
    if (recomendacion === "A") {
      diag = `El dictamen para ${swNom} es plenamente favorable (Recomendación A) con un ${viabilidad}% de viabilidad y nivel de confianza ${nivelConfianza.toLowerCase()}. Todos los factores clave cumplen holgadamente los criterios de éxito clasificados como Fortalezas u Oportunidades.`;
    } else if (recomendacion === "B") {
      const nombresOpc = negativos.slice(0, 3).map((f) => f.nombre).join(", ") || "factores no críticos";
      diag = `La adopción de ${swNom} es metodológicamente viable con reservas (Recomendación B), registrando un ${viabilidad}% de viabilidad con nivel de confianza ${nivelConfianza.toLowerCase()}. No se compromete ningún factor clasificado como crítico por el decisor; sin embargo, se identificaron brechas en factores de importancia opcional (${nombresOpc}). La adopción puede avanzar ejecutando en paralelo las acciones correctivas técnicas y de gestión detalladas a continuación.`;
    } else {
      const nombresCrit = criticos.slice(0, 3).map((f) => f.nombre).join(", ") || "factores críticos";
      diag = `Para proceder con la adopción de ${swNom} (Recomendación C, ${viabilidad}% de viabilidad), es mandatorio asignar recursos previos para subsanar ${criticos.length} factor(es) crítico(s) comprometido(s): ${nombresCrit}. Las brechas externas requieren ingeniería de software y adaptación técnica, mientras que las internas demandan capacitación y fortalecimiento institucional.`;
    }

    const priorizadas = negativos.slice(0, 6).map((f) => {
      const sfs = subfactoresState[f.id] || [];
      const sfsCods = sfs
        .filter((sf) => sf.calificacion === 1 || sf.calificacion === 2)
        .map((sf) => sf.codigo)
        .slice(0, 4);
      const esCrit = Boolean(f.isCritical || f.critico);
      const info = buscarConocimientoLocal(f.nombre);

      return {
        prioridad: esCrit || Number(f.PM || 3) < 2.0 ? "Alta" : "Media",
        factor: f.nombre,
        alcance: `${f.alcance || "Externo"} (${f.alcance === "Interno" ? "Organizacional" : "Tecnológico"})`,
        criticidad: esCrit ? "Crítico" : "Opcional",
        subfactores_clave: sfsCods,
        accion: info.accion,
        pasos: info.pasos,
        entregable: info.entregable,
        plazo: info.plazo,
        justificacion: `Clasificado como ${f.foda} con puntuación media ponderada de ${f.PM_str || f.PM} / 4.0 (Importancia Relativa: ${f.IR || "Estándar"}).`,
      };
    });

    const chips = [];
    if (criticos.length > 0) chips.push(`Mitigar ${criticos.length} factor(es) crítico(s)`);
    if (externos.length > 0) chips.push("Ingeniería FLOSS (Tecnológico)");
    if (internos.length > 0) chips.push("Capacitación y Gestión Interna");
    if (reactivosDesconozco.length > 0) chips.push(`Validar ${reactivosDesconozco.length} reactivo(s) incierto(s)`);
    if (chips.length === 0) chips.push("Despliegue gradual", "Monitoreo de SLAs", "Documentación operativa");

    return {
      diagnostico_ejecutivo: diag,
      chips_accion: chips.slice(0, 4),
      recomendaciones_priorizadas: priorizadas,
      plan_desconocimiento: reactivosDesconozco.slice(0, 5),
      generado_por_ia: false,
      modelo: "Motor Metodológico GUIOS+ (Tesis Cap. 6)",
    };
  };

  const solicitarRecomendacionesIA = async (regenerar = false) => {
    if (recomendacion === "Pendiente" || !factoresEvaluados || factoresEvaluados.length === 0) {
      return;
    }
    setCargandoIA(true);
    setErrorIA("");
    try {
      const payload = {
        evaluacion_id: !isNaN(Number(evaluacionId)) ? Number(evaluacionId) : null,
        regenerar,
        nombre_software: softwareActivo,
        contexto_uso: contextoActivo,
        descripcion_caso: descripcionCaso,
        recomendacion,
        dictamen_titulo: dictamenTitulo,
        viabilidad,
        nivel_confianza: nivelConfianza,
        factores: factoresEvaluados,
        subfactores: subfactoresState,
      };
      const res = await apiService.generarRecomendacionesIA(payload);
      if (res && res.diagnostico_ejecutivo) {
        setAnalisisIA(res);
      } else {
        setAnalisisIA(generarRecomendacionesLocales());
      }
    } catch (err) {
      console.warn("Fallo en API de recomendaciones IA, aplicando fallback:", err.message);
      setAnalisisIA(generarRecomendacionesLocales());
    } finally {
      setCargandoIA(false);
    }
  };

  useEffect(() => {
    setAnalisisIA(null);
    if (recomendacion !== "Pendiente" && factoresEvaluados.length > 0) {
      solicitarRecomendacionesIA(false);
    }
  }, [evaluacionId, recomendacion]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuCsvAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const escaparCSV = (valor) => {
    if (valor === null || valor === undefined) return '""';
    const str = String(valor).replace(/"/g, '""');
    return `"${str}"`;
  };

  const descargarArchivoCSV = (contenido, nombreArchivo) => {
    const blob = new Blob(["\uFEFF" + contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const MAPA_ESCALA_TEXTO = {
    1: "1 - No cumple el requisito",
    2: "2 - Desconozco si cumple el requisito",
    3: "3 - Cumple parcialmente",
    4: "4 - Cumple el requisito",
  };

  const generarCSV_FODA = () => {
    const fecha = new Date().toISOString().split("T")[0];
    const lineas = [
      `"REPORTE DE EVALUACIÓN FLOSS — MATRIZ FODA Y FACTORES (METODOLOGÍA GUIOS)"`,
      `"Software Evaluado:",${escaparCSV(softwareActivo)},"Fecha:",${escaparCSV(fecha)}`,
      `"Contexto Institucional:",${escaparCSV(contextoActivo)},"Evaluación ID:",${escaparCSV(evaluacionId)}`,
      `"Dictamen Oficial:",${escaparCSV(`Recomendación ${recomendacion}: ${dictamenTitulo}`)}`,
      `"Índice de Viabilidad:",${escaparCSV(`${viabilidad}%`)},"Nivel de Confianza:",${escaparCSV(nivelConfianza)}`,
      `"Balance FODA:",${escaparCSV(`Fortalezas (${strengths}) · Oportunidades (${opportunities}) · Debilidades (${weaknesses}) · Amenazas (${threats})`)}`,
      "",
      `"Dimensión","Factor","Alcance","Importancia Sugerida (IS)","Importancia Decisor (ID)","Importancia Relativa (IR)","Ponderación Media (PM)","Clasificación FODA","Factor Crítico"`,
    ];

    (factoresEvaluados || []).forEach((f) => {
      lineas.push([
        escaparCSV(f.dimension),
        escaparCSV(f.nombre),
        escaparCSV(f.alcance || "Externo"),
        escaparCSV(f.IS),
        escaparCSV(f.ID || 2),
        escaparCSV(f.IR),
        escaparCSV(f.PM_str || f.PM),
        escaparCSV(f.foda),
        escaparCSV(f.isCritical ? "SÍ (CRÍTICO)" : "No"),
      ].join(","));
    });

    const slug = (softwareActivo || "software").toLowerCase().replace(/[^a-z0-9]/g, "_");
    descargarArchivoCSV(lineas.join("\r\n"), `GUIOS_FODA_${slug}_${fecha}.csv`);
    mostrarToast("Matriz FODA exportada a CSV exitosamente.");
  };

  const generarCSV_Reactivos = () => {
    const fecha = new Date().toISOString().split("T")[0];
    const lineas = [
      `"REPORTE DE EVALUACIÓN FLOSS — DETALLE DE REACTIVOS Y OBSERVACIONES"`,
      `"Software Evaluado:",${escaparCSV(softwareActivo)},"Fecha:",${escaparCSV(fecha)}`,
      `"Contexto:",${escaparCSV(contextoActivo)},"Dictamen:",${escaparCSV(`Recomendación ${recomendacion}`)}`,
      "",
      `"Dimensión","Factor","Código","Enunciado del Reactivo","Calificación (1-4)","Nivel de Cumplimiento","Observación / Evidencia Registrada"`,
    ];

    (factoresEvaluados || []).forEach((factor) => {
      const sfs = subfactoresState[factor.id] || [];
      sfs.forEach((sf) => {
        const calif = sf.calificacion !== null && sf.calificacion !== undefined ? sf.calificacion : "Sin calificar";
        const escalaTexto = MAPA_ESCALA_TEXTO[sf.calificacion] || "Pendiente";
        lineas.push([
          escaparCSV(factor.dimension),
          escaparCSV(factor.nombre),
          escaparCSV(sf.codigo),
          escaparCSV(sf.descripcion),
          escaparCSV(calif),
          escaparCSV(escalaTexto),
          escaparCSV(sf.observacion || ""),
        ].join(","));
      });
    });

    const slug = (softwareActivo || "software").toLowerCase().replace(/[^a-z0-9]/g, "_");
    descargarArchivoCSV(lineas.join("\r\n"), `GUIOS_Reactivos_${slug}_${fecha}.csv`);
    mostrarToast("Reactivos y observaciones exportados a CSV exitosamente.");
  };

  const generarCSV_Consolidado = () => {
    const fecha = new Date().toISOString().split("T")[0];
    const lineas = [
      `"INFORME METODOLÓGICO CONSOLIDADO — GUIOSPRO FLOSS WEB"`,
      `"Software Evaluado:",${escaparCSV(softwareActivo)},"Fecha:",${escaparCSV(fecha)}`,
      `"Contexto Institucional:",${escaparCSV(contextoActivo)},"Evaluación ID:",${escaparCSV(evaluacionId)}`,
      `"Dictamen Final:",${escaparCSV(`Recomendación ${recomendacion}: ${dictamenTitulo}`)}`,
      `"Índice de Viabilidad FLOSS:",${escaparCSV(`${viabilidad}%`)},"Nivel de Confianza:",${escaparCSV(nivelConfianza)}`,
      `"Resumen FODA:",${escaparCSV(`Fortalezas: ${strengths} | Oportunidades: ${opportunities} | Debilidades: ${weaknesses} | Amenazas: ${threats}`)}`,
      "",
      `"==================== SECCIÓN 1: MATRIZ FODA Y FACTORES ===================="`,
      `"Dimensión","Factor","Alcance","Importancia Sugerida (IS)","Importancia Decisor (ID)","Importancia Relativa (IR)","Ponderación Media (PM)","Clasificación FODA","Factor Crítico"`,
    ];

    (factoresEvaluados || []).forEach((f) => {
      lineas.push([
        escaparCSV(f.dimension),
        escaparCSV(f.nombre),
        escaparCSV(f.alcance || "Externo"),
        escaparCSV(f.IS),
        escaparCSV(f.ID || 2),
        escaparCSV(f.IR),
        escaparCSV(f.PM_str || f.PM),
        escaparCSV(f.foda),
        escaparCSV(f.isCritical ? "SÍ (CRÍTICO)" : "No"),
      ].join(","));
    });

    lineas.push("");
    lineas.push(`"==================== SECCIÓN 2: CALIFICACIÓN DE REACTIVOS Y OBSERVACIONES ===================="`);
    lineas.push(`"Dimensión","Factor","Código","Enunciado del Reactivo","Calificación (1-4)","Nivel de Cumplimiento","Observación / Evidencia Registrada"`);

    (factoresEvaluados || []).forEach((factor) => {
      const sfs = subfactoresState[factor.id] || [];
      sfs.forEach((sf) => {
        const calif = sf.calificacion !== null && sf.calificacion !== undefined ? sf.calificacion : "Sin calificar";
        const escalaTexto = MAPA_ESCALA_TEXTO[sf.calificacion] || "Pendiente";
        lineas.push([
          escaparCSV(factor.dimension),
          escaparCSV(factor.nombre),
          escaparCSV(sf.codigo),
          escaparCSV(sf.descripcion),
          escaparCSV(calif),
          escaparCSV(escalaTexto),
          escaparCSV(sf.observacion || ""),
        ].join(","));
      });
    });

    const slug = (softwareActivo || "software").toLowerCase().replace(/[^a-z0-9]/g, "_");
    descargarArchivoCSV(lineas.join("\r\n"), `GUIOS_Consolidado_${slug}_${fecha}.csv`);
    mostrarToast("Informe consolidado exportado a CSV exitosamente.");
  };

  React.useEffect(() => {
    if (evaluacionId) {
      apiService.calcularResultado(evaluacionId)
        .then((resp) => {
          if (
            resp &&
            (resp.estado === "completada" ||
              resp.evaluacion?.estado === "completada" ||
              resp.message?.includes("completad") ||
              resp.recomendacion_tipo)
          ) {
            if (setEstadoEvaluacionActiva) setEstadoEvaluacionActiva("completada");
            localStorage.setItem("guios_evaluacion_estado", "completada");
          }
          if (fetchEvaluaciones) fetchEvaluaciones();
        })
        .catch(console.warn);
    }
  }, [evaluacionId, fetchEvaluaciones, setEstadoEvaluacionActiva]);

  const handleFinalizarYVerDashboard = async () => {
    setFinalizando(true);
    try {
      if (sincronizarEvaluacionCompletaConBackend) {
        await sincronizarEvaluacionCompletaConBackend();
      }
      if (setEstadoEvaluacionActiva) setEstadoEvaluacionActiva("completada");
      localStorage.setItem("guios_evaluacion_estado", "completada");
      if (fetchEvaluaciones) {
        await fetchEvaluaciones();
      }
      navigate("/dashboard");
    } catch (e) {
      console.warn("Error al finalizar evaluación:", e);
      if (setEstadoEvaluacionActiva) setEstadoEvaluacionActiva("completada");
      localStorage.setItem("guios_evaluacion_estado", "completada");
      navigate("/dashboard");
    } finally {
      setFinalizando(false);
    }
  };

  // Filtrar factores por cuadrante FODA
  const listaFortalezas = factoresEvaluados.filter((f) => f.foda === "Fortaleza");
  const listaOportunidades = factoresEvaluados.filter((f) => f.foda === "Oportunidad");
  const listaDebilidades = factoresEvaluados.filter((f) => f.foda === "Debilidad");
  const listaAmenazas = factoresEvaluados.filter((f) => f.foda === "Amenaza");

  const totalClasificados = factoresEvaluados.length;

  const handleExportarPDF = async () => {
    setExportandoPDF(true);
    try {
      // 1. Preparar payload con factores y subfactores actuales
      let listaSubfactores = [];
      if (subfactoresState) {
        Object.values(subfactoresState).forEach((subList) => {
          listaSubfactores = listaSubfactores.concat(subList);
        });
      }
      const subfactoresAEnviar = listaSubfactores
        .filter((s) => (s.id || s.codigo) && s.calificacion !== undefined && Number(s.calificacion) >= 1)
        .map((s) => ({
          id_subfactor: s.id || (s.codigo ? parseInt(s.codigo.replace("SF-", ""), 10) : null),
          codigo: s.codigo,
          calificacion: Number(s.calificacion),
          observacion: s.observacion || "",
        }));

      const payload = {
        factores: (factores || []).map((f) => ({
          id_factor: f.id,
          importancia_decisor: Number(f.ID || 1),
          alcance_aplicado: f.alcance || null,
        })),
        subfactores: subfactoresAEnviar,
      };

      // 2. Si el ID es un timestamp (> 100000000) o no numérico, sincronizar primero
      let targetId = evaluacionId;
      if (!targetId || Number(targetId) > 100000000 || isNaN(Number(targetId))) {
        if (sincronizarEvaluacionCompletaConBackend) {
          const syncResult = await sincronizarEvaluacionCompletaConBackend();
          if (syncResult && syncResult.id) {
            targetId = syncResult.id;
          }
        }
      } else if (sincronizarEvaluacionCompletaConBackend) {
        sincronizarEvaluacionCompletaConBackend(targetId).catch(console.warn);
      }

      // 3. Descargar el PDF enviando el payload completo (garantiza FODA y reactivos 100% poblados)
      await apiService.descargarInformePDF(targetId, softwareActivo, payload);
      if (fetchEvaluaciones) fetchEvaluaciones();
    } catch (err) {
      console.warn("Fallo exportando PDF:", err);
      alert("No se pudo generar el informe PDF: " + (err.message || "Error del servidor"));
    } finally {
      setExportandoPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado: Paso 3, Título grande y subtítulo + Botones de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-gray-400 block mb-0.5">
            Paso 3
          </span>
          <h1 className="text-3xl font-light text-[#2F5444] tracking-tight">
            Resultado y recomendación
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Síntesis automática de importancia relativa, valoración de subfactores y matriz FODA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleFinalizarYVerDashboard}
            disabled={finalizando}
            className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <Check size={14} />
            <span>{finalizando ? "Finalizando..." : "Finalizar y ver en Dashboard"}</span>
          </button>
          <button
            onClick={handleExportarPDF}
            disabled={exportandoPDF}
            className="px-4 py-2 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-medium text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer disabled:opacity-60"
          >
            <Download size={14} className={exportandoPDF ? "animate-bounce text-[#3F6F58]" : "text-gray-600"} />
            <span>{exportandoPDF ? "Generando PDF oficial..." : "Exportar PDF"}</span>
          </button>

          {/* Botón con Menú Desplegable: Exportar Excel / CSV */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuCsvAbierto((prev) => !prev)}
              className="px-4 py-2 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-medium text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-[#3F6F58]" />
              <span>Exportar Excel / CSV</span>
              <ChevronDown
                size={13}
                className={`text-gray-400 transition-transform ${
                  menuCsvAbierto ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuCsvAbierto && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl border border-[#DDE7E1] shadow-2xl p-1.5 z-30 animate-in fade-in zoom-in-95 text-xs">
                <button
                  onClick={() => {
                    generarCSV_FODA();
                    setMenuCsvAbierto(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F3F7F4] transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <Table size={16} className="text-[#3F6F58] shrink-0" />
                  <div>
                    <span className="font-semibold block text-gray-800 group-hover:text-[#2F5444]">
                      Matriz FODA y Factores
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Ponderación PM, alcance y categorías
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    generarCSV_Reactivos();
                    setMenuCsvAbierto(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F3F7F4] transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <FileText size={16} className="text-teal-600 shrink-0" />
                  <div>
                    <span className="font-semibold block text-gray-800 group-hover:text-[#2F5444]">
                      Reactivos y Observaciones
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      61 subfactores calificados y notas
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={() => {
                    generarCSV_Consolidado();
                    setMenuCsvAbierto(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#F3F7F4] transition-colors flex items-center gap-2.5 cursor-pointer group"
                >
                  <FileSpreadsheet size={16} className="text-[#3F6F58] shrink-0" />
                  <div>
                    <span className="font-semibold block text-[#2F5444]">
                      Informe Consolidado
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      FODA + Reactivos en un solo CSV
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Superior: Tarjeta Verde Oscuro (Col 4) + Tarjeta Explicativa Blanca (Col 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Tarjeta Verde (Col 1 a 4) */}
        <div className="lg:col-span-4 rounded-card bg-[#3F6F58] text-white p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-[11px] font-normal text-green-100/90 block mb-2">
              Recomendación GUIOSPRO
            </span>

            <div className="flex items-center gap-4">
              {/* Círculo de recomendación o estado */}
              <div className="w-16 h-16 rounded-full bg-[#52876D] text-white flex items-center justify-center font-bold text-3xl shrink-0 shadow-inner">
                {recomendacion === "Pendiente" ? (
                  <Clock size={28} className="text-white/95" />
                ) : (
                  recomendacion
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {recomendacion === "Pendiente" ? "Evaluación en curso" : dictamenTitulo}
                </h2>
                {recomendacion === "Pendiente" && (
                  <span className="text-xs text-green-100/80 font-normal block mt-0.5">
                    Subfactores pendientes por calificar
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 text-xs text-green-100/90 leading-tight">
            Índice de viabilidad FLOSS: <strong className="text-white">{viabilidad} %</strong> · Confianza {nivelConfianza.toLowerCase()}
          </div>
        </div>

        {/* Tarjeta Explicativa Blanca (Col 5 a 12) */}
        <div className="lg:col-span-8 rounded-card border border-[#DDE7E1] bg-white p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            {/* Header de la tarjeta */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-base font-semibold text-gray-800">
                {recomendacion === "Pendiente"
                  ? "Evaluación en proceso de cálculo"
                  : `¿Qué significa la Recomendación ${recomendacion}?`}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF4EE] text-[#25633C] border border-[#D5E6DB] shrink-0">
                {recomendacion === "Pendiente" ? "En curso" : "Resultado oficial"}
              </span>
            </div>

            {/* Párrafo explicativo dinámico según la recomendación oficial GUIOS */}
            <p className="text-xs text-gray-600 leading-relaxed">
              {recomendacion === "Pendiente"
                ? "Aún existen reactivos pendientes de calificación en los factores relevantes. El dictamen final de adopción (A, B o C) se calculará automáticamente en cuanto complete la evaluación de todos los factores en el Paso 2."
                : recomendacion === "A"
                ? "Todos los factores evaluados han sido identificados como Fortalezas u Oportunidades. La organización cumple satisfactoriamente con los requisitos para adoptar la solución FLOSS."
                : recomendacion === "B"
                ? "Existen debilidades o amenazas únicamente en factores cuya Importancia Relativa es Opcional. La adopción es factible estableciendo un plan de seguimiento sobre dichos factores."
                : "Existe al menos una Debilidad o Amenaza en un factor Importante o Fundamental. Se recomienda destinar recursos de ingeniería al software (factores externos) y fortalecer a la organización (factores internos) antes de proceder con la adopción."}
            </p>

            {/* Chips de acciones recomendadas dinámicas */}
            <div className="flex flex-wrap gap-2 mt-3.5">
              {recomendacion === "Pendiente" ? (
                <button
                  onClick={() => navigate("/subfactores")}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF4EE] hover:bg-[#DDEFE3] text-[#2F5444] border border-[#CDE1D4] transition-colors cursor-pointer"
                >
                  Ir al Paso 2 para completar evaluación →
                </button>
              ) : analisisIA?.chips_accion?.length > 0 ? (
                analisisIA.chips_accion.map((chip, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F7F4] text-[#2F5444] border border-[#DDE7E1]"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F7F4] text-gray-500 border border-[#DDE7E1]">
                  {cargandoIA ? "Analizando acciones prioritarias..." : "Revisión según matriz FODA"}
                </span>
              )}
            </div>
          </div>

          {/* Leyenda al pie */}
          <div className="pt-3 mt-4 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
            A · Adoptar &nbsp;|&nbsp; B · Es posible adoptar &nbsp;|&nbsp; C · Requiere recursos
          </div>
        </div>
      </div>

      {/* Sección: Recomendaciones Personalizadas según Calificación (IA) */}
      {recomendacion !== "Pendiente" && (
        <div className="rounded-card border border-[#DDE7E1] bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] text-[#3F6F58] flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Recomendaciones personalizadas según calificación
                </h3>
                <p className="text-[11px] text-gray-500">
                  Plan de acción específico generado a partir de tus puntuaciones FODA, reactivos reprobados (1) o inciertos (2) y observaciones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {analisisIA?.modelo && (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#F3F7F4] text-[#2F5444] border border-[#DDE7E1]">
                  {analisisIA.generado_por_ia ? `✦ ${analisisIA.modelo}` : analisisIA.modelo}
                </span>
              )}
              <button
                onClick={() => solicitarRecomendacionesIA(true)}
                disabled={cargandoIA}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-[#2F5444] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={cargandoIA ? "animate-spin" : ""} />
                <span>{cargandoIA ? "Analizando..." : "Regenerar análisis"}</span>
              </button>
            </div>
          </div>

          {errorIA && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorIA}</span>
            </div>
          )}

          {cargandoIA && !analisisIA ? (
            <div className="py-6 text-center text-xs text-gray-500 space-y-2">
              <RefreshCw size={20} className="animate-spin mx-auto text-[#3F6F58]" />
              <p>Analizando los factores, subfactores y observaciones de {softwareActivo}...</p>
            </div>
          ) : analisisIA ? (
            <div className="space-y-4">
              {/* Diagnóstico ejecutivo */}
              <div className="p-3.5 rounded-xl bg-[#F8FAF9] border border-[#E6EFEA] text-xs text-gray-700 leading-relaxed">
                <strong className="text-[#2F5444] block mb-1">Diagnóstico contextualizado:</strong>
                {analisisIA.diagnostico_ejecutivo}
              </div>

              {/* Acciones prioritarias */}
              {analisisIA.recomendaciones_priorizadas?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {analisisIA.recomendaciones_priorizadas.map((recItem, idx) => {
                    const esAlta = recItem.prioridad === "Alta";
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                          esAlta
                            ? "border-amber-200 bg-amber-50/30"
                            : "border-[#DDE7E1] bg-white"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-gray-900">
                              {recItem.factor}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {recItem.criticidad && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  recItem.criticidad === "Crítico"
                                    ? "bg-red-50 text-red-700 border border-red-100"
                                    : "bg-gray-50 text-gray-600 border border-gray-100"
                                }`}>
                                  {recItem.criticidad}
                                </span>
                              )}
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                {recItem.alcance}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  esAlta
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-[#EBF4EE] text-[#2F5444] border border-[#DDE7E1]"
                                }`}
                              >
                                Prioridad {recItem.prioridad}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-800 font-medium leading-relaxed">
                            {recItem.accion}
                          </p>

                          {recItem.pasos?.length > 0 && (
                            <div className="pt-1.5 space-y-1">
                              <span className="text-[11px] font-semibold text-gray-700 block">
                                Ruta técnica recomendada:
                              </span>
                              <ol className="text-[11px] text-gray-600 space-y-1 pl-4 list-decimal">
                                {recItem.pasos.map((paso, pIdx) => (
                                  <li key={pIdx} className="leading-snug">{paso}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 pt-2 border-t border-gray-100/80">
                          {(recItem.entregable || recItem.plazo) && (
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              {recItem.entregable && (
                                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50/80 px-2 py-0.5 rounded border border-gray-100">
                                  <FileText size={12} className="text-[#3F6F58] shrink-0" />
                                  <span className="font-semibold text-gray-700">Entregable:</span>
                                  <span className="truncate max-w-[210px]">{recItem.entregable}</span>
                                </div>
                              )}
                              {recItem.plazo && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock size={11} className="text-gray-400 shrink-0" />
                                  <span>{recItem.plazo}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                            <span className="italic">{recItem.justificacion}</span>
                            {recItem.subfactores_clave?.length > 0 && (
                              <span className="font-mono font-semibold text-[#3F6F58] bg-[#F3F7F4] px-1.5 py-0.5 rounded border border-[#DDE7E1]">
                                {recItem.subfactores_clave.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Plan para reducir incertidumbre (nota 2 = Desconozco) */}
              {analisisIA.plan_desconocimiento?.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                      <HelpCircle size={15} className="text-blue-600 shrink-0" />
                      <span>Protocolos de comprobación rápida para reactivos marcados como "2 · Desconozco"</span>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                      {analisisIA.plan_desconocimiento.length} reactivo(s) por despejar
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    {analisisIA.plan_desconocimiento.map((item, idx) => {
                      const esObjeto = typeof item === "object" && item !== null;
                      return (
                        <div key={idx} className="p-3 rounded-lg bg-white border border-blue-100/80 shadow-xs space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="font-mono font-bold text-blue-800 text-[11px]">
                              {esObjeto ? `${item.codigo} · ${item.factor}` : `Item #${idx + 1}`}
                            </span>
                            {esObjeto && item.rol_responsable && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                                {item.rol_responsable}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 font-medium text-[11px] leading-snug">
                            {esObjeto ? item.reactivo : item}
                          </p>
                          {esObjeto && item.protocolo && (
                            <p className="text-blue-900/90 text-[11px] bg-blue-50/50 p-2 rounded border border-blue-50 leading-relaxed">
                              <strong className="text-blue-950">Protocolo: </strong>
                              {item.protocolo}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Sección Matriz FODA (2x2) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Matriz FODA
          </h3>
          <span className="text-xs text-gray-400">
            {totalClasificados} factores clasificados automáticamente
          </span>
        </div>

        {/* 4 Cuadrantes FODA 2x2 idénticos a la captura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Fortalezas */}
          <FodaQuadrant
            tipo="Fortalezas"
            subtitulo="Factores internos positivos"
            count={strengths}
            factores={listaFortalezas}
          />

          {/* 2. Oportunidades */}
          <FodaQuadrant
            tipo="Oportunidades"
            subtitulo="Factores externos positivos"
            count={opportunities}
            factores={listaOportunidades}
          />

          {/* 3. Debilidades */}
          <FodaQuadrant
            tipo="Debilidades"
            subtitulo="Factores internos negativos"
            count={weaknesses}
            factores={listaDebilidades}
          />

          {/* 4. Amenazas */}
          <FodaQuadrant
            tipo="Amenazas"
            subtitulo="Factores externos negativos"
            count={threats}
            factores={listaAmenazas}
          />
        </div>
      </div>

      {/* Sección Inferior: Tabla "Resultados por factor" */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm tracking-wide">
            Resultados por factor
          </h3>
          <span className="text-xs text-gray-400">
            Detalle de ponderaciones medias y clasificación
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#DDE7E1] bg-[#F8FAF9] text-gray-500 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4">Factor</th>
                <th className="py-3 px-3">Dimensión</th>
                <th className="py-3 px-3 text-center">Imp. relativa</th>
                <th className="py-3 px-3 text-center">Promedio (PM)</th>
                <th className="py-3 px-3 text-center">Alcance</th>
                <th className="py-3 px-4 text-center">FODA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF1ED]">
              {factoresEvaluados.map((factor) => {
                const esNegativo = factor.foda === "Debilidad" || factor.foda === "Amenaza";

                return (
                  <tr key={factor.id} className="hover:bg-[#F6FAF7] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {factor.nombre}
                    </td>
                    <td className="py-3.5 px-3 text-gray-500">
                      {factor.dimension}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant="auto" size="sm">
                        {factor.IR}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-gray-700">
                      {factor.PM_str} / 4,0
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {factor.alcance === "Interno" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#CDE1D4] bg-[#F0F7F4] text-[#2F5444]">
                          Interno
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-normal border border-gray-200 bg-white text-gray-600">
                          {factor.alcance || "Externo"}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <Badge variant="auto" size="sm" withDot>
                          {factor.foda}
                        </Badge>
                        {factor.isCritical && (
                          <Badge variant="critico" size="xs">
                            Crítico
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notificación flotante al exportar */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F5444] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ResultadoDictamen;
