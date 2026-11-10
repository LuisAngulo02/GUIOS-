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
  const menuRef = useRef(null);

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

            {/* Chips de acciones recomendadas */}
            <div className="flex flex-wrap gap-2 mt-3.5">
              {recomendacion === "Pendiente" ? (
                <button
                  onClick={() => navigate("/subfactores")}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF4EE] hover:bg-[#DDEFE3] text-[#2F5444] border border-[#CDE1D4] transition-colors cursor-pointer"
                >
                  Ir al Paso 2 para completar evaluación →
                </button>
              ) : (
                <>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F7F4] text-[#2F5444] border border-[#DDE7E1]">
                    Plan de mejora del código
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F7F4] text-[#2F5444] border border-[#DDE7E1]">
                    Capacitación interna
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3F7F4] text-[#2F5444] border border-[#DDE7E1]">
                    Análisis de costes
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Leyenda al pie */}
          <div className="pt-3 mt-4 border-t border-gray-100 text-[11px] text-gray-400 font-medium">
            A · Adoptar &nbsp;|&nbsp; B · Es posible adoptar &nbsp;|&nbsp; C · Requiere recursos
          </div>
        </div>
      </div>

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
