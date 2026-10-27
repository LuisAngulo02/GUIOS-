import React, { useState } from "react";
import { RefreshCw, Download, Search, ExternalLink, Database, Calendar } from "lucide-react";
import { MOCK_EVIDENCIA } from "../data/mockEvidencia";
import KpiCard from "../components/KpiCard";
import Chip from "../components/Chip";
import Badge from "../components/Badge";

/**
 * Pantalla 7: Evidencia bibliográfica (/evidencia)
 */
export const Evidencia = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFuente, setFiltroFuente] = useState("Todas");
  const [actualizando, setActualizando] = useState(false);

  const data = MOCK_EVIDENCIA;

  const handleActualizar = () => {
    setActualizando(true);
    setTimeout(() => {
      setActualizando(false);
      alert("Consulta bibliográfica sincronizada con Scopus, OpenAlex y Semantic Scholar.");
    }, 1000);
  };

  const handleExportar = () => {
    alert("Exportando trazabilidad de evidencia bibliográfica a CSV/Excel...");
  };

  const itemsFiltrados = data.items.filter((item) => {
    const coincideTexto =
      item.factor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.autores_relevantes.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideFuente =
      filtroFuente === "Todas" || item.fuente_principal === filtroFuente;
    return coincideTexto && coincideFuente;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado con Botón Actualizar consulta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
            Evidencia bibliográfica
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Trazabilidad académica, citas acumuladas y corpus documental que respaldan la Importancia Sugerida (IS).
          </p>
        </div>

        <button
          onClick={handleActualizar}
          disabled={actualizando}
          className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={actualizando ? "animate-spin" : ""} />
          <span>{actualizando ? "Actualizando..." : "Actualizar consulta"}</span>
        </button>
      </div>

      {/* Tarjeta Resumen de la consulta académica */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#3F6F58]" />
            <h3 className="font-semibold text-gray-800 text-xs tracking-wide">
              Resumen de la consulta académica
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={13} />
            <span>{data.fecha_consulta}</span>
          </div>
        </div>

        {/* Cadena booleana */}
        <div className="bg-[#F8FAF9] p-3 rounded-lg border border-gray-200">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            CADENA BOOLEANA DE BÚSQUEDA
          </span>
          <code className="text-xs text-[#2F5444] font-mono break-all leading-relaxed">
            {data.cadena_booleana}
          </code>
        </div>

        {/* Chips de fuentes conectadas */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-gray-500 font-medium">Fuentes consultadas:</span>
          <div className="flex flex-wrap gap-1.5">
            {data.fuentes_conectadas.map((src, idx) => (
              <Chip key={idx} label={src} />
            ))}
          </div>
        </div>
      </div>

      {/* 3 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Documentos"
          value={data.kpis.documentos}
          subtitle="Artículos y ponencias analizados"
        />
        <KpiCard
          title="Citas acumuladas"
          value={data.kpis.citas_acumuladas}
          subtitle="Impacto bibliográfico total"
        />
        <KpiCard
          title="Factores con evidencia"
          value={data.kpis.factores_con_evidencia}
          subtitle="Factores relevantes respaldados"
        />
      </div>

      {/* Tabla con Buscador y Select de Fuentes */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-4">
        {/* Barra superior de la tabla */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por factor o autores..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
              />
            </div>

            <select
              value={filtroFuente}
              onChange={(e) => setFiltroFuente(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none"
            >
              <option value="Todas">Todas las fuentes</option>
              <option value="IEEE Xplore">IEEE Xplore</option>
              <option value="Scopus">Scopus</option>
              <option value="ACM Digital Library">ACM Digital Library</option>
              <option value="OpenAlex">OpenAlex</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-[#25633C] bg-[#DDEFE3] px-3 py-1 rounded-full border border-[#C5E4CE]">
            Consulta vigente · 9 factores
          </div>
        </div>

        {/* Tabla de Evidencia */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-[#DDE7E1] bg-[#F8FAF9] text-gray-500 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3 px-4">Factor</th>
                <th className="py-3 px-3 text-center">Documentos</th>
                <th className="py-3 px-3 text-center">Citas</th>
                <th className="py-3 px-4">Autores relevantes</th>
                <th className="py-3 px-3 text-center">IL</th>
                <th className="py-3 px-3 text-center">IE</th>
                <th className="py-3 px-3 text-center">IS</th>
                <th className="py-3 px-3">Fuente principal</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBF1ED]">
              {itemsFiltrados.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F6FAF7] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-gray-800">
                    {item.factor}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-[#2F5444]">
                    {item.documentos}
                  </td>
                  <td className="py-3.5 px-3 text-center text-gray-600">
                    {item.citas}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 text-xs">
                    {item.autores_relevantes}
                  </td>
                  <td className="py-3.5 px-3 text-center text-gray-500">
                    {item.IL}
                  </td>
                  <td className="py-3.5 px-3 text-center text-gray-500">
                    {item.IE}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <Badge variant="auto" size="sm">
                      {item.IS === 4 ? "4 · Fundamental" : item.IS === 3 ? "3 · Importante" : item.IS === 2 ? "2 · Opcional" : "1 · Irrelevante"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-3 text-gray-600">
                    {item.fuente_principal}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => alert(`Visualizando referencias documentales de ${item.factor}...`)}
                      className="text-[#3F6F58] hover:underline font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver documentos</span>
                      <ExternalLink size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie con texto aclaratorio y botón Exportar evidencia */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-4 px-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          IL e IE normalizados en escala 0–1 · IS expresada en los 4 niveles de la guía.
        </p>

        <button
          onClick={handleExportar}
          className="px-6 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Download size={14} />
          <span>Exportar evidencia</span>
        </button>
      </div>
    </div>
  );
};

export default Evidencia;
