/**
 * Capa de Servicios Asíncronos para GUIOS+
 * Preparada para alternar sin fricción entre mocks y la API REST de Django.
 */
import { MOCK_DIMENSIONES, MOCK_FACTORES, MOCK_SUBFACTORES } from "../data/mockCatalog";
import { MOCK_EVIDENCIA } from "../data/mockEvidencia";

const USE_LOCAL_MOCKS = true; // Permite conmutar a API REST fácilmente
const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper de delay para simulación asíncrona realista
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // 1. Autenticación
  async login(email, password, remember = false) {
    if (USE_LOCAL_MOCKS) {
      await delay(400);
      if (email.toLowerCase().includes("admin") || email === "admin@guiosplus.org") {
        return {
          user: {
            id: 1,
            nombre: "Admin Usuario",
            email: email,
            rol: "Administrador",
            avatar: "AU",
          },
          token: "mock-jwt-token-admin",
        };
      }
      return {
        user: {
          id: 2,
          nombre: "Evaluador Técnico",
          email: email,
          rol: "Evaluador",
          avatar: "ET",
        },
        token: "mock-jwt-token-evaluador",
      };
    } else {
      const res = await fetch(`${API_BASE_URL}/users/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Credenciales inválidas");
      }
      return await res.json();
    }
  },

  // 2. Catálogo y Factores
  async getFactores() {
    await delay(250);
    return JSON.parse(JSON.stringify(MOCK_FACTORES));
  },

  async getDimensiones() {
    await delay(150);
    return JSON.parse(JSON.stringify(MOCK_DIMENSIONES));
  },

  async getSubfactores(factorId) {
    await delay(200);
    return JSON.parse(JSON.stringify(MOCK_SUBFACTORES[factorId] || []));
  },

  // 3. Paso 0: Automatización de Importancia Sugerida
  async calcularImportanciaSugerida(onProgress) {
    // Simulación progresiva con callback de progreso
    for (let p = 10; p <= 100; p += 20) {
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
    await delay(300);
    return JSON.parse(JSON.stringify(MOCK_FACTORES));
  },

  // 4. Paso 1: Guardar Evaluación de Factores
  async saveResultadoFactor(factores) {
    await delay(300);
    return { success: true, timestamp: new Date().toISOString() };
  },

  // 5. Paso 2: Guardar Calificación de Subfactores
  async saveResultadoSubfactor(factorId, subfactores) {
    await delay(300);
    return { success: true, factorId, timestamp: new Date().toISOString() };
  },

  // 6. Evidencia Académica
  async getEvidencia() {
    await delay(250);
    return JSON.parse(JSON.stringify(MOCK_EVIDENCIA));
  },
};
