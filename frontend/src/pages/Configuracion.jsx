import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, RotateCcw, Check, Database, Info, Calendar, Globe } from "lucide-react";
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
    softwareActivo,
    setSoftwareActivo,
    contextoActivo,
    setContextoActivo,
    descripcionCaso,
    setDescripcionCaso,
    actualizarMetadatosEvaluacion,
  } = useEvaluation();

  // Estados de fuentes bibliográficas
  const [fuentes, setFuentes] = useState({
    scopus: true,
    openAlex: true,
    semanticScholar: true,
  });

  // Estado de simulación de cálculo
  const [calculando, setCalculando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [calculoExitoso, setCalculoExitoso] = useState(true); // Inicialmente mostrado como en la captura

  const handleCalcular = async () => {
    setCalculando(true);
    setCalculoExitoso(false);
    setProgreso(0);

    try {
      if (actualizarMetadatosEvaluacion) {
        await actualizarMetadatosEvaluacion({
          nombre_software: softwareActivo,
          contexto_uso: contextoActivo,
          objetivo: descripcionCaso,
        });
      }
      await apiService.calcularImportanciaSugerida((p) => setProgreso(p));
      setCalculoExitoso(true);
    } finally {
      setCalculando(false);
    }
  };

  const handleRestaurar = async () => {
    if (window.confirm("¿Deseas restaurar los valores originales de la literatura científica de la tesis?")) {
      await apiService.restaurarValoresOriginales();
      alert("Valores originales de la tesis doctoral restaurados con éxito.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
          Paso 0 · Configuración automática
        </h1>
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
                { key: "semanticScholar", name: "Semantic Scholar", desc: "Análisis semántico de citas e influencia" },
              ].map((src) => (
                <div
                  key={src.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-[#DDE7E1] bg-[#F8FAF9]"
                >
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-[#3F6F58]" />
                    <div>
                      <span className="text-xs font-semibold text-gray-800 block">
                        {src.name}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {src.desc}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="green" size="sm">
                      Conectada
                    </Badge>
                    <Toggle
                      enabled={fuentes[src.key]}
                      onChange={(val) => setFuentes({ ...fuentes, [src.key]: val })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Barra de progreso interactiva si está calculando */}
          {calculando && (
            <div className="p-4 rounded-lg bg-[#EBF4EE] border border-[#CDE1D4]">
              <div className="flex justify-between items-center text-xs font-semibold text-[#2F5444] mb-1">
                <span>Consultando APIs académicas y procesando sinónimos...</span>
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
              onClick={handleRestaurar}
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
                <span className="font-semibold text-gray-800">24 Oct 2026, 22:30</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Modo</span>
                <span className="font-semibold text-[#3F6F58]">Automático con revisión</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banda verde de éxito abajo */}
      {calculoExitoso && (
        <div className="rounded-card bg-[#3F6F58] text-white p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#52876D] flex items-center justify-center text-white shrink-0">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h5 className="font-semibold text-sm">
                Cálculo completado correctamente
              </h5>
              <p className="text-xs text-green-100 opacity-90">
                18 factores actualizados · 61 subfactores vinculados · 126 documentos procesados desde Scopus y OpenAlex.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/factores")}
            className="px-4 py-2 rounded-lg bg-white text-[#2F5444] hover:bg-gray-100 font-semibold text-xs transition-colors shrink-0 shadow cursor-pointer"
          >
            Ir al Paso 1 · Factores relevantes →
          </button>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
