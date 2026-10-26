/**
 * Ensamblador Principal de la Aplicación GUIOSAD.
 * Inicializa el store reactivo y monta los componentes modulares en el DOM.
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof GUIOSAD_CATALOG === "undefined") {
    console.error("Error: No se encontró GUIOSAD_CATALOG. Asegúrese de cargar dataset.js antes de app.js.");
    return;
  }

  // 1. Inicializar el Store reactivo con los 18 factores y 61 subfactores
  const store = new GuiosadStore(GUIOSAD_CATALOG);
  window.guiosadApp = { store };

  // 2. Montar Modal de Ayuda Contextual
  const helpModal = new HelpModalComponent("guiosad-help-modal");
  window.helpModal = helpModal;

  // 3. Montar Componentes Modulares de cada paso
  const step1 = new Step1FactorsComponent("tab-content-step1", store);
  const step2 = new Step2SubfactorsComponent("tab-content-step2", store);
  const step3 = new Step3FodaComponent("tab-content-step3", store);

  // 4. Inicializar Navegación por Pestañas
  const tabs = new TabsComponent("app-tabs-nav", (tabIndex) => {
    // Al cambiar a la pestaña 2, refrescar la lista de factores relevantes
    if (tabIndex === 1) {
      step2.onStoreUpdate();
    }
    // Al cambiar a la pestaña 3, refrescar la tabla FODA
    if (tabIndex === 2) {
      step3.render();
    }
  });

  // 5. Conectar botón de ayuda general en cabecera
  const headerHelpBtn = document.getElementById("btn-header-help");
  if (headerHelpBtn) {
    headerHelpBtn.addEventListener("click", () => {
      helpModal.open(tabs.activeTab);
    });
  }

  // Activar la primera pestaña por defecto
  tabs.setActiveTab(0);
});
