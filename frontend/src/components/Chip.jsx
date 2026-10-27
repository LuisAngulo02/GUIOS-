import React from "react";
import { X } from "lucide-react";

/**
 * Chip para palabras clave, filtros y etiquetas
 */
export const Chip = ({ label, onRemove, color = "green" }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EBF4EE] text-[#2F5444] border border-[#D5E6DB]">
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-red-600 focus:outline-none p-0.5 rounded-full hover:bg-[#D5E6DB]"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};

export default Chip;
