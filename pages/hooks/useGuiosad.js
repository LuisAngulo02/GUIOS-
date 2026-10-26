/**
 * Hook / Gestor de Estado y Motor de Decisión GUIOSAD.
 * Maneja la reactividad, cálculo de importancia relativa, ponderaciones y recomendaciones.
 */

const LEVELS_LABELS = ["Irrelevante", "Opcional", "Importante", "Fundamental"];
const SUBFACTOR_LABELS = [
  "No cumple el requisito",
  "Desconozco si cumple requisito",
  "Cumple parcialmente el requisito",
  "Cumple el requisito",
];

class GuiosadStore {
  constructor(catalog) {
    this.listeners = new Set();
    this.factors = catalog.map((item, index) => {
      const suggestedVal = item.suggested; // 1..4
      const decisorVal = 1; // 1..4 por defecto ("Irrelevante")
      const relIndex = Math.floor(((suggestedVal - 1) + (decisorVal - 1)) / 2);
      const isRel = relIndex > 0;

      return {
        id: index,
        name: item.name,
        dimension: item.dimension,
        suggested: suggestedVal, // 1..4
        suggestedLabel: LEVELS_LABELS[suggestedVal - 1],
        decisor: decisorVal, // 1..4
        decisorLabel: LEVELS_LABELS[decisorVal - 1],
        relativeIndex: relIndex, // 0..3
        relativeLabel: LEVELS_LABELS[relIndex],
        initialScope: item.scope, // 'Interno' | 'Externo' | 'Ambos'
        currentScope: item.scope === "Ambos" ? "Interno" : item.scope,
        isRelevant: isRel,
        averageWeight: null, // null hasta que se evalúen subfactores
        foda: null, // 'Fortaleza' | 'Oportunidad' | 'Debilidad' | 'Amenaza'
        subfactors: item.subfactors.map((subName) => ({
          name: subName,
          score: 1, // 1..4 por defecto
          scoreLabel: SUBFACTOR_LABELS[0],
        })),
      };
    });
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const cb of this.listeners) {
      cb(this.getState());
    }
  }

  getState() {
    return {
      factors: this.factors,
      relevantFactors: this.factors.filter((f) => f.isRelevant),
    };
  }

  /**
   * Actualiza la importancia asignada por el decisor (Paso 1).
   */
  setDecisorImportance(factorId, value) {
    const factor = this.factors[factorId];
    if (!factor) return;

    factor.decisor = value;
    factor.decisorLabel = LEVELS_LABELS[value - 1];

    const relIndex = Math.floor(((factor.suggested - 1) + (factor.decisor - 1)) / 2);
    factor.relativeIndex = relIndex;
    factor.relativeLabel = LEVELS_LABELS[relIndex];
    factor.isRelevant = relIndex > 0;

    // Si deja de ser relevante, se limpian sus resultados en Paso 5
    if (!factor.isRelevant) {
      factor.averageWeight = null;
      factor.foda = null;
    }

    this.notify();
  }

  /**
   * Cambia el alcance del factor (Interno / Externo).
   */
  setFactorScope(factorId, scope) {
    const factor = this.factors[factorId];
    if (!factor) return;

    factor.currentScope = scope;

    // Si ya tenía ponderación calculada, recalcular su FODA
    if (factor.averageWeight !== null) {
      this._updateFactorFoda(factor);
    }

    this.notify();
  }

  /**
   * Actualiza el valor de un subfactor individual (Paso 3).
   */
  setSubfactorScore(factorId, subIndex, score) {
    const factor = this.factors[factorId];
    if (!factor || !factor.subfactors[subIndex]) return;

    factor.subfactors[subIndex].score = score;
    factor.subfactors[subIndex].scoreLabel = SUBFACTOR_LABELS[score - 1];
    this.notify();
  }

  /**
   * Guarda y pondera los subfactores de un factor (Botón Guardar Paso 3 y 4).
   */
  saveFactorSubfactors(factorId) {
    const factor = this.factors[factorId];
    if (!factor || factor.subfactors.length === 0) return null;

    const total = factor.subfactors.reduce((acc, s) => acc + s.score, 0);
    const avg = total / factor.subfactors.length;
    factor.averageWeight = parseFloat(avg.toFixed(1));

    this._updateFactorFoda(factor);
    this.notify();
    return factor;
  }

  _updateFactorFoda(factor) {
    const isGood = factor.averageWeight >= 3.0;
    if (factor.currentScope === "Interno") {
      factor.foda = isGood ? "Fortaleza" : "Debilidad";
    } else {
      factor.foda = isGood ? "Oportunidad" : "Amenaza";
    }
  }

  /**
   * Motor de recomendación (Paso 5 y 6).
   */
  computeRecommendation() {
    const evaluated = this.factors.filter((f) => f.averageWeight !== null && f.foda !== null);

    if (evaluated.length === 0) {
      return {
        decision: "No se han evaluado subfactores aún. Por favor evalúe los subfactores en el Paso 3 y 4.",
        styleClass: "style-neutral",
        totals: { evaluated: 0, strengths: 0, opportunities: 0, weaknesses: 0, threats: 0 },
      };
    }

    const ra = "Recomendación C: La organización debe de proporcionar los recursos necesarios que garanticen una adopción satisfactoria. Si se trata de factores internos deben de ser aspectos a mejorar dentro de la organización y si son factores externos, dedicar recursos de ingeniería para mejorar el software.";
    const rb = "Recomendación B: Es posible adoptar. A pesar que se han detectado amenazas y/o debilidades en factores cuya importancia relativa es opcional, por lo tanto, se sugiere revisar los criterios que no cumplen con lo mínimo requerido para adoptar. ";
    const rc = "Recomendación A: Adoptar. Todos los factores han sido identifcados como Oportunidades y/o Fortalezas. Esto quiere decir que la organización cumple satisfactoriamente con la mayoria de requisitos para adoptar la solución FLOSS.";

    let a = false;
    let b = false;
    let c = false;

    let strengths = 0;
    let opportunities = 0;
    let weaknesses = 0;
    let threats = 0;

    for (const f of evaluated) {
      if (f.foda === "Fortaleza") strengths++;
      if (f.foda === "Oportunidad") opportunities++;
      if (f.foda === "Debilidad") weaknesses++;
      if (f.foda === "Amenaza") threats++;

      const isBad = f.foda === "Amenaza" || f.foda === "Debilidad";
      const isCritical = f.relativeLabel === "Importante" || f.relativeLabel === "Fundamental";

      if (isBad && isCritical) {
        a = true;
      } else if (isBad && f.relativeLabel === "Opcional") {
        b = true;
      } else {
        c = true;
      }
    }

    let decision = rc;
    let styleClass = "style-good";

    if (a) {
      decision = ra;
      styleClass = "style-bad";
    } else if (b) {
      decision = rb;
      styleClass = "style-warning";
    }

    return {
      decision,
      styleClass,
      totals: {
        evaluated: evaluated.length,
        strengths,
        opportunities,
        weaknesses,
        threats,
      },
    };
  }
}

// Exportación compatible tanto con módulos ES como scripts globales
if (typeof window !== "undefined") {
  window.GuiosadStore = GuiosadStore;
  window.LEVELS_LABELS = LEVELS_LABELS;
  window.SUBFACTOR_LABELS = SUBFACTOR_LABELS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GuiosadStore, LEVELS_LABELS, SUBFACTOR_LABELS };
}
