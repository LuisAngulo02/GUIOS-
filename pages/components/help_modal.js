/**
 * Componente de Modal de Ayuda Contextual para GUIOSAD.
 * Utiliza el elemento nativo <dialog> con soporte de light-dismiss y accesibilidad ARIA.
 */

const HELP_DATA = {
  0: {
    stepBadge: "Paso 1 y 2 de 3",
    title: "¿Qué aspectos importan para su organización?",
    objective: "En este primer paso usted indica qué tan importante es cada uno de los 18 criterios de evaluación para su organización, y si cada criterio depende de decisiones internas (de su empresa) o de cómo funciona el propio software.",
    steps: [
      {
        title: "Lea cada criterio y observe la sugerencia inicial",
        desc: "La columna <b>Imp. Sugerida</b> muestra qué tan relevante consideran este criterio los expertos e investigadores que estudiaron adopciones de software libre. Úsela como punto de partida.",
      },
      {
        title: "Mueva el control deslizante según su situación real",
        desc: "La columna <b>Evaluación</b> es donde usted da su opinión. Mueva el control hacia la derecha para darle más importancia:<br>&nbsp;&nbsp;<b>1 – Irrelevante:</b> No aplica para su organización.<br>&nbsp;&nbsp;<b>2 – Opcional:</b> Sería útil, pero no es indispensable.<br>&nbsp;&nbsp;<b>3 – Importante:</b> Si falta, puede generar problemas.<br>&nbsp;&nbsp;<b>4 – Fundamental:</b> Sin esto, la adopción no es viable.",
      },
      {
        title: "Observe el resultado en la columna Imp. Relativa",
        desc: "El sistema combina automáticamente la sugerencia de los expertos con su evaluación personal y muestra el nivel de importancia final del criterio. No necesita calcular nada.",
      },
      {
        title: "Defina si el criterio es Interno o Externo",
        desc: "Algunos criterios permiten elegir su alcance. Seleccione <b>Interno</b> si el criterio depende de su organización (por ejemplo, si tiene personal capacitado), o <b>Externo</b> si depende del software (por ejemplo, si el programa tiene buena compatibilidad con sus archivos actuales).",
      },
    ],
    alert: {
      type: "warning",
      title: "Para avanzar al siguiente paso:",
      text: "Solo los criterios que queden en <b>Opcional, Importante o Fundamental</b> pasarán a la siguiente etapa. Si deja todos los criterios en <b>Irrelevante</b>, la siguiente pantalla aparecerá vacía.",
    },
    tip: {
      title: "Si no sabe por dónde empezar:",
      text: "Piense en los problemas que tuvo su organización al usar otros programas antes. Por ejemplo, si la compatibilidad con archivos de Word o Excel fue un problema, suba el criterio de <b>Compatibilidad</b> a Fundamental. Si tuvo dificultades para conseguir ayuda técnica, suba el criterio de <b>Soporte</b>.",
    },
  },
  1: {
    stepBadge: "Paso 3 y 4 de 3",
    title: "¿Qué tan bien cumple el software con cada criterio?",
    objective: "Aquí usted califica, para cada criterio que marcó como relevante, qué tan bien cumple el programa de software libre que está evaluando. El sistema calculará automáticamente un promedio de cumplimiento.",
    steps: [
      {
        title: "Seleccione un criterio de la lista desplegable",
        desc: "En la parte superior aparecen únicamente los criterios que usted marcó como relevantes en el paso anterior. Elija uno para comenzar a evaluarlo.",
      },
      {
        title: "Califique cada punto de evaluación con el control deslizante",
        desc: "Para cada punto, indique qué tan bien cumple el software basándose en pruebas, documentación u opiniones de su equipo técnico:<br>&nbsp;&nbsp;<b>1 – No cumple:</b> El software falla en este punto.<br>&nbsp;&nbsp;<b>2 – No lo sé:</b> No tiene información suficiente para saberlo.<br>&nbsp;&nbsp;<b>3 – Cumple en parte:</b> Lo hace, pero con limitaciones.<br>&nbsp;&nbsp;<b>4 – Cumple:</b> El software lo hace correctamente.",
      },
      {
        title: "Presione el botón Guardar",
        desc: "Cuando termine de calificar todos los puntos del criterio seleccionado, haga clic en <b>Guardar</b>. El sistema calculará el promedio y lo registrará para el análisis final.",
      },
      {
        title: "Repita para los demás criterios relevantes",
        desc: "Regrese a la lista desplegable y evalúe los demás criterios que desee incluir en el resultado final. No es obligatorio completarlos todos, pero a más criterios evaluados, más completo será el análisis.",
      },
    ],
    alert: {
      type: "info",
      title: "Cómo se clasifica cada criterio:",
      text: "Si el promedio de calificaciones del criterio es <b>3 o mayor</b>, se considera que el software cumple satisfactoriamente. Si el promedio es <b>menor a 3</b>, se identifica como un riesgo o área de mejora. Esta clasificación se mostrará en el siguiente paso.",
    },
    tip: {
      title: "Importante antes de cambiar de criterio:",
      text: "Asegúrese de presionar <b>Guardar</b> antes de seleccionar otro criterio en la lista. Si cambia sin guardar, las calificaciones de ese criterio no quedarán registradas.",
    },
  },
  2: {
    stepBadge: "Paso 5 y 6 de 3",
    title: "Resultado del análisis y recomendación final",
    objective: "En esta pantalla se muestra el resumen completo del análisis y la recomendación sobre si su organización está en condiciones de adoptar el software libre evaluado.",
    steps: [
      {
        title: "Revise la tabla de resultados",
        desc: "Cada criterio aparece con su nivel de cumplimiento y su clasificación de colores:<br>&nbsp;&nbsp;<b>Fondo verde – Fortaleza u Oportunidad:</b> El software cumple bien en este punto.<br>&nbsp;&nbsp;<b>Fondo rosa – Debilidad o Amenaza:</b> Este punto representa un riesgo o área a mejorar.<br>&nbsp;&nbsp;<i>Sin color – No evaluado:</i> El criterio no fue marcado como relevante o no se calificó.",
      },
      {
        title: "Presione Ver recomendación",
        desc: "Al hacer clic en este botón, el sistema analiza todos los resultados y emite un dictamen automático basado en el peso e importancia de cada criterio evaluado.",
      },
      {
        title: "Lea e interprete el dictamen",
        desc: "<b>Recomendación A – Adoptar:</b> El software cumple satisfactoriamente. No se detectan riesgos graves.<br><b>Recomendación B – Adoptar con precaución:</b> Hay algunos puntos con riesgo menor que conviene atender antes o durante la implementación.<br><b>Recomendación C – No adoptar aún:</b> Se detectaron riesgos serios en criterios que son importantes o fundamentales para su organización. Se recomienda resolver esas brechas primero.",
      },
    ],
    alert: {
      type: "tip",
      title: "Si obtiene Recomendación C:",
      text: "Regrese al Paso 3 y 4 para identificar exactamente cuáles puntos de evaluación fallaron. Esa información le servirá para definir qué acciones debe tomar su organización (capacitación, negociar soporte, buscar extensiones, etc.) antes de intentar la adopción.",
    },
  },
};

class HelpModalComponent {
  constructor(dialogId) {
    this.dialog = document.getElementById(dialogId);
    this.currentStep = 0;
    this.init();
  }

  init() {
    if (!this.dialog) return;

    // Fallback de cierre al hacer clic fuera del contenido (backdrop) para navegadores sin closedby nativo
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      this.dialog.addEventListener("click", (event) => {
        if (event.target !== this.dialog) return;
        const rect = this.dialog.getBoundingClientRect();
        const isInDialog =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          this.close();
        }
      });
    }

    // Botones internos de cierre
    const closeBtns = this.dialog.querySelectorAll("[data-dialog-close]");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => this.close());
    });
  }

  open(stepIndex = 0) {
    if (!this.dialog) return;
    this.currentStep = stepIndex;
    this.renderContent(stepIndex);
    if (typeof this.dialog.showModal === "function") {
      this.dialog.showModal();
    } else {
      this.dialog.setAttribute("open", "");
    }
  }

  close() {
    if (!this.dialog) return;
    if (typeof this.dialog.close === "function") {
      this.dialog.close();
    } else {
      this.dialog.removeAttribute("open");
    }
  }

  renderContent(stepIndex) {
    const data = HELP_DATA[stepIndex] || HELP_DATA[0];

    const badgeEl = this.dialog.querySelector("#modal-step-badge");
    const titleEl = this.dialog.querySelector("#modal-help-title");
    const objectiveEl = this.dialog.querySelector("#modal-objective-text");
    const stepsContainer = this.dialog.querySelector("#modal-steps-list");
    const alertBox = this.dialog.querySelector("#modal-alert-box");
    const tipBox = this.dialog.querySelector("#modal-tip-box");

    if (badgeEl) badgeEl.textContent = data.stepBadge;
    if (titleEl) titleEl.textContent = data.title;
    if (objectiveEl) objectiveEl.textContent = data.objective;

    if (stepsContainer) {
      stepsContainer.innerHTML = data.steps
        .map(
          (s, idx) => `
          <div class="help-step-item">
            <div class="help-step-number">${idx + 1}</div>
            <div class="help-step-content">
              <h4>${s.title}</h4>
              <p>${s.desc}</p>
            </div>
          </div>
        `
        )
        .join("");
    }

    if (alertBox) {
      if (data.alert) {
        alertBox.style.display = "block";
        alertBox.className = `help-callout callout-${data.alert.type}`;
        alertBox.innerHTML = `
          <strong>${data.alert.title}</strong>
          <span>${data.alert.text}</span>
        `;
      } else {
        alertBox.style.display = "none";
      }
    }

    if (tipBox) {
      if (data.tip) {
        tipBox.style.display = "block";
        tipBox.className = "help-callout callout-tip";
        tipBox.innerHTML = `
          <strong>${data.tip.title}</strong>
          <span>${data.tip.text}</span>
        `;
      } else {
        tipBox.style.display = "none";
      }
    }
  }
}

if (typeof window !== "undefined") {
  window.HelpModalComponent = HelpModalComponent;
  window.HELP_DATA = HELP_DATA;
}
