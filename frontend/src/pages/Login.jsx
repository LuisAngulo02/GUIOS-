import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  X,
  Mail,
  User,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { useEvaluation } from "../context/EvaluationContext";
import { apiService } from "../services/apiService";

/**
 * Pantalla 1: Acceso y Registro (/login, /register)
 */
export const Login = ({ defaultTab = "login" }) => {
  const [tab, setTab] = useState(defaultTab); // 'login' | 'registro'

  // Estados Formulario de Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados Formulario de Registro
  const [regNombre, setRegNombre] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Estado para modal de recuperación de contraseña
  const [modalRecuperarOpen, setModalRecuperarOpen] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [enviandoRecuperar, setEnviandoRecuperar] = useState(false);
  const [mensajeRecuperar, setMensajeRecuperar] = useState("");
  const [errorRecuperar, setErrorRecuperar] = useState("");

  const { login } = useEvaluation();
  const navigate = useNavigate();

  // Extrae mensajes amigables de error desde la respuesta de DRF
  const extractErrorMessage = (err, fallback) => {
    if (err?.data && typeof err.data === "object") {
      const messages = [];
      for (const [key, val] of Object.entries(err.data)) {
        if (Array.isArray(val)) {
          messages.push(...val);
        } else if (typeof val === "string") {
          messages.push(val);
        }
      }
      if (messages.length > 0) return messages.join(" ");
    }
    return err?.message || fallback;
  };

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
      setErrorRecuperar(extractErrorMessage(err, "Error al procesar la solicitud de recuperación."));
    } finally {
      setEnviandoRecuperar(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRegSuccess("");
    setLoading(true);

    try {
      await login(email.trim(), password, remember);
      navigate("/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err, "Credenciales incorrectas o cuenta inactiva."));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    const nombreClean = regNombre.trim();
    const emailClean = regEmail.trim();

    if (!nombreClean) {
      setRegError("Por favor, ingresa tu nombre y apellido completo.");
      return;
    }
    if (!emailClean) {
      setRegError("Por favor, ingresa tu correo electrónico.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setRegLoading(true);
    try {
      const res = await apiService.register(nombreClean, emailClean, regPassword);

      // Intento de inicio de sesión automático para máxima fluidez
      try {
        await login(emailClean, regPassword, false);
        navigate("/dashboard");
        return;
      } catch {
        // En caso de requerir login explícito, prellenamos datos en la pestaña de login
        setEmail(emailClean);
        setPassword("");
        setTab("login");
        setRegSuccess(res?.message || "¡Registro exitoso! Por favor inicia sesión con tu contraseña.");
      }
    } catch (err) {
      setRegError(extractErrorMessage(err, "No se pudo completar el registro. Verifica los datos."));
    } finally {
      setRegLoading(false);
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

      {/* Tarjeta blanca centrada con círculo con ícono sobresaliente */}
      <div className="w-full max-w-md bg-white rounded-card shadow-2xl p-8 pt-10 relative z-10 my-8 border border-[#DDE7E1]">
        {/* Círculo verde con icono sobresaliendo */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-[#3F6F58] border-4 border-white flex items-center justify-center text-white shadow-md transition-all">
          {tab === "login" ? (
            <Lock size={22} strokeWidth={2.2} />
          ) : (
            <UserPlus size={22} strokeWidth={2.2} />
          )}
        </div>

        {/* Tabs para alternar entre Iniciar Sesión y Registrarse */}
        <div className="flex border-b border-[#DDE7E1] mb-5 mt-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
              setRegError("");
            }}
            className={`flex-1 pb-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
              tab === "login"
                ? "border-[#3F6F58] text-[#2F5444]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("registro");
              setError("");
              setRegError("");
              setRegSuccess("");
            }}
            className={`flex-1 pb-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 cursor-pointer ${
              tab === "registro"
                ? "border-[#3F6F58] text-[#2F5444]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: INICIAR SESIÓN */}
        {/* ================================================================= */}
        {tab === "login" && (
          <div>
            <div className="text-center mb-5">
              <h2 className="text-2xl font-light text-[#2F5444] tracking-tight">
                Bienvenido de nuevo
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Accede al sistema de evaluación y toma de decisiones FLOSS.
              </p>
            </div>

            {regSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#3F6F58] shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[#FBE0E0] border border-[#F5C2C2] text-xs text-[#B33A3A] font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Correo electrónico institucional
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3.5 py-2.5 pl-9 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] focus:border-transparent transition-all"
                  />
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
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
                    className="w-full px-3.5 py-2.5 pl-9 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] focus:border-transparent transition-all pr-16"
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            <p className="text-[11px] text-gray-500 text-center mt-5">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("registro");
                  setError("");
                  setRegError("");
                }}
                className="text-[#3F6F58] font-semibold hover:underline cursor-pointer"
              >
                Regístrate como evaluador
              </button>
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: CREAR CUENTA (REGISTRO PÚBLICO) */}
        {/* ================================================================= */}
        {tab === "registro" && (
          <div>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-light text-[#2F5444] tracking-tight">
                Crear Cuenta
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Regístrate para evaluar adopciones de software libre.
              </p>
            </div>

            {regError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FBE0E0] border border-[#F5C2C2] text-xs text-[#B33A3A] font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre y Apellidos *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Ing. Juan Pérez"
                    className="w-full px-3.5 py-2 pl-9 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] transition-all"
                  />
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo electrónico institucional *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="usuario@institucion.edu"
                    className="w-full px-3.5 py-2 pl-9 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] transition-all"
                  />
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña (mínimo 8 caracteres) *
                </label>
                <div className="relative">
                  <input
                    type={regShowPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 pl-9 pr-14 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] transition-all"
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setRegShowPassword(!regShowPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 hover:text-gray-700 px-1 cursor-pointer"
                  >
                    {regShowPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <input
                    type={regShowPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 pl-9 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58] transition-all"
                  />
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
                <Sparkles size={14} className="text-[#3F6F58] shrink-0 mt-0.5" />
                <span>Se te asignará el rol de <strong>Evaluador</strong> para registrar proyectos y ejecutar diagnósticos FLOSS.</span>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 mt-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {regLoading ? "Registrando cuenta..." : "Registrarme y acceder"}
              </button>
            </form>

            <p className="text-[11px] text-gray-500 text-center mt-4">
              ¿Ya tienes una cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setRegError("");
                }}
                className="text-[#3F6F58] font-semibold hover:underline cursor-pointer"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {modalRecuperarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-gray-100 relative">
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
