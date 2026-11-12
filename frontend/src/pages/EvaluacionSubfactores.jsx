import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  CheckCheck,
  RotateCcw,
  Filter,
  Check,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";
import ScaleButtons from "../components/ScaleButtons";
import Badge from "../components/Badge";

/**
 * Pantalla 5: Paso 2 · Evaluación de subfactores (/subfactores)
 * Optimizado para UX ágil de calificación de los 61 reactivos con:
 * - Asistente de precalificación con IA (Gemini / Base Experta)
 * - Calificación masiva en bloque por factor
 * - Stepper visual de completitud y filtro de factores pendientes
 * - Navegación secuencial continua (1 al 18)
 */
export const EvaluacionSubfactores = () => {
  const {
    evaluacionId,
    softwareActivo,
    contextoActivo,
    descripcionCaso,
    factores,
    subfactoresState,
    updateSubfactorScore,
    saveStatus,
    puedeAvanzarPaso3,
    sincronizarPaso2ConBackend,
    aplicarCalificacionesSubfactores,
    calificarBloqueFactor,
    limpiarCalificacionesFactor,
  } = useEvaluation();

  const [guardadoManual, setGuardadoManual] = useState(false);
  const [modalIncompletoOpen, setModalIncompletoOpen] = useState(false);
  const [modalIaOpen, setModalIaOpen] = useState(false);
  const [iaAmbito, setIaAmbito] = useState("factor"); // "factor" | "todos"
  const [iaSobrescribir, setIaSobrescribir] = useState(false);
  const [ejecutandoIa, setEjecutandoIa] = useState(false);
  const [iaToast, setIaToast] = useState("");
  const [soloPendientes, setSoloPendientes] = useState(false);

  const navigate = useNavigate();

  // 1. Filtrar solo los factores relevantes para este paso
  const factoresRelevantes = useMemo(
    () => factores.filter((f) => f.relevante),
    [factores]
  );

  // 2. Factores relevantes con subfactores pendientes
  const factoresPendientes = useMemo(() => {
    return factoresRelevantes
      .map((f) => {
        const sfs = subfactoresState[f.id] || [];
        const calificados = sfs.filter(
          (s) =>
            s.calificacion !== undefined &&
            s.calificacion !== null &&
            Number(s.calificacion) >= 1
        ).length;
        const faltantes = sfs.length - calificados;
        return {
          id: f.id,
          nombre: f.nombre,
          total: sfs.length,
          calificados,
          faltantes,
          completo: faltantes === 0,
        };
      })
      .filter((f) => !f.completo);
  }, [factoresRelevantes, subfactoresState]);

  const totalSubfactoresPendientes = useMemo(() => {
    return factoresPendientes.reduce((acc, f) => acc + f.faltantes, 0);
  }, [factoresPendientes]);

  // Totales globales de avance
  const totalSfsGlobal = useMemo(() => {
    return factoresRelevantes.reduce(
      (acc, f) => acc + (subfactoresState[f.id] || []).length,
      0
    );
  }, [factoresRelevantes, subfactoresState]);

  const calificadosGlobal = useMemo(() => {
    return factoresRelevantes.reduce((acc, f) => {
      const sfs = subfactoresState[f.id] || [];
      return (
        acc +
        sfs.filter(
          (s) =>
            s.calificacion !== undefined &&
            s.calificacion !== null &&
            Number(s.calificacion) >= 1
        ).length
      );
    }, 0);
  }, [factoresRelevantes, subfactoresState]);

  const porcentajeGlobal =
    totalSfsGlobal > 0 ? Math.round((calificadosGlobal / totalSfsGlobal) * 100) : 0;

  // Factor seleccionado actualmente
  const [selectedFactorId, setSelectedFactorId] = useState(
    factoresRelevantes.length > 0 ? factoresRelevantes[0].id : 1
  );

  const factorActual =
    factoresRelevantes.find((f) => f.id === Number(selectedFactorId)) ||
    factoresRelevantes[0] ||
    factores[0];

  const subfactoresActuales = subfactoresState[factorActual.id] || [];

  // Conteo de completados del factor actual
  const calificadosActuales = subfactoresActuales.filter(
    (s) => s.calificacion !== undefined && s.calificacion !== null && Number(s.calificacion) >= 1
  );
  const completadosActuales = calificadosActuales.length;
  const totalSfsActuales = subfactoresActuales.length;

  // Índice secuencial actual
  const indiceActual = factoresRelevantes.findIndex((f) => f.id === factorActual.id);
  const esPrimero = indiceActual <= 0;
  const esUltimo = indiceActual >= factoresRelevantes.length - 1;

  // Lista de factores mostrados según el filtro de pendientes
  const factoresMostrados = useMemo(() => {
    if (!soloPendientes) return factoresRelevantes;
    const idsPendientes = new Set(factoresPendientes.map((f) => f.id));
    return factoresRelevantes.filter((f) => idsPendientes.has(f.id));
  }, [factoresRelevantes, factoresPendientes, soloPendientes]);

  // Ponderación media del factor actual
  const pmActual =
    completadosActuales === totalSfsActuales && totalSfsActuales > 0
      ? (
          calificadosActuales.reduce((acc, s) => acc + Number(s.calificacion), 0) /
          totalSfsActuales
        )
          .toFixed(1)
          .replace(".", ",")
      : completadosActuales > 0
      ? (
          calificadosActuales.reduce((acc, s) => acc + Number(s.calificacion), 0) /
          completadosActuales
        )
          .toFixed(1)
          .replace(".", ",")
      : "—";

  const handleGuardarPaso2 = async () => {
    setGuardadoManual(true);
    await sincronizarPaso2ConBackend(selectedFactorId);
    setTimeout(() => setGuardadoManual(false), 2000);
  };

  const handleSiguienteFactor = async () => {
    // Sincronizar en segundo plano el factor actual
    sincronizarPaso2ConBackend(factorActual.id);
    if (!esUltimo) {
      setSelectedFactorId(factoresRelevantes[indiceActual + 1].id);
    }
  };

  const handleAnteriorFactor = () => {
    if (!esPrimero) {
      setSelectedFactorId(factoresRelevantes[indiceActual - 1].id);
    }
  };

  const handleContinuarPaso3 = async () => {
    if (!puedeAvanzarPaso3) {
      setModalIncompletoOpen(true);
      return;
    }
    await sincronizarPaso2ConBackend();
    navigate("/resultado");
  };

  // Asistente de IA: Precalificación automatizada
  const handleEjecutarIa = async () => {
    setEjecutandoIa(true);
    try {
      let subfactoresParaIa = [];
      if (iaAmbito === "factor") {
        subfactoresParaIa = subfactoresActuales.map((sf) => ({
          codigo: sf.codigo,
          factor_nombre: factorActual.nombre,
          descripcion: sf.descripcion,
        }));
      } else {
        factoresRelevantes.forEach((f) => {
          (subfactoresState[f.id] || []).forEach((sf) => {
            subfactoresParaIa.push({
              codigo: sf.codigo,
              factor_nombre: f.nombre,
              descripcion: sf.descripcion,
            });
          });
        });
      }

      const res = await apiService.precalificarSubfactores({
        nombre_software: softwareActivo,
        contexto_uso: contextoActivo,
        descripcion_caso: descripcionCaso,
        subfactores: subfactoresParaIa,
      });

      if (res && res.sugerencias) {
        let mapaFinal = { ...res.sugerencias };

        // Si el usuario no desea sobrescribir los ya calificados, excluir los que ya tienen nota
        if (!iaSobrescribir) {
          Object.keys(mapaFinal).forEach((cod) => {
            let yaTieneNota = false;
            Object.values(subfactoresState).forEach((lista) => {
              const item = lista.find((x) => x.codigo === cod);
              if (item && item.calificacion !== null && item.calificacion !== undefined) {
                yaTieneNota = true;
              }
            });
            if (yaTieneNota) {
              delete mapaFinal[cod];
            }
          });
        }

        aplicarCalificacionesSubfactores(mapaFinal);
        setModalIaOpen(false);
        const totalMod = Object.keys(mapaFinal).length;
        setIaToast(
          `¡Calificaciones sugeridas con éxito! (${totalMod} reactivo${totalMod === 1 ? "" : "s"} actualizado${totalMod === 1 ? "" : "s"} vía ${res.motor || "IA"})`
        );
        setTimeout(() => setIaToast(""), 5000);
      }
    } catch (err) {
      alert("Error al consultar el asistente IA: " + err.message);
    } finally {
      setEjecutandoIa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Encabezado con Insignia e Interacción Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
              Paso 2 · Evaluación de subfactores
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF4EE] text-[#2F5444] border border-[#CDE1D4]">
              {softwareActivo} #{evaluacionId}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Valora el cumplimiento de los reactivos específicos (1 a 4) de cada factor relevante identificado.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          {/* Botón Asistente IA */}
          <button
            type="button"
            onClick={() => setModalIaOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            title="Sugerir calificaciones preliminares con IA y base metodológica"
          >
            <Sparkles size={14} className="text-emerald-200 animate-pulse" />
            <span>Pre-calificar con IA</span>
          </button>

          {/* Botón Guardar Manual */}
          <button
            type="button"
            onClick={handleGuardarPaso2}
            className="px-4 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Save size={14} />
            <span>{guardadoManual ? "¡Guardado!" : "Guardar calificaciones"}</span>
          </button>
        </div>
      </div>

      {/* Toast informativo de IA */}
      {iaToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-emerald-600 shrink-0" />
            <span>{iaToast}</span>
          </div>
          <button
            onClick={() => setIaToast("")}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. Barra de Progreso Global y Stepper Visual de Factores */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-4 shadow-sm space-y-3">
        {/* Cabecera del Stepper con Barra de Porcentaje */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-700">
              Progreso global:{" "}
              <strong className="text-[#3F6F58]">
                {calificadosGlobal} de {totalSfsGlobal} reactivos ({porcentajeGlobal}%)
              </strong>
            </span>
            <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#3F6F58] h-2 rounded-full transition-all duration-300"
                style={{ width: `${porcentajeGlobal}%` }}
              />
            </div>
          </div>

          {/* Toggle para filtrar factores pendientes */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 select-none hover:text-gray-900">
              <input
                type="checkbox"
                checked={soloPendientes}
                onChange={(e) => setSoloPendientes(e.target.checked)}
                className="rounded text-[#3F6F58] focus:ring-[#3F6F58] w-3.5 h-3.5"
              />
              <Filter size={13} className="text-gray-400" />
              <span>Mostrar solo factores pendientes ({factoresPendientes.length})</span>
            </label>
            <Badge variant="relevante" size="sm" withDot>
              {saveStatus}
            </Badge>
          </div>
        </div>

        {/* Stepper horizontal de factores (píldoras scrolleables) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          {factoresMostrados.map((f, idx) => {
            const sfs = subfactoresState[f.id] || [];
            const califs = sfs.filter(
              (s) => s.calificacion !== null && s.calificacion !== undefined && Number(s.calificacion) >= 1
            ).length;
            const completo = califs === sfs.length && sfs.length > 0;
            const esActivo = f.id === factorActual.id;

            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFactorId(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  esActivo
                    ? "bg-[#2F5444] text-white border-[#2F5444] shadow-xs"
                    : completo
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {completo ? (
                  <Check size={12} className={esActivo ? "text-emerald-200" : "text-emerald-600"} />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      esActivo ? "bg-amber-300" : "bg-amber-500"
                    }`}
                  />
                )}
                <span>
                  {f.nombre} ({califs}/{sfs.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tarjeta de Contexto del Factor Seleccionado */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-[#EBF4EE] border border-[#CDE1D4] flex items-center justify-center font-bold text-xl text-[#2F5444] shrink-0">
            {softwareActivo.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {softwareActivo} / {contextoActivo ? contextoActivo.split("·")[0].trim() : "Evaluación activa"}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge variant="auto" size="xs">
                {factorActual.IR}
              </Badge>
              <Badge variant="relevante" size="xs">
                Relevante
              </Badge>
              <span className="text-xs text-gray-400">· Dimensión {factorActual.dimension}</span>
              <span className="text-xs text-gray-400">· Alcance {factorActual.alcance || "Externo"}</span>
            </div>
          </div>
        </div>

        {/* Selector de Factor */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <label className="text-xs font-semibold text-gray-600">
            Factor ({indiceActual + 1} de {factoresRelevantes.length}):
          </label>
          <select
            value={selectedFactorId}
            onChange={(e) => setSelectedFactorId(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-[#DDE7E1] bg-white text-[#2F5444] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
          >
            {factoresRelevantes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre} ({f.dimension})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Tarjeta de Subfactores con Acciones Rápidas en Bloque */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm space-y-4">
        {/* Cabecera con Título, Leyenda de Escala y Botonera Rápida en Bloque */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#2F5444] text-base">
                Subfactores de {factorActual.nombre}
              </h3>
              <Badge variant="auto" size="xs">
                {factorActual.IR}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              {factorActual.descripcion}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Acciones Rápidas en Bloque (Tarea 6) */}
            <div className="flex items-center gap-1.5 bg-[#F6FAF7] p-1 rounded-lg border border-[#DDE7E1]">
              <span className="text-[10px] font-semibold text-gray-500 px-2 uppercase tracking-wider">
                Acciones rápidas:
              </span>
              <button
                type="button"
                onClick={() => calificarBloqueFactor(factorActual.id, 4)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Marcar todos los subfactores de este factor como 4 (Cumple)"
              >
                <CheckCheck size={12} />
                <span>Marcar todo Cumple (4)</span>
              </button>
              <button
                type="button"
                onClick={() => calificarBloqueFactor(factorActual.id, 3, true)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Asignar nota 3 (Cumple parcialmente) a los reactivos sin responder de este factor"
              >
                <span>Pendientes a Parcial (3)</span>
              </button>
              <button
                type="button"
                onClick={() => limpiarCalificacionesFactor(factorActual.id)}
                className="p-1 rounded-md bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200 transition-colors cursor-pointer"
                title="Limpiar calificaciones de este factor"
              >
                <RotateCcw size={12} />
              </button>
            </div>

            {/* Escala */}
            <div className="text-[11px] text-gray-500 bg-[#F8FAF9] px-2.5 py-1 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-700">1</span>=No ·{" "}
              <span className="font-semibold text-gray-700">2</span>=Desc ·{" "}
              <span className="font-semibold text-gray-700">3</span>=Parcial ·{" "}
              <span className="font-semibold text-gray-700">4</span>=Cumple
            </div>
          </div>
        </div>

        {/* Tabla de Subfactores */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DDE7E1] bg-[#F8FAF9] text-gray-500 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-3 w-20">Código</th>
                <th className="py-3 px-4">Enunciado del Reactivo</th>
                <th className="py-3 px-4 text-center w-48">Calificación (1–4)</th>
                <th className="py-3 px-4 w-72">Observación y Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF1ED]">
              {subfactoresActuales.map((sf) => (
                <tr key={sf.codigo} className="hover:bg-[#F6FAF7] transition-colors">
                  {/* Código SF-xx */}
                  <td className="py-3.5 px-3 font-bold text-[#2F5444] align-top">
                    {sf.codigo}
                  </td>

                  {/* Enunciado */}
                  <td className="py-3.5 px-4 text-gray-800 leading-relaxed align-top">
                    {sf.descripcion}
                  </td>

                  {/* Botonera 1 a 4 */}
                  <td className="py-3.5 px-4 text-center align-top">
                    <ScaleButtons
                      value={sf.calificacion}
                      onChange={(nuevaNota) =>
                        updateSubfactorScore(factorActual.id, sf.codigo, nuevaNota)
                      }
                    />
                  </td>

                  {/* Campo de Observación */}
                  <td className="py-3.5 px-4 align-top">
                    <input
                      type="text"
                      value={sf.observacion || ""}
                      onChange={(e) =>
                        updateSubfactorScore(
                          factorActual.id,
                          sf.codigo,
                          sf.calificacion !== undefined && sf.calificacion !== null
                            ? sf.calificacion
                            : null,
                          e.target.value
                        )
                      }
                      placeholder="Añadir observación…"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58] text-gray-700 bg-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Pie con Ponderación Media y Navegación Secuencial */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-4 px-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-700 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#3F6F58]" />
          <span>
            Ponderación media de <strong className="text-[#2F5444]">{factorActual.nombre}</strong>:{" "}
            <strong className="text-base text-[#3F6F58]">{pmActual} / 4,0</strong> ·{" "}
            {completadosActuales === totalSfsActuales ? (
              <span className="text-green-700 font-semibold">Factor completo ({totalSfsActuales}/{totalSfsActuales})</span>
            ) : (
              <span className="text-amber-700 font-medium">
                Pendientes {totalSfsActuales - completadosActuales} reactivo(s)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={esPrimero}
            onClick={handleAnteriorFactor}
            className="px-3.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Ir al factor anterior"
          >
            <ArrowLeft size={14} />
            <span>Factor anterior</span>
          </button>

          <button
            type="button"
            disabled={esUltimo}
            onClick={handleSiguienteFactor}
            className="px-4 py-2 rounded-lg border border-[#CDE1D4] bg-[#F4F8F5] hover:bg-[#E5EFE9] text-[#2F5444] font-semibold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title={esUltimo ? "Estás en el último factor" : "Guardar y avanzar al siguiente factor"}
          >
            <span>Siguiente factor</span>
            <ArrowRight size={14} />
          </button>

          <button
            type="button"
            onClick={handleContinuarPaso3}
            className="px-5 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer ml-auto sm:ml-2"
            title="Avanzar al Paso 3: Resultado y dictamen"
          >
            <span>Ir al Paso 3 (Resultado)</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 6. Modal Asistente IA (Precalificación Ágil) */}
      {modalIaOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 text-[#2F5444] border border-emerald-200 flex items-center justify-center shrink-0">
                  <Sparkles size={20} className="text-[#3F6F58]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Asistente de Pre-calificación IA
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Sugerencias objetivas basadas en la tesis y Gemini IA
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalIaOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-3">
              <p>
                El asistente analizará las características técnicas y licencias de{" "}
                <strong className="text-[#2F5444]">{softwareActivo}</strong> para sugerir
                puntuaciones (1–4) y justificaciones técnicas preliminares.
              </p>

              {/* Selector de Ámbito */}
              <div className="space-y-2 p-3 rounded-xl bg-[#F8FAF9] border border-gray-200">
                <span className="text-[11px] font-semibold text-gray-700 block uppercase tracking-wider">
                  Ámbito de la sugerencia:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="iaAmbito"
                    value="factor"
                    checked={iaAmbito === "factor"}
                    onChange={() => setIaAmbito("factor")}
                    className="text-[#3F6F58] focus:ring-[#3F6F58]"
                  />
                  <span>
                    Solo para <strong>{factorActual.nombre}</strong> ({totalSfsActuales} reactivos)
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="iaAmbito"
                    value="todos"
                    checked={iaAmbito === "todos"}
                    onChange={() => setIaAmbito("todos")}
                    className="text-[#3F6F58] focus:ring-[#3F6F58]"
                  />
                  <span>
                    Para todos los factores relevantes ({factoresRelevantes.length} factores,{" "}
                    {totalSfsGlobal} reactivos)
                  </span>
                </label>
              </div>

              {/* Checkbox Sobrescribir */}
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                <input
                  type="checkbox"
                  checked={iaSobrescribir}
                  onChange={(e) => setIaSobrescribir(e.target.checked)}
                  className="rounded text-[#3F6F58] focus:ring-[#3F6F58] w-3.5 h-3.5"
                />
                <span>Sobrescribir calificaciones que ya hayan sido respondidas</span>
              </label>

              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                <Check size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Cada puntuación asignada puede ser editada o corregida por ti en cualquier momento.
                </span>
              </div>
            </div>

            {/* Botones de acción del Modal IA */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalIaOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={ejecutandoIa}
                onClick={handleEjecutarIa}
                className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={13} className="text-emerald-200" />
                <span>{ejecutandoIa ? "Analizando software..." : "Generar sugerencias"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Metodológico: Evaluación Incompleta */}
      {modalIncompletoOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Evaluación Incompleta
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Regla de completitud metodológica de la tesis GUIOS
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalIncompletoOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2">
              <p>
                Para emitir el dictamen oficial de adopción (<strong>Recomendación A, B o C</strong>) y construir la matriz FODA, es indispensable calificar todos los reactivos de los factores relevantes.
              </p>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex items-center justify-between text-xs font-medium">
                <span>Reactivos pendientes por responder:</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300/60">
                  {totalSubfactoresPendientes} pendientes
                </span>
              </div>
            </div>

            {/* Lista interactiva de factores pendientes */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-gray-500 block uppercase tracking-wider">
                Factores con preguntas pendientes ({factoresPendientes.length}):
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {factoresPendientes.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFactorId(f.id);
                      setModalIncompletoOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[#DDE7E1] bg-white hover:border-[#3F6F58] hover:bg-emerald-50/40 transition-all cursor-pointer group text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-[#EBF4EE] group-hover:text-[#2F5444] text-gray-600 flex items-center justify-center text-[10px] font-bold">
                        {f.id}
                      </div>
                      <span className="font-semibold text-gray-800 group-hover:text-[#2F5444]">
                        {f.nombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {f.faltantes} {f.faltantes === 1 ? "pendiente" : "pendientes"}
                      </span>
                      <ChevronRight size={14} className="text-gray-400 group-hover:text-[#3F6F58] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setModalIncompletoOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-xs cursor-pointer"
              >
                Cerrar
              </button>
              {factoresPendientes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFactorId(factoresPendientes[0].id);
                    setModalIncompletoOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span>Completar "{factoresPendientes[0].nombre}"</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluacionSubfactores;
