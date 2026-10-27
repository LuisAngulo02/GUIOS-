import React from "react";

/**
 * Tarjeta KPI con indicador numérico y barra de progreso inferior
 */
export const KpiCard = ({ title, value, percentage, total, subtitle, color = "green" }) => {
  return (
    <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-3xl font-light text-[#2F5444] tracking-tight">
          {value}
        </h3>
        {percentage !== undefined && (
          <span className="text-xs font-semibold text-gray-500">
            {percentage}%
          </span>
        )}
      </div>
      {percentage !== undefined && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#3F6F58] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
};

export default KpiCard;
