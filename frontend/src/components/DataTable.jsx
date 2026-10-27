import React from "react";

/**
 * Tabla genérica reutilizable con scroll horizontal y estilo GUIOS+
 */
export const DataTable = ({ columns, data, keyField = "id", emptyMessage = "No hay registros disponibles." }) => {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-[#DDE7E1] bg-white shadow-sm">
      <table className="w-full text-left text-xs sm:text-sm border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-[#DDE7E1] bg-[#F8FAF9] text-gray-500 font-semibold text-xs tracking-wider uppercase">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3.5 px-4 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.headerClassName || ""}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EBF1ED]">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-400 italic text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row[keyField] || rIdx}
                className="hover:bg-[#F6FAF7] transition-colors"
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className={`py-3.5 px-4 text-gray-700 ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"} ${col.className || ""}`}
                  >
                    {col.render ? col.render(row, rIdx) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
