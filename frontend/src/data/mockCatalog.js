/**
 * Catálogo Maestro Oficial GUIOS+
 * 3 Dimensiones, 18 Factores y 61 Subfactores de la Tesis Doctoral
 * Alineado exactamente a las capturas de pantalla de la interfaz de usuario.
 */
export const MOCK_DIMENSIONES = [
  { id: 1, nombre: "Tecnológica", total_factores: 9 },
  { id: 2, nombre: "Organizacional", total_factores: 8 },
  { id: 3, nombre: "Económica", total_factores: 1 },
];

export const MOCK_FACTORES = [
  // 1. Compatibilidad
  {
    id: 1,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Compatibilidad",
    descripcion: "Capacidad del software FLOSS para coexistir e interactuar con la infraestructura existente.",
    IL: 3,
    IE: 3,
    IS: 3,
    IL_dec: "0.92",
    IE_dec: "0.88",
    ID: 4, // 4 · Fundamental en la captura
    IR: "3 · Importante",
    alcance: "Externo",
    relevante: true,
    evidencia_count: 18,
    citas_acumuladas: 146,
    articulos: [
      {
        fuente: "Scopus",
        titulo: "Compatibilidad in open source learning platforms: a systematic review",
        autores: "Al-Ajlan; Costello",
        meta: "2025 · 51 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "FLOSS adoption and compatibilidad in higher education",
        autores: "Martin, J.; Kumar, R.",
        meta: "2023 · 34 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Evaluating Moodle for institutional digital transformation",
        autores: "Garcia, P.; Hill, A.",
        meta: "2021 · 26 citas",
      },
    ],
  },
  // 2. Personalización
  {
    id: 2,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Personalización",
    descripcion: "Facilidad para modificar, extender y adaptar el software a necesidades particulares.",
    IL: 4,
    IE: 3,
    IS: 3,
    IL_dec: "0.81",
    IE_dec: "0.78",
    ID: 3, // 3 · Importante
    IR: "3 · Importante",
    alcance: "Externo",
    relevante: true,
    evidencia_count: 10,
    citas_acumuladas: 98,
    articulos: [
      {
        fuente: "Scopus",
        titulo: "Modularity and customization capabilities in academic LMS ecosystems",
        autores: "Neira & Benavides",
        meta: "2024 · 42 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Open source software extensibility through plugins: empirical evaluation",
        autores: "Kim, D.; Alvarez, C.",
        meta: "2022 · 31 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Source code adaptation practices in Latin American higher education",
        autores: "Mora, S.; Silva, J.",
        meta: "2021 · 25 citas",
      },
    ],
  },
  // 3. Prueba
  {
    id: 3,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Prueba",
    descripcion: "Facilidad para desplegar, instalar y evaluar preliminarmente el software.",
    IL: 3,
    IE: 3,
    IS: 3,
    IL_dec: "0.74",
    IE_dec: "0.70",
    ID: 2, // 2 · Opcional
    IR: "2 · Opcional",
    alcance: "Externo",
    relevante: true,
    evidencia_count: 10,
    citas_acumuladas: 84,
    articulos: [
      {
        fuente: "IEEE Xplore",
        titulo: "Evaluation and sandbox deployment methodologies for FLOSS platforms",
        autores: "Rea Sánchez, V. H.",
        meta: "2023 · 38 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Pilot deployment frameworks for institutional educational software",
        autores: "Gomez, L.; Torres, M.",
        meta: "2022 · 28 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Automated containerized testing in open source adoption pipelines",
        autores: "Fowler, M.; Beck, K.",
        meta: "2021 · 18 citas",
      },
    ],
  },
  // 4. Fiabilidad
  {
    id: 4,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Fiabilidad",
    descripcion: "Estabilidad, madurez, control de accesos e historial de seguridad.",
    IL: 3,
    IE: 3,
    IS: 3,
    IL_dec: "0.90",
    IE_dec: "0.86",
    ID: 4, // 4 · Fundamental
    IR: "3 · Importante",
    alcance: "Externo",
    relevante: true,
    evidencia_count: 15,
    citas_acumuladas: 132,
    articulos: [
      {
        fuente: "Scopus",
        titulo: "Security audit and vulnerability mitigation in enterprise open source software",
        autores: "Al-Banna; Wang et al.",
        meta: "2024 · 58 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Long-term stability and fault tolerance in critical FLOSS deployments",
        autores: "Chen, H.; Silva, R.",
        meta: "2023 · 44 citas",
      },
      {
        fuente: "IEEE Xplore",
        titulo: "Role-based access control compliance in open source web platforms",
        autores: "Sandhu, R.; Ferraiolo, D.",
        meta: "2022 · 30 citas",
      },
    ],
  },
  // 5. Reusabilidad
  {
    id: 5,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Reusabilidad",
    descripcion: "Capacidad de emplear el software o sus bibliotecas en otras soluciones.",
    IL: 2,
    IE: 3,
    IS: 2,
    IL_dec: "0.55",
    IE_dec: "0.52",
    ID: 1, // 1 · Irrelevante
    IR: "1 · Irrelevante",
    alcance: "Externo",
    relevante: false,
    evidencia_count: 7,
    citas_acumuladas: 45,
    articulos: [
      {
        fuente: "ACM Digital Library",
        titulo: "Software reuse and component-based architectures in educational FLOSS",
        autores: "Gonzalez-Barahona, J.",
        meta: "2022 · 22 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Code modularity and cross-project reuse patterns in open source",
        autores: "Robles, G.; Perez, A.",
        meta: "2021 · 15 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Open source software library reuse: benefits and licensing obstacles",
        autores: "Krueger, C. W.",
        meta: "2020 · 8 citas",
      },
    ],
  },
  // 6. Usabilidad
  {
    id: 6,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Usabilidad",
    descripcion: "Calidad de interfaz gráfica, curva de aprendizaje y satisfacción de usuario.",
    IL: 2,
    IE: 3,
    IS: 3,
    IL_dec: "0.89",
    IE_dec: "0.81",
    ID: 3, // 3 · Importante
    IR: "3 · Importante",
    alcance: "Externo",
    relevante: true,
    evidencia_count: 21,
    citas_acumuladas: 165,
    articulos: [
      {
        fuente: "Scopus",
        titulo: "UX benchmarks and user adoption barriers in open source platforms",
        autores: "Nielsen, J.; Crowston",
        meta: "2025 · 64 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Heuristic evaluation and accessibility compliance in modern LMS",
        autores: "Fernandez, E.; Morales, S.",
        meta: "2024 · 52 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Comparative usability test: Canvas vs Moodle in university environments",
        autores: "Raza, A.; Capretz, L. F.",
        meta: "2023 · 49 citas",
      },
    ],
  },
  // 7. Mantenibilidad
  {
    id: 7,
    dimension_id: 1,
    dimension: "Tecnológica",
    nombre: "Mantenibilidad",
    descripcion: "Grado de actividad y continuidad del desarrollo y mantenimiento por la comunidad.",
    IL: 3,
    IE: 3,
    IS: 3,
    IL_dec: "0.76",
    IE_dec: "0.71",
    ID: 2, // 2 · Opcional
    IR: "2 · Opcional",
    alcance: "Externo",
    relevante: true,
    evidencia_count: 9,
    citas_acumuladas: 71,
    articulos: [
      {
        fuente: "OpenAlex",
        titulo: "Community health and commit cadence in long-term FLOSS maintenance",
        autores: "Mockus, A.; Herbsleb",
        meta: "2023 · 35 citas",
      },
      {
        fuente: "IEEE Xplore",
        titulo: "Refactoring trends and technical debt management in open source projects",
        autores: "Spinellis, D.; Vlachos",
        meta: "2022 · 24 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Software longevity: predicting sustainability in large community projects",
        autores: "Coelho, J.; Valente, M. T.",
        meta: "2021 · 12 citas",
      },
    ],
  },
  // 8. Formación
  {
    id: 10,
    dimension_id: 2,
    dimension: "Organizacional",
    nombre: "Formación",
    descripcion: "Habilidades técnicas del personal de la organización y planes formativos.",
    IL: 4,
    IE: 3,
    IS: 3,
    IL_dec: "0.69",
    IE_dec: "0.74",
    ID: 3, // 3 · Importante
    IR: "3 · Importante",
    alcance: "Interno",
    relevante: true,
    evidencia_count: 9,
    citas_acumuladas: 88,
    articulos: [
      {
        fuente: "IEEE Xplore",
        titulo: "Training and skills development for staff transitioning to FLOSS systems",
        autores: "Rea-Sánchez & Benavides",
        meta: "2024 · 44 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Capacity building strategies for institutional open source adoption",
        autores: "Lopez, K.; Duran, F.",
        meta: "2023 · 29 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Organizational readiness and e-learning training pathways for educators",
        autores: "Garrison, D. R.; Kanuka, H.",
        meta: "2022 · 15 citas",
      },
    ],
  },
  // 9. Soporte
  {
    id: 16,
    dimension_id: 2,
    dimension: "Organizacional",
    nombre: "Soporte",
    descripcion: "Disponibilidad de soporte por comunidad, consultoría comercial o equipo interno.",
    IL: 4,
    IE: 3,
    IS: 3,
    IL_dec: "0.84",
    IE_dec: "0.79",
    ID: 4, // 4 · Fundamental
    IR: "3 · Importante",
    alcance: "Interno", // Select con Interno en la captura
    relevante: true,
    evidencia_count: 14,
    citas_acumuladas: 142,
    articulos: [
      {
        fuente: "Scopus",
        titulo: "Community response time vs commercial support SLAs in FLOSS adoption",
        autores: "Lakhani, K.; von Hippel",
        meta: "2024 · 72 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Vendor ecosystem and institutional support readiness for open platforms",
        autores: "Fitzgerald, B.; Feller, J.",
        meta: "2023 · 48 citas",
      },
      {
        fuente: "IEEE Xplore",
        titulo: "Assessing hybrid support models in enterprise educational technologies",
        autores: "Ven, K.; Verelst, J.",
        meta: "2022 · 22 citas",
      },
    ],
  },
  // 10. Coste total de propiedad
  {
    id: 18,
    dimension_id: 3,
    dimension: "Económica",
    nombre: "Coste total de propiedad",
    descripcion: "Evaluación del TCO considerando costes de licencia, implantación y soporte.",
    IL: 4,
    IE: 3,
    IS: 3,
    IL_dec: "0.87",
    IE_dec: "0.82",
    ID: 2, // 2 · Opcional
    IR: "2 · Opcional",
    alcance: "Interno",
    relevante: true,
    evidencia_count: 13,
    citas_acumuladas: 110,
    articulos: [
      {
        fuente: "IEEE Xplore",
        titulo: "Total cost of ownership models in higher education open source migrations",
        autores: "Wheeler, D. A.; Gartner",
        meta: "2023 · 56 citas",
      },
      {
        fuente: "Scopus",
        titulo: "Comparative economic analysis of proprietary vs open source institutional licensing",
        autores: "Smith, R.; Johnson, P.",
        meta: "2022 · 38 citas",
      },
      {
        fuente: "OpenAlex",
        titulo: "Hidden costs in migration from Blackboard to Moodle: a multi-year audit",
        autores: "Ramirez, G.; Ortiz, V.",
        meta: "2021 · 16 citas",
      },
    ],
  },
];

export const MOCK_SUBFACTORES = {
  // Factor 1: Compatibilidad (8 subfactores)
  1: [
    { codigo: "SF-01", descripcion: "Una empresa proporciona una infraestructura de nube lista para usar para este software.", calificacion: 4, observacion: "MoodleCloud y partners ofrecen entornos listos." },
    { codigo: "SF-02", descripcion: "Los programas informáticos pueden exportar formatos propietarios.", calificacion: 3, observacion: "Exporta SCORM, IMS-CP y formatos estándar." },
    { codigo: "SF-03", descripcion: "El software interactúa y se integra con el software propietario existente.", calificacion: 4, observacion: "Integración con MS Office 365, Google Workspace y LDAP." },
    { codigo: "SF-04", descripcion: "El software está certificado para operar en su nicho de mercado.", calificacion: 4, observacion: "Certificación oficial LTI 1.3 de IMS Global." },
    { codigo: "SF-05", descripcion: "El software es compatible con los casos de uso y las funcionalidades más comunes.", calificacion: 4, observacion: "Cubre evaluaciones, foros, cuestionarios y tareas." },
    { codigo: "SF-06", descripcion: "El software es compatible con múltiples componentes de hardware.", calificacion: 3, observacion: "Compatible con arquitecturas x86 y ARM." },
    { codigo: "SF-07", descripcion: "El software utiliza formatos estándar.", calificacion: 4, observacion: "Uso riguroso de HTML5, UTF-8 y JSON." },
    { codigo: "SF-08", descripcion: "El software es compatible con varios sistemas operativos diferentes (el software es multiplataforma).", calificacion: 3, observacion: "Funciona sobre Linux, Windows Server y macOS." },
  ],
  // Factor 2: Personalización (6 subfactores)
  2: [
    { codigo: "SF-09", descripcion: "El acceso al código fuente es un incentivo para la organización.", calificacion: 4, observacion: "Permite auditorías y personalizaciones institucionales." },
    { codigo: "SF-10", descripcion: "El software se puede ampliar fácilmente para satisfacer las necesidades de la organización modificando el código fuente.", calificacion: 3, observacion: "" },
    { codigo: "SF-11", descripcion: "Las innovaciones se introducen en el software a un ritmo rápido.", calificacion: 4, observacion: "Ciclo de releases mayores semestrales." },
    { codigo: "SF-12", descripcion: "El software es fácil de personalizar sin necesidad de actualizar el código fuente (fácil de personalizar desde el panel de control).", calificacion: 4, observacion: "" },
    { codigo: "SF-13", descripcion: "El software soporta nuevas funciones a través de módulos (el software es modular).", calificacion: 4, observacion: "Más de 2000 plugins en el directorio oficial." },
    { codigo: "SF-14", descripcion: "Hay un repositorio público de extensiones para este software.", calificacion: 4, observacion: "Moodle Plugins Directory." },
  ],
  // Factor 3: Prueba (1 subfactor)
  3: [
    { codigo: "SF-15", descripcion: "El software es fácil de desplegar y de probar (fácil de instalar y de probar).", calificacion: 4, observacion: "Disponibilidad en contenedores Docker y Bitnami." },
  ],
  // Factor 4: Fiabilidad (5 subfactores)
  4: [
    { codigo: "SF-16", descripcion: "El software tiene un buen historial en cuanto a errores de seguridad (el software es seguro).", calificacion: 3, observacion: "" },
    { codigo: "SF-17", descripcion: "El software es fiable y estable.", calificacion: 4, observacion: "Madurez de más de 20 años en producción." },
    { codigo: "SF-18", descripcion: "El software es más flexible que la solución propietaria.", calificacion: 4, observacion: "" },
    { codigo: "SF-19", descripcion: "El software es más confiable que la solución propietaria.", calificacion: 3, observacion: "" },
    { codigo: "SF-20", descripcion: "El programa proporciona una amplia variedad de funciones de control de acceso.", calificacion: 4, observacion: "RBAC granular con roles y capacidades." },
  ],
  // Factor 5: Reusabilidad (2 subfactores)
  5: [
    { codigo: "SF-21", descripcion: "La licencia permite extensiones propietarias.", calificacion: 2, observacion: "GPL v3 restringe redistribuciones propietarias sin código." },
    { codigo: "SF-22", descripcion: "El software se ofrece como una biblioteca / marco de trabajo.", calificacion: 3, observacion: "" },
  ],
  // Factor 6: Usabilidad (4 subfactores)
  6: [
    { codigo: "SF-23", descripcion: "El software proporciona una interfaz gráfica de usuario (GUI).", calificacion: 4, observacion: "Interfaz responsiva moderna en Moodle 4.x." },
    { codigo: "SF-24", descripcion: "El software es más fácil de usar que la alternativa propietaria.", calificacion: 2, observacion: "Competidores propietarios como Canvas tienen interfaz más simple." },
    { codigo: "SF-25", descripcion: "El software es fácil de aprender.", calificacion: 2, observacion: "Curva de aprendizaje media para docentes nuevos." },
    { codigo: "SF-26", descripcion: "El usuario está descontento con el software propietario.", calificacion: 4, observacion: "Altos costes de licencias privativas." },
  ],
  // Factor 7: Mantenibilidad (1 subfactor)
  7: [
    { codigo: "SF-27", descripcion: "El software es mantenido activamente por los desarrolladores.", calificacion: 4, observacion: "Moodle HQ publica commits diarios." },
  ],
  // Factor 10: Formación (4 subfactores)
  10: [
    { codigo: "SF-41", descripcion: "La adopción de este software permite a los usuarios mejorar las habilidades técnicas de TI.", calificacion: 4, observacion: "" },
    { codigo: "SF-42", descripcion: "El personal de la organización puede aprender fácilmente por sí mismo a utilizar este software.", calificacion: 2, observacion: "Requiere inducción guiada." },
    { codigo: "SF-43", descripcion: "El personal de la organización está capacitado para resolver problemas tecnológicos.", calificacion: 3, observacion: "" },
    { codigo: "SF-44", descripcion: "Los planes de entrenamiento de este software están disponibles.", calificacion: 4, observacion: "Cursos de Moodle Academy gratuitos." },
  ],
  // Factor 16: Soporte (6 subfactores)
  16: [
    { codigo: "SF-52", descripcion: "El soporte de la comunidad para este software está disponible.", calificacion: 4, observacion: "Foros activos en moodle.org con millones de posts." },
    { codigo: "SF-53", descripcion: "Soporte de expertos y consultores externos para consultas específicas está disponible.", calificacion: 4, observacion: "" },
    { codigo: "SF-54", descripcion: "El soporte comercial de este software está disponible 24/7/365.", calificacion: 4, observacion: "Moodle Certified Partners a nivel mundial." },
    { codigo: "SF-55", descripcion: "Es fácil contratar personal informático en la comunidad que conozca este software.", calificacion: 3, observacion: "" },
    { codigo: "SF-56", descripcion: "Hay desarrolladores en su organización que saben cómo desarrollar este software.", calificacion: 2, observacion: "Se requiere capacitar al equipo interno en PHP/Moodle." },
    { codigo: "SF-57", descripcion: "Soporte comercial para la personalización de software está disponible.", calificacion: 4, observacion: "" },
  ],
  // Factor 18: Coste total de propiedad (2 subfactores)
  18: [
    { codigo: "SF-60", descripcion: "Es poco probable que haya costos ocultos al adoptar este software.", calificacion: 3, observacion: "Costes previsibles de alojamiento y mantenimiento." },
    { codigo: "SF-61", descripcion: "La adopción de este software es menos costosa que la alternativa propietaria (patentada).", calificacion: 4, observacion: "Ahorro del 65% en licencias de Blackboard." },
  ],
};
