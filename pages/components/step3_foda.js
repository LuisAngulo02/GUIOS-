/**
 * Componente Paso 5 y 6: Evaluación y Recomendación sobre la Adopción.
 * Muestra la tabla FODA con los colores exactos y calcula la recomendación final.
 */

class Step3FodaComponent {
  constructor(containerId, store) {
    this.container = document.getElementById(containerId);
    this.store = store;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.store.subscribe(() => this.render());
    this.render();
  }

  render() {
    const factors = this.store.factors;

    let rowsHtml = "";
    factors.forEach((f) => {
      let weightText = "";
      let scopeText = "";
      let fodaText = "";
      let fodaClass = "";

      if (!f.isRelevant) {
        weightText = "";
        scopeText = "";
        fodaText = "Subfactores no evaluados.";
        fodaClass = "foda-none";
      } else if (f.averageWeight === null) {
        weightText = "";
        scopeText = f.currentScope;
        fodaText = "Subfactores no evaluados.";
        fodaClass = "foda-none";
      } else {
        weightText = f.averageWeight.toFixed(1);
        scopeText = f.currentScope;
        fodaText = f.foda;

        if (f.foda === "Fortaleza" || f.foda === "Oportunidad") {
          fodaClass = "foda-good"; // #9d9
        } else {
          fodaClass = "foda-bad"; // #ff9ec0
        }
      }

      rowsHtml += `
        <div class="table-row">
          <div class="col col-flex-2 factor-label" title="${f.dimension} - ${f.name}">${f.name}</div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit" value="${weightText}" disabled />
          </div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit" value="${scopeText}" disabled />
          </div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit foda-badge ${fodaClass}" value="${fodaText}" disabled />
          </div>
        </div>
      `;
    });

    let html = `
      <div class="flx-header-description">
        <div class="flx-header-text">
          <h5>Paso 5 y 6. Evaluación y recomendación sobre la adopción</h5>
          <p>Visualiza la clasificación FODA de los factores según su ponderación y alcance, y obtén el dictamen automatizado de adopción basado en el modelo doctoral.</p>
        </div>
        <button type="button" class="btn-help-step" id="btn-help-step3" title="Ver guía metodológica de esta sección">
          Guía del paso
        </button>
      </div>

      <div class="table-container border-box">
        <div class="table-row table-header">
          <div class="col col-flex-2"><b>Factor</b></div>
          <div class="col col-flex-1"><b>Ponderación media del factor</b></div>
          <div class="col col-flex-1"><b>Alcance</b></div>
          <div class="col col-flex-1"><b>FODA</b></div>
        </div>
        <div class="table-body">
          ${rowsHtml}
        </div>
      </div>

      <div class="recommendation-section">
        <div class="col-spacer"></div>
        <button id="btn-calculate-recom" class="flx-button btn-success">Ver recomendación</button>
        <textarea id="txt-recommendation" class="flx-multilineedit" readonly placeholder="Presione 'Ver recomendación' para obtener el dictamen del sistema..."></textarea>
      </div>
    `;

    this.container.innerHTML = html;

    const helpBtn = this.container.querySelector("#btn-help-step3");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        if (window.helpModal) {
          window.helpModal.open(2);
        }
      });
    }

    const recomBtn = this.container.querySelector("#btn-calculate-recom");
    recomBtn.addEventListener("click", () => {
      this.handleRecommendation();
    });
  }

  handleRecommendation() {
    const result = this.store.computeRecommendation();
    const txtArea = this.container.querySelector("#txt-recommendation");
    if (!txtArea) return;

    txtArea.value = result.decision;
    txtArea.className = `flx-multilineedit ${result.styleClass}`;
  }
}

if (typeof window !== "undefined") {
  window.Step3FodaComponent = Step3FodaComponent;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Step3FodaComponent };
}
