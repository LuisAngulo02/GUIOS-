/**
 * Componente de Navegación por Pestañas (Tabs).
 * Controla el cambio entre las 3 vistas principales de GUIOSAD.
 */

class TabsComponent {
  constructor(containerId, onTabChange) {
    this.container = document.getElementById(containerId);
    this.onTabChange = onTabChange;
    this.activeTab = 0;
    this.init();
  }

  init() {
    if (!this.container) return;
    const buttons = this.container.querySelectorAll(".flx-tab-button");
    buttons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        this.setActiveTab(index);
      });
    });
  }

  setActiveTab(index) {
    this.activeTab = index;
    const buttons = this.container.querySelectorAll(".flx-tab-button");
    const contents = document.querySelectorAll(".tab-content-panel");

    buttons.forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      }
    });

    contents.forEach((panel, idx) => {
      if (idx === index) {
        panel.classList.add("active");
        panel.style.display = "flex";
      } else {
        panel.classList.remove("active");
        panel.style.display = "none";
      }
    });

    if (typeof this.onTabChange === "function") {
      this.onTabChange(index);
    }
  }
}

if (typeof window !== "undefined") {
  window.TabsComponent = TabsComponent;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TabsComponent };
}
