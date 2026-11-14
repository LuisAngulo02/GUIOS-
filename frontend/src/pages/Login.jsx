import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";

/**
 * Pantalla 1: Login (/login)
 */
export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estado para modal de recuperación de contraseña
  const [modalRecuperarOpen, setModalRecuperarOpen] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false);
  const [mensajeRecuperar, setMensajeRecuperar] = useState("");
  const [errorRecuperar, setErrorRecuperar] = useState("");

  const { login } = useEvaluation();
  const navigate = useNavigate();

  const handleSolicitarRecuperacion = async (e) => {
    e.preventDefault();
    setErrorRecuperar("");
    setMensajeRecuperar("");
    setEnviandoRecuperar(true);
    try {
      const res = await apiService.solicitarRecuperacionPassword(emailRecuperar.trim());
      setMensajeRecuperar(
        res?.message ||
          "Si el correo electrónico está registrado en el sistema, recibirás un enlace de recuperación en breve. Revisa tu bandeja de entrada o carpeta de spam."
      );
    } catch (err) {
      setErrorRecuperar(err.message || "Error al procesar la solicitud de recuperación.");
    } finally {
      setEnviandoRecuperar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, remember);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
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

      {/* Tarjeta blanca centrada con círculo con candado que sobresale arriba */}
      <div className="w-full max-w-md bg-white rounded-card shadow-2xl p-8 pt-10 relative z-10 my-8 border border-[#DDE7E1]">
        {/* Círculo verde con candado sobresaliendo */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-[#3F6F58] border-4 border-white flex items-center justify-center text-white shadow-md">
          <Lock size={22} strokeWidth={2.2} />
        </div>

        {/* Encabezado */}
        <div className="text-center mt-2 mb-6">
          <h2 className="text-2xl font-light text-[#2F5444] tracking-tight">
            Bienvenido de nuevo
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Accede al sistema administrativo de evaluación FLOSS.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FBE0E0] border border-[#F5C2C2] text-xs text-[#B33A3A] font-medium">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] focus:border-transparent transition-all pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-gray-800 px-2 py-1 flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            </div>
          </div>

          {/* Recordar sesión y Olvidaste tu contraseña */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-[#DDE7E1] text-[#3F6F58] focus:ring-[#3F6F58] h-4 w-4"
              />
              <span>Recordar sesión</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setEmailRecuperar(email || "");
                setErrorRecuperar("");
                setMensajeRecuperar("");
                setModalRecuperarOpen(true);
              }}
              className="text-[#3F6F58] hover:underline font-medium cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón Iniciar sesión */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Nota de roles */}
        <p className="text-[11px] text-gray-400 text-center mt-4">
          Ingrese sus credenciales institucionales autorizadas para acceder a la plataforma.
        </p>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {modalRecuperarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DDE7E1] w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#3F6F58] flex items-center justify-center border border-emerald-200">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Recuperar contraseña
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Restablecimiento de credenciales GUIOS+
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalRecuperarOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {mensajeRecuperar ? (
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#3F6F58] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Correo enviado</p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {mensajeRecuperar}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalRecuperarOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#2F5444] hover:bg-[#254336] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <form onSubmit={handleSolicitarRecuperacion} className="space-y-3.5 text-xs">
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Ingresa tu correo institucional registrado. Si la cuenta existe, te enviaremos un enlace seguro de un solo uso para definir una nueva contraseña.
                </p>

                {errorRecuperar && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs border border-red-200 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorRecuperar}</span>
                  </div>
                )}

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Correo electrónico institucional *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      autoFocus
                      value={emailRecuperar}
                      onChange={(e) => setEmailRecuperar(e.target.value)}
                      placeholder="usuario@guiosplus.org"
                      className="w-full px-3 py-2 pl-9 rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                    />
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalRecuperarOpen(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoRecuperar}
                    className="px-4 py-1.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {enviandoRecuperar ? "Enviando enlace..." : "Enviar enlace"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Pie de página */}
      <div className="text-center z-10 text-xs text-green-100/80 mb-2">
        GUIOSPRO · Metodología de evaluación para adopción FLOSS
      </div>
    </div>
  );
};

export default Login;
