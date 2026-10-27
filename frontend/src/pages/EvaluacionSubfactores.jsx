import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import ScaleButtons from "../components/ScaleButtons";
import Badge from "../components/Badge";

/**
 * Pantalla 5: Paso 2 · Evaluación de subfactores (/subfactores)
 */
export const EvaluacionSubfactores = () => {
  const {
    softwareActivo,
    factores,
    subfactoresState,
    updateSubfactorScore,
    saveStatus,
    puedeAvanzarPaso3,
    sincronizarPaso2ConBackend,
  } = useEvaluation();

  const [guardadoManual, setGuardadoManual] = useState(false);

  const navigate = useNavigate();

  // Filtrar solo los factores relevantes para este paso
  const factoresRelevantes = factores.filter((f) => f.relevante);

  // Factor seleccionado actualmente (por defecto el primero o Compatibilidad = ID 1)
  const [selectedFactorId, setSelectedFactorId] = useState(
    factoresRelevantes.length > 0 ? factoresRelevantes[0].id : 1
  );

  const factorActual =
    factoresRelevantes.find((f) => f.id === Number(selectedFactorId)) ||
    factoresRelevantes[0] ||
    factores[0];

  const subfactoresActuales = subfactoresState[factorActual.id] || [];

  // Conteo de completados del factor actual
  const completadosActuales = subfactoresActuales.filter(
    (s) => s.calificacion !== undefined && s.calificacion >= 1
  ).length;

  const totalSfsActuales = subfactoresActuales.length;

  // Ponderación media del factor actual
  const pmActual =
    completadosActuales > 0
      ? (
          subfactoresActuales.reduce((acc, s) => acc + (s.calificacion || 1), 0) /
          totalSfsActuales
        )
          .toFixed(1)
          .replace(".", ",")
      : "0,0";

  const handleGuardarPaso2 = async () => {
    setGuardadoManual(true);
    await sincronizarPaso2ConBackend(selectedFactorId);
    setTimeout(() => setGuardadoManual(false), 2000);
  };

  const handleContinuarPaso3 = async () => {
    if (!puedeAvanzarPaso3) {
      alert("Faltan subfactores por calificar en los factores relevantes. Complete la evaluación de todos los factores para emitir el dictamen.");
      return;
    }
    sincronizarPaso2ConBackend();
    navigate("/resultado");
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con Botón Guardar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
            Paso 2 · Evaluación de subfactores
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Valora el cumplimiento de los reactivos específicos (1 a 4) de cada factor relevante identificado.
          </p>
        </div>

        <button
          onClick={handleGuardarPaso2}
          className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Save size={14} />
          <span>{guardadoManual ? "¡Guardado en base de datos!" : "Guardar calificaciones"}</span>
        </button>
      </div>

      {/* Tarjeta de Contexto y Selector de Factor */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-[#EBF4EE] border border-[#CDE1D4] flex items-center justify-center font-bold text-xl text-[#2F5444] shrink-0">
            {softwareActivo.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {softwareActivo} / Educación · Evaluación activa
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

        {/* Selector de Factor y Estado de Completitud */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-600">
              Factor seleccionado:
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              Completado {completadosActuales} de {totalSfsActuales}
            </span>
            <Badge variant="relevante" size="sm" withDot>
              {saveStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tarjeta de Subfactores del Factor Seleccionado */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm space-y-4">
        {/* Cabecera con Título, Leyenda de Escala e Insignia */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#2F5444] text-base">
                Subfactores de {factorActual.nombre}
              </h3>
              <Badge variant="auto" size="xs">
                {factorActual.IR}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {factorActual.descripcion}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Leyenda visible */}
            <div className="text-[11px] text-gray-500 bg-[#F8FAF9] px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="font-semibold text-gray-700">1</span> = No cumple ·{" "}
              <span className="font-semibold text-gray-700">2</span> = Desconozco ·{" "}
              <span className="font-semibold text-gray-700">3</span> = Cumple parcialmente ·{" "}
              <span className="font-semibold text-gray-700">4</span> = Cumple
            </div>

            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#EBF4EE] text-[#25633C] border border-[#CDE1D4]">
              {totalSfsActuales} reactivos
            </span>
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
                          sf.calificacion || 1,
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

      {/* Pie con Ponderación Media y Botón Continuar al Paso 3 */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-4 px-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-700 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#3F6F58]" />
          <span>
            Ponderación media de <strong className="text-[#2F5444]">{factorActual.nombre}</strong>:{" "}
            <strong className="text-base text-[#3F6F58]">{pmActual} / 4,0</strong> ·{" "}
            {completadosActuales === totalSfsActuales ? (
              <span className="text-green-700 font-semibold">Evaluación completa</span>
            ) : (
              <span className="text-amber-700 font-medium">Pendiente de completar</span>
            )}
          </span>
        </div>

        <button
          onClick={handleContinuarPaso3}
          className="px-6 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span>Continuar al Paso 3</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default EvaluacionSubfactores;
