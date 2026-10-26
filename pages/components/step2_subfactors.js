/**
 * Componente Paso 3 y 4: Obtención de Factores Ponderados.
 * Permite seleccionar factores relevantes, calificar cada subfactor con sliders y guardar la ponderación media.
 */

class Step2SubfactorsComponent {
  constructor(containerId, store) {
    this.container = document.getElementById(containerId);
    this.store = store;
    this.selectedFactorId = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.store.subscribe(() => this.onStoreUpdate());
    this.render();
  }

  onStoreUpdate() {
    const relevant = this.store.factors.filter((f) => f.isRelevant);
    // Si el factor seleccionado ya no es relevante, cambiar al primero disponible
    if (this.selectedFactorId === null || !relevant.some((f) => f.id === this.selectedFactorId)) {
      this.selectedFactorId = relevant.length > 0 ? relevant[0].id : null;
    }
    this.updateDropdown();
    this.renderSubfactors();
  }

  render() {
    let html = `
      <div class="flx-header-description">
        <div class="flx-header-text">
          <h5>Paso 3 y 4. Obtención de factores ponderados</h5>
          <p>Selecciona un factor relevante en el menú, califica el cumplimiento de sus subfactores con los controles deslizantes y presiona 'Guardar' para calcular su ponderación media.</p>
        </div>
        <button type="button" class="btn-help-step" id="btn-help-step2" title="Ver guía metodológica de esta sección">
          Guía del paso
        </button>
      </div>

      <div class="selector-row">
        <label for="cmb-factor-select"><b>Factor:</b></label>
        <select id="cmb-factor-select" class="flx-combobox flex-grow"></select>
        <button id="btn-save-subfactors" class="flx-button btn-primary">Guardar</button>
        <span id="save-status-msg" class="save-status"></span>
      </div>

      <div class="table-container border-box flex-grow">
        <div class="table-row table-header">
          <div class="col col-flex-3"><b>Subfactor</b></div>
          <div class="col col-flex-1"><b>Evaluación</b></div>
          <div class="col col-flex-1"><b>Resultado</b></div>
        </div>
        <div id="subfactors-table-body" class="table-body"></div>
      </div>
    `;

    this.container.innerHTML = html;

    const helpBtn = this.container.querySelector("#btn-help-step2");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        if (window.helpModal) {
          window.helpModal.open(1);
        }
      });
    }

    const selectEl = this.container.querySelector("#cmb-factor-select");
    selectEl.addEventListener("change", (e) => {
      this.selectedFactorId = parseInt(e.target.value, 10);
      this.renderSubfactors();
    });

    const saveBtn = this.container.querySelector("#btn-save-subfactors");
    saveBtn.addEventListener("click", () => {
      this.handleSave();
    });

    this.onStoreUpdate();
  }

  updateDropdown() {
    const selectEl = this.container.querySelector("#cmb-factor-select");
    if (!selectEl) return;

    const relevant = this.store.factors.filter((f) => f.isRelevant);

    if (relevant.length === 0) {
      selectEl.innerHTML = `<option value="">(Sin factores relevantes)</option>`;
      selectEl.disabled = true;
      return;
    }

    selectEl.disabled = false;
    let optionsHtml = "";
    relevant.forEach((f) => {
      const isSelected = f.id === this.selectedFactorId ? "selected" : "";
      const statusBadge = f.averageWeight !== null ? ` [PM: ${f.averageWeight}]` : "";
      optionsHtml += `<option value="${f.id}" ${isSelected}>${f.name}${statusBadge}</option>`;
    });

    selectEl.innerHTML = optionsHtml;
  }

  renderSubfactors() {
    const bodyEl = this.container.querySelector("#subfactors-table-body");
    if (!bodyEl) return;

    if (this.selectedFactorId === null) {
      bodyEl.innerHTML = `<div class="empty-notice">No hay factores relevantes para evaluar. Seleccione importancias en el Paso 1 y 2.</div>`;
      return;
    }

    const factor = this.store.factors[this.selectedFactorId];
    if (!factor || factor.subfactors.length === 0) {
      bodyEl.innerHTML = `<div class="empty-notice">Este factor no contiene subfactores catalogados.</div>`;
      return;
    }

    let rowsHtml = "";
    factor.subfactors.forEach((s, subIdx) => {
      rowsHtml += `
        <div class="table-row" id="subfactor-row-${subIdx}">
          <div class="col col-flex-3 factor-label">${s.name}</div>
          <div class="col col-flex-1">
            <input 
              type="range" 
              class="flx-slider subfactor-slider" 
              min="1" 
              max="4" 
              step="1" 
              value="${s.score}" 
              data-sub-index="${subIdx}" 
            />
          </div>
          <div class="col col-flex-1">
            <input type="text" class="flx-lineedit txt-sub-result" value="${s.scoreLabel}" disabled />
          </div>
        </div>
      `;
    });

    bodyEl.innerHTML = rowsHtml;

    // Conectar eventos de los sliders de subfactores
    const sliders = bodyEl.querySelectorAll(".subfactor-slider");
    sliders.forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const subIdx = parseInt(e.target.dataset.subIndex, 10);
        const score = parseInt(e.target.value, 10);
        this.store.setSubfactorScore(this.selectedFactorId, subIdx, score);

        const row = document.getElementById(`subfactor-row-${subIdx}`);
        if (row) {
          const sub = factor.subfactors[subIdx];
          row.querySelector(".txt-sub-result").value = sub.scoreLabel;
        }
      });
    });
  }

  handleSave() {
    if (this.selectedFactorId === null) return;
    const factor = this.store.saveFactorSubfactors(this.selectedFactorId);

    const statusEl = this.container.querySelector("#save-status-msg");
    if (statusEl && factor) {
      statusEl.textContent = `Guardado: Ponderación ${factor.averageWeight} (${factor.foda})`;
      statusEl.className = `save-status ${factor.foda === "Fortaleza" || factor.foda === "Oportunidad" ? "status-good" : "status-bad"}`;
      setTimeout(() => {
        statusEl.textContent = "";
      }, 4000);
    }
  }
}

if (typeof window !== "undefined") {
  window.Step2SubfactorsComponent = Step2SubfactorsComponent;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Step2SubfactorsComponent };
}
