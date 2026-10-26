# GUIOSAD — Sistema de Apoyo a las Decisiones para la Adopción de Software Libre

**Versión:** 0.1.2  
**Basado en:** Tesis Doctoral *"Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas"*  
**Autor de la tesis:** Dr. Víctor Hugo Rea Sánchez  
**Universidad:** Universidad de Sevilla — Escuela Técnica Superior de Ingeniería Informática  
**Licencia del prototipo:** AGPL-3.0 / 2-BSD

---

## Tabla de Contenidos

1. [Descripción del Sistema](#1-descripción-del-sistema)
2. [Para qué sirve y a quiénes va dirigido](#2-para-qué-sirve-y-a-quiénes-va-dirigido)
3. [El problema que resuelve](#3-el-problema-que-resuelve)
4. [La guía GUIOS — Base metodológica](#4-la-guía-guios--base-metodológica)
5. [Modelo matemático](#5-modelo-matemático)
6. [Flujo de trabajo en 6 pasos](#6-flujo-de-trabajo-en-6-pasos)
7. [Arquitectura del proyecto](#7-arquitectura-del-proyecto)
8. [Instalación y ejecución](#8-instalación-y-ejecución)
9. [Estructura de archivos](#9-estructura-de-archivos)
10. [Documentación adicional](#10-documentación-adicional)

---

## 1. Descripción del Sistema

**GUIOSAD** (*Guía para la Adopción de Software Libre — Sistema de Apoyo a las Decisiones*) es una herramienta interactiva basada en navegador que permite a directivos, responsables de tecnología y administradores de sistemas evaluar de forma sistemática y objetiva si una solución de Software Libre y de Fuentes Abiertas (FLOSS, *Free/Libre Open Source Software*) es viable para ser adoptada en su organización.

El sistema implementa íntegramente la guía metodológica **GUIOS** desarrollada en la tesis doctoral de 2022, que consolida los resultados de una Revisión Sistemática de la Literatura sobre 54 estudios científicos internacionales, una encuesta a 57 expertos en FLOSS de Ecuador y España, y la validación en un caso de estudio real en la Universidad Estatal de Milagro (UNEMI, Ecuador).

---

## 2. Para qué sirve y a quiénes va dirigido

**GUIOSAD sirve para:**

- Evaluar si una organización tiene las condiciones técnicas, organizacionales y económicas necesarias para adoptar un software libre específico.
- Identificar cuáles son los puntos fuertes (Fortalezas y Oportunidades) y los puntos de riesgo (Debilidades y Amenazas) antes de tomar la decisión de migrar.
- Obtener un dictamen estructurado y justificado — Recomendación A, B o C — que respalde la decisión ante la dirección de la organización.
- Registrar los resultados del análisis en una Matriz FODA personalizada para cada evaluación.

**Dirigido a:**

- Responsables del área de Tecnologías de la Información (TI) de organizaciones públicas o privadas.
- Administradores que deben justificar una decisión de cambio de software ante la gerencia.
- Consultores y analistas que acompañan procesos de transformación digital.
- Investigadores y estudiantes que aplican la guía GUIOS en casos de estudio académicos.

No se requiere conocimiento avanzado de informática para utilizarlo. El sistema guía al usuario paso a paso y genera automáticamente todos los cálculos y el dictamen final.

---

## 3. El problema que resuelve

La adopción de software libre en las organizaciones suele llevarse a cabo de forma improvisada y sin un proceso formal, lo que genera problemas recurrentes:

- Incompatibilidad con los formatos de archivos históricos (documentos, hojas de cálculo, bases de datos).
- Costos ocultos en capacitación, soporte técnico y adaptación de infraestructura.
- Resistencia al cambio por parte del personal, sin un plan de gestión del cambio.
- Reversión al software privativo tras pérdidas económicas y de tiempo operacional.

Según el marco legal ecuatoriano (Decreto Presidencial No. 1014 de 2008 y el Código Orgánico de Economía Social del Conocimiento), el uso de software libre es obligatorio en la administración pública, pero la ausencia de una metodología estructurada expone a las instituciones a esos mismos riesgos.

GUIOSAD formaliza este proceso aplicando criterios validados científicamente, evitando que cada organización tenga que "reinventar la rueda" cada vez que evalúa una alternativa de software libre.

---

## 4. La guía GUIOS — Base metodológica

La guía **GUIOS** (*Guía para la Adopción de Software Libre y Fuentes Abiertas*) es el núcleo metodológico del sistema. Fue construida a partir de tres fuentes de evidencia complementarias:

1. **Revisión Sistemática de la Literatura (RSL):** Análisis de 4.429 publicaciones científicas (2008–2019) en IEEE Xplore, ACM Digital Library, Scopus y Web of Science. Tras el proceso de filtrado se seleccionaron 54 estudios primarios de alta calidad que identificaron 22 factores primarios de adopción.

2. **Encuesta a expertos:** Se aplicó un cuestionario estructurado con escala Likert de 4 niveles a 57 expertos en FLOSS de Ecuador y España, con más del 75% con 6 o más años de experiencia en el área. Su evaluación fue utilizada para calcular el indicador de Importancia del Experto (`IE`).

3. **Refinamiento al modelo final:** Los 22 factores primarios fueron depurados y estructurados en 18 factores finales, desglosados a su vez en 61 subfactores redactados como sentencias positivas y verificables.

### Los 18 factores de evaluación organizados por dimensión

| Dimensión | Factores incluidos |
| :--- | :--- |
| **Tecnológica** | Compatibilidad, Fiabilidad, Usabilidad, Personalización, Documentación, Mantenimiento, Prueba, Reutilización, Portabilidad |
| **Organizacional** | Soporte, Formación, Apoyo de la Alta Dirección, Bloqueo de Proveedores, Actitud al Cambio, Centralidad de TI, Casos de Estudio, Tiempo de Adopción, Reingeniería de Procesos |
| **Económica** | Costo Total de Propiedad (TCO), Costos de Licencia, Costos Operacionales, Costos de Soporte |

Cada factor contiene entre 1 y 6 subfactores concretos. Por ejemplo, el factor **Compatibilidad** incluye subfactores como:

- "El software utiliza formatos estándar (ej. ODF)."
- "El software es compatible con los casos de uso y funcionalidades más comunes."
- "El software interactúa y se integra con el software propietario existente."

---

## 5. Modelo matemático

El sistema implementa un conjunto de cinco indicadores de importancia que combinan la evidencia científica con la valoración propia de la organización. Todos los indicadores se expresan en la escala discreta `[1, 4]`:

| Valor | Nivel |
| :---: | :--- |
| 1 | Irrelevante |
| 2 | Opcional |
| 3 | Importante |
| 4 | Fundamental |

### 5.1 Indicadores de Importancia

| Indicador | Nombre | Descripción |
| :---: | :--- | :--- |
| `IE` | Importancia del Experto | Promedio ponderado de la encuesta a 57 expertos en FLOSS. |
| `IL` | Importancia de la Literatura | Calculada por cuartiles de citas y frecuencia de subfactores en los 54 estudios primarios. |
| `IS` | Importancia Sugerida | Combinación matricial de `IE × IL`. Precalculada e incluida en el catálogo de datos. |
| `ID` | Importancia del Decisor | Valoración asignada por el responsable de la organización en el Paso 1. |
| `IR` | Importancia Relativa Final | Cruce matricial de `IS × ID`. Determina si el factor es relevante para el análisis. |

### 5.2 Cálculo de la Importancia Relativa (IR)

La Importancia Relativa se obtiene aplicando la siguiente función de cruce sobre índices ordinales `[0, 3]`:

```
IR_index = floor( (IS_index + ID_index) / 2 )
```

Donde `IS_index` e `ID_index` son los valores ordinales del nivel de importancia
(`0 = Irrelevante`, `1 = Opcional`, `2 = Importante`, `3 = Fundamental`).

La tabla de cruce completa es la siguiente:

```
                      IS  (Importancia Sugerida)
                    ┌──────────────┬──────────┬────────────┬─────────────┐
                    │ Irrelevante  │ Opcional │ Importante │ Fundamental │
         ┌──────────┼──────────────┼──────────┼────────────┼─────────────┤
ID       │Fundamental│   Opcional  │Importante│ Importante │ Fundamental │
(Decisor)│Importante │   Opcional  │ Opcional │ Importante │  Importante │
         │Opcional   │ Irrelevante │ Opcional │  Opcional  │  Importante │
         │Irrelevante│ Irrelevante │Irrelevante│  Opcional  │   Opcional  │
         └──────────┴──────────────┴──────────┴────────────┴─────────────┘
```

Un factor es considerado **relevante** si su `IR` es mayor a Irrelevante (Opcional, Importante o Fundamental).
Solo los factores relevantes pasan al Paso 3 de evaluación de subfactores.

### 5.3 Cálculo de la Ponderación Media (PM)

Para cada factor relevante, el evaluador califica cada uno de sus subfactores con una puntuación `pm_i`.
La ponderación media del factor se calcula como:

```
PM = ( sum(pm_i) para i en [1..n] ) / n

Donde:
  pm_i  =  puntuación del subfactor i
           1 = No cumple el requisito
           2 = Desconozco si cumple el requisito
           3 = Cumple parcialmente el requisito
           4 = Cumple el requisito
  n     =  número total de subfactores del factor evaluado
```

### 5.4 Clasificación en la Matriz FODA

Una vez calculada la `PM`, el factor se clasifica según su Alcance y el umbral fijo de `PM = 3.0`:

```
              PM >= 3.0          PM < 3.0
Interno   →   FORTALEZA          DEBILIDAD
Externo   →   OPORTUNIDAD        AMENAZA
```

- **Factores Internos:** Dependen de la organización adoptante (capacidad de soporte interno, actitud del personal, presupuesto disponible).
- **Factores Externos:** Son características del propio software libre candidato (compatibilidad de formatos, calidad de la documentación, actividad de la comunidad).

### 5.5 Reglas de Recomendación Final (Matriz de Decisión 2021)

El motor de decisión analiza todos los factores evaluados y emite uno de tres dictámenes:

```
Recomendación C  —  ADOPTAR
  Condición: Ningún factor evaluado es Debilidad o Amenaza.
  Resultado: Todos los criterios relevantes son Fortalezas u Oportunidades.
             La adopción es altamente recomendable.

Recomendación B  —  ADOPTAR CON RESERVAS
  Condición: Existen Debilidades o Amenazas, pero únicamente en factores
             cuya IR es OPCIONAL.
  Resultado: La adopción es factible. Se recomienda establecer un plan
             de seguimiento para los criterios con riesgo identificado.

Recomendación A  —  NO ADOPTAR EN EL ESTADO ACTUAL
  Condición: Al menos una Debilidad o Amenaza en un factor con IR
             clasificada como IMPORTANTE o FUNDAMENTAL.
  Resultado: La adopción representa un riesgo grave para la organización.
             Se deben resolver las brechas identificadas antes de proceder.
```

---

## 6. Flujo de trabajo en 6 pasos

El sistema implementa el procedimiento secuencial de GUIOS organizado en tres pantallas:

### Pantalla 1 — Pasos 1 y 2: Selección de Factores Relevantes

**Paso 1 — Asignación de Importancia del Decisor (ID):**
El responsable de la organización revisa la lista de 18 factores y, para cada uno, indica su nivel de importancia usando el control deslizante (escala 1 a 4). El sistema combina automáticamente ese valor con la Importancia Sugerida (`IS`) del modelo y calcula la Importancia Relativa (`IR`) sin intervención manual.

**Paso 2 — Clasificación del Alcance:**
Para cada factor relevante cuyo alcance no está predefinido, el evaluador indica si el criterio es Interno (capacidades de la organización) o Externo (características del software candidato).

### Pantalla 2 — Pasos 3 y 4: Ponderación de Subfactores

**Paso 3 — Evaluación de Subfactores:**
Para cada factor relevante, el evaluador califica individualmente cada uno de sus subfactores según el grado de cumplimiento del software candidato (escala 1 a 4).

**Paso 4 — Cálculo de la Ponderación Media:**
Al presionar Guardar, el sistema calcula automáticamente la `PM` y determina la clasificación FODA del factor.

### Pantalla 3 — Pasos 5 y 6: Resultado y Recomendación

**Paso 5 — Generación de la Matriz FODA:**
Se presenta la tabla consolidada con todos los factores evaluados, su `PM` y su clasificación FODA. Los colores identifican visualmente cada categoría.

**Paso 6 — Emisión del Dictamen:**
Al presionar "Ver recomendación", el motor aplica las reglas de la Matriz de Decisión 2021 y emite la Recomendación A, B o C con su justificación completa.

---

## 7. Arquitectura del proyecto

El proyecto está organizado en tres capas independientes:

### Capa de interfaz — Frontend (`pages/`)

Implementación web modular en HTML, CSS y JavaScript puro, sin frameworks ni dependencias externas. Puede ejecutarse directamente en cualquier navegador moderno.

| Archivo | Propósito |
| :--- | :--- |
| `pages/index.html` | Estructura semántica HTML y modal de ayuda contextual |
| `pages/styles.css` | Diseño visual, paleta de colores y estilos de todos los componentes |
| `pages/dataset.js` | Catálogo completo de los 18 factores y 61 subfactores como objeto JSON |
| `pages/hooks/useGuiosad.js` | Motor de cálculo JavaScript, estado reactivo y reglas de decisión |
| `pages/app.js` | Ensamblador principal que inicializa y conecta todos los componentes |
| `pages/components/tabs.js` | Navegación entre las tres pantallas principales |
| `pages/components/help_modal.js` | Modal de ayuda contextual con instrucciones por paso |
| `pages/components/step1_factors.js` | Pantalla de factores e importancias (Pasos 1 y 2) |
| `pages/components/step2_subfactors.js` | Pantalla de calificación de subfactores (Pasos 3 y 4) |
| `pages/components/step3_foda.js` | Pantalla de resultados FODA y recomendación (Pasos 5 y 6) |

### Capa de lógica de negocio — Backend (`core/`)

Módulo Python que implementa el modelo matemático de GUIOS de forma independiente a la interfaz.

| Archivo | Propósito |
| :--- | :--- |
| `core/models.py` | Tipos, enumeraciones y estructuras de datos del dominio |
| `core/data_loader.py` | Carga y validación de los archivos CSV del catálogo de factores |
| `core/engine.py` | Implementación de las fórmulas IR, PM, clasificación FODA y Recomendación |
| `core/__init__.py` | Punto de entrada del módulo Python |

### Capa de datos (`data/`)

| Archivo | Contenido |
| :--- | :--- |
| `data/guiosad_data.csv` | Catálogo completo: 18 factores, 61 subfactores, IS precalculada y alcance |
| `data/factors.csv` | Lista resumida de los 18 factores con sus dimensiones |
| `data/MATRIZ RECOMENDACION GUIOSAD 2021.xlsx` | Matriz de decisión original de la tesis (referencia) |

---

## 8. Instalación y ejecución

### Opción 1: Abrir directamente en el navegador (sin instalación)

Esta es la forma más rápida. El frontend no requiere ninguna dependencia externa:

1. Navegar hasta la carpeta `pages/` del proyecto.
2. Hacer doble clic sobre el archivo `index.html`.
3. El sistema se abrirá en el navegador predeterminado y estará listo para usar.

### Opción 2: Servidor local con Python (recomendado para desarrollo)

```bash
cd pages
python -m http.server 8000
```

Abrir en el navegador: `http://localhost:8000`

### Opción 3: Módulo Python puro

Para utilizar el motor de cálculo desde Python sin interfaz gráfica:

```bash
pip install -r requirements.txt
python guiosad.py
```

**Requisitos:** Python 3.9 o superior. La única dependencia de producción es `pandas >= 2.0`.

---

## 9. Estructura de archivos

```
SISTEMA-EJEMPLO/
├── README.md                                    Este archivo
├── requirements.txt                             Dependencias Python
├── .gitignore
├── guiosad.py                                   Adaptador Python que usa core/
│
├── core/                                        Motor de cálculo en Python
│   ├── __init__.py
│   ├── models.py
│   ├── data_loader.py
│   └── engine.py
│
├── data/                                        Catálogo de evaluación
│   ├── guiosad_data.csv
│   ├── factors.csv
│   └── MATRIZ RECOMENDACION GUIOSAD 2021.xlsx
│
├── pages/                                       Interfaz web modular
│   ├── index.html
│   ├── styles.css
│   ├── dataset.js
│   ├── app.js
│   ├── hooks/
│   │   └── useGuiosad.js
│   └── components/
│       ├── tabs.js
│       ├── help_modal.js
│       ├── step1_factors.js
│       ├── step2_subfactors.js
│       └── step3_foda.js
│
└── docs/
    └── tesis/
        ├── README.md
        ├── README_01_Introduccion.md
        ├── README_02_FLOSS_y_Licencias.md
        ├── README_03_Motivacion_y_Estado_del_Arte.md
        ├── README_04_Revision_Sistematica_y_Factores.md
        ├── README_05_Guia_GUIOS_Metodologia.md
        ├── README_06_Validacion_GUIOS_PRO_Caso_Estudio.md
        ├── README_07_Conclusiones_y_Trabajos_Futuros.md
        └── README_08_Apendices_y_Bibliografia.md
```

---

## 10. Documentación adicional

La carpeta `docs/tesis/` contiene la documentación completa de la tesis doctoral organizada en 8 módulos. Para comprender el modelo y las reglas del sistema se recomienda consultar:

- [`README_05_Guia_GUIOS_Metodologia.md`](docs/tesis/README_05_Guia_GUIOS_Metodologia.md) — Construcción de GUIOS, los 61 subfactores y el sistema de indicadores `IE`, `IL`, `IS`, `ID`, `IR`.
- [`README_06_Validacion_GUIOS_PRO_Caso_Estudio.md`](docs/tesis/README_06_Validacion_GUIOS_PRO_Caso_Estudio.md) — Flujo de trabajo en 6 pasos, tipos de recomendación A/B/C y el caso de estudio en la UNEMI con LibreOffice.
- [`README_04_Revision_Sistematica_y_Factores.md`](docs/tesis/README_04_Revision_Sistematica_y_Factores.md) — Los 22 factores primarios identificados en la literatura científica y su clasificación por dimensión.

---

*Este proyecto es una reimplementación modular del prototipo GUIOS PRO original (Python 3 + Flexx v0.80), separando el frontend en componentes web estándar y el motor de cálculo en un módulo Python reutilizable, manteniendo íntegra la lógica matemática y las reglas de decisión de la tesis doctoral.*
