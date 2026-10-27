import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, BookOpen, PlusCircle } from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import KpiCard from "../components/KpiCard";
import Badge from "../components/Badge";

/**
 * Pantalla 2: Dashboard (/dashboard)
 */
export const Dashboard = () => {
  const { currentUser, softwareActivo, contextoActivo } = useEvaluation();
  const navigate = useNavigate();

  // Saludo según la hora local
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const nombreUsuario = currentUser?.nombre || "Admin Usuario";

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
          {getSaludo()}, {nombreUsuario}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Supervisa el avance de tus evaluaciones FLOSS y continúa el flujo de decisión.
        </p>
      </div>

      {/* 4 KPIs con barra de progreso */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Factores totales"
          value="18"
          percentage={100}
          subtitle="Catálogo completo oficial"
        />
        <KpiCard
          title="Factores relevantes"
          value="9"
          percentage={50}
          subtitle="9 de 18 con IR > 1"
        />
        <KpiCard
          title="Subfactores"
          value="61"
          percentage={100}
          subtitle="Reactivos SF-01 a SF-61"
        />
        <KpiCard
          title="Factores pendientes"
          value="2"
          percentage={11}
          subtitle="Pendientes de revisión final"
        />
      </div>

      {/* Grid Central: Evaluación Activa y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta Evaluación Activa (2 columnas) */}
        <div className="lg:col-span-2 bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                EVALUACIÓN ACTIVA
              </span>
              <Badge variant="green" size="md">
                En progreso
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
                    <span className="text-gray-400 block text-[11px]">Fase actual</span>
                    <span className="font-semibold text-[#2F5444]">Paso 2 · Subfactores</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Fuentes</span>
                    <span className="font-semibold text-gray-700">Scopus, OpenAlex, Semantic</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[11px]">Última consulta</span>
                    <span className="font-semibold text-gray-700">Hoy, 22:30</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de progreso general 78% */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-gray-600">Progreso general</span>
                <span className="font-bold text-[#2F5444]">78%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#3F6F58] h-2 rounded-full transition-all duration-700"
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>

          {/* Botones Continuar evaluación y Ver evidencia */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate("/factores")}
              className="px-5 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Continuar evaluación</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate("/evidencia")}
              className="px-5 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BookOpen size={14} />
              <span>Ver evidencia</span>
            </button>
          </div>
        </div>

        {/* Tarjeta Actividad Reciente (1 columna) */}
        <div className="bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                ACTIVIDAD RECIENTE
              </span>
              <span className="text-[11px] text-gray-400 font-medium">Últimos 7 días</span>
            </div>

            {/* 4 ítems con check */}
            <div className="space-y-3.5">
              {[
                {
                  titulo: "Factores relevantes calculados",
                  sub: "9 factores confirmados con IR > 1",
                  tiempo: "Hace 2 horas",
                },
                {
                  titulo: "Subfactores de Compatibilidad calificados",
                  sub: "8 de 8 completados (PM = 3,6)",
                  tiempo: "Ayer",
                },
                {
                  titulo: "Actualización de evidencia Scopus",
                  sub: "126 documentos y 976 citas procesadas",
                  tiempo: "Hace 3 días",
                },
                {
                  titulo: "Nueva evaluación iniciada",
                  sub: "Software Moodle registrado",
                  tiempo: "Hace 5 días",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-[#DDEFE3] text-[#25633C] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 leading-tight">
                      {item.titulo}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {item.sub}
                    </p>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {item.tiempo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <Link
              to="/subfactores"
              className="text-xs font-semibold text-[#3F6F58] hover:underline flex items-center gap-1"
            >
              <span>Ver todas las actividades</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Banda verde inferior: ¿Quieres evaluar otro software FLOSS? */}
      <div className="rounded-card bg-[#3F6F58] text-white p-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="font-semibold text-base">
            ¿Quieres evaluar otro software FLOSS?
          </h4>
          <p className="text-xs text-green-100 opacity-90 mt-0.5">
            Puedes configurar una nueva instancia de evaluación sin perder el avance de la actual.
          </p>
        </div>
        <button
          onClick={() => {
            alert("Iniciando formulario de nueva evaluación...");
            navigate("/configuracion");
          }}
          className="px-5 py-2.5 rounded-lg bg-white text-[#2F5444] hover:bg-gray-100 font-semibold text-xs transition-colors flex items-center gap-2 shrink-0 shadow cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>+ Nueva evaluación</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
