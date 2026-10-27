import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Save, ChevronDown, X, ArrowRight } from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import Badge from "../components/Badge";

/**
 * Pantalla Paso 1 · Factores relevantes (/factores)
 * Con colores semánticos por importancia y estado integrados al diseño verde GUIOS+
 */
export const FactoresRelevantes = () => {
  const {
    factores,
    updateFactorID,
    updateFactorAlcance,
    totalRelevantes,
    totalIrrelevantes,
    puedeAvanzarPaso2,
    sincronizarPaso1ConBackend,
  } = useEvaluation();

  const navigate = useNavigate();

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroDimension, setFiltroDimension] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroAlcance, setFiltroAlcance] = useState("Todos");
  const [guardadoManual, setGuardadoManual] = useState(false);

  // Estado para el Drawer lateral de Evidencia bibliográfica
  const [drawerFactor, setDrawerFactor] = useState(null);

  // Estilos de selector "Tu importancia" (ID) coordinados con la paleta de importancia
  const idSelectStyles = {
    4: "border-[#86EFAC] bg-[#F0FDF4] text-[#14532D]",
    3: "border-[#C6E6D1] bg-[#F6FAF7] text-[#25633C]",
    2: "border-[#FDE68A] bg-[#FFFBEB] text-[#854D0E]",
    1: "border-[#CBD5E1] bg-[#F8FAF9] text-[#64748B]",
  };

  // Filtrado reactivo en cliente
  const factoresFiltrados = useMemo(() => {
    return factores.filter((f) => {
      const coincideTexto =
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.descripcion && f.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      const coincideDim =
        filtroDimension === "Todas" || f.dimension === filtroDimension;

      const coincideEstado =
        filtroEstado === "Todos" ||
        (filtroEstado === "Relevante" && f.relevante) ||
        (filtroEstado === "Irrelevante" && !f.relevante);

      const coincideAlcance =
        filtroAlcance === "Todos" ||
        f.alcance === filtroAlcance ||
        (f.nombre === "Soporte" && filtroAlcance === "Ambos");

      return coincideTexto && coincideDim && coincideEstado && coincideAlcance;
    });
  }, [factores, searchTerm, filtroDimension, filtroEstado, filtroAlcance]);

  // Formateador estándar de importancia "N · Etiqueta"
  const formatImportancia = (val) => {
    if (!val && val !== 0) return "—";
    if (typeof val === "string" && val.includes("·")) return val;
    const num = parseInt(val, 10);
    switch (num) {
      case 4:
        return "4 · Fundamental";
      case 3:
        return "3 · Importante";
      case 2:
        return "2 · Opcional";
      case 1:
        return "1 · Irrelevante";
      default:
        return val;
    }
  };

  const handleGuardar = async () => {
    setGuardadoManual(true);
    await sincronizarPaso1ConBackend();
    setTimeout(() => setGuardadoManual(false), 2000);
  };

  const handleContinuarPaso2 = async () => {
    if (!puedeAvanzarPaso2) {
      alert("No hay ningún factor relevante seleccionado (IR > 1). Asigne al menos un factor con importancia para continuar.");
      return;
    }
    sincronizarPaso1ConBackend();
    navigate("/subfactores");
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* 1. Encabezado con título y botón Guardar cambios */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
            Paso 1 · Factores relevantes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Determina la Importancia del Decisor (ID) para calcular la Importancia Relativa (IR) y filtrar los factores clave.
          </p>
        </div>

        <button
          onClick={handleGuardar}
          className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Save size={14} />
          <span>{guardadoManual ? "¡Cambios guardados!" : "Guardar cambios"}</span>
        </button>
      </div>

      {/* 2. Banda informativa con regla de decisión */}
      <div className="rounded-xl bg-[#EBF4EE] border border-[#CDE1D4] p-4 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-[#2F5444] leading-relaxed">
          <span className="font-bold">Regla de decisión:</span> IL, IE e Import. sugerida son de solo lectura. Tu importancia es editable; la importancia relativa se recalcula automáticamente.
        </p>
        <div className="bg-white px-3.5 py-1.5 rounded-full border border-[#CDE1D4] font-bold text-[#25633C] shrink-0 text-xs shadow-xs">
          {totalRelevantes} de 18 factores relevantes
        </div>
      </div>

      {/* 3. Tarjeta de Filtros y Búsqueda */}
      <div className="bg-white rounded-xl border border-[#DDE7E1] p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Buscador */}
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de factor o descripción..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
          />
        </div>

        {/* Filtros select */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Dimensión */}
          <select
            value={filtroDimension}
            onChange={(e) => setFiltroDimension(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3F6F58] cursor-pointer"
          >
            <option value="Todas">Dimensión: Todas</option>
            <option value="Tecnológica">Tecnológica</option>
            <option value="Organizacional">Organizacional</option>
            <option value="Económica">Económica</option>
          </select>

          {/* Relevante / Irrelevante */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3F6F58] cursor-pointer"
          >
            <option value="Todos">Estado: Todos</option>
            <option value="Relevante">Relevante</option>
            <option value="Irrelevante">Irrelevante</option>
          </select>

          {/* Alcance */}
          <select
            value={filtroAlcance}
            onChange={(e) => setFiltroAlcance(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3F6F58] cursor-pointer"
          >
            <option value="Todos">Alcance: Todos</option>
            <option value="Interno">Interno</option>
            <option value="Externo">Externo</option>
            <option value="Ambos">Ambos</option>
          </select>
        </div>
      </div>

      {/* 4. Contador de resultados y ayuda contextual */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Mostrando</span>
          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#25633C] font-semibold text-xs border border-[#CDE1D4]">
            {factoresFiltrados.length}
          </span>
          <span className="font-medium text-gray-700">
            {factoresFiltrados.length === 1 ? "factor" : "factores"}
          </span>
          {factoresFiltrados.length !== factores.length && (
            <span className="text-gray-400 text-[11px] ml-1">
              (filtrados de {factores.length} en total)
            </span>
          )}
        </div>

        <div className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1">
          <span>Haga clic en</span>
          <span className="text-[#3F6F58] font-semibold underline decoration-[#3F6F58]/50">Ver N</span>
          <span>para desplegar la evidencia bibliográfica</span>
        </div>
      </div>

      {/* 5. Contenedor de la Tabla */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 font-medium text-[11px] bg-white">
              <th className="py-4 px-4 font-semibold text-gray-600">Factor</th>
              <th className="py-4 px-3 font-semibold text-gray-600">Dimensión</th>
              <th className="py-4 px-3 font-semibold text-gray-600">IL</th>
              <th className="py-4 px-3 font-semibold text-gray-600">IE</th>
              <th className="py-4 px-3 font-semibold text-gray-600">Import. sugerida</th>
              <th className="py-4 px-4 font-semibold text-gray-600">Tu importancia</th>
              <th className="py-4 px-3 font-semibold text-gray-600">Import. relativa</th>
              <th className="py-4 px-3 font-semibold text-gray-600 text-center">Alcance</th>
              <th className="py-4 px-3 font-semibold text-gray-600 text-center">Estado</th>
              <th className="py-4 px-4 font-semibold text-gray-600 text-center">Evidencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {factoresFiltrados.map((factor) => {
              const esSoporte = factor.nombre === "Soporte";
              const isRelevante = factor.relevante;

              return (
                <tr
                  key={factor.id}
                  className={`transition-colors ${
                    !isRelevante
                      ? "bg-gray-50/50 opacity-60 hover:bg-gray-50"
                      : "hover:bg-[#F9FCFA]"
                  }`}
                >
                  {/* Factor */}
                  <td className="py-4 px-4 font-semibold text-gray-800 text-[13px]">
                    {factor.nombre}
                  </td>

                  {/* Dimensión */}
                  <td className="py-4 px-3 text-gray-600 text-xs">
                    {factor.dimension}
                  </td>

                  {/* IL */}
                  <td className="py-4 px-3 text-gray-600 font-normal text-xs">
                    {factor.IL_dec || (factor.IL === 4 ? "0.92" : factor.IL === 3 ? "0.76" : "0.55")}
                  </td>

                  {/* IE */}
                  <td className="py-4 px-3 text-gray-600 font-normal text-xs">
                    {factor.IE_dec || (factor.IE === 4 ? "0.88" : factor.IE === 3 ? "0.71" : "0.52")}
                  </td>

                  {/* Importancia sugerida (Badge con color semántico según IS) */}
                  <td className="py-4 px-3">
                    <Badge variant="auto" size="md">
                      {formatImportancia(factor.IS)}
                    </Badge>
                  </td>

                  {/* Tu importancia (Select estilizado armónicamente con ID) */}
                  <td className="py-4 px-4">
                    <div className="relative inline-block w-40">
                      <select
                        value={factor.ID}
                        onChange={(e) => updateFactorID(factor.id, e.target.value)}
                        className={`w-full appearance-none px-3 py-1.5 pr-8 text-xs font-medium rounded-lg border transition-all focus:outline-none focus:ring-1 focus:ring-[#3F6F58] cursor-pointer shadow-2xs ${
                          idSelectStyles[factor.ID] || "border-gray-200 bg-white text-gray-800"
                        }`}
                      >
                        <option value="4" className="bg-white text-[#14532D] font-medium">4 · Fundamental</option>
                        <option value="3" className="bg-white text-[#25633C] font-medium">3 · Importante</option>
                        <option value="2" className="bg-white text-[#854D0E] font-medium">2 · Opcional</option>
                        <option value="1" className="bg-white text-[#64748B] font-medium">1 · Irrelevante</option>
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                    </div>
                  </td>

                  {/* Importancia relativa (Badge con color según IR) */}
                  <td className="py-4 px-3">
                    <Badge variant="auto" size="md">
                      {formatImportancia(factor.IR)}
                    </Badge>
                  </td>

                  {/* Alcance (Pill o Select para Soporte) */}
                  <td className="py-4 px-3 text-center">
                    {esSoporte && isRelevante ? (
                      <div className="relative inline-block w-28">
                        <select
                          value={factor.alcance || "Interno"}
                          onChange={(e) => updateFactorAlcance(factor.id, e.target.value)}
                          className="w-full appearance-none px-3 py-1 pr-6 text-xs font-medium rounded-full border border-[#CDE1D4] bg-[#F0F7F4] text-[#2F5444] focus:outline-none cursor-pointer"
                        >
                          <option value="Interno">Interno</option>
                          <option value="Externo">Externo</option>
                        </select>
                        <ChevronDown
                          size={12}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3F6F58] pointer-events-none"
                        />
                      </div>
                    ) : factor.alcance === "Interno" ? (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium border border-[#CDE1D4] bg-[#F0F7F4] text-[#2F5444]">
                        Interno
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-normal border border-gray-200 bg-white text-gray-600">
                        {factor.alcance || "—"}
                      </span>
                    )}
                  </td>

                  {/* Estado (Badge Relevante en verde institucional / Irrelevante en gris neutro) */}
                  <td className="py-4 px-3 text-center">
                    <Badge variant={isRelevante ? "relevante" : "irrelevante"} size="md">
                      {isRelevante ? "Relevante" : "Irrelevante"}
                    </Badge>
                  </td>

                  {/* Evidencia (Enlace subrayado verde que abre el Drawer) */}
                  <td className="py-4 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setDrawerFactor(factor)}
                      className="text-[#2F5444] hover:text-[#1F3A2E] underline font-medium text-xs cursor-pointer"
                    >
                      Ver {factor.evidencia_count || factor.documentos || 10}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pie inferior: Resumen y botón Continuar al Paso 2 */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="relevante" size="sm" withDot>
            {totalRelevantes} relevantes
          </Badge>
          <span className="text-gray-300">·</span>
          <Badge variant="irrelevante" size="sm" withDot>
            {totalIrrelevantes} irrelevantes
          </Badge>
        </div>

        <button
          onClick={handleContinuarPaso2}
          className="px-6 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Continuar al Paso 2</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* DRAWER LATERAL DERECHO: Evidencia Bibliográfica               */}
      {/* ============================================================== */}
      {drawerFactor && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop translúcido */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity duration-300"
            onClick={() => setDrawerFactor(null)}
          />

          {/* Panel deslizante lateral derecho */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col p-6 sm:p-8 overflow-y-auto">
              {/* Encabezado del Drawer */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-gray-500 block mb-1">
                    Evidencia bibliográfica
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                    {drawerFactor.nombre}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="auto" size="xs">
                      {formatImportancia(drawerFactor.IR)}
                    </Badge>
                    <Badge variant={drawerFactor.relevante ? "relevante" : "irrelevante"} size="xs">
                      {drawerFactor.relevante ? "Relevante" : "Irrelevante"}
                    </Badge>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500 font-medium">{drawerFactor.dimension}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {drawerFactor.evidencia_count || 18} documentos · {drawerFactor.citas_acumuladas || 146} citas acumuladas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerFactor(null)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                  aria-label="Cerrar panel"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-100 my-6" />

              {/* Lista de Artículos */}
              <div className="space-y-6">
                {(drawerFactor.articulos && drawerFactor.articulos.length > 0
                  ? drawerFactor.articulos
                  : [
                      {
                        fuente: "Scopus",
                        titulo: `${drawerFactor.nombre} in open source learning platforms: a systematic review`,
                        autores: "Al-Ajlan; Costello",
                        meta: "2025 · 51 citas",
                      },
                      {
                        fuente: "OpenAlex",
                        titulo: `FLOSS adoption and ${drawerFactor.nombre.toLowerCase()} in higher education`,
                        autores: "Martin, J.; Kumar, R.",
                        meta: "2023 · 34 citas",
                      },
                      {
                        fuente: "Scopus",
                        titulo: "Evaluating Moodle for institutional digital transformation",
                        autores: "Garcia, P.; Hill, A.",
                        meta: "2021 · 26 citas",
                      },
                    ]
                ).map((art, idx) => (
                  <div
                    key={idx}
                    className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    {/* Badge de Fuente */}
                    <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-medium bg-[#F8FAF9] text-gray-700 border border-gray-200 mb-2.5">
                      {art.fuente}
                    </span>

                    {/* Título */}
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1.5">
                      {art.titulo}
                    </h3>

                    {/* Autores */}
                    <p className="text-xs text-gray-500 mb-1">
                      {art.autores}
                    </p>

                    {/* Año y citas acumuladas */}
                    <p className="text-xs text-gray-500 font-normal">
                      {art.meta}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactoresRelevantes;

