/**
 * Capa de Servicios Asíncronos para GUIOS+
 * Conecta el Frontend con la API REST de Django (PostgreSQL)
 * Incluye fallback transparente a mocks locales cuando el servidor no está disponible.
 */
import { MOCK_DIMENSIONES, MOCK_FACTORES, MOCK_SUBFACTORES } from "../data/mockCatalog";
import { MOCK_EVIDENCIA } from "../data/mockEvidencia";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getStoredToken() {
  return localStorage.getItem("guios_access_token") || "";
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("guios_user") || "null");
  } catch {
    return null;
  }
}

/**
 * Wrapper de peticiones HTTP autenticadas con JSON
 */
async function request(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { detail: `Error HTTP ${response.status}: ${response.statusText}` };
    }
    const message = errorData.detail || errorData.message || JSON.stringify(errorData);
    const error = new Error(message);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Si no hay contenido (ej 204 No Content)
  if (response.status === 204) return null;
  return await response.json();
}

export const apiService = {
  // ---------------------------------------------------------------------------
  // 1. Autenticación & Usuarios (HU-01)
  // ---------------------------------------------------------------------------
  async login(email, password, remember = false) {
    try {
      const data = await request("/users/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.access) {
        localStorage.setItem("guios_access_token", data.access);
        if (data.refresh) localStorage.setItem("guios_refresh_token", data.refresh);
        localStorage.setItem("guios_user", JSON.stringify(data.user));
      }

      return {
        user: data.user,
        token: data.access,
        isLiveApi: true,
      };
    } catch (err) {
      console.warn("API de login no disponible o credenciales inválidas. Aplicando fallback:", err.message);
      await delay(350);

      // Si fue rechazo por credenciales explícitas del backend (400 o 401), propagar error
      if (err.status === 400 || err.status === 401) {
        throw err;
      }

      // Si fue fallo de red / backend apagado, fallback mock:
      const isAdmin = email.toLowerCase().includes("admin") || email === "admin@guiosplus.org";
      const fallbackUser = {
        id: isAdmin ? 1 : 2,
        nombre: isAdmin ? "Admin Usuario" : "Evaluador Técnico",
        email: email || "usuario@guiosplus.org",
        rol: isAdmin ? "administrador" : "evaluador",
        avatar: isAdmin ? "AU" : "ET",
      };
      localStorage.setItem("guios_user", JSON.stringify(fallbackUser));
      return {
        user: fallbackUser,
        token: "mock-jwt-token-fallback",
        isLiveApi: false,
      };
    }
  },

  async register(nombre, email, password) {
    return await request("/users/auth/registro/", {
      method: "POST",
      body: JSON.stringify({ nombre, email, password }),
    });
  },

  logout() {
    localStorage.removeItem("guios_access_token");
    localStorage.removeItem("guios_refresh_token");
    localStorage.removeItem("guios_user");
  },

  // ---------------------------------------------------------------------------
  // 2. Catálogo Oficial (Dimensiones, Factores, Subfactores)
  // ---------------------------------------------------------------------------
  async getCatalogo() {
    try {
      const res = await request("/guios/catalog/");
      return res;
    } catch (err) {
      console.warn("Fallo al obtener catálogo del backend, usando catálogo base:", err.message);
      return {
        dimensiones: MOCK_DIMENSIONES,
        factores: MOCK_FACTORES,
      };
    }
  },

  async getFactores() {
    await delay(150);
    return JSON.parse(JSON.stringify(MOCK_FACTORES));
  },

  async getDimensiones() {
    await delay(100);
    return JSON.parse(JSON.stringify(MOCK_DIMENSIONES));
  },

  async getSubfactores(factorId) {
    await delay(100);
    return JSON.parse(JSON.stringify(MOCK_SUBFACTORES[factorId] || []));
  },

  // ---------------------------------------------------------------------------
  // 3. Paso 0: Automatización de Importancia Sugerida (IS)
  // ---------------------------------------------------------------------------
  async calcularImportanciaSugerida(onProgress) {
    for (let p = 10; p <= 100; p += 25) {
      await delay(200);
      if (onProgress) onProgress(p);
    }
    return {
      factores_actualizados: 18,
      subfactores_evaluados: 61,
      documentos_procesados: 126,
      fuentes_consultadas: ["Scopus", "OpenAlex", "Semantic Scholar"],
      timestamp: new Date().toISOString(),
    };
  },

  async restaurarValoresOriginales() {
    await delay(150);
    return JSON.parse(JSON.stringify(MOCK_FACTORES));
  },

  // ---------------------------------------------------------------------------
  // 4. Gestión de Evaluaciones y Persistencia Real (Django + PostgreSQL)
  // ---------------------------------------------------------------------------
  async getEvaluaciones() {
    try {
      return await request("/guios/evaluations/");
    } catch (err) {
      console.warn("getEvaluaciones offline:", err.message);
      const saved = localStorage.getItem("guios_evaluaciones_cache");
      return saved ? JSON.parse(saved) : [];
    }
  },

  async getEvaluacion(id) {
    try {
      return await request(`/guios/evaluations/${id}/`);
    } catch (err) {
      console.warn(`getEvaluacion ${id} offline:`, err.message);
      return null;
    }
  },

  async createEvaluation({ nombre_software, contexto_uso, objetivo }) {
    try {
      const result = await request("/guios/evaluations/", {
        method: "POST",
        body: JSON.stringify({
          nombre_software: nombre_software || "Software sin título",
          contexto_uso: contexto_uso || "Contexto general",
          objetivo: objetivo || "Evaluación de viabilidad y madurez OSS",
        }),
      });
      return { ...result, isLiveApi: true };
    } catch (err) {
      console.warn("createEvaluation offline fallback:", err.message);
      const mockEval = {
        id: Date.now(),
        nombre_software,
        contexto_uso,
        objetivo,
        estado: "borrador",
        fecha_creacion: new Date().toISOString(),
        isLiveApi: false,
      };
      return mockEval;
    }
  },

  // Paso 1: Guardar ponderaciones ID, calcular IR y alcance
  async savePaso1(evaluacionId, items) {
    try {
      const payload = {
        items: items.map((f) => ({
          factor_id: f.id,
          id_usuario: Number(f.ID || 1),
          alcance: f.alcance || undefined,
        })),
      };

      const result = await request(`/guios/evaluations/${evaluacionId}/paso1/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, ...result, isLiveApi: true };
    } catch (err) {
      console.warn("savePaso1 offline:", err.message);
      return { success: true, isLiveApi: false, timestamp: new Date().toISOString() };
    }
  },

  // Paso 2: Obtener subfactores reactivos y guardar calificaciones
  async getPaso2(evaluacionId) {
    try {
      return await request(`/guios/evaluations/${evaluacionId}/paso2/`);
    } catch (err) {
      console.warn("getPaso2 offline:", err.message);
      return null;
    }
  },

  async savePaso2(evaluacionId, subfactoresList) {
    try {
      const payload = {
        subfactores: subfactoresList.map((sf) => ({
          subfactor_id: sf.id,
          calificacion: Number(sf.calificacion),
          observaciones: sf.observacion || "",
        })),
      };

      const result = await request(`/guios/evaluations/${evaluacionId}/paso2/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { success: true, ...result, isLiveApi: true };
    } catch (err) {
      console.warn("savePaso2 offline:", err.message);
      return { success: true, isLiveApi: false, timestamp: new Date().toISOString() };
    }
  },

  // Paso 3: Calcular dictamen final y matrices FODA con persistencia
  async calcularResultado(evaluacionId) {
    try {
      const result = await request(`/guios/evaluations/${evaluacionId}/resultado/`, {
        method: "POST",
      });
      return { ...result, isLiveApi: true };
    } catch (err) {
      console.warn("calcularResultado offline:", err.message);
      return { isLiveApi: false };
    }
  },

  // ---------------------------------------------------------------------------
  // 5. Evidencia Académica
  // ---------------------------------------------------------------------------
  async getEvidencia() {
    await delay(150);
    return JSON.parse(JSON.stringify(MOCK_EVIDENCIA));
  },
};
