import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Save,
  Play,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Check,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  Activity,
  RefreshCw,
  X,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { MOCK_FACTORES } from "../data/mockCatalog";
import Badge from "../components/Badge";
import Chip from "../components/Chip";
import Toggle from "../components/Toggle";
import { apiService } from "../services/apiService";
import { useEvaluation } from "../context/EvaluationContext";

/**
 * Pantalla 8: Administración (/administracion)
 * Implementa HU-02 (Gestión de Roles y Usuarios, Baja Lógica y Bitácora de Auditoría)
 * y HU-03 (Parámetros y Catálogo GUIOS).
 */
export const Administracion = () => {
  const { currentUser } = useEvaluation();

  // Pestañas de la vista de administración
  const tabs = [
    "Usuarios",
    "Palabras clave por factor",
    "Factores GUIOS",
    "Fuentes bibliográficas",
    "Historial de consultas",
    "Parámetros de cálculo",
  ];
  const [activeTab, setActiveTab] = useState("Usuarios");

  // ===========================================================================
  // ESTADOS PARA HU-02: GESTIÓN DE USUARIOS Y AUDITORÍA
  // ===========================================================================
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Modal Crear Usuario
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nuevoUsuarioData, setNuevoUsuarioData] = useState({
    nombre: "",
    email: "",
    id_rol: 2, // Evaluador por defecto
    password: "",
  });
  const [creandoUsuario, setCreandoUsuario] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState("");

  // Modal Bitácora de Auditoría
  const [modalAuditoriaAbierto, setModalAuditoriaAbierto] = useState(false);
  const [logsAuditoria, setLogsAuditoria] = useState([]);
  const [cargandoLogs, setCargandoLogs] = useState(false);

  // Modal Confirmación Elegante (Sustituye alert / confirm nativo)
  const [modalConfirm, setModalConfirm] = useState({
    abierto: false,
    titulo: "",
    mensaje: "",
    subtexto: "",
    detalleUsuario: null,
    tipo: "danger", // "danger" | "success" | "warning"
    textoConfirmar: "Confirmar",
    onConfirm: null,
    cargando: false,
  });

  const cerrarModalConfirm = () => {
    setModalConfirm((prev) => ({ ...prev, abierto: false, cargando: false }));
  };

  const ejecutarModalConfirm = async () => {
    if (!modalConfirm.onConfirm) return;
    setModalConfirm((prev) => ({ ...prev, cargando: true }));
    try {
      await modalConfirm.onConfirm();
      cerrarModalConfirm();
    } catch (err) {
      mostrarToast(err.message || "Error al procesar la acción", "error");
      setModalConfirm((prev) => ({ ...prev, cargando: false }));
    }
  };

  // Notificaciones flotantes tipo Toast
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = "success") => {
    setToast({ mensaje, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Cargar lista de usuarios y roles
  const cargarUsuariosYRoles = async () => {
    setCargandoUsuarios(true);
    try {
      const [dataUsuarios, dataRoles] = await Promise.all([
        apiService.getUsuarios(),
        apiService.getRoles(),
      ]);
      setUsuarios(Array.isArray(dataUsuarios) ? dataUsuarios : []);
      setRoles(Array.isArray(dataRoles) ? dataRoles : []);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      mostrarToast("No se pudo cargar la lista de usuarios.", "error");
    } finally {
      setCargandoUsuarios(false);
    }
  };

  useEffect(() => {
    cargarUsuariosYRoles();
  }, []);

  // Cargar bitácora de auditoría
  const handleAbrirAuditoria = async () => {
    setModalAuditoriaAbierto(true);
    setCargandoLogs(true);
    try {
      const logs = await apiService.getLogsAuditoria();
      setLogsAuditoria(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
      mostrarToast("Error al cargar la bitácora de auditoría", "error");
    } finally {
      setCargandoLogs(false);
    }
  };

  // Cambiar rol de un usuario
  const handleCambiarRol = async (usuario, nuevoRolId) => {
    try {
      const res = await apiService.cambiarRolUsuario(usuario.id, nuevoRolId);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuario.id ? { ...u, id_rol: nuevoRolId, rol_nombre: res.user?.rol_nombre || (nuevoRolId === 1 ? "administrador" : "evaluador") } : u))
      );
      mostrarToast(`Rol de ${usuario.nombre} actualizado con éxito.`);
    } catch (err) {
      mostrarToast(err.message || "Error al actualizar rol del usuario", "error");
    }
  };

  // Activar / Desactivar cuenta (Baja lógica RNF-02 con Modal)
  const handleToggleEstado = (usuario) => {
    if (usuario.id === currentUser?.id) {
      mostrarToast("No puedes desactivar tu propia cuenta de administrador activo.", "error");
      return;
    }

    const accionDesactivar = usuario.activo;
    setModalConfirm({
      abierto: true,
      tipo: accionDesactivar ? "danger" : "success",
      titulo: accionDesactivar ? "Desactivar Cuenta de Usuario" : "Reactivar Cuenta de Usuario",
      mensaje: accionDesactivar
        ? `¿Estás seguro de que deseas desactivar la cuenta de ${usuario.nombre}?`
        : `¿Estás seguro de que deseas reactivar la cuenta de ${usuario.nombre}?`,
      subtexto: accionDesactivar
        ? "La cuenta pasará a estado inactivo (Baja lógica). El usuario no podrá iniciar sesión pero todos sus datos, evaluaciones y registros en auditoría permanecerán intactos en PostgreSQL (RNF-02)."
        : "La cuenta volverá a tener acceso activo al sistema y se restablecerán a 0 los intentos fallidos de inicio de sesión.",
      detalleUsuario: usuario,
      textoConfirmar: accionDesactivar ? "Sí, desactivar cuenta" : "Sí, reactivar cuenta",
      cargando: false,
      onConfirm: async () => {
        const res = await apiService.cambiarEstadoUsuario(usuario.id);
        const userActualizado = res.user;
        setUsuarios((prev) =>
          prev.map((u) => (u.id === usuario.id ? (userActualizado || { ...u, activo: !u.activo }) : u))
        );
        mostrarToast(res.message || `Usuario ${accionDesactivar ? "desactivado" : "reactivado"} con éxito.`);
      },
    });
  };

  // Desbloquear cuenta por exceso de intentos fallidos (con Modal)
  const handleDesbloquear = (usuario) => {
    setModalConfirm({
      abierto: true,
      tipo: "warning",
      titulo: "Desbloquear Cuenta de Usuario",
      mensaje: `¿Deseas levantar el bloqueo de seguridad para ${usuario.nombre}?`,
      subtexto: "Se reiniciará el contador de intentos fallidos a 0 y se anulará la marca de tiempo de bloqueo.",
      detalleUsuario: usuario,
      textoConfirmar: "Sí, desbloquear cuenta",
      cargando: false,
      onConfirm: async () => {
        const res = await apiService.desbloquearUsuario(usuario.id);
        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === usuario.id
              ? { ...u, intentos_fallidos: 0, bloqueado_hasta: null }
              : u
          )
        );
        mostrarToast(res.message || `Cuenta de ${usuario.nombre} desbloqueada.`);
      },
    });
  };

  // Crear nuevo usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setErrorCreacion("");
    if (!nuevoUsuarioData.nombre.trim() || !nuevoUsuarioData.email.trim()) {
      setErrorCreacion("Nombre y correo electrónico son obligatorios.");
      return;
    }

    setCreandoUsuario(true);
    try {
      const payload = {
        nombre: nuevoUsuarioData.nombre.trim(),
        email: nuevoUsuarioData.email.trim(),
        id_rol: Number(nuevoUsuarioData.id_rol),
        password: nuevoUsuarioData.password.trim() || "Guios2026!",
      };
      const res = await apiService.crearUsuario(payload);
      setUsuarios((prev) => [res, ...prev]);
      setModalCrearAbierto(false);
      setNuevoUsuarioData({ nombre: "", email: "", id_rol: 2, password: "" });
      mostrarToast(`Usuario ${res.nombre} creado con éxito.`);
    } catch (err) {
      setErrorCreacion(err.message || "Error al crear usuario.");
    } finally {
      setCreandoUsuario(false);
    }
  };

  // Filtrado reactivo de usuarios
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchBusqueda =
        u.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
        u.email.toLowerCase().includes(busquedaUsuario.toLowerCase());

      const matchRol =
        filtroRol === "todos" ||
        u.rol_nombre?.toLowerCase() === filtroRol.toLowerCase();

      let matchEstado = true;
      if (filtroEstado === "activos") matchEstado = u.activo;
      if (filtroEstado === "inactivos") matchEstado = !u.activo;
      if (filtroEstado === "bloqueados") matchEstado = (u.intentos_fallidos >= 5) || !!u.bloqueado_hasta;

      return matchBusqueda && matchRol && matchEstado;
    });
  }, [usuarios, busquedaUsuario, filtroRol, filtroEstado]);

  // Métricas rápidas de usuarios
  const metricas = useMemo(() => {
    const total = usuarios.length;
    const admins = usuarios.filter((u) => u.rol_nombre?.toLowerCase() === "administrador").length;
    const evaluadores = usuarios.filter((u) => u.rol_nombre?.toLowerCase() === "evaluador").length;
    const bloqueados = usuarios.filter((u) => u.intentos_fallidos >= 5 || !u.activo).length;
    return { total, admins, evaluadores, bloqueados };
  }, [usuarios]);

  // ===========================================================================
  // ESTADOS PARA PESTAÑA: PALABRAS CLAVE POR FACTOR (HU-03 / RF-14)
  // ===========================================================================
  const [selectedFactorId, setSelectedFactorId] = useState(1);
  const [searchFactor, setSearchFactor] = useState("");

  const [keywordsState, setKeywordsState] = useState({
    1: ["interoperability", "standards", "cloud ready", "cross-platform", "LTI integration"],
    2: ["customization", "modular extension", "source code access", "plugins repository"],
    3: ["deploy test", "docker container", "installation ease"],
    4: ["reliability", "security audit", "RBAC control", "stability"],
    5: ["reusability", "software framework", "GPL library"],
    6: ["usability", "GUI interface", "learning curve", "user satisfaction"],
    7: ["maintainability", "active developers", "commit activity"],
    8: ["portability", "DBMS independent", "mobile app"],
    9: ["documentation quality", "user guide", "API reference", "multilingual docs"],
    10: ["training plan", "technical skills", "self-learning", "staff qualification"],
    16: ["community support", "certified partners", "commercial SLAs", "internal developers"],
    18: ["total cost of ownership", "hidden costs", "license savings", "ROI"],
  });

  const [nuevaKeyword, setNuevaKeyword] = useState("");
  const [usarSinonimos, setUsarSinonimos] = useState(true);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const factoresList = MOCK_FACTORES.filter((f) =>
    f.nombre.toLowerCase().includes(searchFactor.toLowerCase())
  );

  const factorActual =
    MOCK_FACTORES.find((f) => f.id === selectedFactorId) || MOCK_FACTORES[0];

  const currentKeywords = keywordsState[factorActual.id] || ["open source", "criteria"];

  const handleAddKeyword = () => {
    if (!nuevaKeyword.trim()) return;
    setKeywordsState((prev) => ({
      ...prev,
      [factorActual.id]: [...(prev[factorActual.id] || []), nuevaKeyword.trim()],
    }));
    setNuevaKeyword("");
  };

  const handleRemoveKeyword = (index) => {
    setKeywordsState((prev) => ({
      ...prev,
      [factorActual.id]: prev[factorActual.id].filter((_, i) => i !== index),
    }));
  };

  const handleGuardarCambios = () => {
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 2000);
  };

  const booleanQuery = `TITLE-ABS-KEY ("${factorActual.nombre}" AND (${currentKeywords
    .map((k) => `"${k}"`)
    .join(" OR ")}))`;

  return (
    <div className="space-y-6">
      {/* Toast Notificación Flotante */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transition-all transform translate-y-0 ${
            toast.tipo === "success"
              ? "bg-[#2F5444] text-white border-[#53876D]"
              : "bg-red-700 text-white border-red-800"
          }`}
        >
          {toast.tipo === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toast.mensaje}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Encabezado con Insignia Administrador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-light text-[#2F5444] tracking-tight">
              Administración del Sistema
            </h1>
            <Badge variant="green" size="md">
              <ShieldCheck size={13} />
              <span>Administrador Activo</span>
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gestión institucional de roles, cuentas, baja lógica, catálogo metodológico y bitácora de auditoría.
          </p>
        </div>
      </div>

      {/* Barra de Pestañas de Administración */}
      <div className="flex items-center gap-1 border-b border-[#DDE7E1] overflow-x-auto whitespace-nowrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-3 text-xs font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === t
                ? "border-[#3F6F58] text-[#2F5444] bg-white rounded-t-lg shadow-sm"
                : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50"
            }`}
          >
            {t === "Usuarios" && <Users size={14} />}
            {t === "Palabras clave por factor" && <Activity size={14} />}
            <span>{t}</span>
            {t === "Usuarios" && (
              <span className="text-[10px] bg-green-100 text-[#2F5444] px-1.5 py-0.5 rounded-full font-bold">
                {usuarios.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ======================================================================= */}
      {/* PESTAÑA 1: GESTIÓN DE USUARIOS Y ROLES (HU-02) */}
      {/* ======================================================================= */}
      {activeTab === "Usuarios" && (
        <div className="space-y-6">
          {/* Tarjetas de Métricas de Cuentas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-card border border-[#DDE7E1] p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-[#3F6F58] flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">Total Cuentas</span>
                <span className="text-xl font-bold text-[#2F5444]">{metricas.total}</span>
              </div>
            </div>

            <div className="bg-white rounded-card border border-[#DDE7E1] p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">Administradores</span>
                <span className="text-xl font-bold text-emerald-800">{metricas.admins}</span>
              </div>
            </div>

            <div className="bg-white rounded-card border border-[#DDE7E1] p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <UserCheck size={20} />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">Evaluadores</span>
                <span className="text-xl font-bold text-blue-800">{metricas.evaluadores}</span>
              </div>
            </div>

            <div className="bg-white rounded-card border border-[#DDE7E1] p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Lock size={20} />
              </div>
              <div>
                <span className="text-[11px] text-gray-500 font-medium block">Inactivos / Bloqueados</span>
                <span className="text-xl font-bold text-amber-800">{metricas.bloqueados}</span>
              </div>
            </div>
          </div>

          {/* Barra de Filtros, Acciones y Bitácora */}
          <div className="bg-white rounded-card border border-[#DDE7E1] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Buscador */}
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
              />
            </div>

            {/* Selectores de Filtro */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
              >
                <option value="todos">Todos los roles</option>
                <option value="administrador">Administrador</option>
                <option value="evaluador">Evaluador</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
              >
                <option value="todos">Todos los estados</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
                <option value="bloqueados">Bloqueados por seguridad</option>
              </select>

              <button
                onClick={cargarUsuariosYRoles}
                title="Recargar datos"
                className="p-2 text-gray-600 hover:text-[#2F5444] rounded-lg border border-[#DDE7E1] hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={cargandoUsuarios ? "animate-spin" : ""} />
              </button>

              <button
                onClick={handleAbrirAuditoria}
                className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} className="text-[#3F6F58]" />
                <span>Bitácora de Auditoría</span>
              </button>

              <button
                onClick={() => setModalCrearAbierto(true)}
                className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
              >
                <UserPlus size={14} />
                <span>+ Nuevo Usuario</span>
              </button>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="bg-white rounded-card border border-[#DDE7E1] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAF9] border-b border-[#DDE7E1] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Correo Electrónico</th>
                    <th className="py-3 px-4">Rol en GUIOS+</th>
                    <th className="py-3 px-4">Estado / Seguridad</th>
                    <th className="py-3 px-4">Fecha Alta</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBF0EC] text-xs">
                  {cargandoUsuarios ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        <RefreshCw size={20} className="animate-spin mx-auto text-[#3F6F58] mb-2" />
                        Cargando usuarios desde PostgreSQL...
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-400">
                        No se encontraron usuarios que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((u) => {
                      const esPropioUsuario = u.id === currentUser?.id;
                      const esBloqueado = (u.intentos_fallidos >= 5) || !!u.bloqueado_hasta;
                      const initials = u.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-[#F9FCFA] transition-colors ${
                            !u.activo ? "bg-gray-50/60 opacity-80" : ""
                          }`}
                        >
                          {/* Avatar y Nombre */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  u.rol_nombre?.toLowerCase() === "administrador"
                                    ? "bg-[#2F5444] text-white"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {initials || "U"}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                                  {u.nombre}
                                  {esPropioUsuario && (
                                    <span className="text-[10px] bg-green-100 text-[#2F5444] px-1.5 py-0.2 rounded font-medium">
                                      Tú
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-gray-400 block">ID: #{u.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3.5 px-4 font-mono text-gray-600 text-[11px]">
                            {u.email}
                          </td>

                          {/* Selector de Rol interactivo */}
                          <td className="py-3.5 px-4">
                            <select
                              value={u.id_rol}
                              disabled={esPropioUsuario}
                              onChange={(e) => handleCambiarRol(u, Number(e.target.value))}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium focus:outline-none ${
                                u.rol_nombre?.toLowerCase() === "administrador"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                              } ${esPropioUsuario ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                            >
                              <option value="1">Administrador</option>
                              <option value="2">Evaluador</option>
                            </select>
                          </td>

                          {/* Estado y Seguridad */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {u.activo ? (
                                  <Badge variant="green" size="xs">
                                    <UserCheck size={11} />
                                    <span>Activo</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="auto" size="xs">
                                    <UserX size={11} className="text-gray-400" />
                                    <span className="text-gray-500">Inactivo (Baja lógica)</span>
                                  </Badge>
                                )}

                                {esBloqueado && (
                                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Lock size={10} />
                                    Bloqueado ({u.intentos_fallidos} intentos)
                                  </span>
                                )}
                              </div>
                              {u.intentos_fallidos > 0 && !esBloqueado && (
                                <span className="text-[10px] text-amber-600 font-medium">
                                  {u.intentos_fallidos} intentos fallidos
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Fecha */}
                          <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                            {u.fecha_creacion
                              ? new Date(u.fecha_creacion).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </td>

                          {/* Acciones */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botón Desbloquear */}
                              {(esBloqueado || u.intentos_fallidos > 0) && (
                                <button
                                  onClick={() => handleDesbloquear(u)}
                                  title="Desbloquear cuenta de usuario"
                                  className="px-2.5 py-1 text-xs rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Unlock size={12} />
                                  <span>Desbloquear</span>
                                </button>
                              )}

                              {/* Botón Baja Lógica / Reactivar */}
                              <button
                                onClick={() => handleToggleEstado(u)}
                                disabled={esPropioUsuario}
                                title={
                                  esPropioUsuario
                                    ? "Prohibido desactivar tu propia cuenta activa de administrador."
                                    : u.activo
                                    ? "Desactivar cuenta (Baja lógica)"
                                    : "Reactivar cuenta"
                                }
                                className={`px-2.5 py-1 text-xs rounded font-semibold border transition-colors flex items-center gap-1 ${
                                  esPropioUsuario
                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                    : u.activo
                                    ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 cursor-pointer"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 cursor-pointer"
                                }`}
                              >
                                {u.activo ? (
                                  <>
                                    <Trash2 size={12} />
                                    <span>Desactivar</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={12} />
                                    <span>Reactivar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie de tabla */}
            <div className="bg-[#F8FAF9] px-4 py-3 border-t border-[#DDE7E1] flex items-center justify-between text-xs text-gray-500">
              <span>
                Mostrando <strong>{usuariosFiltrados.length}</strong> de <strong>{usuarios.length}</strong> cuentas registradas en PostgreSQL.
              </span>
              <span className="text-[11px] text-gray-400">
                Las bajas no borran registros físicos para preservar trazabilidad histórica (RNF-02).
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* PESTAÑA 2: PALABRAS CLAVE POR FACTOR (HU-03 / RF-14) */}
      {/* ======================================================================= */}
      {activeTab === "Palabras clave por factor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda (1 col): Lista de Factores */}
          <div className="bg-white rounded-card border border-[#DDE7E1] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-xs tracking-wide uppercase text-gray-500">
                Factores GUIOS (18)
              </h3>
            </div>

            {/* Buscador de factores */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchFactor}
                onChange={(e) => setSearchFactor(e.target.value)}
                placeholder="Buscar factor..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
              />
            </div>

            {/* Lista scrolleable de factores */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {factoresList.map((f) => {
                const isSelected = f.id === selectedFactorId;
                const kwCount = (keywordsState[f.id] || []).length;

                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFactorId(f.id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#EBF4EE] border-[#3F6F58] text-[#2F5444] font-bold shadow-sm"
                        : "bg-white border-transparent hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div>
                      <span>{f.nombre}</span>
                      <span className="block text-[10px] text-gray-400 font-normal">
                        {f.dimension}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="auto" size="xs">
                        {f.IS === 4 ? "Fundamental" : f.IS === 3 ? "Importante" : "Opcional"}
                      </Badge>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                        {kwCount} kw
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha (2 cols): Detalle del Factor */}
          <div className="lg:col-span-2 bg-white rounded-card border border-[#DDE7E1] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-[#2F5444] text-base">
                  {factorActual.nombre}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuración de metadatos y términos de búsqueda booleana.
                </p>
              </div>

              <Badge variant="green" size="md">
                {currentKeywords.length} términos activos
              </Badge>
            </div>

            {/* Selects: Dimensión, Importancia sugerida y Alcance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Dimensión
                </label>
                <select
                  defaultValue={factorActual.dimension}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                >
                  <option value="Tecnológica">Tecnológica</option>
                  <option value="Organizacional">Organizacional</option>
                  <option value="Económica">Económica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Importancia sugerida (IS)
                </label>
                <select
                  defaultValue={factorActual.IS}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                >
                  <option value="1">1 · Irrelevante</option>
                  <option value="2">2 · Opcional</option>
                  <option value="3">3 · Importante</option>
                  <option value="4">4 · Fundamental</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Alcance
                </label>
                <select
                  defaultValue={factorActual.alcance || "Externo"}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-1 focus:ring-[#3F6F58]"
                >
                  <option value="Interno">Interno</option>
                  <option value="Externo">Externo</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
            </div>

            {/* Input para agregar nueva palabra clave */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Palabras clave y sinónimos para la consulta
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nuevaKeyword}
                  onChange={(e) => setNuevaKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="Nueva palabra clave o frase…"
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Agregar</span>
                </button>
              </div>
            </div>

            {/* Chips eliminables de palabras clave */}
            <div>
              <span className="text-[11px] text-gray-500 font-medium block mb-2">
                Términos asociados a este factor:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentKeywords.map((kw, idx) => (
                  <Chip
                    key={idx}
                    label={kw}
                    onRemove={() => handleRemoveKeyword(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Recuadro Vista previa de consulta */}
            <div className="rounded-lg bg-[#F8FAF9] p-4 border border-gray-200 space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                VISTA PREVIA DE CONSULTA (SYNTAX)
              </span>
              <code className="text-xs text-[#2F5444] font-mono break-all leading-relaxed block bg-white p-3 rounded border border-gray-100">
                {booleanQuery}
              </code>
            </div>

            {/* Interruptor Usar sinónimos automáticos */}
            <div className="pt-2">
              <Toggle
                enabled={usarSinonimos}
                onChange={setUsarSinonimos}
                label="Usar sinónimos automáticos (Amplía variantes en ES, EN y PT)"
              />
            </div>

            {/* Botones Probar consulta y Guardar cambios */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => mostrarToast(`Probando consulta booleana para ${factorActual.nombre} en Scopus y OpenAlex... 33 documentos coincidentes.`)}
                className="px-5 py-2.5 rounded-lg bg-white border border-[#DDE7E1] hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} className="text-[#3F6F58]" />
                <span>Probar consulta</span>
              </button>

              <button
                onClick={handleGuardarCambios}
                className="px-6 py-2.5 rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Save size={14} />
                <span>{guardadoExitoso ? "✓ ¡Cambios guardados!" : "Guardar cambios"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* OTRAS PESTAÑAS (Módulos Informativos) */}
      {/* ======================================================================= */}
      {activeTab !== "Usuarios" && activeTab !== "Palabras clave por factor" && (
        <div className="bg-white rounded-card border border-[#DDE7E1] p-12 text-center shadow-sm space-y-4">
          <div className="w-12 h-12 bg-green-50 text-[#3F6F58] rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Módulo: {activeTab}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Parámetros metodológicos sincronizados con el corpus bibliográfico y las tablas de configuración en PostgreSQL.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("Usuarios")}
            className="px-4 py-2 rounded-lg bg-[#3F6F58] text-white text-xs font-semibold cursor-pointer"
          >
            Ir a Gestión de Usuarios
          </button>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 1: CREAR NUEVO USUARIO (HU-02) */}
      {/* ======================================================================= */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-[#3F6F58] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Registrar Nuevo Usuario
                </h3>
              </div>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorCreacion && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {errorCreacion}
              </div>
            )}

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoUsuarioData.nombre}
                  onChange={(e) => setNuevoUsuarioData({ ...nuevoUsuarioData, nombre: e.target.value })}
                  placeholder="Ej. Dra. Carmen Mendoza"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  value={nuevoUsuarioData.email}
                  onChange={(e) => setNuevoUsuarioData({ ...nuevoUsuarioData, email: e.target.value })}
                  placeholder="usuario@institucion.org"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Rol Asignado *
                </label>
                <select
                  value={nuevoUsuarioData.id_rol}
                  onChange={(e) => setNuevoUsuarioData({ ...nuevoUsuarioData, id_rol: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] bg-white focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                >
                  <option value="2">Evaluador (Acceso a evaluaciones)</option>
                  <option value="1">Administrador (Control total y auditoría)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contraseña Inicial (Opcional)
                </label>
                <input
                  type="password"
                  value={nuevoUsuarioData.password}
                  onChange={(e) => setNuevoUsuarioData({ ...nuevoUsuarioData, password: e.target.value })}
                  placeholder="Por defecto: Guios2026!"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DDE7E1] focus:outline-none focus:ring-2 focus:ring-[#3F6F58]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Mínimo 8 caracteres. Hasheada automáticamente con Bcrypt.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoUsuario}
                  className="px-4 py-2 text-xs rounded-lg bg-[#3F6F58] hover:bg-[#345C49] text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {creandoUsuario && <RefreshCw size={13} className="animate-spin" />}
                  <span>{creandoUsuario ? "Guardando..." : "Crear Usuario"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 2: BITÁCORA DE AUDITORÍA (HU-02 / RF-02) */}
      {/* ======================================================================= */}
      {modalAuditoriaAbierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-[#3F6F58] flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Bitácora de Auditoría del Sistema (log_auditoria)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Trazabilidad de acciones de usuarios, cambios de rol, bloqueos y persistencia en PostgreSQL.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalAuditoriaAbierto(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 border border-gray-100 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F8FAF9] sticky top-0 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    <th className="py-2.5 px-3">Ejecutor</th>
                    <th className="py-2.5 px-3">Acción</th>
                    <th className="py-2.5 px-3">Entidad</th>
                    <th className="py-2.5 px-3">Detalle del Evento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {cargandoLogs ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        <RefreshCw size={18} className="animate-spin mx-auto text-[#3F6F58] mb-1.5" />
                        Cargando eventos de auditoría...
                      </td>
                    </tr>
                  ) : logsAuditoria.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-400">
                        No hay registros de auditoría recientes.
                      </td>
                    </tr>
                  ) : (
                    logsAuditoria.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap font-mono text-[10px]">
                          {log.fecha ? new Date(log.fecha).toLocaleString("es-ES") : "—"}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {log.usuario_email || "Sistema"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-gray-100 text-[#2F5444] font-medium">
                            {log.accion}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {log.entidad} #{log.id_entidad}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700">
                          {log.detalle}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-gray-400 text-[11px]">
                {logsAuditoria.length} registros cargados de la tabla PostgreSQL.
              </span>
              <button
                onClick={() => setModalAuditoriaAbierto(false)}
                className="px-4 py-1.5 bg-[#3F6F58] text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL 3: CONFIRMACIÓN MODERNA (Sustituye alert/confirm nativo) */}
      {/* ======================================================================= */}
      {modalConfirm.abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DDE7E1] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  modalConfirm.tipo === "danger"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : modalConfirm.tipo === "warning"
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {modalConfirm.tipo === "danger" && <Trash2 size={20} />}
                {modalConfirm.tipo === "warning" && <Unlock size={20} />}
                {modalConfirm.tipo === "success" && <UserCheck size={20} />}
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {modalConfirm.titulo}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {modalConfirm.mensaje}
                </p>
              </div>
            </div>

            {/* Ficha rápida del usuario */}
            {modalConfirm.detalleUsuario && (
              <div className="bg-[#F8FAF9] rounded-xl p-3 border border-[#EBF0EC] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2F5444] text-white flex items-center justify-center font-bold text-xs">
                    {modalConfirm.detalleUsuario.nombre
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-gray-800 block">
                      {modalConfirm.detalleUsuario.nombre}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">
                      {modalConfirm.detalleUsuario.email}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    modalConfirm.detalleUsuario.rol_nombre?.toLowerCase() === "administrador"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {modalConfirm.detalleUsuario.rol_nombre?.toLowerCase() === "administrador"
                    ? "Administrador"
                    : "Evaluador"}
                </span>
              </div>
            )}

            {/* Subtexto explicativo */}
            {modalConfirm.subtexto && (
              <p className="text-[11px] text-gray-500 leading-normal bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {modalConfirm.subtexto}
              </p>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={cerrarModalConfirm}
                disabled={modalConfirm.cargando}
                className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={ejecutarModalConfirm}
                disabled={modalConfirm.cargando}
                className={`px-4 py-2 text-xs rounded-lg font-semibold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  modalConfirm.tipo === "danger"
                    ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                    : modalConfirm.tipo === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                    : "bg-[#3F6F58] hover:bg-[#345C49] shadow-green-200"
                }`}
              >
                {modalConfirm.cargando && <RefreshCw size={13} className="animate-spin" />}
                <span>{modalConfirm.cargando ? "Procesando..." : modalConfirm.textoConfirmar}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Administracion;
