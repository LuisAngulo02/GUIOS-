/**
 * Componente Paso 1 y 2: Obtención de Factores Relevantes.
 * Muestra la tabla de factores, sliders de evaluación, cálculo de IR y selección de alcance.
 */

class Step1FactorsComponent {
  constructor(containerId, store) {
    this.container = document.getElementById(containerId);
    this.store = store;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  render() {
    const state = this.store.getState();
    const factors = state.factors;

    let html = `
      <div class="flx-header-description">
        <div class="flx-header-text">
          <h5>Paso 1 y 2. Obtención de factores relevantes</h5>
          <p>Evalúa la importancia que tiene cada factor para tu organización y define su alcance. Los factores con importancia relativa mayor a 'Irrelevante' pasarán a los pasos siguientes.</p>
        </div>
        <button type="button" class="btn-help-step" id="btn-help-step1" title="Ver guía metodológica de esta sección">
          Guía del paso
        </button>
      </div>

      <div class="table-container border-box">
        <div class="table-row table-header">
          <div class="col col-flex-2"><b>Factor</b></div>
          <div class="col col-flex-1"><b>Imp. Sugerida</b></div>
          <div class="col col-flex-1"><b>Evaluación</b></div>
          <div class="col col-flex-1"><b>Imp. Decisor</b></div>
          <div class="col col-flex-1"><b>Imp. Relativa</b></div>
          <div class="col col-flex-1"><b>Alcance</b></div>
        </div>
        <div class="table-body">
    `;

    factors.forEach((f) => {
      const scopeControl =
        f.initialScope === "Ambos"
          ? `<select class="flx-combobox col-scope-select" data-factor-id="${f.id}">
               <option value="Interno" ${f.currentScope === "Interno" ? "selected" : ""}>Interno</option>
               <option value="Externo" ${f.currentScope === "Externo" ? "selected" : ""}>Externo</option>
             </select>`
          : `<input type="text" class="flx-lineedit" value="${f.currentScope}" disabled />`;

      html += `
        <div class="table-row" id="factor-row-${f.id}">
          <div class="col col-flex-2 factor-label" title="${f.dimension} - ${f.name}">${f.name}</div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit" value="${f.suggestedLabel}" disabled />
          </div>
          <div class="col col-flex-1">
            <input 
              type="range" 
              class="flx-slider factor-slider" 
              min="1" 
              max="4" 
              step="1" 
              value="${f.decisor}" 
              data-factor-id="${f.id}" 
            />
          </div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit txt-decisor" value="${f.decisorLabel}" disabled />
          </div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit txt-relative" value="${f.relativeLabel}" disabled />
          </div>
          <div class="col col-flex-1">
            ${scopeControl}
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    // Escuchar cambios en los sliders
    const sliders = this.container.querySelectorAll(".factor-slider");
    sliders.forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const factorId = parseInt(e.target.dataset.factorId, 10);
        const val = parseInt(e.target.value, 10);
        this.store.setDecisorImportance(factorId, val);

        // Actualizar fila específica
        const row = document.getElementById(`factor-row-${factorId}`);
        if (row) {
          const factor = this.store.factors[factorId];
          row.querySelector(".txt-decisor").value = factor.decisorLabel;
          row.querySelector(".txt-relative").value = factor.relativeLabel;
        }
      });
    });

    // Escuchar cambios en los selectores de alcance
    const scopeSelects = this.container.querySelectorAll(".col-scope-select");
    scopeSelects.forEach((select) => {
      select.addEventListener("change", (e) => {
        const factorId = parseInt(e.target.dataset.factorId, 10);
        const scope = e.target.value;
        this.store.setFactorScope(factorId, scope);
      });
    });

    // Escuchar clic en botón de ayuda
    const helpBtn = this.container.querySelector("#btn-help-step1");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        if (window.helpModal) {
          window.helpModal.open(0);
        }
      });
    }
  }
}

if (typeof window !== "undefined") {
  window.Step1FactorsComponent = Step1FactorsComponent;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Step1FactorsComponent };
}
