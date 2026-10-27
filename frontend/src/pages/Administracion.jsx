import React, { useState } from "react";
import { Search, Plus, Save, Play, Trash2, ShieldCheck, Check } from "lucide-react";
import { MOCK_FACTORES } from "../data/mockCatalog";
import Badge from "../components/Badge";
import Chip from "../components/Chip";
import Toggle from "../components/Toggle";

/**
 * Pantalla 8: Administración (/administracion)
 */
export const Administracion = () => {
  // Pestañas de la vista de administración
  const tabs = [
    "Usuarios",
    "Fuentes bibliográficas",
    "Factores GUIOS",
    "Palabras clave por factor",
    "Historial de consultas",
    "Parámetros de cálculo",
  ];
  const [activeTab, setActiveTab] = useState("Palabras clave por factor");

  // Factor seleccionado en la columna izquierda
  const [selectedFactorId, setSelectedFactorId] = useState(1);
  const [searchFactor, setSearchFactor] = useState("");

  // Estado editable para el factor seleccionado
  const [keywordsState, setKeywordsState] = useState({
    1: ["interoperability", "standards", "cloud ready", "cross-platform", "LTI integration"],
    2: ["customization", "modular extension", "source code access", "plugins repository"],
    3: ["deploy test", "docker container", "installation ease"],
    4: ["reliability", "security audit", "RBAC control", "stability"],
    5: ["reusability", "software framework", "GPL library"],
    6: ["usability", "GUI interface", "learning curve", "user satisfaction"],
    7: ["maintainability", "active developers", "commit activity"],
    8: ["portability", "DBMS independent", "mobile app"],
    9: ["documentation quality", "user guide", "API reference", "multilingual docs"],
    10: ["training plan", "technical skills", "self-learning", "staff qualification"],
    16: ["community support", "certified partners", "commercial SLAs", "internal developers"],
    18: ["total cost of ownership", "hidden costs", "license savings", "ROI"],
  });

  const [nuevaKeyword, setNuevaKeyword] = useState("");
  const [usarSinonimos, setUsarSinonimos] = useState(true);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const factoresList = MOCK_FACTORES.filter((f) =>
    f.nombre.toLowerCase().includes(searchFactor.toLowerCase())
  );

  const factorActual =
    MOCK_FACTORES.find((f) => f.id === selectedFactorId) || MOCK_FACTORES[0];

  const currentKeywords = keywordsState[factorActual.id] || ["open source", "criteria"];

  const handleAddKeyword = () => {
    if (!nuevaKeyword.trim()) return;
    setKeywordsState((prev) => ({
      ...prev,
      [factorActual.id]: [...(prev[factorActual.id] || []), nuevaKeyword.trim()],
    }));
    setNuevaKeyword("");
  };

  const handleRemoveKeyword = (index) => {
    setKeywordsState((prev) => ({
      ...prev,
      [factorActual.id]: prev[factorActual.id].filter((_, i) => i !== index),
    }));
  };

  const handleGuardarCambios = () => {
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2000);
  };

  // Cadena booleana reactiva
  const booleanQuery = `TITLE-ABS-KEY ("${factorActual.nombre}" AND (${currentKeywords
    .map((k) => `"${k}"`)
    .join(" OR ")}))`;

  return (
    <div className="space-y-6">
      {/* Encabezado con Insignia Administrador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
              Administración
            </h1>
            <Badge variant="green" size="md">
              <ShieldCheck size={13} />
              <span>Administrador</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gestión integral de usuarios, catálogo GUIOS, corpus bibliográfico y parámetros de inferencia.
          </p>
        </div>
      </div>

      {/* Barra de Pestañas de Administración */}
      <div className="flex items-center gap-1 border-b border-[#DDE7E1] overflow-x-auto whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === t
                ? "border-[#3F6F58] text-[#2F5444] bg-white rounded-t-lg shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa (Palabras clave por factor por defecto) */}
      {activeTab === "Palabras clave por factor" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda (1 col): Lista de Factores */}
          <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-xs tracking-wide uppercase text-gray-500">
                Factores GUIOS (18)
              </h3>
              <button
                onClick={() => alert("Formulario para agregar nuevo factor al catálogo...")}
                className="text-xs font-semibold text-[#3F6F58] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Agregar factor</span>
              </button>
            </div>

            {/* Buscador de factores */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchFactor}
                onChange={(e) => setSearchFactor(e.target.value)}
                placeholder="Buscar factor..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
              />
            </div>

            {/* Lista scrolleable de factores */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {factoresList.map((f) => {
                const isSelected = f.id === selectedFactorId;
                const kwCount = (keywordsState[f.id] || []).length;

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFactorId(f.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF4EE] border-[#3F6F58] text-[#2F5444] font-bold shadow-sm"
                        : "bg-white border-transparent hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div>
                      <span>{f.nombre}</span>
                      <span className="block text-[10px] text-gray-400 font-normal">
                        {f.dimension}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="auto" size="xs">
                        {f.IS === 4 ? "Fundamental" : f.IS === 3 ? "Importante" : "Opcional"}
                      </Badge>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {kwCount} kw
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha (2 cols): Detalle del Factor */}
          <div className="lg:col-span-2 bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-[#2F5444] text-base">
                  {factorActual.nombre}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuración de metadatos y términos de búsqueda booleana.
                </p>
              </div>

              <Badge variant="green" size="md">
                {currentKeywords.length} términos activos
              </Badge>
            </div>

            {/* Selects: Dimensión, Importancia sugerida y Alcance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Dimensión
                </label>
                <select
                  defaultValue={factorActual.dimension}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                >
                  <option value="Tecnológica">Tecnológica</option>
                  <option value="Organizacional">Organizacional</option>
                  <option value="Económica">Económica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Importancia sugerida (IS)
                </label>
                <select
                  defaultValue={factorActual.IS}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                >
                  <option value="1">1 · Irrelevante</option>
                  <option value="2">2 · Opcional</option>
                  <option value="3">3 · Importante</option>
                  <option value="4">4 · Fundamental</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Alcance
                </label>
                <select
                  defaultValue={factorActual.alcance || "Externo"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                >
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
            </div>

            {/* Input para agregar nueva palabra clave */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Palabras clave y sinónimos para la consulta
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaKeyword}
                  onChange={(e) => setNuevaKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Nueva palabra clave o frase…"
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Agregar</span>
                </button>
              </div>
            </div>

            {/* Chips eliminables de palabras clave */}
            <div>
              <span className="text-[11px] text-gray-500 font-medium block mb-2">
                Términos asociados a este factor:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentKeywords.map((kw, idx) => (
                  <Chip
                    key={idx}
                    label={kw}
                    onRemove={() => handleRemoveKeyword(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Recuadro Vista previa de consulta */}
            <div className="rounded-lg bg-[#F8FAF9] p-4 border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                VISTA PREVIA DE CONSULTA (SYNTAX)
              </span>
              <code className="text-xs text-[#2F5444] font-mono break-all leading-relaxed block bg-white p-3 rounded border border-gray-100">
                {booleanQuery}
              </code>
            </div>

            {/* Interruptor Usar sinónimos automáticos */}
            <div className="pt-2">
              <Toggle
                enabled={usarSinonimos}
                onChange={setUsarSinonimos}
                label="Usar sinónimos automáticos (Amplía variantes en ES, EN y PT)"
              />
            </div>

            {/* Botones Probar consulta y Guardar cambios */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => alert(`Probando consulta booleana para ${factorActual.nombre} en Scopus y OpenAlex... Encontrados 33 documentos coincidentes.`)}
                className="px-5 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} className="text-[#3F6F58]" />
                <span>Probar consulta</span>
              </button>

              <button
                onClick={handleGuardarCambios}
                className="px-6 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save size={14} />
                <span>{guardadoExitoso ? "✓ ¡Cambios guardados!" : "Guardar cambios"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-[#DDE7E1] p-12 text-center shadow-sm">
          <p className="text-sm text-gray-500 font-medium">
            Módulo <strong className="text-[#2F5444]">{activeTab}</strong> listo para administración de cuentas y catálogos en PostgreSQL.
          </p>
          <button
            onClick={() => setActiveTab("Palabras clave por factor")}
            className="mt-4 px-4 py-2 rounded-lg bg-[#3F6F58] text-white text-xs font-semibold"
          >
            Volver a Palabras clave por factor
          </button>
        </div>
      )}
    </div>
  );
};

export default Administracion;
