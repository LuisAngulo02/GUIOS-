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
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";
import KpiCard from "../components/KpiCard";
import Badge from "../components/Badge";

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
    totalFactores,
    totalRelevantes,
  } = useEvaluation();

  const navigate = useNavigate();

  // Estados de filtros para el Historial
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Estado para la selección de evaluaciones a comparar (máximo 2)
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [comparacionData, setComparacionData] = useState(null);
  const [loadingComparacion, setLoadingComparacion] = useState(false);
  const [modalComparacionOpen, setModalComparacionOpen] = useState(false);

  // Estado para el modal de Nueva Evaluación
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);
  const [nuevoSoftware, setNuevoSoftware] = useState("");
  const [nuevoContexto, setNuevoContexto] = useState("");
  const [nuevoObjetivo, setNuevoObjetivo] = useState("");
  const [creandoNueva, setCreandoNueva] = useState(false);

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
      alert("No se pudo cargar la comparación: " + (err.message || "Error del servidor"));
    } finally {
      setLoadingComparacion(false);
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
      alert("Error al cargar la evaluación: " + err.message);
    }
  };

  // Crear nueva evaluación
  const handleCrearNueva = async (e) => {
    e.preventDefault();
    if (!nuevoSoftware.trim()) {
      alert("Ingrese el nombre de la solución de software FLOSS");
      return;
    }
    setCreandoNueva(true);
    try {
      await crearNuevaEvaluacion({
        nombre_software: nuevoSoftware.trim(),
        contexto_uso: nuevoContexto.trim() || "Evaluación institucional",
        objetivo: nuevoObjetivo.trim() || "Evaluación de viabilidad y madurez",
      });
      setModalNuevaOpen(false);
      setNuevoSoftware("");
      setNuevoContexto("");
      setNuevoObjetivo("");
      navigate("/configuracion");
    } catch (err) {
      alert("Error al crear la evaluación: " + err.message);
    } finally {
      setCreandoNueva(false);
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

        <button
          onClick={() => setModalNuevaOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>+ Nueva evaluación</span>
        </button>
      </div>

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
          subtitle={`${evaluacionesList.filter((e) => e.estado === "completada").length} completadas`}
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
              <Badge variant="green" size="md">
                En sesión
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
                    <span className="text-gray-400 block text-[11px]">Fuentes bibliográficas</span>
                    <span className="font-semibold text-gray-700">Scopus, OpenAlex, Semantic</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Persistencia</span>
                    <span className="font-semibold text-gray-700">PostgreSQL (Relacional)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Navegación Rápida */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
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
                  const isActiva = Number(evaluacionId) === ev.id;
                  const isCompletada = ev.estado === "completada";

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
                        <button
                          onClick={() => handleReanudarEvaluacion(ev)}
                          className="px-3 py-1.5 rounded-lg bg-[#EBF4EE] hover:bg-[#DDEFE3] text-[#2F5444] font-semibold text-xs transition-colors cursor-pointer"
                        >
                          {isCompletada ? "Ver dictamen" : "Continuar"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL: Comparador en Paralelo (Side-by-Side) */}
      {modalComparacionOpen && comparacionData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DDE7E1] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in">
            {/* Header del Modal */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAF9]">
              <div>
                <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <GitCompare size={18} className="text-[#3F6F58]" />
                  Comparativa en Paralelo de Soluciones FLOSS
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Análisis contrastado según los 18 factores y la Ecuación 5.3 de la guía GUIOS
                </p>
              </div>
              <button
                onClick={() => setModalComparacionOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido scrolleable del comparador */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Tarjetas Superiores Lado a Lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evaluación 1 */}
                <div className="p-5 rounded-xl border border-[#CDE1D4] bg-[#F9FCFA]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    OPCIÓN 1
                  </span>
                  <h4 className="text-lg font-bold text-[#2F5444]">
                    {comparacionData.evaluacion_1?.nombre_software}
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <p>
                      <b>Dictamen Oficial:</b>{" "}
                      <span className="font-bold text-[#25633C]">
                        Recomendación {comparacionData.evaluacion_1?.recomendacion?.tipo || "—"}
                      </span>
                    </p>
                    <p>
                      <b>Índice de Viabilidad:</b> {comparacionData.evaluacion_1?.indice_viabilidad || 0}%
                    </p>
                    <p>
                      <b>Nivel de Confianza:</b> {comparacionData.evaluacion_1?.nivel_confianza || "—"}
                    </p>
                    <p>
                      <b>Factores Críticos:</b> {comparacionData.evaluacion_1?.resumen_foda?.criticos || 0}
                    </p>
                  </div>
                </div>

                {/* Evaluación 2 */}
                <div className="p-5 rounded-xl border border-[#CDE1D4] bg-[#F9FCFA]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    OPCIÓN 2
                  </span>
                  <h4 className="text-lg font-bold text-[#2F5444]">
                    {comparacionData.evaluacion_2?.nombre_software}
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <p>
                      <b>Dictamen Oficial:</b>{" "}
                      <span className="font-bold text-[#25633C]">
                        Recomendación {comparacionData.evaluacion_2?.recomendacion?.tipo || "—"}
                      </span>
                    </p>
                    <p>
                      <b>Índice de Viabilidad:</b> {comparacionData.evaluacion_2?.indice_viabilidad || 0}%
                    </p>
                    <p>
                      <b>Nivel de Confianza:</b> {comparacionData.evaluacion_2?.nivel_confianza || "—"}
                    </p>
                    <p>
                      <b>Factores Críticos:</b> {comparacionData.evaluacion_2?.resumen_foda?.criticos || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Conclusión de Diferencias */}
              {comparacionData.resumen_diferencias?.length > 0 && (
                <div className="p-4 rounded-xl bg-[#EBF4EE] border border-[#CDE1D4] text-xs">
                  <h5 className="font-bold text-[#2F5444] mb-1.5">Síntesis Comparativa:</h5>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {comparacionData.resumen_diferencias.map((dif, idx) => (
                      <li key={idx}>{dif}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tabla Detallada Factor por Factor */}
              <div>
                <h5 className="font-bold text-gray-800 text-xs mb-3">
                  Comparativa de Factores (18 Factores GUIOS):
                </h5>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold">
                        <th className="py-2.5 px-3">Factor</th>
                        <th className="py-2.5 px-3">Dimensión</th>
                        <th className="py-2.5 px-3 text-center">
                          {comparacionData.evaluacion_1?.nombre_software} (PM / FODA)
                        </th>
                        <th className="py-2.5 px-3 text-center">
                          {comparacionData.evaluacion_2?.nombre_software} (PM / FODA)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[11px]">
                      {comparacionData.comparativa_factores?.map((cf) => (
                        <tr key={cf.id_factor} className="hover:bg-gray-50/50">
                          <td className="py-2 px-3 font-semibold text-gray-800">
                            {cf.nombre_factor}
                          </td>
                          <td className="py-2 px-3 text-gray-500">
                            {cf.dimension}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {cf.eval1.pm ? `${cf.eval1.pm} · ${cf.eval1.foda}` : "—"}
                            {cf.eval1.critico && (
                              <span className="text-red-600 font-bold ml-1">(!Crítico)</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {cf.eval2.pm ? `${cf.eval2.pm} · ${cf.eval2.foda}` : "—"}
                            {cf.eval2.critico && (
                              <span className="text-red-600 font-bold ml-1">(!Crítico)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setModalComparacionOpen(false)}
                className="px-5 py-2 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
              >
                Cerrar comparativa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Nueva Evaluación */}
      {modalNuevaOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DDE7E1] w-full max-w-md p-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                <PlusCircle size={18} className="text-[#3F6F58]" />
                Nueva Evaluación FLOSS
              </h3>
              <button
                onClick={() => setModalNuevaOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCrearNueva} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Nombre de la Solución FLOSS *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoSoftware}
                  onChange={(e) => setNuevoSoftware(e.target.value)}
                  placeholder="Ej. GitLab CE, Nextcloud, PostgreSQL 16..."
                  className="w-full px-3 py-2 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Área o Contexto Institucional
                </label>
                <input
                  type="text"
                  value={nuevoContexto}
                  onChange={(e) => setNuevoContexto(e.target.value)}
                  placeholder="Ej. Educación virtual, Gestión de TI, Base de datos..."
                  className="w-full px-3 py-2 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Objetivo de la Evaluación
                </label>
                <textarea
                  rows={2}
                  value={nuevoObjetivo}
                  onChange={(e) => setNuevoObjetivo(e.target.value)}
                  placeholder="Describa brevemente la necesidad u objetivo de adopción..."
                  className="w-full px-3 py-2 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoNueva}
                  className="px-5 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold cursor-pointer shadow-sm"
                >
                  {creandoNueva ? "Creando..." : "Crear y comenzar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
