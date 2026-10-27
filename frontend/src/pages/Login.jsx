import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";

/**
 * Pantalla 1: Login (/login)
 */
export const Login = () => {
  const [email, setEmail] = useState("admin@guiosplus.org");
  const [password, setPassword] = useState("demo2026");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useEvaluation();
  const navigate = useNavigate();

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
            <a
              href="#recuperar"
              onClick={(e) => {
                e.preventDefault();
                alert("Para restablecer su contraseña, contacte al administrador del sistema.");
              }}
              className="text-[#3F6F58] hover:underline font-medium"
            >
              ¿Olvidaste tu contraseña?
            </a>
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
          Tu rol (Administrador o Evaluador) se asigna al crear la cuenta
        </p>

        {/* Recuadro de credenciales demo */}
        <div className="mt-5 p-3 rounded-lg bg-[#F3F7F4] border border-[#DDE7E1] text-[11px] text-center text-gray-600">
          <span className="font-semibold text-[#2F5444]">Credenciales demo:</span> admin@guiosplus.org · <span className="font-semibold text-[#2F5444]">Contraseña:</span> demo2026
        </div>
      </div>

      {/* Pie de página */}
      <div className="text-center z-10 text-xs text-green-100/80 mb-2">
        GUIOSPRO · Metodología de evaluación para adopción FLOSS
      </div>
    </div>
  );
};

export default Login;
