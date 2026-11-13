import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  ArrowRight,
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  GitCompare,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Download,
  FileSpreadsheet,
  Award,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  Scale,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";
import KpiCard from "../components/KpiCard";
import Badge from "../components/Badge";
import ModalNuevaEvaluacion from "../components/ModalNuevaEvaluacion";

/**
 * Pantalla 2: Dashboard (/dashboard)
 * Incluye HU-07:
 * - Tarjetas KPI y Evaluación Activa
 * - Historial completo de Evaluaciones con filtros en vivo
 * - Modo de comparación en paralelo de 2 evaluaciones (Side-by-Side Comparison)
 * - Creación interactiva de nueva instancia de evaluación
 */
export const Dashboard = () => {
  const {
    currentUser,
    softwareActivo,
    contextoActivo,
    evaluacionId,
    evaluacionesList,
    cargandoEvaluaciones,
    fetchEvaluaciones,
    crearNuevaEvaluacion,
    cargarEvaluacionParaContinuar,
    cargarCasoEstudioUNEMI,
    estadoEvaluacionActiva,
    totalFactores,
    totalRelevantes,
  } = useEvaluation();

  const navigate = useNavigate();

  // Recargar evaluaciones automáticamente al entrar al Dashboard
  React.useEffect(() => {
    fetchEvaluaciones();
  }, [fetchEvaluaciones]);

  const [cargandoUnemi, setCargandoUnemi] = useState(false);
  const [errorToast, setErrorToast] = useState("");

  const mostrarError = (msg) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(""), 6000);
  };

  const handleCargarUNEMI = async () => {
    setCargandoUnemi(true);
    try {
      await cargarCasoEstudioUNEMI();
      await fetchEvaluaciones();
      navigate("/resultado");
    } catch (err) {
      mostrarError("Error al cargar caso UNEMI: " + err.message);
    } finally {
      setCargandoUnemi(false);
    }
  };

  // Estados de filtros para el Historial
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Estado para la selección de evaluaciones a comparar (máximo 2)
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [comparacionData, setComparacionData] = useState(null);
  const [loadingComparacion, setLoadingComparacion] = useState(false);
  const [modalComparacionOpen, setModalComparacionOpen] = useState(false);
  const [descargandoPdfId, setDescargandoPdfId] = useState(null);
  const [filtroComp, setFiltroComp] = useState("todos");
  const [busquedaComp, setBusquedaComp] = useState("");

  const exportarComparativaExcel = (ev1, ev2, factores) => {
    const fecha = new Date().toISOString().split("T")[0];
    const fechaHora = new Date().toLocaleString("es-ES");
    const nom1 = ev1.nombre_software || "Opción 1";
    const nom2 = ev2.nombre_software || "Opción 2";

    const getRec = (e) => {
      if (!e) return "—";
      if (typeof e.recomendacion === "object" && e.recomendacion?.tipo) return e.recomendacion.tipo;
      if (typeof e.recomendacion === "string") return e.recomendacion;
      if (e.dictamen_oficial) return e.dictamen_oficial;
      return "—";
    };

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Comparativa FLOSS</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; }
          .titulo { font-size: 15pt; font-weight: bold; color: #2F5444; }
          .subtitulo { font-size: 10pt; color: #555555; }
          th { background-color: #2F5444; color: #FFFFFF; font-weight: bold; font-size: 9pt; border: 1px solid #1F382E; padding: 7px 10px; }
          td { border: 1px solid #DDE7E1; padding: 6px 10px; font-size: 9pt; vertical-align: middle; }
          .center { text-align: center; }
          .fortaleza { background-color: #E8F5E9; color: #1B5E20; font-weight: bold; }
          .oportunidad { background-color: #E1F5FE; color: #0277BD; font-weight: bold; }
          .debilidad { background-color: #FFF3E0; color: #E65100; font-weight: bold; }
          .amenaza { background-color: #FFEBEE; color: #C62828; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="5" class="titulo">GUIOS+ · COMPARATIVA EN PARALELO DE SOLUCIONES FLOSS</td></tr>
          <tr><td colspan="5" class="subtitulo">Análisis contrastado según los 18 factores y la Ecuación 5.3 (Tesis Doctoral URJC) · Fecha: ${fechaHora}</td></tr>
        </table>
        <br/>
        <table>
          <thead>
            <tr>
              <th>Métrica de Decisión</th>
              <th class="center">${nom1} (Opción 1)</th>
              <th class="center">${nom2} (Opción 2)</th>
              <th>Diferencial / Balance Comparativo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Dictamen Oficial</strong></td>
              <td class="center"><strong>Recomendación ${getRec(ev1)}</strong></td>
              <td class="center"><strong>Recomendación ${getRec(ev2)}</strong></td>
              <td>${getRec(ev1) === getRec(ev2) ? "Dictámenes equivalentes" : `Difieren (${getRec(ev1)} vs ${getRec(ev2)})`}</td>
            </tr>
            <tr>
              <td><strong>Índice de Viabilidad FLOSS</strong></td>
              <td class="center" style="font-weight: bold; color: #2E7D32;">${ev1.indice_viabilidad != null ? `${ev1.indice_viabilidad}%` : "0%"}</td>
              <td class="center" style="font-weight: bold; color: #0277BD;">${ev2.indice_viabilidad != null ? `${ev2.indice_viabilidad}%` : "0%"}</td>
              <td>${(ev1.indice_viabilidad || 0) > (ev2.indice_viabilidad || 0) ? `+${((ev1.indice_viabilidad || 0) - (ev2.indice_viabilidad || 0)).toFixed(1)}% a favor de ${nom1}` : (ev2.indice_viabilidad || 0) > (ev1.indice_viabilidad || 0) ? `+${((ev2.indice_viabilidad || 0) - (ev1.indice_viabilidad || 0)).toFixed(1)}% a favor de ${nom2}` : "Misma viabilidad"}</td>
            </tr>
            <tr>
              <td><strong>Nivel de Confianza</strong></td>
              <td class="center">${ev1.nivel_confianza || "—"}</td>
              <td class="center">${ev2.nivel_confianza || "—"}</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>Factores Críticos</strong></td>
              <td class="center">${ev1?.resumen_foda?.criticos || 0}</td>
              <td class="center">${ev2?.resumen_foda?.criticos || 0}</td>
              <td>${(ev1?.resumen_foda?.criticos || 0) < (ev2?.resumen_foda?.criticos || 0) ? `Menor riesgo en ${nom1}` : (ev2?.resumen_foda?.criticos || 0) < (ev1?.resumen_foda?.criticos || 0) ? `Menor riesgo en ${nom2}` : "Mismo riesgo"}</td>
            </tr>
          </tbody>
        </table>
        <br/>
        <table>
          <thead>
            <tr>
              <th>Factor</th>
              <th>Dimensión</th>
              <th class="center">${nom1} (PM / FODA)</th>
              <th class="center">${nom2} (PM / FODA)</th>
              <th>Ventaja Técnica</th>
            </tr>
          </thead>
          <tbody>
            ${(factores || []).map((cf) => {
              const pm1 = cf.eval1?.pm != null ? Number(cf.eval1.pm) : null;
              const pm2 = cf.eval2?.pm != null ? Number(cf.eval2.pm) : null;
              let ventaja = "Empate";
              if (pm1 != null && pm2 != null) {
                if (pm1 > pm2) ventaja = `+${(pm1 - pm2).toFixed(2)} ${nom1}`;
                else if (pm2 > pm1) ventaja = `+${(pm2 - pm1).toFixed(2)} ${nom2}`;
              } else if (pm1 != null && pm2 == null) {
                ventaja = `Evaluado solo en ${nom1}`;
              } else if (pm2 != null && pm1 == null) {
                ventaja = `Evaluado solo en ${nom2}`;
              } else {
                ventaja = "No evaluado";
              }

              const txt1 = cf.eval1?.pm != null ? `${cf.eval1.pm} · ${cf.eval1.foda || "—"}` : cf.eval1?.importancia_relativa && cf.eval1.importancia_relativa !== "—" ? `IR: ${cf.eval1.importancia_relativa}` : "No evaluado";
              const txt2 = cf.eval2?.pm != null ? `${cf.eval2.pm} · ${cf.eval2.foda || "—"}` : cf.eval2?.importancia_relativa && cf.eval2.importancia_relativa !== "—" ? `IR: ${cf.eval2.importancia_relativa}` : "No evaluado";

              return `
                <tr>
                  <td><strong>${cf.nombre_factor}</strong></td>
                  <td>${cf.dimension}</td>
                  <td class="center">${txt1}</td>
                  <td class="center">${txt2}</td>
                  <td><strong>${ventaja}</strong></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GUIOS_Comparativa_${nom1}_vs_${nom2}_${fecha}.xls`.replace(/\s+/g, "_");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportarComparativaCSV = (ev1, ev2, factores) => {
    const fecha = new Date().toISOString().split("T")[0];
    const nom1 = ev1.nombre_software || "Opción 1";
    const nom2 = ev2.nombre_software || "Opción 2";

    const lineas = [
      `sep=;\r\n"GUIOS+ — COMPARATIVA EN PARALELO DE SOLUCIONES FLOSS"`,
      `"Opción 1:";"${nom1}";"ID:";"${ev1.id || ""}";"Viabilidad:";"${ev1.indice_viabilidad || 0}%";"Dictamen:";"${ev1.dictamen_oficial || ""}"`,
      `"Opción 2:";"${nom2}";"ID:";"${ev2.id || ""}";"Viabilidad:";"${ev2.indice_viabilidad || 0}%";"Dictamen:";"${ev2.dictamen_oficial || ""}"`,
      "",
      `"Factor";"Dimensión";"${nom1} (PM)";"${nom1} (FODA)";"${nom2} (PM)";"${nom2} (FODA)";"Diferencial PM"`,
    ];

    (factores || []).forEach((cf) => {
      const pm1 = cf.eval1?.pm != null ? cf.eval1.pm : "";
      const foda1 = cf.eval1?.foda || cf.eval1?.importancia_relativa || "No evaluado";
      const pm2 = cf.eval2?.pm != null ? cf.eval2.pm : "";
      const foda2 = cf.eval2?.foda || cf.eval2?.importancia_relativa || "No evaluado";
      let dif = "";
      if (cf.eval1?.pm != null && cf.eval2?.pm != null) {
        dif = (Number(cf.eval1.pm) - Number(cf.eval2.pm)).toFixed(2);
      }
      lineas.push(`"${cf.nombre_factor}";"${cf.dimension}";"${pm1}";"${foda1}";"${pm2}";"${foda2}";"${dif}"`);
    });

    const blob = new Blob(["\uFEFF" + lineas.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GUIOS_Comparativa_${nom1}_vs_${nom2}_${fecha}.csv`.replace(/\s+/g, "_");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Estado para el modal de Nueva Evaluación
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);

  // Determinar si la evaluación activa actual está completada
  const evaluacionActualObj = useMemo(() => {
    return evaluacionesList.find((e) => String(e.id) === String(evaluacionId));
  }, [evaluacionesList, evaluacionId]);

  const esCompletadaActiva =
    evaluacionActualObj?.estado === "completada" ||
    estadoEvaluacionActiva === "completada";

  // Saludo según la hora local
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const nombreUsuario = currentUser?.nombre || "Admin Usuario";

  // Filtrar lista de evaluaciones en cliente
  const evaluacionesFiltradas = useMemo(() => {
    return evaluacionesList.filter((ev) => {
      const matchText =
        ev.nombre_software?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.evaluador_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchEstado =
        filtroEstado === "todos" || ev.estado === filtroEstado;
      return matchText && matchEstado;
    });
  }, [evaluacionesList, searchTerm, filtroEstado]);

  // Manejador de selección para comparar (máximo 2)
  const toggleSelectCompare = (id) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id]; // Reemplaza la primera si ya hay 2
      }
      return [...prev, id];
    });
  };

  // Ejecutar comparador lado a lado
  const handleEjecutarComparacion = async () => {
    if (selectedForCompare.length !== 2) return;
    setLoadingComparacion(true);
    try {
      const data = await apiService.compararEvaluaciones(
        selectedForCompare[0],
        selectedForCompare[1]
      );
      setComparacionData(data);
      setModalComparacionOpen(true);
    } catch (err) {
      mostrarError("No se pudo cargar la comparación: " + (err.message || "Error del servidor"));
    } finally {
      setLoadingComparacion(false);
    }
  };

  // Descargar informe en PDF
  const handleDescargarPDF = async (ev) => {
    setDescargandoPdfId(ev.id);
    try {
      await apiService.descargarInformePDF(ev.id, ev.nombre_software);
    } catch (err) {
      mostrarError("No se pudo descargar el informe PDF: " + (err.message || "Error del servidor"));
    } finally {
      setDescargandoPdfId(null);
    }
  };

  // Reanudar una evaluación previa
  const handleReanudarEvaluacion = async (ev) => {
    try {
      await cargarEvaluacionParaContinuar(ev.id);
      if (ev.estado === "completada") {
        navigate("/resultado");
      } else {
        navigate("/factores");
      }
    } catch (err) {
      mostrarError("Error al cargar la evaluación: " + err.message);
    }
  };

  return (
    <div className="space-y-7">
      {/* 1. Encabezado de Bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
            {getSaludo()}, {nombreUsuario}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Supervisa el avance de tus evaluaciones FLOSS, revisa el historial y realiza análisis comparativos.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleCargarUNEMI}
            disabled={cargandoUnemi}
            className="px-3.5 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-[#2F5444] font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            title="Cargar la evaluación oficial de la Universidad Estatal de Milagro (Capítulo 6)"
          >
            <BookOpen size={14} className="text-[#3F6F58]" />
            <span>{cargandoUnemi ? "Cargando..." : "Caso UNEMI (LibreOffice)"}</span>
          </button>

          <button
            onClick={() => setModalNuevaOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Nueva evaluación</span>
          </button>
        </div>
      </div>

      {/* Notificación de Error */}
      {errorToast && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button
            onClick={() => setErrorToast("")}
            className="text-red-700 hover:text-red-900 font-bold ml-2 cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 2. KPIs Dinámicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Factores totales"
          value={totalFactores || "18"}
          percentage={100}
          subtitle="Catálogo oficial GUIOS"
        />
        <KpiCard
          title="Factores relevantes"
          value={totalRelevantes || "9"}
          percentage={Math.round(((totalRelevantes || 9) / 18) * 100)}
          subtitle="Con Importancia Relativa > 1"
        />
        <KpiCard
          title="Subfactores"
          value="61"
          percentage={100}
          subtitle="Reactivos SF-01 a SF-61"
        />
        <KpiCard
          title="Evaluaciones registradas"
          value={evaluacionesList.length.toString()}
          percentage={evaluacionesList.length > 0 ? 100 : 0}
          subtitle={`${evaluacionesList.filter((e) => e.estado === "completada" || (String(e.id) === String(evaluacionId) && esCompletadaActiva)).length} completadas`}
        />
      </div>

      {/* 3. Grid Central: Evaluación Activa y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta Evaluación Activa (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#3F6F58]" />
                EVALUACIÓN ACTIVA #{evaluacionId}
              </span>
              <Badge variant={esCompletadaActiva ? "green" : "amber"} size="md">
                {esCompletadaActiva ? "Completada" : "En sesión"}
              </Badge>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF4EE] border border-[#CDE1D4] flex items-center justify-center font-bold text-2xl text-[#2F5444] shrink-0 shadow-inner">
                {softwareActivo.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-light text-gray-800">
                  {softwareActivo}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {contextoActivo}
                </p>

                {/* Metadatos en 3 columnas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Metodología</span>
                    <span className="font-semibold text-[#2F5444]">Tesis Doctoral GUIOS</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Resultado Dictamen</span>
                    <span className="font-semibold text-[#25633C]">
                      {esCompletadaActiva
                        ? `Rec. ${evaluacionActualObj?.recomendacion?.tipo || "C"} (${evaluacionActualObj?.indice_viabilidad || 100}%)`
                        : "En proceso de cálculo"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Estado Persistencia</span>
                    <span className="font-semibold text-gray-700">
                      {esCompletadaActiva ? "Completada en PostgreSQL" : "En sesión activa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Navegación Rápida */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            {esCompletadaActiva ? (
              <>
                <button
                  onClick={() => navigate("/resultado")}
                  className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Ver Dictamen Final (Paso 3)</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate("/factores")}
                  className="px-4 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Revisar Paso 1</span>
                </button>
                <button
                  onClick={() => navigate("/subfactores")}
                  className="px-4 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Revisar Paso 2</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/factores")}
                  className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Ir a Paso 1 (Factores)</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => navigate("/subfactores")}
                  className="px-4 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Paso 2 (Subfactores)</span>
                </button>
                <button
                  onClick={() => navigate("/resultado")}
                  className="px-4 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Paso 3 (Resultado)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tarjeta Resumen Metodológico */}
        <div className="bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                CRITERIOS GUIOS
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Cap. 5 Tesis</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-[#F9FCFA] border border-[#E2EBE5]">
                <p className="font-semibold text-[#25633C] mb-1">Regla de Dictamen:</p>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  • <b>A:</b> Todos los factores relevantes en Fortalezas u Oportunidades.<br/>
                  • <b>B:</b> Debilidades o Amenazas solo en factores Opcionales.<br/>
                  • <b>C:</b> Al menos un factor Crítico con debilidad/amenaza.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#F9FCFA] border border-[#E2EBE5]">
                <p className="font-semibold text-[#25633C] mb-1">Umbral Decisorio:</p>
                <p className="text-gray-600 text-[11px]">
                  Ponderación Media mínima de <b>3.00 / 4.00</b> para clasificar positivamente.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <Link
              to="/evidencia"
              className="text-xs font-semibold text-[#3F6F58] hover:underline flex items-center gap-1"
            >
              <span>Consultar evidencia y literatura</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. SECCIÓN HU-07: Historial de Evaluaciones y Comparador en Paralelo */}
      <div className="bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-light text-gray-800 tracking-tight flex items-center gap-2">
              <Layers size={18} className="text-[#3F6F58]" />
              Historial de Evaluaciones Guardadas
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Consulta todas las instancias persistidas en PostgreSQL y selecciona 2 para compararlas en paralelo.
            </p>
          </div>

          {/* Barra de Comparación si hay selecciones */}
          <div className="flex items-center gap-3">
            {selectedForCompare.length > 0 && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                {selectedForCompare.length} de 2 seleccionadas
              </span>
            )}
            <button
              onClick={handleEjecutarComparacion}
              disabled={selectedForCompare.length !== 2 || loadingComparacion}
              className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                selectedForCompare.length === 2
                  ? "bg-[#3F6F58] hover:bg-[#345C49] text-white cursor-pointer shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              }`}
            >
              <GitCompare size={14} />
              <span>{loadingComparacion ? "Comparando..." : "Comparar en paralelo (2)"}</span>
            </button>
          </div>
        </div>

        {/* Filtros y Buscador del Historial */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por software o evaluador..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-gray-400 shrink-0" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3F6F58] cursor-pointer"
            >
              <option value="todos">Estado: Todos</option>
              <option value="en_progreso">En progreso</option>
              <option value="completada">Completada</option>
            </select>
          </div>
        </div>

        {/* Tabla del Historial */}
        {cargandoEvaluaciones ? (
          <div className="py-12 text-center text-xs text-gray-400">
            Cargando historial desde la base de datos PostgreSQL...
          </div>
        ) : evaluacionesFiltradas.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
            No se encontraron evaluaciones registradas. Haz clic en <b>"+ Nueva evaluación"</b> para iniciar una.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-semibold bg-gray-50/50">
                  <th className="py-3 px-3 w-10 text-center">Comparar</th>
                  <th className="py-3 px-4">Software FLOSS</th>
                  <th className="py-3 px-3">Evaluador</th>
                  <th className="py-3 px-3">Fecha de inicio</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-3 text-center">Dictamen / Viabilidad</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {evaluacionesFiltradas.map((ev) => {
                  const isChecked = selectedForCompare.includes(ev.id);
                  const isActiva = String(evaluacionId) === String(ev.id);
                  const isCompletada = ev.estado === "completada" || (isActiva && esCompletadaActiva);

                  return (
                    <tr
                      key={ev.id}
                      className={`hover:bg-[#F9FCFA] transition-colors ${
                        isActiva ? "bg-[#F3F8F5]" : ""
                      }`}
                    >
                      {/* Checkbox Comparar */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectCompare(ev.id)}
                          className="rounded border-gray-300 text-[#3F6F58] focus:ring-[#3F6F58] cursor-pointer"
                        />
                      </td>

                      {/* Nombre Software */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-[13px]">
                            {ev.nombre_software}
                          </span>
                          {isActiva && (
                            <span className="text-[10px] bg-[#DDEFE3] text-[#25633C] px-1.5 py-0.5 rounded font-bold">
                              Activa
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">ID: #{ev.id}</span>
                      </td>

                      {/* Evaluador */}
                      <td className="py-3 px-3 text-gray-600">
                        {ev.evaluador_nombre || "Evaluador"}
                      </td>

                      {/* Fecha */}
                      <td className="py-3 px-3 text-gray-500 text-[11px]">
                        {ev.fecha_inicio
                          ? new Date(ev.fecha_inicio).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-3 text-center">
                        {isCompletada ? (
                          <Badge variant="green" size="xs">
                            Completada
                          </Badge>
                        ) : (
                          <Badge variant="amber" size="xs">
                            En progreso
                          </Badge>
                        )}
                      </td>

                      {/* Dictamen / Viabilidad */}
                      <td className="py-3 px-3 text-center">
                        {isCompletada ? (
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-[#25633C] text-xs">
                              Rec. {ev.recomendacion?.tipo || "A"} · {ev.indice_viabilidad || 100}%
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Confianza {ev.nivel_confianza || "Alta"}
                            </span>
                          </div>
                        ) : (
                          <div className="w-24 mx-auto bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#3F6F58] h-1.5 rounded-full"
                              style={{ width: `${ev.progreso_porcentaje || 30}%` }}
                            />
                          </div>
                        )}
                      </td>

                      {/* Botón Acción */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCompletada && (
                            <button
                              onClick={() => handleDescargarPDF(ev)}
                              disabled={descargandoPdfId === ev.id}
                              title="Descargar Informe Oficial en PDF"
                              className="p-1.5 rounded-lg border border-[#DDE7E1] hover:bg-[#EBF4EE] text-[#2F5444] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Download size={13} className={descargandoPdfId === ev.id ? "animate-bounce text-[#3F6F58]" : "text-gray-600"} />
                            </button>
                          )}
                          <button
                            onClick={() => handleReanudarEvaluacion(ev)}
                            className="px-3 py-1.5 rounded-lg bg-[#EBF4EE] hover:bg-[#DDEFE3] text-[#2F5444] font-semibold text-xs transition-colors cursor-pointer"
                          >
                            {isCompletada ? "Ver dictamen" : "Continuar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: Comparador en Paralelo (Side-by-Side Profesional) */}
      {modalComparacionOpen && comparacionData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl border border-[#DDE7E1] w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header del Modal */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#F4F8F5] via-white to-[#F4F8F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EBF4EE] border border-[#CDE1D4] flex items-center justify-center text-[#2F5444] shrink-0">
                  <GitCompare size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#2F5444] text-base">
                      Comparativa en Paralelo de Soluciones FLOSS
                    </h3>
                    <span className="text-[10px] font-bold bg-[#3F6F58]/10 text-[#2F5444] px-2 py-0.5 rounded-full border border-[#CDE1D4]">
                      18 Factores GUIOS
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Evaluación contrastada según la Ecuación 5.3 y Matriz de Decisión Oficial (Tesis Doctoral URJC)
                  </p>
                </div>
              </div>

              {/* Acciones de Cabecera: Exportar y Cerrar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    exportarComparativaExcel(
                      comparacionData?.evaluacion_1 || comparacionData?.evaluacion1 || {},
                      comparacionData?.evaluacion_2 || comparacionData?.evaluacion2 || {},
                      comparacionData?.comparativa_factores || []
                    )
                  }
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F5444] hover:bg-[#254336] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  title="Descargar libro de cálculo en Excel con estilos y cuadrícula"
                >
                  <FileSpreadsheet size={14} />
                  <span>Excel (.xls)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportarComparativaCSV(
                      comparacionData?.evaluacion_1 || comparacionData?.evaluacion1 || {},
                      comparacionData?.evaluacion_2 || comparacionData?.evaluacion2 || {},
                      comparacionData?.comparativa_factores || []
                    )
                  }
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  title="Descargar datos tabulares separados por ;"
                >
                  <Download size={13} />
                  <span>CSV</span>
                </button>

                <button
                  onClick={() => setModalComparacionOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer ml-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Contenido scrolleable del comparador */}
            {(() => {
              const ev1 = comparacionData?.evaluacion_1 || comparacionData?.evaluacion1 || {};
              const ev2 = comparacionData?.evaluacion_2 || comparacionData?.evaluacion2 || {};

              const getRecTipo = (e) => {
                if (!e) return "—";
                if (typeof e.recomendacion === "object" && e.recomendacion?.tipo) return e.recomendacion.tipo;
                if (typeof e.recomendacion === "string") return e.recomendacion;
                if (e.dictamen_oficial) return e.dictamen_oficial;
                return "—";
              };

              const getCriticosCount = (e) => {
                if (e?.resumen_foda?.criticos != null) return e.resumen_foda.criticos;
                if (Array.isArray(e?.resultados_foda)) return e.resultados_foda.filter((f) => f.critico).length;
                return 0;
              };

              const rec1 = getRecTipo(ev1);
              const rec2 = getRecTipo(ev2);
              const viab1 = Number(ev1.indice_viabilidad || 0);
              const viab2 = Number(ev2.indice_viabilidad || 0);
              const crit1 = getCriticosCount(ev1);
              const crit2 = getCriticosCount(ev2);

              const esGanador1 = viab1 > viab2 || (viab1 === viab2 && crit1 < crit2);
              const esGanador2 = viab2 > viab1 || (viab1 === viab2 && crit2 < crit1);

              const getRecBadgeColor = (r) => {
                if (r === "A") return "bg-emerald-600 text-white shadow-emerald-200";
                if (r === "B") return "bg-amber-500 text-white shadow-amber-200";
                if (r === "C") return "bg-rose-600 text-white shadow-rose-200";
                return "bg-gray-400 text-white";
              };

              // Filtrado de factores en la comparativa
              const listaFactoresOriginal = Array.isArray(comparacionData?.comparativa_factores)
                ? comparacionData.comparativa_factores
                : [];

              const factoresFiltrados = listaFactoresOriginal.filter((cf) => {
                // Filtro por texto
                if (busquedaComp.trim()) {
                  const q = busquedaComp.toLowerCase();
                  const matchNom = (cf.nombre_factor || "").toLowerCase().includes(q);
                  const matchDim = (cf.dimension || "").toLowerCase().includes(q);
                  if (!matchNom && !matchDim) return false;
                }

                // Filtro por categoría/tab
                if (filtroComp === "todos") return true;
                if (filtroComp === "diferencias") {
                  const pm1 = cf.eval1?.pm != null ? Number(cf.eval1.pm) : null;
                  const pm2 = cf.eval2?.pm != null ? Number(cf.eval2.pm) : null;
                  const foda1 = cf.eval1?.foda || "";
                  const foda2 = cf.eval2?.foda || "";
                  return pm1 !== pm2 || foda1 !== foda2;
                }
                if (filtroComp === "criticos") {
                  return (
                    cf.eval1?.critico ||
                    cf.eval2?.critico ||
                    cf.eval1?.foda === "debilidad" ||
                    cf.eval1?.foda === "amenaza" ||
                    cf.eval2?.foda === "debilidad" ||
                    cf.eval2?.foda === "amenaza"
                  );
                }
                if (filtroComp === "tecnologica") return (cf.dimension || "").toLowerCase().includes("tecnol");
                if (filtroComp === "organizacional") return (cf.dimension || "").toLowerCase().includes("organiz");
                if (filtroComp === "entorno") return (cf.dimension || "").toLowerCase().includes("entorno");
                return true;
              });

              return (
                <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
                  {/* Tarjetas Superiores Ejecutivas Lado a Lado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tarjeta Opción 1 */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        esGanador1
                          ? "border-[#3F6F58] bg-gradient-to-br from-[#F4F8F5] to-white shadow-md ring-1 ring-[#3F6F58]/20"
                          : "border-gray-200 bg-white shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              OPCIÓN 1 {ev1.id ? `(#${ev1.id})` : ""}
                            </span>
                            {esGanador1 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Award size={11} /> Mayor Viabilidad
                              </span>
                            )}
                          </div>
                          <h4 className="text-xl font-bold text-[#2F5444] mt-0.5">
                            {ev1.nombre_software || "Opción 1"}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {ev1.contexto_uso || "Evaluación institucional"}
                          </p>
                        </div>

                        {/* Badge de Recomendación Oficial */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${getRecBadgeColor(
                              rec1
                            )}`}
                          >
                            {rec1}
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase mt-1">Dictamen</span>
                        </div>
                      </div>

                      {/* Métricas Visuales Opción 1 */}
                      <div className="mt-4 space-y-3">
                        {/* Barra de Viabilidad */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-700">Índice de Viabilidad FLOSS</span>
                            <span className="font-bold text-[#2F5444] text-sm">{viab1}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-[#3F6F58] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(viab1, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Chips de Balance FODA */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev1.resumen_foda?.fortalezas ?? "—"}</span>
                            <span className="text-[9px] text-emerald-600 block">Fortalezas</span>
                          </div>
                          <div className="bg-sky-50 text-sky-800 border border-sky-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev1.resumen_foda?.oportunidades ?? "—"}</span>
                            <span className="text-[9px] text-sky-600 block">Oportunidades</span>
                          </div>
                          <div className="bg-amber-50 text-amber-800 border border-amber-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev1.resumen_foda?.debilidades ?? "—"}</span>
                            <span className="text-[9px] text-amber-600 block">Debilidades</span>
                          </div>
                          <div className="bg-rose-50 text-rose-800 border border-rose-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev1.resumen_foda?.amenazas ?? "—"}</span>
                            <span className="text-[9px] text-rose-600 block">Amenazas</span>
                          </div>
                        </div>

                        {/* Indicadores Adicionales */}
                        <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                          <span>
                            Confianza: <strong className="text-gray-800">{ev1.nivel_confianza || "—"}</strong>
                          </span>
                          <span>
                            {crit1 === 0 ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check size={13} /> 0 Críticos (Sin bloqueo)
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <AlertTriangle size={13} /> {crit1} Crítico(s)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta Opción 2 */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        esGanador2
                          ? "border-[#3F6F58] bg-gradient-to-br from-[#F4F8F5] to-white shadow-md ring-1 ring-[#3F6F58]/20"
                          : "border-gray-200 bg-white shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              OPCIÓN 2 {ev2.id ? `(#${ev2.id})` : ""}
                            </span>
                            {esGanador2 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Award size={11} /> Mayor Viabilidad
                              </span>
                            )}
                          </div>
                          <h4 className="text-xl font-bold text-[#2F5444] mt-0.5">
                            {ev2.nombre_software || "Opción 2"}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {ev2.contexto_uso || "Evaluación institucional"}
                          </p>
                        </div>

                        {/* Badge de Recomendación Oficial */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-sm ${getRecBadgeColor(
                              rec2
                            )}`}
                          >
                            {rec2}
                          </div>
                          <span className="text-[9px] font-bold text-gray-500 uppercase mt-1">Dictamen</span>
                        </div>
                      </div>

                      {/* Métricas Visuales Opción 2 */}
                      <div className="mt-4 space-y-3">
                        {/* Barra de Viabilidad */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-gray-700">Índice de Viabilidad FLOSS</span>
                            <span className="font-bold text-[#2F5444] text-sm">{viab2}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-[#3F6F58] rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(viab2, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Chips de Balance FODA */}
                        <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev2.resumen_foda?.fortalezas ?? "—"}</span>
                            <span className="text-[9px] text-emerald-600 block">Fortalezas</span>
                          </div>
                          <div className="bg-sky-50 text-sky-800 border border-sky-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev2.resumen_foda?.oportunidades ?? "—"}</span>
                            <span className="text-[9px] text-sky-600 block">Oportunidades</span>
                          </div>
                          <div className="bg-amber-50 text-amber-800 border border-amber-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev2.resumen_foda?.debilidades ?? "—"}</span>
                            <span className="text-[9px] text-amber-600 block">Debilidades</span>
                          </div>
                          <div className="bg-rose-50 text-rose-800 border border-rose-200/60 rounded-lg p-1.5">
                            <span className="block text-xs font-bold">{ev2.resumen_foda?.amenazas ?? "—"}</span>
                            <span className="text-[9px] text-rose-600 block">Amenazas</span>
                          </div>
                        </div>

                        {/* Indicadores Adicionales */}
                        <div className="flex items-center justify-between text-xs text-gray-600 pt-1 border-t border-gray-100">
                          <span>
                            Confianza: <strong className="text-gray-800">{ev2.nivel_confianza || "—"}</strong>
                          </span>
                          <span>
                            {crit2 === 0 ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <Check size={13} /> 0 Críticos (Sin bloqueo)
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1">
                                <AlertTriangle size={13} /> {crit2} Crítico(s)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conclusión de Diferencias */}
                  {Array.isArray(comparacionData?.resumen_diferencias) && comparacionData.resumen_diferencias.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#EBF4EE] border border-[#CDE1D4] text-xs">
                      <div className="flex items-center gap-2 mb-1.5">
                        <TrendingUp size={15} className="text-[#2F5444]" />
                        <h5 className="font-bold text-[#2F5444]">Síntesis Comparativa Oficial:</h5>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {comparacionData.resumen_diferencias.map((dif, idx) => (
                          <li key={idx}>{dif}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Barra de Filtros y Búsqueda para la Tabla de Factores */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                          <Scale size={16} className="text-[#3F6F58]" />
                          Comparativa de Factores ({factoresFiltrados.length} de {listaFactoresOriginal.length})
                        </h5>
                        <p className="text-[11px] text-gray-500">
                          Puntuación Media (PM en escala 1-4) y diagnóstico FODA por cada factor metodológico
                        </p>
                      </div>

                      {/* Buscador de Factores */}
                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar factor..."
                          value={busquedaComp}
                          onChange={(e) => setBusquedaComp(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                        />
                      </div>
                    </div>

                    {/* Chips de Filtrado Rápido */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "todos", label: `Todos (${listaFactoresOriginal.length})` },
                        { id: "diferencias", label: "Solo Diferencias" },
                        { id: "criticos", label: "Críticos / Debilidades" },
                        { id: "tecnologica", label: "Dim. Tecnológica" },
                        { id: "organizacional", label: "Dim. Organizacional" },
                        { id: "entorno", label: "Dim. Entorno" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setFiltroComp(tab.id)}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                            filtroComp === tab.id
                              ? "bg-[#3F6F58] text-white shadow-xs"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tabla Detallada Factor por Factor */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-700 font-semibold">
                            <th className="py-2.5 px-3">Factor GUIOS</th>
                            <th className="py-2.5 px-3">Dimensión</th>
                            <th className="py-2.5 px-3 text-center">
                              {ev1.nombre_software || "Opción 1"} (PM / FODA)
                            </th>
                            <th className="py-2.5 px-3 text-center">
                              {ev2.nombre_software || "Opción 2"} (PM / FODA)
                            </th>
                            <th className="py-2.5 px-3 text-center">Ventaja Técnica</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-[11px]">
                          {factoresFiltrados.length > 0 ? (
                            factoresFiltrados.map((cf) => {
                              const pm1 = cf.eval1?.pm != null ? Number(cf.eval1.pm) : null;
                              const pm2 = cf.eval2?.pm != null ? Number(cf.eval2.pm) : null;

                              // Cuadrante FODA helpers
                              const renderFodaBadge = (evalData) => {
                                if (evalData?.pm != null) {
                                  const foda = (evalData.foda || "").toLowerCase();
                                  let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
                                  if (foda.includes("fortaleza")) {
                                    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                  } else if (foda.includes("oportunidad")) {
                                    badgeStyle = "bg-sky-50 text-sky-800 border-sky-200";
                                  } else if (foda.includes("debilidad")) {
                                    badgeStyle = "bg-amber-50 text-amber-800 border-amber-200";
                                  } else if (foda.includes("amenaza")) {
                                    badgeStyle = "bg-rose-50 text-rose-800 border-rose-200";
                                  }

                                  return (
                                    <div className="flex items-center justify-center gap-1.5">
                                      <span className="font-bold text-gray-900 text-xs">{evalData.pm}</span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize ${badgeStyle}`}
                                      >
                                        {evalData.foda}
                                      </span>
                                      {evalData.critico && (
                                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[9px] border border-red-200">
                                          !Crítico
                                        </span>
                                      )}
                                    </div>
                                  );
                                }

                                if (evalData?.importancia_relativa && evalData.importancia_relativa !== "—") {
                                  return (
                                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200 text-[10px] italic">
                                      IR: {evalData.importancia_relativa}
                                    </span>
                                  );
                                }

                                return (
                                  <span className="px-2 py-0.5 rounded bg-gray-50 text-gray-400 border border-dashed border-gray-200 text-[10px] italic">
                                    No evaluado
                                  </span>
                                );
                              };

                              // Ventaja técnica comparada
                              let ventajaLabel = <span className="text-gray-400">—</span>;
                              if (pm1 != null && pm2 != null) {
                                if (pm1 > pm2) {
                                  ventajaLabel = (
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                                      +{(pm1 - pm2).toFixed(2)} {ev1.nombre_software}
                                    </span>
                                  );
                                } else if (pm2 > pm1) {
                                  ventajaLabel = (
                                    <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 inline-block">
                                      +{(pm2 - pm1).toFixed(2)} {ev2.nombre_software}
                                    </span>
                                  );
                                } else {
                                  ventajaLabel = (
                                    <span className="text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md inline-block">
                                      = Empate
                                    </span>
                                  );
                                }
                              } else if (pm1 != null && pm2 == null) {
                                ventajaLabel = (
                                  <span className="text-gray-500 text-[10px] italic">Solo {ev1.nombre_software}</span>
                                );
                              } else if (pm2 != null && pm1 == null) {
                                ventajaLabel = (
                                  <span className="text-gray-500 text-[10px] italic">Solo {ev2.nombre_software}</span>
                                );
                              }

                              return (
                                <tr key={cf.id_factor} className="hover:bg-gray-50/80 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                                    {cf.nombre_factor}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-500">
                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px]">
                                      {cf.dimension}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center">{renderFodaBadge(cf.eval1)}</td>
                                  <td className="py-2.5 px-3 text-center">{renderFodaBadge(cf.eval2)}</td>
                                  <td className="py-2.5 px-3 text-center">{ventajaLabel}</td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                                No se encontraron factores coincidentes con los filtros aplicados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Footer Modal con Acciones */}
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F8FAF9]">
              <div className="text-xs text-gray-500 flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#3F6F58]" />
                <span>Análisis comparativo multicriterio generado conforme a la metodología oficial GUIOS.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() =>
                    exportarComparativaExcel(
                      comparacionData?.evaluacion_1 || comparacionData?.evaluacion1 || {},
                      comparacionData?.evaluacion_2 || comparacionData?.evaluacion2 || {},
                      comparacionData?.comparativa_factores || []
                    )
                  }
                  className="sm:hidden px-3 py-2 rounded-lg bg-[#2F5444] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet size={14} />
                  <span>Excel</span>
                </button>

                <button
                  onClick={() => setModalComparacionOpen(false)}
                  className="px-5 py-2 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  Cerrar comparativa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Nueva Evaluación (Compartido) */}
      <ModalNuevaEvaluacion
        isOpen={modalNuevaOpen}
        onClose={() => setModalNuevaOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
