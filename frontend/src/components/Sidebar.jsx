import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Sliders,
  Layers,
  CheckSquare,
  Award,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  PlusCircle,
  X,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import ModalNuevaEvaluacion from "./ModalNuevaEvaluacion";

/**
 * Layout común: Menú lateral responsivo (sidebar de escritorio y drawer móvil deslizante)
 */
export const Sidebar = ({ isOpenMobile, onCloseMobile }) => {
  const { currentUser } = useEvaluation();
  const esAdmin = currentUser?.rol?.toLowerCase() === "administrador";
  const [modalNuevaOpen, setModalNuevaOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/configuracion", label: "0. Configuración", icon: Sliders },
    { to: "/factores", label: "1. Factores", icon: Layers },
    { to: "/subfactores", label: "2. Subfactores", icon: CheckSquare },
    { to: "/resultado", label: "3. Resultado", icon: Award },
    { to: "/evidencia", label: "Evidencia", icon: BookOpen },
    ...(esAdmin
      ? [{ to: "/administracion", label: "Administración", icon: ShieldCheck }]
      : []),
  ];

  return (
    <>
      {/* Fondo oscuro para móvil */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Contenedor del Sidebar (Drawer en móvil, barra lateral fija en escritorio) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#DDE7E1] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:w-60 md:min-h-[calc(100vh-64px)] md:shadow-sm md:z-auto
          ${isOpenMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Navegación Principal */}
        <div className="py-6 overflow-y-auto">
          <div className="px-5 mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              FLUJO DE EVALUACIÓN
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setModalNuevaOpen(true);
                  if (onCloseMobile) onCloseMobile();
                }}
                title="Iniciar nueva evaluación"
                className="w-6 h-6 rounded hover:bg-emerald-50 text-[#3F6F58] flex items-center justify-center transition-colors cursor-pointer"
              >
                <PlusCircle size={16} />
              </button>
              <button
                onClick={onCloseMobile}
                className="md:hidden text-gray-400 hover:text-gray-600 p-1 rounded-md"
                title="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-5 py-3 text-xs font-semibold transition-all border-l-4 ${
                      isActive
                        ? "bg-[#EBF4EE] text-[#2F5444] border-[#3F6F58]"
                        : "text-gray-600 hover:bg-[#F8FAF9] hover:text-[#2F5444] border-transparent"
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Tarjeta inferior de Ayuda Metodológica */}
        <div className="p-4 m-3 rounded-card bg-[#F3F7F4] border border-[#DDE7E1]">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-full bg-[#DDEFE3] text-[#25633C] shrink-0 mt-0.5">
              <HelpCircle size={15} />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#2F5444] mb-1">
                ¿Necesitas ayuda?
              </h5>
              <p className="text-[11px] text-gray-500 leading-snug">
                Consulta la guía metodológica de GUIOSPRO para conocer los fundamentos de decisión.
              </p>
            </div>
          </div>
        </div>

        <ModalNuevaEvaluacion
          isOpen={modalNuevaOpen}
          onClose={() => setModalNuevaOpen(false)}
        />
      </aside>
    </>
  );
};

export default Sidebar;
