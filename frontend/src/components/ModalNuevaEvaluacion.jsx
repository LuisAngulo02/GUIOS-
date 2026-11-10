import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, X, Sparkles, Layers } from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";

export const ModalNuevaEvaluacion = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { crearNuevaEvaluacion } = useEvaluation();

  const [nuevoSoftware, setNuevoSoftware] = useState("");
  const [nuevoContexto, setNuevoContexto] = useState("");
  const [nuevoObjetivo, setNuevoObjetivo] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const soft = nuevoSoftware.trim();
    if (!soft) {
      setError("Por favor ingrese el nombre del software o solución FLOSS a evaluar.");
      return;
    }

    setCreando(true);
    try {
      await crearNuevaEvaluacion({
        nombre_software: soft,
        contexto_uso: nuevoContexto.trim() || "Evaluación institucional",
        objetivo: nuevoObjetivo.trim() || "Evaluación de viabilidad y madurez tecnológica",
      });

      setNuevoSoftware("");
      setNuevoContexto("");
      setNuevoObjetivo("");
      onClose();
      navigate("/factores");
    } catch (err) {
      setError(err.message || "Error al registrar la nueva evaluación en PostgreSQL.");
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#DDE7E1] w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#3F6F58] flex items-center justify-center font-bold text-xs border border-emerald-200">
              <PlusCircle size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                Nueva Evaluación FLOSS
              </h3>
              <p className="text-[11px] text-gray-400">
                Iniciar evaluación en blanco con el catálogo GUIOS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs border border-red-200">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Nombre de la Solución FLOSS *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={nuevoSoftware}
              onChange={(e) => setNuevoSoftware(e.target.value)}
              placeholder="Ej. GitLab CE, Nextcloud, PostgreSQL 16..."
              className="w-full px-3 py-2 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Se creará un nuevo registro limpio en la base de datos PostgreSQL.
            </span>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Área o Contexto Institucional
            </label>
            <input
              type="text"
              value={nuevoContexto}
              onChange={(e) => setNuevoContexto(e.target.value)}
              placeholder="Ej. Infraestructura TI, Educación Virtual, Gestión Documental..."
              className="w-full px-3 py-2 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-1">
              Objetivo de la Evaluación
            </label>
            <textarea
              rows={2}
              value={nuevoObjetivo}
              onChange={(e) => setNuevoObjetivo(e.target.value)}
              placeholder="Describa brevemente la necesidad u objetivo de adopción..."
              className="w-full px-3 py-2 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
            />
          </div>

          {/* Información metodológica */}
          <div className="p-3 rounded-lg bg-[#F8FAF9] border border-[#E3ECE6] text-[11px] text-gray-600 flex items-start gap-2">
            <Layers size={15} className="text-[#3F6F58] shrink-0 mt-0.5" />
            <span>
              La evaluación se inicializará con los <strong>18 factores</strong> y <strong>61 subfactores</strong> del catálogo en blanco listos para ser calificados en el Paso 1.
            </span>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creando}
              className="px-4 py-1.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold cursor-pointer shadow-sm disabled:opacity-50"
            >
              {creando ? "Creando en PostgreSQL..." : "Crear y comenzar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevaEvaluacion;

