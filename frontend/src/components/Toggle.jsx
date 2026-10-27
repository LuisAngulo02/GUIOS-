import React from "react";

/**
 * Toggle / Switch estilizado en el verde de GUIOS+
 */
export const Toggle = ({ enabled, onChange, label, disabled = false }) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={enabled}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`block w-11 h-6 rounded-full transition-colors ${
            enabled ? "bg-[#3F6F58]" : "bg-gray-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        <div
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            enabled ? "transform translate-x-5" : ""
          }`}
        />
      </div>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </label>
  );
};

export default Toggle;
