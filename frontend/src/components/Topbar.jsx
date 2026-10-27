import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, LogOut } from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";

/**
 * Layout común: Barra superior verde (#3F6F58)
 */
export const Topbar = () => {
  const { currentUser, saveStatus, softwareActivo, contextoActivo, logout } = useEvaluation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-[#3F6F58] text-white px-4 sm:px-6 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Lado izquierdo: Marca GUIOS+ */}
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg bg-[#53876D] flex items-center justify-center font-bold text-white text-base shadow-inner">
          G+
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-wide text-white">
            GUIOS+
          </span>
          <span className="text-[11px] text-green-100 font-light tracking-normal leading-none opacity-90 hidden sm:block">
            Evaluación inteligente para adopción FLOSS
          </span>
        </div>
      </Link>

      {/* Lado derecho: Software activo, Estado de guardado y Perfil */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Pill Software Activo */}
        <div className="hidden md:flex items-center bg-[#4F8169] text-white px-3.5 py-1 rounded-full text-xs font-medium border border-[#62977D]">
          <span className="font-semibold">{softwareActivo}</span>
          <span className="mx-1.5 opacity-60">·</span>
          <span className="opacity-90">{contextoActivo.split("·")[0].trim()}</span>
        </div>

        {/* Indicador de Guardado */}
        <div className="flex items-center gap-1.5 text-xs text-green-100 bg-[#355E4A] px-2.5 py-1 rounded-full">
          <Check size={14} className="text-green-300 stroke-[2.5]" />
          <span>{saveStatus}</span>
        </div>

        {/* Separador vertical */}
        <div className="h-6 w-px bg-[#53876D] hidden sm:block" />

        {/* Usuario logueado */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#2F5444] border border-[#5E947A] flex items-center justify-center font-semibold text-xs text-white shadow-sm">
            {currentUser?.avatar || "AU"}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-white">
              {currentUser?.nombre || "Admin Usuario"}
            </span>
            <span className="text-[10px] text-green-200 uppercase tracking-wider font-light">
              {currentUser?.rol || "Administrador"}
            </span>
          </div>

          {/* Botón Logout */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 text-green-200 hover:text-white hover:bg-[#4F8169] rounded-lg transition-colors ml-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
