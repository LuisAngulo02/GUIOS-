import React from "react";
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
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";

/**
 * Layout común: Menú lateral izquierdo (~240px, blanco)
 */
export const Sidebar = () => {
  const { currentUser } = useEvaluation();
  const esAdmin = currentUser?.rol?.toLowerCase() === "administrador";

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
    <aside className="w-60 bg-white border-r border-[#DDE7E1] flex flex-col justify-between shrink-0 min-h-[calc(100vh-64px)] shadow-sm">
      {/* Navegación Principal */}
      <div className="py-6">
        <div className="px-5 mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            FLUJO DE EVALUACIÓN
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
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
    </aside>
  );
};

export default Sidebar;
