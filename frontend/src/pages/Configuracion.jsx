import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  RotateCcw,
  Check,
  Database,
  Info,
  Calendar,
  Globe,
  AlertTriangle,
  X,
  BookOpen,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import Toggle from "../components/Toggle";
import Badge from "../components/Badge";
import { apiService } from "../services/apiService";

/**
 * Pantalla 3: Paso 0 · Configuración automática (/configuracion)
 */
export const Configuracion = () => {
  const navigate = useNavigate();
  const {
    evaluacionId,
    softwareActivo,
    setSoftwareActivo,
    contextoActivo,
    setContextoActivo,
    descripcionCaso,
    setDescripcionCaso,
    actualizarMetadatosEvaluacion,
    aplicarEvidenciaEnFactores,
    restaurarValoresTesisEnFactores,
  } = useEvaluation();

  // Estados de fuentes bibliográficas
  const [fuentes, setFuentes] = useState({
    scopus: true,
    openAlex: true,
    semanticScholar: false, // Desactivado temporalmente hasta aprobación de API key
  });

  // Estado de cálculo real con backend + IA + APIs académicas
  const [calculando, setCalculando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [calculoExitoso, setCalculoExitoso] = useState(false);
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  const [errorCalculo, setErrorCalculo] = useState("");
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState(false);
  const [restaurando, setRestaurando] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Cargar resumen si ya existe una consulta previa para esta evaluación
  useEffect(() => {
    if (!evaluacionId) return;
    apiService
      .getEvidenciaBibliografica(evaluacionId)
      .then((res) => {
        if (res && !res.sin_consulta && Array.isArray(res.items) && res.items.length > 0) {
          setResultadoConsulta(res);
          setCalculoExitoso(true);
        } else {
          setResultadoConsulta(null);
          setCalculoExitoso(false);
        }
      })
      .catch(() => {});
  }, [evaluacionId]);

  const handleCalcular = async () => {
    if (!softwareActivo.trim()) {
      setErrorCalculo("Ingresa el nombre del software FLOSS antes de calcular la evidencia.");
      return;
    }
    setErrorCalculo("");
    setCalculando(true);
    setCalculoExitoso(false);
    setProgreso(15);

    const timer = setInterval(() => {
      setProgreso((prev) => (prev < 88 ? prev + 12 : prev));
    }, 350);

    try {
      if (actualizarMetadatosEvaluacion) {
        await actualizarMetadatosEvaluacion({
          nombre_software: softwareActivo,
          contexto_uso: contextoActivo,
          objetivo: descripcionCaso,
        });
      }
      const res = await apiService.calcularImportanciaSugerida({
        evaluacion_id: !isNaN(Number(evaluacionId)) ? Number(evaluacionId) : null,
        nombre_software: softwareActivo,
        contexto_uso: contextoActivo,
        descripcion_caso: descripcionCaso,
        fuentes,
      });

      setProgreso(100);
      if (res && Array.isArray(res.items)) {
        aplicarEvidenciaEnFactores(res.items);
        setResultadoConsulta(res);
        setCalculoExitoso(true);
      }
    } catch (err) {
      setErrorCalculo(err.message || "Error al conectar con las APIs académicas.");
    } finally {
      clearInterval(timer);
      setCalculando(false);
    }
  };

  const handleConfirmarRestaurar = async () => {
    setRestaurando(true);
    try {
      await apiService.restaurarValoresOriginales(
        !isNaN(Number(evaluacionId)) ? Number(evaluacionId) : null
      );
      restaurarValoresTesisEnFactores();
      setResultadoConsulta(null);
      setCalculoExitoso(false);
      setModalRestaurarAbierto(false);
      mostrarToast("Valores oficiales de la tesis doctoral restaurados correctamente.");
    } catch (err) {
      setErrorCalculo(err.message || "No se pudieron restaurar los valores originales.");
    } finally {
      setRestaurando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
            Paso 0 · Configuración automática
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF4EE] text-[#2F5444] border border-[#CDE1D4]">
            {softwareActivo} #{evaluacionId}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configura los parámetros del caso de estudio y la estimación asistida de Importancia Sugerida (IS).
        </p>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2 cols): Datos de la evaluación */}
        <div className="lg:col-span-2 bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm tracking-wide">
              Datos de la evaluación
            </h3>
            <span className="text-xs text-gray-400">Paso previo preparatorio</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Input Software FLOSS con sugerencias */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Software FLOSS
              </label>
              <input
                type="text"
                list="software-suggestions"
                value={softwareActivo}
                onChange={(e) => setSoftwareActivo(e.target.value)}
                placeholder="Ej. Moodle, GitLab, PostgreSQL, Nextcloud..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
              />
              <datalist id="software-suggestions">
                <option value="Moodle" />
                <option value="PostgreSQL" />
                <option value="Nextcloud" />
                <option value="LibreOffice" />
                <option value="GitLab CE" />
                <option value="Canvas LMS" />
              </datalist>
            </div>

            {/* Input Área o contexto con sugerencias */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Área o contexto
              </label>
              <input
                type="text"
                list="context-suggestions"
                value={contextoActivo}
                onChange={(e) => setContextoActivo(e.target.value)}
                placeholder="Ej. Educación · Plataforma de aprendizaje virtual..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
              />
              <datalist id="context-suggestions">
                <option value="Educación · Plataforma de aprendizaje virtual" />
                <option value="Gobierno y Administración Pública" />
                <option value="Salud y Hospitales" />
                <option value="Sector Financiero / Banca" />
                <option value="Infraestructura y Telecomunicaciones" />
              </datalist>
            </div>
          </div>

          {/* Textarea Descripción del caso */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Descripción del caso
            </label>
            <textarea
              rows={3}
              value={descripcionCaso}
              onChange={(e) => setDescripcionCaso(e.target.value)}
              placeholder="Describe el contexto de la organización, los objetivos de adopción y los sistemas a reemplazar..."
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
            />
          </div>

          {/* Lista de Fuentes Bibliográficas */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Fuentes bibliográficas
            </label>
            <div className="space-y-2.5">
              {[
                { key: "scopus", name: "Scopus (Elsevier)", desc: "54 estudios primarios indexados" },
                { key: "openAlex", name: "OpenAlex", desc: "Metadatos abiertos globales y citas" },
                { key: "semanticScholar", name: "Semantic Scholar", desc: "En espera de API Key (desactivado temporalmente)" },
              ].map((src) => {
                const conectada = !!fuentes[src.key];
                return (
                  <div
                    key={src.key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      conectada
                        ? "border-[#DDE7E1] bg-[#F8FAF9]"
                        : "border-gray-200 bg-gray-50/70 opacity-80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Database
                        size={16}
                        className={conectada ? "text-[#3F6F58]" : "text-gray-400"}
                      />
                      <div>
                        <span
                          className={`text-xs font-semibold block ${
                            conectada ? "text-gray-800" : "text-gray-500"
                          }`}
                        >
                          {src.name}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {src.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={conectada ? "green" : "neutral"} size="sm">
                        {conectada ? "Conectada" : "Desconectada"}
                      </Badge>
                      <Toggle
                        enabled={conectada}
                        onChange={(val) => setFuentes({ ...fuentes, [src.key]: val })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mensaje de error si falla la consulta */}
          {errorCalculo && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{errorCalculo}</span>
            </div>
          )}

          {/* Barra de progreso interactiva si está calculando */}
          {calculando && (
            <div className="p-4 rounded-lg bg-[#EBF4EE] border border-[#CDE1D4]">
              <div className="flex justify-between items-center text-xs font-semibold text-[#2F5444] mb-1">
                <span>Consultando OpenAlex / Semantic Scholar y procesando sinónimos...</span>
                <span>{progreso}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#3F6F58] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso}%` }}
                />
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={handleCalcular}
              disabled={calculando}
              className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={14} />
              <span>{calculando ? "Procesando cálculo..." : "Calcular importancia sugerida"}</span>
            </button>
            <button
              onClick={() => setModalRestaurarAbierto(true)}
              disabled={calculando}
              className="px-5 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} />
              <span>Restaurar valores originales</span>
            </button>
          </div>
        </div>

        {/* Columna Derecha (1 col): Qué calcula + Parámetros */}
        <div className="space-y-6">
          {/* Tarjeta Qué calcula la automatización */}
          <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Info size={16} className="text-[#3F6F58]" />
              <h4 className="font-semibold text-gray-800 text-xs tracking-wide">
                Qué calcula la automatización
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-gray-100">
                <span className="font-bold text-[#2F5444] block">IL (Importancia Literatura)</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Calculada mediante citas normalizadas divididas entre número de subfactores y cuartiles.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAF9] border border-gray-100">
                <span className="font-bold text-[#2F5444] block">IE (Importancia Experto)</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Basada en la encuesta a 57 expertos internacionales en FLOSS de la tesis doctoral.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#EBF4EE] border border-[#CDE1D4]">
                <span className="font-bold text-[#2F5444] block">IS (Importancia Sugerida)</span>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Fórmula de la tesis: <code className="font-semibold text-[#2F5444]">IS = floor((IL + IE) / 2)</code>. Sirve de guía objetiva previa al juicio del decisor.
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta Parámetros de consulta */}
          <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-3 text-xs">
            <h4 className="font-semibold text-gray-800 text-xs tracking-wide pb-2 border-b border-gray-100">
              Parámetros de consulta
            </h4>

            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Ventana temporal</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <Calendar size={12} /> 2016–2026
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Idiomas</span>
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                  <Globe size={12} /> ES · EN · PT
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Fecha de cálculo</span>
                <span className="font-semibold text-gray-800">
                  {resultadoConsulta?.fecha_consulta
                    ? new Date(resultadoConsulta.fecha_consulta).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Base Tesis 2022"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Modo</span>
                <span className="font-semibold text-[#3F6F58]">
                  {resultadoConsulta?.ia_utilizada
                    ? `IA (${resultadoConsulta.proveedor_ia || "Gemini"}) + APIs`
                    : "APIs abiertas + Palabras clave"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banda verde de éxito abajo */}
      {calculoExitoso && resultadoConsulta && (
        <div className="rounded-card bg-[#3F6F58] text-white p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#52876D] flex items-center justify-center text-white shrink-0">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h5 className="font-semibold text-sm">
                Cálculo completado correctamente · {resultadoConsulta.software}
              </h5>
              <p className="text-xs text-green-100 opacity-90">
                {resultadoConsulta.factores_actualizados} factores actualizados ·{" "}
                {resultadoConsulta.kpis?.documentos ?? 0} documentos analizados ·{" "}
                {resultadoConsulta.kpis?.citas_acumuladas ?? 0} citas acumuladas
                {resultadoConsulta.ia_utilizada ? " · Sinónimos expandidos con IA" : ""}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/evidencia")}
              className="px-3.5 py-2 rounded-lg bg-[#52876D] hover:bg-[#5E9A7D] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={13} />
              <span>Ver evidencia</span>
            </button>
            <button
              onClick={() => navigate("/factores")}
              className="px-4 py-2 rounded-lg bg-white text-[#2F5444] hover:bg-gray-100 font-semibold text-xs transition-colors shadow cursor-pointer"
            >
              Ir al Paso 1 · Factores relevantes →
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmación Restaurar Valores Originales */}
      {modalRestaurarAbierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <RotateCcw size={17} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Restaurar valores de la tesis
                </h3>
              </div>
              <button
                onClick={() => setModalRestaurarAbierto(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              ¿Deseas descartar los valores calculados por las APIs académicas para esta evaluación y restaurar los valores oficiales de <strong>IL, IE e IS</strong> validados en la tesis doctoral?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalRestaurarAbierto(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRestaurar}
                disabled={restaurando}
                className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {restaurando ? "Restaurando..." : "Sí, restaurar valores"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2F5444] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2">
          <Check size={14} className="text-green-300" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
