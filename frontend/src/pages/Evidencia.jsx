import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  Download,
  Search,
  ExternalLink,
  Database,
  Calendar,
  BookOpen,
  X,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { MOCK_EVIDENCIA } from "../data/mockEvidencia";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";
import KpiCard from "../components/KpiCard";
import Chip from "../components/Chip";
import Badge from "../components/Badge";

/**
 * Pantalla 7: Evidencia bibliográfica (/evidencia)
 * Conectada a PostgreSQL, OpenAlex, Semantic Scholar y Gemini IA (RF-14).
 */
export const Evidencia = () => {
  const {
    evaluacionId,
    softwareActivo,
    contextoActivo,
    descripcionCaso,
    aplicarEvidenciaEnFactores,
  } = useEvaluation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFuente, setFiltroFuente] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [evidenciaData, setEvidenciaData] = useState(null);
  const [esReferenciaMock, setEsReferenciaMock] = useState(false);
  const [modalFactor, setModalFactor] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const mostrarToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    setErrorMsg("");

    apiService
      .getEvidenciaBibliografica(!isNaN(Number(evaluacionId)) ? evaluacionId : null)
      .then((res) => {
        if (cancelado) return;
        if (res && !res.sin_consulta && Array.isArray(res.items) && res.items.length > 0) {
          setEvidenciaData(res);
          setEsReferenciaMock(false);
        } else {
          setEvidenciaData(MOCK_EVIDENCIA);
          setEsReferenciaMock(true);
        }
      })
      .catch(() => {
        if (!cancelado) {
          setEvidenciaData(MOCK_EVIDENCIA);
          setEsReferenciaMock(true);
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [evaluacionId]);

  const data = evidenciaData || MOCK_EVIDENCIA;

  const handleActualizar = async () => {
    if (!softwareActivo?.trim()) {
      setErrorMsg("Define un software en Paso 0 antes de consultar.");
      return;
    }
    setActualizando(true);
    setErrorMsg("");
    try {
      const res = await apiService.calcularImportanciaSugerida({
        evaluacion_id: !isNaN(Number(evaluacionId)) ? Number(evaluacionId) : null,
        nombre_software: softwareActivo,
        contexto_uso: contextoActivo,
        descripcion_caso: descripcionCaso,
        fuentes: { scopus: true, openAlex: true, semanticScholar: false },
      });
      if (res && Array.isArray(res.items)) {
        setEvidenciaData(res);
        setEsReferenciaMock(false);
        aplicarEvidenciaEnFactores(res.items);
        mostrarToast(
          `Consulta sincronizada: ${res.kpis?.documentos ?? 0} documentos analizados para ${softwareActivo}.`
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "Error al sincronizar consulta bibliográfica.");
    } finally {
      setActualizando(false);
    }
  };

  const handleExportar = () => {
    const escapar = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const fecha = new Date().toISOString().split("T")[0];
    const lineas = [
      `"REPORTE DE EVIDENCIA BIBLIOGRÁFICA — METODOLOGÍA GUIOS (RF-14)"`,
      `"Software:",${escapar(data.software || softwareActivo)},"Fecha:",${escapar(fecha)}`,
      `"Cadena Booleana:",${escapar(data.cadena_booleana)}`,
      "",
      `"Factor","Documentos","Citas","Autores Relevantes","IL","IE","IS","Fuente Principal"`,
    ];

    (data.items || []).forEach((item) => {
      lineas.push(
        [
          escapar(item.factor),
          escapar(item.documentos),
          escapar(item.citas),
          escapar(item.autores_relevantes),
          escapar(item.IL),
          escapar(item.IE),
          escapar(
            typeof item.IS === "number"
              ? item.IS === 4
                ? "4 · Fundamental"
                : item.IS === 3
                ? "3 · Importante"
                : item.IS === 2
                ? "2 · Opcional"
                : "1 · Irrelevante"
              : item.IS
          ),
          escapar(item.fuente_principal),
        ].join(",")
      );
    });

    const blob = new Blob(["\uFEFF" + lineas.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = (data.software || softwareActivo || "floss")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    link.href = url;
    link.download = `GUIOS_Evidencia_${slug}_${fecha}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    mostrarToast("Trazabilidad bibliográfica exportada a CSV correctamente.");
  };

  const fuentesDisponibles = useMemo(() => {
    const set = new Set((data.items || []).map((i) => i.fuente_principal).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [data.items]);

  const itemsFiltrados = (data.items || []).filter((item) => {
    const coincideTexto =
      item.factor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.autores_relevantes || "").toLowerCase().includes(searchTerm.toLowerCase());
    const coincideFuente =
      filtroFuente === "Todas" || item.fuente_principal === filtroFuente;
    return coincideTexto && coincideFuente;
  });

  const formatearFecha = (iso) => {
    if (!iso) return "Sin fecha";
    const parsed = new Date(iso);
    if (isNaN(parsed.getTime())) return iso;
    return parsed.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
  };

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
          <span>{actualizando ? "Consultando APIs..." : "Actualizar consulta en vivo"}</span>
        </button>
      </div>

      {/* Aviso si está mostrando datos base porque aún no se ejecuta Paso 0 para esta evaluación */}
      {esReferenciaMock && !cargando && (
        <div className="rounded-card bg-amber-50 border border-amber-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0 text-amber-600" />
            <span>
              Aún no se ha ejecutado una búsqueda en vivo para <strong>{softwareActivo}</strong>. Se muestran valores de referencia; pulsa <strong>Actualizar consulta en vivo</strong> para consultar OpenAlex y Gemini IA.
            </span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Tarjeta Resumen de la consulta académica */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#3F6F58]" />
            <h3 className="font-semibold text-gray-800 text-xs tracking-wide">
              Resumen de la consulta académica · {data.software || softwareActivo}
            </h3>
            {data.ia_utilizada && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#EBF4EE] text-[#2F5444] px-2 py-0.5 rounded-full border border-[#CDE1D4]">
                <Sparkles size={10} />
                {data.proveedor_ia || "IA"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={13} />
            <span>{formatearFecha(data.fecha_consulta)}</span>
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
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-gray-500 font-medium">Fuentes consultadas:</span>
          <div className="flex flex-wrap gap-1.5">
            {(data.fuentes_conectadas || []).map((src, idx) => (
              <Chip key={idx} label={src} />
            ))}
          </div>
        </div>
      </div>

      {/* 3 Tarjetas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Documentos"
          value={data.kpis?.documentos ?? 0}
          subtitle="Artículos y ponencias coincidentes"
        />
        <KpiCard
          title="Citas acumuladas"
          value={data.kpis?.citas_acumuladas ?? 0}
          subtitle="Impacto en literatura analizada"
        />
        <KpiCard
          title="Factores con evidencia"
          value={data.kpis?.factores_con_evidencia ?? 0}
          subtitle={`De ${(data.items || []).length} factores evaluados`}
        />
      </div>

      {/* Tabla con Buscador y Select de Fuentes */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-4">
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
              {fuentesDisponibles.map((f) => (
                <option key={f} value={f}>
                  {f === "Todas" ? "Todas las fuentes" : f}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-[#25633C] bg-[#DDEFE3] px-3 py-1 rounded-full border border-[#C5E4CE]">
            {esReferenciaMock ? "Referencia base" : "Consulta vigente"} · {itemsFiltrados.length} factores
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
              {cargando ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    Cargando trazabilidad bibliográfica...
                  </td>
                </tr>
              ) : (
                itemsFiltrados.map((item, idx) => (
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
                    <td className="py-3.5 px-4 text-gray-600 text-xs max-w-[220px] truncate" title={item.autores_relevantes}>
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
                        {typeof item.IS === "number"
                          ? item.IS === 4
                            ? "4 · Fundamental"
                            : item.IS === 3
                            ? "3 · Importante"
                            : item.IS === 2
                            ? "2 · Opcional"
                            : "1 · Irrelevante"
                          : item.IS}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-gray-600 max-w-[160px] truncate" title={item.fuente_principal}>
                      {item.fuente_principal}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setModalFactor(item)}
                        className="text-[#3F6F58] hover:underline font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver documentos</span>
                        <ExternalLink size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie con texto aclaratorio y botón Exportar evidencia */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-4 px-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          IL e IE normalizados en escala 0–1 · IS = floor((IL + IE) / 2) en los 4 niveles de la guía.
        </p>

        <button
          onClick={handleExportar}
          className="px-6 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Download size={14} />
          <span>Exportar evidencia CSV</span>
        </button>
      </div>

      {/* Modal de Artículos Científicos Reales por Factor */}
      {modalFactor && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF4EE] text-[#3F6F58] flex items-center justify-center">
                  <BookOpen size={17} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Documentos científicos · {modalFactor.factor}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {modalFactor.documentos} documentos totales · {modalFactor.citas} citas acumuladas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalFactor(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Keywords y sinónimos IA */}
            {(modalFactor.keywords_usadas?.length > 0 || modalFactor.sinonimos_ia?.length > 0) && (
              <div className="bg-[#F8FAF9] p-3 rounded-lg border border-gray-100 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Términos de búsqueda aplicados
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(modalFactor.keywords_usadas || []).map((kw, i) => {
                    const esIa = (modalFactor.sinonimos_ia || []).includes(kw);
                    return (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          esIa
                            ? "bg-[#EBF4EE] text-[#2F5444] border-[#CDE1D4]"
                            : "bg-white text-gray-600 border-gray-200"
                        }`}
                      >
                        {esIa ? "✦ " : ""}
                        {kw}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de Artículos */}
            <div className="overflow-y-auto space-y-2.5 pr-1">
              {modalFactor.articulos && modalFactor.articulos.length > 0 ? (
                modalFactor.articulos.map((art, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-[#DDE7E1] hover:bg-[#F8FAF9] transition-colors space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-gray-800 leading-snug">
                        {art.titulo}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF4EE] text-[#2F5444] shrink-0">
                        {art.meta}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      {art.autores} · <span className="text-gray-400">{art.fuente}</span>
                    </p>
                    {art.url && (
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3F6F58] hover:underline pt-1"
                      >
                        <span>Abrir fuente académica</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-400">
                  No se recuperaron extractos individuales de artículos para este término de búsqueda.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalFactor(null)}
                className="px-4 py-2 rounded-lg bg-[#3F6F58] text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
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

export default Evidencia;
