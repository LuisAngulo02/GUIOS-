import React from "react";
import Badge from "./Badge";

/**
 * Cuadrante individual de la Matriz FODA 2x2
 * Reproduce exactamente el diseño de la captura:
 * - Card blanca con borde fino #DDE7E1, radio 12px
 * - Título verde oscuro grande (Fortalezas, Oportunidades, Debilidades, Amenazas)
 * - Subtítulo descriptivo en gris claro ("Factores internos positivos", etc.)
 * - Círculo con el contador en verde tenue en la esquina superior derecha
 * - Factores con check gris discreto "✓ Nombre"
 * - Badge "Crítico" rosa/rojo suave si corresponde
 */
export const FodaQuadrant = ({
  tipo, // "Fortalezas", "Oportunidades", "Debilidades", "Amenazas"
  subtitulo, // "Factores internos positivos", etc.
  count,
  factores = [],
}) => {
  return (
    <div className="rounded-card border border-[#DDE7E1] p-6 bg-white shadow-sm flex flex-col justify-between min-h-[190px]">
      <div>
        {/* Cabecera del Cuadrante */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-[#2F5444] text-base tracking-tight">
              {tipo}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {subtitulo}
            </p>
          </div>

          {/* Círculo indicador del conteo en la esquina superior derecha */}
          <span className="w-7 h-7 rounded-full bg-[#EBF4EE] text-[#2F5444] font-bold text-xs flex items-center justify-center shrink-0">
            {count}
          </span>
        </div>

        {/* Lista de Factores */}
        <div className="space-y-2.5 pt-1">
          {factores.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              Sin factores en esta categoría
            </p>
          ) : (
            factores.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-xs text-gray-700">
                <span className="text-gray-400 font-bold text-[13px] select-none">✓</span>
                <span className="font-normal text-gray-800">{f.nombre}</span>
                {f.isCritical && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FBE0E0] text-[#B33A3A] border border-[#F5C2C2]">
                    Crítico
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FodaQuadrant;
