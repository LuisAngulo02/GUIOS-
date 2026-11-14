import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from "lucide-react";
import { apiService } from "../services/apiService";

/**
 * Pantalla: Restablecer Contraseña (/reset-password)
 * Permite al usuario definir una nueva contraseña mediante el enlace seguro con UID y Token criptográfico.
 */
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tokenInvalido = !uid || !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setLoading(true);
    try {
      await apiService.confirmarRecuperacionPassword({
        uid,
        token,
        new_password: newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err.message ||
          "El enlace de restablecimiento es inválido o ha expirado. Por favor solicita uno nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#3F6F58] flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans">
      {/* Círculos decorativos tenues en el fondo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

      {/* Arriba: Logo G+ con GUIOS+ y Lema */}
      <div className="flex flex-col items-center mt-6 z-10 text-center">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-11 h-11 rounded-xl bg-[#52876D] flex items-center justify-center font-bold text-white text-lg shadow-inner">
            G+
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">
            GUIOS+
          </span>
        </div>
        <p className="text-xs text-green-100 tracking-wide font-light opacity-90">
          Evaluación inteligente para adopción FLOSS
        </p>
      </div>

      {/* Tarjeta blanca centrada */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 pt-10 relative z-10 my-8 border border-[#DDE7E1]">
        {/* Círculo verde con icono sobresaliendo */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-[#3F6F58] border-4 border-white flex items-center justify-center text-white shadow-md">
          <KeyRound size={22} />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Restablecer contraseña
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ingresa tu nueva clave de acceso institucional para actualizar tu cuenta.
          </p>
        </div>

        {/* Alerta de enlace inválido */}
        {tokenInvalido ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Enlace incompleto o inválido</p>
                <p className="text-[11px] text-amber-700">
                  Este enlace de recuperación no contiene los parámetros de seguridad requeridos o ya expiró.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Volver al inicio de sesión</span>
            </Link>
          </div>
        ) : success ? (
          /* Estado de éxito */
          <div className="space-y-5 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#3F6F58] border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                ¡Contraseña actualizada con éxito!
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Tu clave de acceso ha sido restablecida de forma segura en PostgreSQL. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              Iniciar sesión ahora
            </button>
          </div>
        ) : (
          /* Formulario de nueva contraseña */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nueva contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] focus:border-transparent transition-all pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirmar nueva contraseña *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] focus:border-transparent transition-all"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-500 space-y-1">
              <p className="font-medium text-gray-700">Requisitos de seguridad:</p>
              <p className="flex items-center gap-1.5">
                <span className={newPassword.length >= 8 ? "text-emerald-600 font-bold" : "text-gray-400"}>•</span>
                <span>Mínimo 8 caracteres</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className={newPassword && newPassword === confirmPassword ? "text-emerald-600 font-bold" : "text-gray-400"}>•</span>
                <span>Coincidencia de ambas contraseñas</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
            >
              {loading ? "Actualizando contraseña..." : "Guardar nueva contraseña"}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-xs text-[#3F6F58] hover:underline font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft size={12} />
                <span>Volver al inicio de sesión</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Pie de página */}
      <div className="text-center z-10 text-xs text-green-100/80 mb-2">
        <p className="font-light">
          GUIOS+ © 2026 · Tesis Doctoral: Víctor Hugo Rea Sánchez · Universidad de Sevilla
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;

