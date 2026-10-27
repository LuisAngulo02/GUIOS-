import React from "react";

/**
 * Botonera de Escala 1 a 4 según GUIOS+
 * 1 = No cumple · 2 = Desconozco · 3 = Cumple parcialmente · 4 = Cumple
 * El botón seleccionado se rellena del verde principal (#3F6F58).
 */
export const ScaleButtons = ({ value, onChange, disabled = false }) => {
  const options = [
    { num: 1, label: "1 · No cumple", short: "1" },
    { num: 2, label: "2 · Desconozco", short: "2" },
    { num: 3, label: "3 · Cumple parcialmente", short: "3" },
    { num: 4, label: "4 · Cumple", short: "4" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-[#DDE7E1] bg-white p-0.5 shadow-sm">
      {options.map((opt) => {
        const isSelected = Number(value) === opt.num;
        return (
          <button
            key={opt.num}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.num)}
            title={opt.label}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-all ${
              isSelected
                ? "bg-[#3F6F58] text-white shadow"
                : "text-gray-700 hover:bg-[#F3F7F4] hover:text-[#2F5444]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt.short}
          </button>
        );
      })}
    </div>
  );
};

export default ScaleButtons;
