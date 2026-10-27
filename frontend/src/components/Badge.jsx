import React from "react";

/**
 * Insignias tipo Pill según el Sistema de Diseño GUIOS+
 * Armonizadas con la paleta verde institucional (#3F6F58, #2F5444).
 *
 * Colores por Importancia:
 * - 4 · Fundamental: Verde esmeralda intenso (#DCFCE7 / #14532D)
 * - 3 · Importante: Verde institucional clásico (#DDEFE3 / #25633C)
 * - 2 · Opcional: Ámbar cálido armónico (#FEF3C7 / #854D0E)
 * - 1 · Irrelevante: Gris neutro pizarra (#F1F5F3 / #64748B)
 *
 * Colores por Estado:
 * - Relevante: Verde institucional (#DDEFE3 / #25633C)
 * - Irrelevante: Gris neutro (#F1F5F3 / #64748B)
 *
 * Colores por FODA:
 * - Fortaleza: Verde claro (#DDEFE3 / #25633C)
 * - Oportunidad: Menta jade suave (#CCFBF1 / #115E59)
 * - Debilidad: Rosa suave (#FEE2E2 / #991B1B)
 * - Amenaza: Rosa claro (#FBE0E0 / #B33A3A)
 * - Crítico: Rojo alerta suave (#FEE2E2 / #991B1B)
 */
export const Badge = ({
  children,
  variant = "auto",
  className = "",
  size = "md",
  withDot = false,
}) => {
  const sizeClasses = {
    xs: "px-2 py-0.5 text-[10px]",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  const dotColors = {
    fundamental: "bg-[#16A34A]",
    importante: "bg-[#3F6F58]",
    opcional: "bg-[#D97706]",
    irrelevante: "bg-[#94A3B8]",
    relevante: "bg-[#25633C]",
    fortaleza: "bg-[#25633C]",
    oportunidad: "bg-[#0D9488]",
    debilidad: "bg-[#DC2626]",
    amenaza: "bg-[#B33A3A]",
    critico: "bg-[#DC2626]",
    green: "bg-[#25633C]",
    red: "bg-[#DC2626]",
    amber: "bg-[#D97706]",
    neutral: "bg-[#94A3B8]",
    blue: "bg-[#0284C7]",
  };

  const variantMap = {
    // 1. IMPORTANCIAS
    fundamental: "bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC]",
    importante: "bg-[#DDEFE3] text-[#25633C] border border-[#C6E6D1]",
    opcional: "bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A]",
    irrelevante: "bg-[#F1F5F3] text-[#64748B] border border-[#CBD5E1]",

    // 2. ESTADOS
    relevante: "bg-[#DDEFE3] text-[#25633C] border border-[#C6E6D1]",

    // 3. MATRIZ FODA
    fortaleza: "bg-[#DDEFE3] text-[#25633C] border border-[#C6E6D1]",
    oportunidad: "bg-[#CCFBF1] text-[#115E59] border border-[#99F6E4]",
    debilidad: "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]",
    amenaza: "bg-[#FBE0E0] text-[#B33A3A] border border-[#F5C2C2]",
    critico: "bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] font-bold uppercase tracking-wider",

    // Genéricos
    green: "bg-[#DDEFE3] text-[#25633C] border border-[#C6E6D1]",
    success: "bg-[#DCFCE7] text-[#14532D] border border-[#86EFAC]",
    red: "bg-[#FBE0E0] text-[#B33A3A] border border-[#F5C2C2]",
    danger: "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]",
    amber: "bg-[#FEF3C7] text-[#854D0E] border border-[#FDE68A]",
    neutral: "bg-[#F1F5F3] text-[#64748B] border border-[#CBD5E1]",
    blue: "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]",
    default: "bg-[#DDEFE3] text-[#25633C] border border-[#C6E6D1]",
  };

  let chosenKey = variant;

  if (variant === "auto") {
    const textStr = String(children || "").toLowerCase().trim();
    if (textStr.includes("fundamental") || textStr.startsWith("4")) {
      chosenKey = "fundamental";
    } else if (textStr.includes("importante") || textStr.startsWith("3")) {
      chosenKey = "importante";
    } else if (textStr.includes("opcional") || textStr.startsWith("2")) {
      chosenKey = "opcional";
    } else if (textStr.includes("irrelevante") || textStr.startsWith("1")) {
      chosenKey = "irrelevante";
    } else if (textStr.includes("relevante")) {
      chosenKey = "relevante";
    } else if (textStr.includes("crítico") || textStr.includes("critico")) {
      chosenKey = "critico";
    } else if (textStr.includes("debilidad")) {
      chosenKey = "debilidad";
    } else if (textStr.includes("amenaza")) {
      chosenKey = "amenaza";
    } else if (textStr.includes("fortaleza")) {
      chosenKey = "fortaleza";
    } else if (textStr.includes("oportunidad")) {
      chosenKey = "oportunidad";
    } else if (textStr.includes("externo") || textStr.includes("interno")) {
      chosenKey = "neutral";
    } else {
      chosenKey = "default";
    }
  }

  const chosenClass = variantMap[chosenKey] || variantMap.default;
  const dotColor = dotColors[chosenKey] || "bg-[#3F6F58]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size] || sizeClasses.md} ${chosenClass} ${className}`}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
