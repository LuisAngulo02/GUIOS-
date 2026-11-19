# Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas

**Tesis Doctoral**  
**Autor:** Víctor Hugo Rea Sánchez (`vreas@unemi.edu.ec`)  
**Directores:** Dr. Pablo Neira Ayuso y Dr. David Benavides Cuevas  
**Institución:** Universidad de Sevilla — Escuela Técnica Superior de Ingeniería Informática (ETSI Informática), Departamento de Lenguajes y Sistemas Informáticos  
**Lugar y Fecha:** Sevilla, España — Junio de 2022  
**Financiación:** Programa de Becas de la Universidad Estatal de Milagro (UNEMI, Ecuador); Proyectos OPHELIA (RTI2018-101204-B-C22 / FEDER-Ministerio de Ciencia e Innovación), COPERNICA (Junta de Andalucía P20_01224) y METAMORFOSIS (FEDER_US-1381375).

---

## Resumen de la Tesis

La adopción de software libre y de fuentes abiertas (**FLOSS**, *Free/Libre Open Source Software*) se ha convertido en una opción estratégica tanto para instituciones públicas como privadas debido a la flexibilidad, estabilidad e independencia tecnológica que ofrece. Sin embargo, en la mayoría de las organizaciones, los procesos de evaluación y adopción de FLOSS se llevan a cabo de forma *ad-hoc*, sin seguir metodologías ni directrices formales. Esta carencia expone a las organizaciones a graves riesgos, tales como incompatibilidad de formatos de datos, costos ocultos de migración, falta de documentación o soporte técnico, e intensa resistencia al cambio por parte de los usuarios.

Para resolver esta problemática, esta tesis doctoral realiza una **Revisión Sistemática de la Literatura (RSL)** examinando publicaciones científicas de catorce años (2008–2019), filtrando un corpus inicial de 4.429 estudios hasta seleccionar **54 estudios primarios** de alta calidad. A partir de este estudio, se identifican y caracterizan **22 factores primarios de adopción** estructurados en tres dimensiones esenciales:
1. **Dimensión Tecnológica** (9 factores: *Compatibilidad, Fiabilidad, Usabilidad, Personalización, Documentación, Mantenimiento, Prueba, Reutilización, Portabilidad*).
2. **Dimensión Organizacional** (9 factores: *Soporte, Formación, Apoyo de la Alta Dirección, Bloqueo de Proveedores, Actitud hacia el Cambio, Casos de Estudio de Adopción, Tiempo para Adoptar, Centralidad de TI, Reingeniería de Procesos*).
3. **Dimensión Económica** (4 factores: *Costo Total de Propiedad [TCO], Costos de Licencia, Costos Operacionales, Costos de Soporte*).

Posteriormente, con el fin de alcanzar una mayor granularidad en la evaluación, los factores se desglosan en **61 subfactores**. Se diseña y aplica una encuesta a **57 expertos en FLOSS** de Ecuador y España para valorar cuantitativa y cualitativamente la relevancia de estos subfactores. Integrando la evidencia de la literatura y el criterio de los expertos, se formulan **cinco indicadores de importancia** ($IE, IL, IS, ID, IR$) y se construye la guía **GUIOS**, una metodología ágil paso a paso para la evaluación de adopción FLOSS estructurada mediante una matriz **FODA/DAFO**. 

Para automatizar este proceso, se desarrolló el prototipo multiplataforma **GUIOS PRO** (construido en Python con el marco Flexx v0.80 bajo licencia libre AGPL3/2-BSD) y se realizó un **piloto de caso de estudio real** en la Universidad Estatal de Milagro (UNEMI) evaluando la adopción de la suite **LibreOffice** frente a software privativo.

---

## Abstract

Nowadays, free libre open source software (FLOSS) is becoming a strategic option for any organization in the public and private sector. Some countries have chosen to implement policies for the use of FLOSS, due to the flexibility that this type of technology offers. The scope of FLOSS has many benefits and that is why many governments and organizations have focused on its adoption.

The lack of well-defined guidelines for those responsible for an information technology (IT) area can jeopardize the FLOSS adoption process. FLOSS adoption procedures are developed ad-hoc in every organization, hence, leading to potential wheel reinvention situations. It is necessary to define well the steps to follow in a FLOSS adoption process, in order to avoid an inadequate selection of the software in question. First of all, it is crucial to identify the factors that influence and determine the adoption, to be a determining basis for the design of a methodology to guide them in the process.

To reach this point, we analyzed the existing literature using systematic review methodologies to make visible the technical, organizational and economic factors to be evaluated in the adoption process. In particular, 22 factors were identified and classified for a better interpretation of the results. Furthermore, a total of 61 sub-factors were identified. Measurement indicators were defined to assess these factors and sub-factors through a prototype tool called GUIOS PRO. Finally, a pilot case study was conducted at the State University of Milagro (UNEMI) evaluating LibreOffice to validate the guide and software prototype.

---

## Índice General de la Tesis

- [Resumen de la Tesis](#resumen-de-la-tesis)
- [Abstract](#abstract)
- [Capítulo 1: Introducción y Contexto de la Investigación](#capítulo-1-introducción-y-contexto-de-la-investigación)
  - [1. Contexto de la Investigación](#1-contexto-de-la-investigación)
  - [2. Definición del Problema de Investigación](#2-definición-del-problema-de-investigación)
  - [3. Definición Conceptual: Dimensiones, Factores y Subfactores](#3-definición-conceptual-dimensiones-factores-y-subfactores)
  - [4. Resumen de las Contribuciones Científicas de la Tesis](#4-resumen-de-las-contribuciones-científicas-de-la-tesis)
  - [5. Estructura General de la Disertación](#5-estructura-general-de-la-disertación)
- [Capítulo 2: FLOSS en la Actualidad y Marco de Licencias](#capítulo-2-floss-en-la-actualidad-y-marco-de-licencias)
  - [1. Definición Formal de FLOSS](#1-definición-formal-de-floss)
  - [2. Los Movimientos Fundamentales: Software Libre vs. Open Source](#2-los-movimientos-fundamentales-software-libre-vs-open-source)
  - [3. Clasificación de Licencias de Software](#3-clasificación-de-licencias-de-software)
- [Capítulo 3: Motivación y Estado del Arte de la Adopción FLOSS](#capítulo-3-motivación-y-estado-del-arte-de-la-adopción-floss)
  - [1. Motivación y Justificación del Estudio](#1-motivación-y-justificación-del-estudio)
  - [2. Análisis de FLOSS en la Literatura Científica](#2-análisis-de-floss-en-la-literatura-científica)
  - [3. Comparativa de Revisiones de la Literatura Existentes](#3-comparativa-de-revisiones-de-la-literatura-existentes)
  - [4. Comparativa de Metodologías Existentes para la Adopción FLOSS](#4-comparativa-de-metodologías-existentes-para-la-adopción-floss)
- [Capítulo 4: Revisión Sistemática de la Literatura y Taxonomía de Factores](#capítulo-4-revisión-sistemática-de-la-literatura-y-taxonomía-de-factores)
  - [1. Definición del Proceso Sistemático (RSL)](#1-definición-del-proceso-sistemático-rsl)
  - [2. Taxonomía de los 22 Factores Primarios de Adopción](#2-taxonomía-de-los-22-factores-primarios-de-adopción)
  - [3. Desglose Detallado por Dimensión](#3-desglose-detallado-por-dimensión)
  - [4. Clasificación por Tipos de Investigación (Según Wieringa)](#4-clasificación-por-tipos-de-investigación-según-wieringa)
- [Capítulo 5: Elaboración de la Guía GUIOS e Indicadores de Importancia](#capítulo-5-elaboración-de-la-guía-guios-e-indicadores-de-importancia)
  - [1. Proceso Metodológico para la Construcción de GUIOS](#1-proceso-metodológico-para-la-construcción-de-guios)
  - [2. Los 61 Subfactores de Adopción](#2-los-61-subfactores-de-adopción)
  - [3. Estudio Empírico: Encuesta a Expertos en FLOSS](#3-estudio-empírico-encuesta-a-expertos-en-floss)
  - [4. Sistema Integrado de Indicadores de Importancia](#4-sistema-integrado-de-indicadores-de-importancia)
  - [5. Clasificación de Factores y Matriz FODA / DAFO](#5-clasificación-de-factores-y-matriz-foda--dafo)
- [Capítulo 6: Herramienta GUIOS PRO y Validación en Caso de Estudio Real](#capítulo-6-herramienta-guios-pro-y-validación-en-caso-de-estudio-real)
  - [1. El Flujo de Trabajo Metodológico de GUIOS (6 Pasos)](#1-el-flujo-de-trabajo-metodológico-de-guios-6-pasos)
  - [2. Arquitectura del Prototipo Automatizado GUIOS PRO](#2-arquitectura-del-prototipo-automatizado-guios-pro)
  - [3. Tipos de Recomendaciones Finales Emitidas por GUIOS PRO](#3-tipos-de-recomendaciones-finales-emitidas-por-guios-pro)
  - [4. Piloto de Validación Real en la Universidad Estatal de Milagro (UNEMI)](#4-piloto-de-validación-real-en-la-universidad-estatal-de-milagro-unemi)
- [Capítulo 7: Conclusiones, Limitaciones y Trabajos Futuros](#capítulo-7-conclusiones-limitaciones-y-trabajos-futuros)
  - [1. Conclusiones Principales de la Tesis](#1-conclusiones-principales-de-la-tesis)
  - [2. Debate Crítico, Limitaciones y Amenazas a la Validez](#2-debate-crítico-limitaciones-y-amenazas-a-la-validez)
  - [3. Líneas de Investigación y Trabajos Futuros](#3-líneas-de-investigación-y-trabajos-futuros)
- [Parte V: Apéndices y Bibliografía Relevante](#parte-v-apéndices-y-bibliografía-relevante)
  - [Apéndice A: Encuesta sobre Características de Adopción de FLOSS](#apéndice-a-encuesta-sobre-características-de-adopción-de-floss)
  - [Bibliografía Destacada de la Tesis Doctoral](#bibliografía-destacada-de-la-tesis-doctoral)

---

# Capítulo 1: Introducción y Contexto de la Investigación

**Parte I: Preliminares**

---

## 1. Contexto de la Investigación

Las Tecnologías de la Información y Comunicación (TIC) están experimentando un aumento constante en su demanda a nivel mundial. Este fenómeno afecta de manera particular a países en vías de desarrollo, los cuales enfrentan la desventaja del acceso limitado a estos sistemas a causa de los altos costes de licencias de software e infraestructura impuestos por monopolios tecnológicos tradicionales.

Frente a esta situación, la adopción de **FLOSS** (*Free/Libre Open Source Software*) se presenta como una alternativa estratégica para organizaciones tanto públicas como privadas, garantizando:
* **Independencia tecnológica** respecto a proveedores específicos (*Vendor Lock-in*).
* **Soberanía digital y seguridad** en el manejo de datos e infraestructura.
* **Fomento del desarrollo local** e inclusión digital.
* **Optimización y racionalización del gasto público**.

### 1.1. Situación Actual de la Adopción de FLOSS en Latinoamérica y Ecuador

En América Latina, diversas administraciones públicas han impulsado políticas orientadas al uso preferente de software libre. En el caso específico de **Ecuador**:
1. **Decreto Presidencial No. 1014 (10 de abril de 2008):** Emitido durante el gobierno del presidente Rafael Correa Delgado, estableció como política pública el uso obligatorio de software libre en la Administración Pública Central del país.
2. **Código Orgánico de Economía Social de los Conocimientos, Creatividad e Innovación (Código Ingenios):** Dio continuidad y rango de ley al marco normativo para la soberanía tecnológica y el software libre.
3. **Resultados de Implementación (Encuesta SNAP 2017):**
   * **Servicios Estatales / Sistemas Centrales:** Se alcanzó un **64% de adopción de software libre** en servidores, bases de datos y plataformas de atención a la ciudadanía (e.g., portales del SRI, Ministerio de Finanzas, sistema QUIPUX).
   * **Entorno de Escritorio / Ofimática:** Se registró un **43% de instalación de software libre** en las computadoras de los servidores públicos (correo electrónico, hojas de cálculo, procesadores de texto, diseño gráfico).

Experiencias internacionales similares en países europeos como Bélgica, Holanda y Suecia demuestran que el uso de estándares abiertos facilita la interoperabilidad entre instituciones públicas.

---

## 2. Definición del Problema de Investigación

A pesar de los claros beneficios del software libre, el proceso de adopción en las organizaciones suele ser una actividad compleja y propensa a errores. La **ausencia de un procedimiento formal y estandarizado** ocasiona que cada institución desarrolle procesos de migración *ad-hoc*, derivando en situaciones de "reinvención de la rueda".

Entre los principales riesgos y amenazas generados por la falta de una guía estructurada se encuentran:
* **Incompatibilidad de formatos de datos:** Imposibilidad de importar o procesar archivos históricos creados con software privativo.
* **Costos ocultos:** Gastos no contemplados en capacitación, soporte técnico o adaptación de infraestructura.
* **Falta de documentación:** Ausencia de manuales adecuados para usuarios finales y administradores de sistemas.
* **Resistencia al cambio:** Rechazo del personal frente a la modificación de sus herramientas de trabajo habituales.
* **Fracaso de la migración:** Reversión hacia el software privativo tras pérdidas financieras y de tiempo operacional.

---

## 3. Definición Conceptual: Dimensiones, Factores y Subfactores

Para sistematizar el análisis de adopción, la tesis adopta y adapta la terminología de ingeniería de software inspirada en Petersen et al.:
* **Dimensión:** Conjunto de factores homogéneos que cubren un área temática específica del proceso de adopción (Tecnológica, Organizacional, Económica).
* **Factor:** Característica o criterio relevante que influye directa o indirectamente en la toma de decisiones para la selección de software (ej. *Compatibilidad, Soporte, TCO*).
* **Subfactor:** Propiedad concreta y de nivel fino de granularidad dentro de un factor, formulada como una sentencia positiva e inequívoca para facilitar su evaluación precisa (ej. *"El software es compatible con los formatos de archivos existentes en la organización"*).

---

## 4. Resumen de las Contribuciones Científicas de la Tesis

Las principales aportaciones derivadas de este trabajo de investigación son:

1. **Taxonomía Integrada de Adopción:** Identificación y clasificación de **3 dimensiones, 22 factores primarios y 61 subfactores** a partir de una Revisión Sistemática de la Literatura (RSL) sobre 54 estudios seleccionados.
2. **Sistema de Indicadores de Importancia:** Definición formal de **5 indicadores** ($IE, IL, IS, ID, IR$) que unifican cuantitativamente la evidencia de la literatura científica con la percepción de expertos y la necesidad del decisor organizacional.
3. **Estudio Empírico con Expertos:** Elaboración y aplicación de una encuesta estructurada a **57 expertos en FLOSS** de Ecuador y España para ponderar la relevancia práctica de los subfactores.
4. **Diseño de la Guía GUIOS:** Formulación de un marco metodológico paso a paso basado en la evaluación de subfactores y el mapeo en una **matriz FODA/DAFO** (Fortalezas, Oportunidades, Debilidades, Amenazas).
5. **Desarrollo del Prototipo GUIOS PRO:** Creación de una herramienta ejecutable multiplataforma desarrollada en **Python 3 con el marco Flexx v0.80** (distribuida bajo licencias libres AGPL3 / 2-BSD) para automatizar la evaluación.
6. **Piloto de Validación en Entorno Real:** Ejecución de un estudio de caso en la **Universidad Estatal de Milagro (UNEMI, Ecuador)** evaluando la factibilidad de adopción de la suite ofimática **LibreOffice**.

---

## 5. Estructura General de la Disertación

La memoria doctoral se organiza en cinco partes principales:
* **Parte I: Preliminares (Capítulo 1):** Introducción, marco contextual, motivación y justificación.
* **Parte II: Antecedentes (Capítulos 2 y 3):** Marco teórico sobre FLOSS, modelo de licencias y revisión del estado del arte en Scopus.
* **Parte III: Contribuciones (Capítulos 4, 5 y 6):** 
  * Capítulo 4: Revisión sistemática de la literatura y 22 factores de adopción.
  * Capítulo 5: Elaboración de la guía GUIOS e indicadores de importancia.
  * Capítulo 6: Desarrollo de GUIOS PRO y caso de estudio en la UNEMI.
* **Parte IV: Observaciones Finales (Capítulo 7):** Conclusiones, limitaciones, amenazas a la validez y trabajos futuros.
* **Parte V: Apéndices:** Apéndice A (Encuesta a expertos) y Bibliografía general.

---

# Capítulo 2: FLOSS en la Actualidad y Marco de Licencias

**Parte II: Antecedentes**

---

## 1. Definición Formal de FLOSS

El término **FLOSS** (*Free/Libre/Open Source Software*) se utiliza como un hiperónimo para englobar el software cuyo código fuente es libremente accesible para el público. Este término reúne las filosofías de dos movimientos principales:
1. **Free Software Movement (Software Libre):** Impulsado desde 1983 por **Richard Stallman** a través de la **Free Software Foundation (FSF)**.
2. **Open Source Movement (Código Abierto):** Establecido a finales de los años 90 por Eric Raymond, Bruce Perens y la **Open Source Initiative (OSI)**.

Aunque ambos movimientos comparten la defensa del código accesible y la colaboración transparente, difieren sustancialmente en sus principios éticos y filosóficos.

---

## 2. Los Movimientos Fundamentales: Software Libre vs. Open Source

### 2.1. Movimiento del Software Libre (FSF)
Es una filosofía social y ética enfocada en garantizar la libertad y los derechos fundamentales de los usuarios frente al control impuesto por el software privativo.

#### Las 4 Libertades Fundamentales del Software Libre
Para que un programa sea considerado *Software Libre*, debe garantizar de manera incondicional las siguientes libertades:
* **Libertad 0 (Uso):** La libertad de ejecutar el programa para cualquier propósito, en cualquier entorno y sin restricciones.
* **Libertad 1 (Estudio y Modificación):** La libertad de examinar cómo funciona el programa y modificarlo para adaptarlo a las necesidades específicas. *(Requiere acceso obligatorio al código fuente)*.
* **Libertad 2 (Redistribución):** La libertad de redistribuir copias exactas del programa para compartirlo con la comunidad.
* **Libertad 3 (Mejora y Distribución de Modificados):** La libertad de distribuir copias de las versiones modificadas a terceros, permitiendo que toda la comunidad se beneficie de las mejoras. *(Requiere acceso obligatorio al código fuente)*.

> **Aclaración Semántica:** La FSF enfatiza *"Free as in free speech, not as in free beer"* (libre como en libertad de expresión, no como en cerveza gratis). El software libre se refiere a la libertad de uso, no a la gratuidad comercial; por ende, se permite la comercialización y cobro por servicios o copias de software libre.

### 2.2. Movimiento Open Source (OSI)
El movimiento *Open Source* enfoca sus argumentos en los beneficios pragmáticos y metodológicos del desarrollo colaborativo (calidad del código, rápida corrección de errores, eficiencia de ingeniería). La **Open Source Definition (OSD)** establece 10 criterios, entre los cuales destacan:
1. Libre redistribución del software.
2. Inclusión explícita del código fuente.
3. Permitir modificaciones y trabajos derivados.
4. Integridad del código fuente del autor original.
5. No discriminación contra personas o grupos.
6. No discriminación contra campos de aplicación (comercial, industrial, etc.).

#### Ejemplo de Diferencia Filosófica: La Paradoja de DRM
La **Gestión de Derechos Digitales (DRM)** impone restricciones tecnológicas sobre hardware y software. La FSF rechaza categóricamente el DRM por violar la libertad del usuario (*Tivoización*). En cambio, el movimiento Open Source permite arquitecturas DRM siempre que su código fuente sea abierto (ejemplo: el estándar *DRM Opera* propuesto por Sun Microsystems).

---

## 3. Clasificación de Licencias de Software

Las licencias de software constituyen el instrumento legal que define los derechos y obligaciones concedidos por el autor. En la tesis doctoral se presenta la clasificación sistemática de licencias estructurada en cuatro categorías principales:

```
                         CATEGORÍAS DE LICENCIAS
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
 Software Privativo                                        FLOSS
 (Derechos reservados)                                (Derechos cedidos)
                                                               │
                       ┌───────────────────────┬───────────────┴───────────────┐
                       ▼                       ▼                               ▼
                   Copyleft             Copyleft Débil                    No Copyleft
             (Hereditario estricto)   (Librerías/Módulos)             (Permisivo / Atribución)
                       │                       │                               │
             • GPLv2, GPLv3          • LGPLv2.1, LGPLv3               • BSD (2/3 Clause)
             • AGPL                  • MPL (Mozilla)                  • MIT
                                     • EPL (Eclipse)                  • Apache 2.0
                                                                               │
                                                                               ▼
                                                                       Dominio Público
                                                                       (Unlicense, CC0)
```

### 3.1. Copyleft (Copyleft Fuerte / Estricto)
El término *Copyleft* (creado por Richard Stallman) es una práctica legal que utiliza los derechos de autor para exigir que **todas las versiones modificadas y derivados del software mantengan exactamente la misma licencia libre**.
* **Objetivo:** Impedir que terceros conviertan un software libre en privativo.
* **Principales Licencias:**
  * **GPLv2 / GPLv3 (GNU General Public License):** Estándar de la FSF para software de escritorio y sistemas operativos (ej. Kernel Linux).
  * **AGPL (Affero GPL):** Diseñada específicamente para software ejecutado en red o la nube, obligando a entregar el código fuente a usuarios que interactúan remotamente con la aplicación.

### 3.2. Copyleft Débil (Weak Copyleft)
Relaja los requerimientos hereditarios para permitir que bibliotecas o módulos de software libre sean enlazados o integrados con programas desarrollados bajo licencias privativas.
* **Mecanismo:** Las modificaciones directas sobre la biblioteca libre deben permanecer bajo la licencia libre, pero el programa principal que llama a la biblioteca puede conservar su propia licencia privativa.
* **Principales Licencias:**
  * **LGPLv2.1 / LGPLv3 (GNU Lesser General Public License):** Ampliamente utilizada en librerías de software.
  * **MPL (Mozilla Public License):** Licencia modular usada en proyectos como Firefox y LibreOffice.
  * **EPL (Eclipse Public License):** Utilizada por la Fundación Eclipse.

### 3.3. No Copyleft (Licencias Permisivas)
Otorgan máxima libertad al usuario, permitiendo modificar, redistribuir e incluso incorporar el código libre en productos comerciales y **convertirlos en software privativo**, exigiendo únicamente el reconocimiento y mantenimiento de la nota de derechos de autor original.
* **Principales Licencias:**
  * **BSD (2-Clause / 3-Clause):** Licencia histórica de la Universidad de California en Berkeley.
  * **MIT License:** Una de las licencias más breves y populares en la comunidad contemporánea.
  * **Apache 2.0:** Licencia permisiva que incluye concesión explícita de patentes.

### 3.4. Dominio Público
Pertenecen a esta categoría aquellos trabajos cuyos derechos de autor han expirado o cuyos autores han renunciado expresamente a todo derecho patrimonial sobre la obra.
* **Ejemplos:** Licencias **Unlicense** y **Creative Commons CC0**.
* **Advertencia en FLOSS:** No se recomienda que el FLOSS sea liberado directamente al dominio público sin licencia, ya que la ausencia de protección legal facilita que empresas privadas apropien el código y lo distribuyan en versiones cerradas privativas sin retribuir a la comunidad.

---

# Capítulo 3: Motivación y Estado del Arte de la Adopción FLOSS

**Parte II: Antecedentes**

---

## 1. Motivación y Justificación del Estudio

En los últimos años, la adopción de FLOSS ha pasado de ser una curiosidad técnica a una **prioridad estratégica empresarial**:
* **Estudio North Bridge - Black Duck (2015):** El **66% de los responsables de TIC** encuestados consideraba el software libre como la primera opción por delante del software propietario.
* **Informe Red Hat (2022):** Basado en 1.250 directivos de TI en todo el mundo, el **92% afirmó que el software libre empresarial es fundamental** para abordar sus desafíos de transformación digital e infraestructura.

A pesar de este elevado interés, la adopción se realiza predominantemente de manera **acelerada, empírica y desestructurada**. La carencia de un itinerario metodológico formal expone a las instituciones a graves fallos operacionales. Automatizar y estructurar la evaluación de software mediante instrumentos ágiles es la principal motivación de esta investigación doctoral.

---

## 2. Análisis de FLOSS en la Literatura Científica

Para fundamentar la necesidad de la tesis, se realizó un análisis bibliométrico de la producción científica publicada entre **2004 y 2019** indexada en la base de datos **Scopus**, aplicando la siguiente cadena de búsqueda estructurada:

```sql
TITLE (foss OR floss OR "Free/libre open source software" OR "free software" OR "open source") 
AND ( LIMIT-TO ( SRCTYPE , "j" ) ) 
AND ( LIMIT-TO ( DOCTYPE , "ar" ) OR LIMIT-TO ( DOCTYPE , "re" ) ) 
AND ( LIMIT-TO ( SUBJAREA , "COMP" ) ) 
AND ( LIMIT-TO ( LANGUAGE , "English" ) )
```

### 2.1. Clasificación mediante la Teoría de Eficiencia de Pareto
Para evaluar la relevancia científica de los artículos de forma objetiva, se aplicó la **Eficiencia de Pareto** considerando dos variables: el *número de citas recibidas* y el *año de publicación*. 
* **Frente 1 de Pareto (Relevancia 1):** Conjunto de soluciones no dominadas (artículos con equilibrio óptimo entre alto número de citas y recientez).
* **Frentes 2 y 3:** Soluciones secundarias.

### 2.2. Distribución Temática de los Artículos en Scopus

El análisis reveló las principales áreas de interés en la literatura científica sobre FLOSS:

| Tema Principal | Descripción del Área | Relevancia en Literatura |
| :--- | :--- | :---: |
| **Desarrollo de FLOSS** | Metodologías, minería de repositorios, prácticas de código. | Muy Alta (18.5%) |
| **Comunidades FLOSS** | Gobernanza, roles núcleo-periferia, cortesía y dinámica social. | Muy Alta (16.8%) |
| **Aplicaciones de FLOSS** | Casos concretos en salud, geoinformática, educación. | Alta (15.2%) |
| **Temas Generales y Cultura** | Filosofía, aspectos culturales y buenas prácticas. | Media (10.2%) |
| **Evaluación, Selección y Adopción** | **Modelos y marcos para adoptar FLOSS en organizaciones.** | **Media (10.2%)** |
| **Enseñanza y Aprendizaje** | Uso de FLOSS en currículos universitarios y formación. | Media (10.2%) |
| **Soporte y Gestión de Errores** | Mantenimiento, depuración y seguimiento de *bugs*. | Baja (5.1%) |
| **Evolución de FLOSS** | Estudio de las leyes de Lehman en código de larga duración. | Baja (3.4%) |
| **Seguridad, Licencias y Nube** | Modelos formales CRAM4FOSS, detección de malware (FOSSIL). | Baja (<2%) |

> **Conclusión Clave:** La temática de *Evaluación, Selección y Adopción* cuenta con presencia constante en la comunidad científica, pero la mayoría de los artículos existentes abordan aspectos parciales sin ofrecer una guía de evaluación integral.

---

## 3. Comparativa de Revisiones de la Literatura Existentes

Se comparó nuestra revisión sistemática con los principales trabajos de revisión previa en el campo de la adopción FLOSS:

| Trabajo de Revisión | Tipo | Año | Contexto / Dominio | N° Artículos | N° Factores | Factores Comunes Identificados |
| :--- | :---: | :---: | :--- | :---: | :---: | :--- |
| **Marsan et al. [85]** | LR | 2013 | Organizaciones de salud médica. | 78 | 8 | Compatibilidad, soporte, apoyo de la alta dirección, costo de licencias. |
| **Badampudi et al. [10]** | SLR | 2016 | Selección de componentes in-house vs. COTS/OSS. | 24 | 11 | Compatibilidad, personalización, mantenimiento, soporte, TCO, costo de licencia. |
| **Ven et al. [154]** | LR | 2012 | Infraestructura de servidores en empresas belgas. | — | 7 | TCO, compatibilidad, fiabilidad, personalización, prueba, soporte. |
| **Rea et al. [115] (Tesis)** | **SLR** | **2020** | **General (Instituciones Públicas y Privadas).** | **54** | **22** | **Compatibilidad, fiabilidad, usabilidad, personalización, mantenimiento, prueba, soporte, TCO, entre otros.** |

---

## 4. Comparativa de Metodologías Existentes para la Adopción FLOSS

Diversos autores han propuesto marcos y modelos parciales para evaluar software libre:
* **Saini et al. [124]:** Propone el *Índice de Adopción FLOSS (IAF)* estructurado en 2 niveles (4 dimensiones de políticas y personal).
* **Rossi et al. [118]:** Analiza factores de impacto en la adopción pública en Italia.
* **Aversano et al. [7]:** Aplica el marco *EFFORT* para evaluar la calidad de sistemas ERP libres.
* **Macho et al. [82]:** Evalúa la calidad analizando la evolución histórica de repositorios mediante el marco *OpenBRR* (aplicado a Moodle).
* **Adewumi et al. [1]:** Presenta el marco *FOSSES* para la selección de FLOSS basado en la opinión de 10 expertos.

### Matriz Comparativa: Metodologías Existentes vs. GUIOS (Propuesta de Tesis)

| Criterios de Evaluación | Saini [124] | Rossi [118] | Aversano [7] | Macho [82] | Adewumi [1] | **GUIOS (Tesis)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| Nivel 1: Dimensiones | **X** | **X** | **X** | **X** | **X** | **X** |
| Nivel 2: Factores Primarios | **X** | **X** | **X** | **X** | **X** | **X** |
| Nivel 3: Subfactores Granulares | | | | | | **X** (61 subfactores) |
| Herramienta Prototipo Automatizada | | | | | | **X** (GUIOS PRO) |
| Aplicación en Caso de Estudio Real | | **X** | | | | **X** (UNEMI / LibreOffice) |
| Integración de Evidencia Bibliográfica | | | | | | **X** ($IL$) |
| Ponderación mediante Encuesta a Expertos | | | | | **X** | **X** (57 expertos) |
| Evaluación de Factores Internos/Externos | | | | | | **X** (Matriz FODA) |

> **Conclusión:** GUIOS es la única metodología que integra tres niveles de granularidad (dimensiones, factores, subfactores), equilibra la evidencia de la literatura científica con el criterio de expertos, genera una matriz FODA automatizada y ofrece un prototipo software validado en una institución pública real.

---

# Capítulo 4: Revisión Sistemática de la Literatura y Taxonomía de Factores

**Parte III: Contribuciones**

---

## 1. Definición del Proceso Sistemático (RSL)

Para identificar rigurosamente los factores que influyen en la adopción de FLOSS, se diseñó y ejecutó una **Revisión Sistemática de la Literatura (RSL)** siguiendo las directrices metodológicas de **Petersen et al.** y **Kitchenham**.

```
                           FASE 1: PLANIFICACIÓN
        ┌─────────────────────────────────────────────────────────┐
        │  • Definición del Protocolo de Búsqueda                 │
        │  • Formulación de Preguntas de Investigación (RQ1, RQ2) │
        └────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
                     FASE 2: IDENTIFICACIÓN Y FILTRADO
        ┌─────────────────────────────────────────────────────────┐
        │  Búsqueda inicial en 4 bases de datos (N = 4.429)       │
        │    ├── IEEE Xplore:  516                                │
        │    ├── ACM Library:  519                                │
        │    ├── Scopus:     2.248                                │
        │    └── Web of Science: 1.146                              │
        │  Eliminación de duplicados (N = 2.742)                  │
        │  Criterios Inclusión/Exclusión: Título/Resumen (N = 483)│
        │  Lectura a Texto Completo (N = 51)                      │
        │  Muestreo Bola de Nieve (+3)                            │
        │  ESTUDIOS PRIMARIOS FINALES SELECCIONADOS: N = 54       │
        └────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
                    FASE 3: EXTRACCIÓN, SÍNTESIS Y CALIDAD
        ┌─────────────────────────────────────────────────────────┐
        │  • Evaluación de Calidad (Ranking Scimago 4-5 puntos)   │
        │  • Categorización temática vía palabras clave           │
        │  • Identificación y clasificación de los 22 Factores    │
        └─────────────────────────────────────────────────────────┘
```

### Preguntas de Investigación Formuladas
* **RQ1:** ¿Qué factores influyen en la adopción FLOSS en las organizaciones según la literatura científica?
* **RQ2:** ¿Cuál es el alcance de la investigación sobre los factores de adopción FLOSS?
  * *RQ2.1:* ¿Qué tipos de investigación (según Wieringa) cubren la adopción FLOSS?
  * *RQ2.2:* ¿Cómo han evolucionado temporalmente las publicaciones por dimensión de factores?

---

## 2. Taxonomía de los 22 Factores Primarios de Adopción

A partir de los 54 estudios primarios analizados, se definieron y caracterizaron **22 factores primarios** estructurados en 3 dimensiones:

```
                               22 FACTORES DE ADOPCIÓN
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
Dimensión Tecnológica              Dimensión Organizacional           Dimensión Económica
  (9 Factores / 91% docs)            (9 Factores / 93% docs)            (4 Factores / 61% docs)
 1. Compatibilidad                  1. Soporte                         1. Costo Total (TCO)
 2. Fiabilidad                      2. Formación                       2. Costos de Licencia
 3. Usabilidad                      3. Apoyo Alta Dirección            3. Costos Operacionales
 4. Personalización                 4. Bloqueo Proveedores             4. Costos de Soporte
 5. Documentación                   5. Actitud al Cambio
 6. Mantenimiento                   6. Casos de Estudio
 7. Prueba                          7. Tiempo de Adopción
 8. Reutilización                   8. Centralidad de TI
 9. Portabilidad                    9. Reingeniería Procesos
```

---

## 3. Desglose Detallado por Dimensión

### 3.1. Dimensión Tecnológica (9 Factores — Mencionada en el 91% de los estudios)

| Factor | Descripción Técnica del Factor | N° Artículos | % Frecuencia |
| :--- | :--- | :---: | :---: |
| **Compatibilidad** | Grado de compatibilidad del software respecto a los **formatos de datos** existentes en la organización. | 34 | 63.0% |
| **Fiabilidad** | Estabilidad operacional, robustez y baja tasa de errores de programación (*bugs*) durante la ejecución. | 23 | 42.6% |
| **Usabilidad** | Grado en que la interfaz gráfica (GUI) resulta intuitiva, cómoda y de fácil aprendizaje para el usuario final. | 17 | 31.5% |
| **Personalización** | Facilidad para modificar la configuración por defecto o adaptar el código fuente a requerimientos específicos. | 17 | 31.5% |
| **Documentación** | Disponibilidad, calidad y actualización de manuales para usuarios, administradores y desarrolladores. | 12 | 22.2% |
| **Mantenimiento** | Frecuencia de actualización, parches de seguridad y facilidad de instalación de nuevas versiones. | 10 | 18.5% |
| **Prueba** | Facilidad para desplegar versiones piloto o de prueba previa antes de la instalación masiva. | 8 | 14.8% |
| **Reutilización** | Capacidad del código fuente para ser reutilizado como librerías, marcos de trabajo o componentes. | 8 | 14.8% |
| **Portabilidad** | Capacidad de despliegue ejecutable en múltiples sistemas operativos y plataformas de hardware. | 6 | 11.1% |

### 3.2. Dimensión Organizacional (9 Factores — Mencionada en el 93% de los estudios)

| Factor | Descripción Técnica del Factor | N° Artículos | % Frecuencia |
| :--- | :--- | :---: | :---: |
| **Soporte** | Disponibilidad de soporte técnico interno, comercial de terceros (24/7/365) o comunitario. *(Factor más citado)*. | 45 | 83.3% |
| **Formación** | Programas de capacitación requeridos para el personal técnico y los usuarios finales de la organización. | 26 | 48.1% |
| **Apoyo Alta Dirección**| Nivel de compromiso explícito de la gerencia hacia la estrategia de migración tecnológica. | 18 | 33.3% |
| **Bloqueo Proveedores**| Grado en que la solución reduce la dependencia hacia un fabricante propietario exclusivo (*Vendor Lock-in*). | 10 | 18.5% |
| **Actitud al Cambio** | Disposición de los empleados hacia las transformaciones tecnológicas e incentivos para mitigar el rechazo. | 6 | 11.1% |
| **Centralidad de TI** | Grado de dependencia directa de la organización respecto a su propia infraestructura de sistemas. | 3 | 5.6% |
| **Casos de Estudio** | Existencia de reportes públicos de éxito en migraciones similares de organizaciones comparables. | 2 | 3.7% |
| **Tiempo de Adopción**| Estimación del periodo temporal requerido para completar la migración e implementación plena. | 2 | 3.7% |
| **Reingeniería Procesos**| Reestructuración de los procesos de trabajo internos impulsada por la adopción del nuevo software. | 1 | 1.9% |

### 3.3. Dimensión Económica (4 Factores — Mencionada en el 61% de los estudios)

| Factor | Descripción Técnica del Factor | N° Artículos | % Frecuencia |
| :--- | :--- | :---: | :---: |
| **Costo Total (TCO)** | Evaluación global que integra costos de adquisición, operación, entrenamiento, mantenimiento y soporte. | 19 | 35.2% |
| **Costos de Licencia**| Ahorro directo derivado de la ausencia de pago de licencias de uso por usuario o por CPU. | 16 | 29.6% |
| **Costos Operacionales**| Gastos asociados a la migración de datos, desarrollo de adaptaciones e infraestructura local. | 4 | 7.4% |
| **Costos de Soporte** | Presupuesto destinado a la contratación de pólizas de soporte especializado externo. | 2 | 3.7% |

---

## 4. Clasificación por Tipos de Investigación (Según Wieringa)

El mapeo sistemático relacionó los grupos de factores con las categorías de investigación definidas por Wieringa et al.:
1. **Estudios de Evaluación (Evaluation Research):** Constituyen la gran mayoría (27 artículos tecnológicos, 26 organizacionales, 18 económicos), demostrando la madurez en el análisis de sistemas FLOSS en entornos reales.
2. **Investigación de Validación (Validation Research):** 7 organizacionales, 4 tecnológicos, 2 económicos.
3. **Documentos Filosóficos y de Opinión:** Taxonomías y análisis conceptuales.
4. **Propuestas de Solución (Solution Proposals):** Área con escasas contribuciones (solo 1 o 2 artículos por dimensión), lo que resalta la brecha científica que justifica la creación de la guía GUIOS.

---

# Capítulo 5: Elaboración de la Guía GUIOS e Indicadores de Importancia

**Parte III: Contribuciones**

---

## 1. Proceso Metodológico para la Construcción de GUIOS

La elaboración de la guía **GUIOS** (*Guía para la Adopción de Software Libre y Fuentes Abiertas*) se desarrolló mediante un proceso metódico compuesto por tres etapas fundamentales de refinamiento e integración empírica:

```
                            PROCESO DE CONSTRUCCIÓN DE GUIOS
                                          │
       ┌──────────────────────────────────┼──────────────────────────────────┐
       ▼                                  ▼                                  ▼
 1. Identificación de            2. Encuesta a Expertos             3. Definición de
 Subfactores Granulares           en FLOSS (Ecuador/España)           Indicadores y FODA
 ──────────────────────          ──────────────────────────          ───────────────────
 • Refinamiento a 18 factores    • Muestra: N = 57 expertos          • Formulación de $IE, IL,$
 • Generación de 61 subfactores  • Escala Likert de 4 niveles        $IS, ID, IR$
   redactados en positivo          (Irrelevante a Fundamental)       • Asignación de Matriz FODA
```

---

## 2. Los 61 Subfactores de Adopción

Para superar la abstracción de los factores primarios y ofrecer un instrumento de evaluación preciso, se desglosaron los **18 factores finales** en **61 subfactores**. Cada subfactor fue redactado como una sentencia positiva, corta y directa:

### Ejemplos Representativos por Dimensión:

* **Dimensión Tecnológica (29 subfactores):**
  * *Compatibilidad:* "El software utiliza formatos estándar (ej. ODF)", "El software es compatible con los casos de uso y funcionalidades más comunes", "El software interactúa y se integra con el software propietario existente".
  * *Fiabilidad:* "El software es fiable y estable", "El software tiene un buen historial en cuanto a corrección de errores de seguridad", "El software proporciona una amplia variedad de funciones de control de acceso".
  * *Usabilidad:* "El software proporciona una interfaz gráfica de usuario (GUI) intuitiva", "El software es fácil de aprender por los usuarios finales".
  * *Personalización:* "El software se puede ampliar fácilmente mediante módulos o extensiones", "Existe un repositorio público de extensiones para este software".

* **Dimensión Organizacional (26 subfactores):**
  * *Soporte:* "El soporte comunitario para este software está activo y disponible", "Existen expertos y consultores comerciales externos contratables 24/7/365", "El personal de TI interno cuenta con conocimientos para administrar la herramienta".
  * *Formación:* "Existen cursos y material de capacitación disponible en el mercado", "El tiempo requerido para capacitar a los usuarios finales es aceptable".
  * *Apoyo de la Alta Dirección:* "La alta gerencia respalda la estrategia de adopción", "El personal técnico apoya la migración al software libre".

* **Dimensión Económica (6 subfactores):**
  * *Costo Total de Propiedad (TCO):* "La adopción de este software es globalmente menos costosa que la alternativa propietaria", "Es poco probable que existan costos ocultos durante el despliegue".

---

## 3. Estudio Empírico: Encuesta a Expertos en FLOSS

Se aplicó una encuesta estructurada a profesionales e investigadores del área TIC de Ecuador y España.

### Perfil Demográfico de los 57 Expertos Participantes:
* **Años de Experiencia en FLOSS:**
  * Más de 10 años: **47.4%**
  * De 6 a 10 años: **28.1%**
  * De 1 a 5 años: **24.6%**
* **Sectores de Aplicación:** Educación e Investigación (28.1%), Sistemas Operativos de Escritorio (21.1%), Ofimática y Gestión (19.3%), Desarrollo de Software (10.5%), Tecnologías Web (7.0%), Seguridad Informática (7.0%), Redes y Nube (5.3%), Finanzas (1.8%).

### Escala de Valoración Utilizada (4 Niveles):
1. **Irrelevante (1):** No justifica asignar recursos a este criterio.
2. **Opcional (2):** Su ausencia no genera problemas en la adopción.
3. **Importante (3):** Criterio deseable; su ausencia genera inconvenientes.
4. **Fundamental (4):** Requisito indispensable para la adopción.

---

## 4. Sistema Integrado de Indicadores de Importancia

Para combinar cuantitativamente la evidencia bibliográfica, el consenso de expertos y las prioridades de la organización adaptante, se estructuraron **cinco indicadores graduados en el rango discreto $[1, 4]$**:

$$egin{array}{rll}
IE & : 	ext{Importancia del Experto} & 	ext{(Promedio ponderado de la encuesta a expertos)} \
IL & : 	ext{Importancia de la Literatura} & 	ext{(Calculada por cuartiles de citas y subfactores)} \
IS & : 	ext{Importancia Sugerida} & 	ext{(Combinación matricial de } IE 	imes IL 	ext{)} \
ID & : 	ext{Importancia del Decisor} & 	ext{(Valoración asignada por la gerencia local)} \
IR & : 	ext{Importancia Relativa Final} & 	ext{(Matriz final de cruce } IS 	imes ID 	ext{)}
\end{array}$$

### Matriz de Combinación de Importancia ($IS$ y $IR$)

La intersección para obtener la Importancia Sugerida ($IS$) o la Importancia Relativa ($IR$) se define según la siguiente regla operacional:

```
                      IMPORTANCIA LITERATURA (IL) / SUGERIDA (IS)
                      Irrelevante(1)   Opcional(2)   Importante(3)   Fundamental(4)
                  ┌─────────────────┬─────────────┬───────────────┬────────────────┐
  Fundamental (4) │    Opcional     │ Importante  │  Importante   │  Fundamental   │
   Importante (3) │    Opcional     │  Opcional   │  Importante   │   Importante   │
     Opcional (2) │   Irrelevante   │  Opcional   │   Opcional    │   Importante   │
  Irrelevante (1) │   Irrelevante   │ Irrelevante │   Opcional    │    Opcional    │
                  └─────────────────┴─────────────┴───────────────┴────────────────┘
```

---

## 5. Clasificación de Factores y Matriz FODA / DAFO

Los 18 factores se dividen según su ámbito de impacto:
* **Factores Internos:** Características inherentes a la propia organización adoptante (*Soporte interno, Formación, Apoyo gerencial, Actitud al cambio, TCO*).
* **Factores Externos:** Propiedades tecnológicas predeterminadas del software candidato (*Compatibilidad, Fiabilidad, Usabilidad, Licencias, Documentación*).

### Reglas de Asignación a la Matriz FODA
Para cada subfactor evaluado con una puntuación de cumplimiento $pm_i \in [1, 4]$:

$$	ext{FODA}(pm_i, 	ext{Impacto}_i) = egin{cases} 
\mathbf{Fortaleza} & 	ext{si } pm_i \ge 3 \;\land\; 	ext{Impacto}_i = 	ext{Interno} \
\mathbf{Oportunidad} & 	ext{si } pm_i \ge 3 \;\land\; 	ext{Impacto}_i = 	ext{Externo} \
\mathbf{Debilidad} & 	ext{si } pm_i < 3 \;\land\; 	ext{Impacto}_i = 	ext{Interno} \
\mathbf{Amenaza} & 	ext{si } pm_i < 3 \;\land\; 	ext{Impacto}_i = 	ext{Externo} 
\end{cases}$$

---

# Capítulo 6: Herramienta GUIOS PRO y Validación en Caso de Estudio Real

**Parte III: Contribuciones**

---

## 1. El Flujo de Trabajo Metodológico de GUIOS (6 Pasos)

La guía GUIOS establece un procedimiento secuencial claro para conducir la evaluación de adopción de software libre:

```
                            FLUJO DE TRABAJO DE GUIOS
                                        │
 ┌──────────────────────────────────────┴──────────────────────────────────────┐
 │  PASO 1: Selección de Factores Relevantes                                   │
 │          • El decisor evalúa los 18 factores y asigna la Importancia ($ID$).│
 ├─────────────────────────────────────────────────────────────────────────────┤
 │  PASO 2: Clasificación de Ámbito de Impacto                                 │
 │          • Se clasifica cada factor seleccionado como Interno o Externo.    │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │  PASO 3: Evaluación de Cumplimiento de Subfactores                         │
 │          • Calificación práctica ($pm_i$) de los 61 subfactores asociados.   │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │  PASO 4: Determinación de la Importancia Relativa ($IR$)                    │
 │          • Cálculo automatizado cruzando $IS$ e $ID$.                       │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │  PASO 5: Generación de la Matriz FODA / DAFO                                │
 │          • Mapeo en Fortalezas, Oportunidades, Debilidades y Amenazas.     │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │  PASO 6: Emisión del Reporte y Recomendación Final                          │
 │          • Clasificación final en Recomendación A, B o C.                  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Arquitectura del Prototipo Automatizado GUIOS PRO

Para facilitar la ejecución ágil de la guía por parte de administradores de TI, se diseñó y programó la herramienta software **GUIOS PRO**:

* **Entorno de Desarrollo:** Lenguaje **Python 3**.
* **Marco de Interfaz Gráfica:** Toolkit **Flexx v0.80** (marco multiplataforma que transpila código Python a JavaScript asíncrono para renderizado web local).
* **Licencia de Distribución:** Licencia libre AGPL3 / 2-BSD.
* **Características de Usabilidad:** Interfaz basada en widgets interactivos (*sliders*, casillas de verificación, gráficos dinámicos) que permite ajustar importancias en tiempo real y visualizar automáticamente los cambios en la matriz FODA.

```
+-----------------------------------------------------------------------------+
|                               GUIOS PRO v1.0                                |
|-----------------------------------------------------------------------------|
|  [Paso 1 y 2: Configuración de Factores]                                    |
|   - Compatibilidad:   [ Slider: Fundamental (4) ]   (Impacto: Externo)     |
|   - Soporte Técnico:  [ Slider: Fundamental (4) ]   (Impacto: Interno)     |
|   - Personalización:  [ Slider: Importante  (3) ]   (Impacto: Externo)     |
|                                                                             |
|  [Paso 3: Evaluación de Subfactores]                                        |
|   • ¿El software lee formatos propietarios (.docx/.xlsx)?  [ Cumple (3) ]   |
|   • ¿Existe soporte comercial 24/7 disponible?            [ No Cumple(1)]   |
|                                                                             |
|  [Paso 5 y 6: Resultado FODA y Recomendación]                               |
|   ┌──────────────────────────────┬──────────────────────────────┐           |
|   │ FORTALEZAS (Internas)        │ OPORTUNIDADES (Externas)     │           |
|   │ • Personal TI capacitado     │ • Compatibilidad ODF alta    │           |
|   ├──────────────────────────────┼──────────────────────────────┤           |
|   │ DEBILIDADES (Internas)       │ AMENAZAS (Externas)          │           |
|   │ • Falta plan de formación    │ • Falta soporte 24/7 externo │           |
|   └──────────────────────────────┴──────────────────────────────┘           |
|   RECOMENDACIÓN SUGERIDA: [ RECOMENDACIÓN A - ADOPTAR SOFTWARE ]            |
+-----------------------------------------------------------------------------+
```

---

## 3. Tipos de Recomendaciones Finales Emitidas por GUIOS PRO

El motor de decisión de GUIOS PRO clasifica el resultado en tres dictámenes:
1. **Recomendación A (Adoptar el FLOSS):** La organización satisface holgadamente los requisitos esenciales. Las debilidades y amenazas identificadas son menores y gestionables.
2. **Recomendación B (Adoptar con Reservas / Plan de Mitigación):** Existen debilidades o amenazas críticas (ej. falta de soporte o incompatibilidad parcial de formatos) que deben ser subsanadas mediante un plan de acción previo a la migración masiva.
3. **Recomendación C (No Adoptar por el Momento):** La evaluación evidencia riesgos inaceptables que comprometen la operación de la organización.

---

## 4. Piloto de Validación Real en la Universidad Estatal de Milagro (UNEMI)

Para evaluar la utilidad práctica de GUIOS y GUIOS PRO, se realizó un ensayo piloto en un escenario real de la administración pública ecuatoriana.

### 4.1. Diseño del Estudio de Caso
* **Institución:** Universidad Estatal de Milagro (UNEMI), Ecuador.
* **Aprobación Ética:** Autorizado por el Comité de Ética de la UNEMI y con consentimiento informado de los participantes.
* **Sujeto de Estudio:** Especialista Senior del Área de Tecnologías de la Información de la UNEMI.
* **Software Evaluado:** Suite ofimática **LibreOffice** (licencia libre Mozilla Public License MPL 2.0) como alternativa de migración frente a Microsoft Office.

### 4.2. Ejecución y Resultados del Piloto
1. **Tiempo de Ejecución:** La especialista completó los Pasos 1 y 2 en solo **15 minutos** utilizando la interfaz interactiva de GUIOS PRO.
2. **Factores Críticos Identificados por la Especialista:**
   * **Compatibilidad:** Clasificada como *Fundamental (4)* e *Impacto Externo*. (Prioridad: lectura y guardado correcto de documentos históricos en formatos `.docx`, `.xlsx` y `.pptx`).
   * **Soporte:** Clasificado como *Fundamental (4)* e *Impacto Interno*. (Prioridad: disponer de equipo técnico propio para resolver incidencias de usuarios de la universidad).
3. **Dictamen Final Obtenido:** **Recomendación A (Adoptar LibreOffice)**, acompañada de una matriz FODA que identificó como principal fortaleza la preparación de la infraestructura interna de la UNEMI y como principal amenaza potencial la necesidad de capacitación continua a docentes y administrativos.
4. **Valoración Cualitativa del Usuario:** La especialista destacó la **agilidad de la herramienta**, la capacidad de retroceder entre pantallas para simular escenarios alternativos y la claridad gráfica del reporte final FODA.

---

# Capítulo 7: Conclusiones, Limitaciones y Trabajos Futuros

**Parte IV: Observaciones Finales**

---

## 1. Conclusiones Principales de la Tesis

Las principales conclusiones derivadas del trabajo de investigación son:

1. **Necesidad de Guiado Formal:** Se demostró empíricamente que la adopción de software libre sin un procedimiento estructurado incrementa los riesgos operacionales y financieros en las organizaciones. Un marco estandarizado evita situaciones de "reinvención de la rueda".
2. **Eficacia de la Granularidad Fina:** La estructuración en tres niveles (**3 dimensiones, 18 factores finales y 61 subfactores**) ofrece el nivel de detalle necesario para evaluar de forma exhaustiva aspectos técnicos, de gestión y económicos que suelen pasarse por alto en evaluaciones tradicionales.
3. **Integración de Evidencia Dual (Literatura + Expertos):** El sistema de indicadores formulado ($IE, IL, IS, ID, IR$) logra un equilibrio óptimo entre la evidencia científica acumulada en 14 años de literatura internacional y la experiencia práctica de expertos de campo.
4. **Automatización Viable:** La herramienta prototipo **GUIOS PRO** demuestra que es posible automatizar el análisis multicriterio y la generación de matrices FODA, reduciendo el tiempo de evaluación a solo minutos.
5. **Validación Práctica en el Sector Público:** El caso de estudio piloto en la Universidad Estatal de Milagro (UNEMI) confirmó que GUIOS es una herramienta intuitiva, útil y directamente aplicable en la toma de decisiones institucionales.

---

## 2. Debate Crítico, Limitaciones y Amenazas a la Validez

De forma transparente, en la disertación se analizan las decisiones metodológicas adoptadas y sus posibles limitaciones:

### 2.1. Selección de la Revisión Sistemática de la Literatura (RSL)
* *Decisión:* Se priorizaron artículos de revistas indexadas por pares, excluyendo inicialmente literatura gris y conferencias.
* *Limitación:* Podrían haberse dejado fuera factores emergentes debatidos únicamente en congresos recientes.
* *Mitigación:* Se aplicó muestreo de bola de nieve (*snowballing*) sobre estudios citados para rescatar contribuciones clave.

### 2.2. Representatividad de la Muestra de Expertos
* *Decisión:* Se encuestó a 57 expertos de Ecuador y España.
* *Limitación:* Aunque la muestra cuenta con alta experiencia (>47% con más de 10 años en FLOSS), la tasa de respuesta en ciertos sectores especializados (finanzas, redes) fue menor.

### 2.3. Capacidades de la Herramienta GUIOS PRO
* *Decisión:* Se desarrolló un prototipo en Python con Flexx v0.80 pensado para ejecución local.
* *Limitación:* El prototipo no incluye gestión de usuarios multiinquilino (*multi-tenant*), persistencia en bases de datos relacionales en la nube, ni autenticación de usuarios.

### 2.4. Generación de Planes de Mitigación Automáticos
* *Decisión:* GUIOS clasifica el resultado en recomendaciones (A, B, C) y genera la matriz FODA.
* *Limitación:* La guía identifica las debilidades y amenazas, pero no prescribe automáticamente las acciones correctivas específicas que debe ejecutar la gerencia para resolverlas.

---

## 3. Líneas de Investigación y Trabajos Futuros

El trabajo realizado abre diversas oportunidades de investigación y desarrollo tecnológico:

1. **Desarrollo de GUIOS Web Enterprise (SaaS):** Evolucionar el prototipo GUIOS PRO hacia una plataforma web en la nube multiusuario que permita la colaboración síncrona entre varios evaluadores de una misma institución.
2. **Incorporación de Métodos de Decisión Multicriterio (MCDM):** Explorar e integrar algoritmos formalizados como **AHP** (*Analytic Hierarchy Process*) o **TOPSIS** para refinamiento matemático de las ponderaciones de subfactores.
3. **Módulo de Mitigación Inteligente de Riesgos:** Diseñar un motor de reglas que, al detectar una debilidad o amenaza en la matriz FODA, sugiera automáticamente planes de contingencia recomendados (ej. programas de capacitación específicos o acuerdos de nivel de servicio SLA).
4. **Ampliación del Repositorio de Casos de Estudio:** Aplicar GUIOS en una muestra más amplia de instituciones públicas, Gobiernos Autónomos Descentralizados (GADs) y PYMES en América Latina para consolidar una base de datos pública de diagnósticos de adopción FLOSS.

---

# Parte V: Apéndices y Bibliografía Relevante

---

## Apéndice A: Encuesta sobre Características de Adopción de FLOSS

El **Apéndice A** de la tesis doctoral detalla la estructura y contenido del instrumento de encuesta aplicado a los expertos en software libre de Ecuador y España para valorar la importancia práctica de los subfactores.

### A.1. Carta de Presentación e Invitación
* **Investigador Principal:** Ing. Víctor Hugo Rea Sánchez (Docente de la Universidad Estatal de Milagro, UNEMI, Ecuador y Doctorando en la Universidad de Sevilla, España).
* **Contacto:** `vreas@unemi.edu.ec`
* **Objetivo:** Valorar la relevancia operacional de las características que influyen en la adopción organizacional de FLOSS.

### A.2. Estructura del Instrumento de Encuesta
El cuestionario digital se organizó en tres secciones principales:

#### Sección 1: Perfil del Experto
1. **Tipo de Institución:** Pública, Privada, Independiente, Académica.
2. **Años de Experiencia en Tecnologías FLOSS:** (1 a 5 años / 6 a 10 años / >10 años).
3. **Selección de Software Libre de Referencia:** Se solicitó a cada experto elegir un par tecnológico de comparación para fundamentar sus respuestas:
   * *Ofimática:* LibreOffice vs. Microsoft Office
   * *Nube e Infraestructura:* OpenStack vs. Amazon AWS
   * *Seguridad:* OpenVAS vs. Nessus
   * *Educación:* Moodle vs. Blackboard
   * *Desarrollo:* Eclipse vs. MS Visual Studio
   * *Sistemas Operativos:* Ubuntu Linux vs. Windows

#### Sección 2: Valoración de Subfactores
Los 61 subfactores redactados en positivo se presentaron para su evaluación mediante una escala cerrada de 4 niveles:
* **Fundamental:** Requisito indispensable que debe cumplirse obligatoriamente.
* **Importante:** Deseable; si no se cumple puede haber inconvenientes.
* **Opcional:** Criterio cuya ausencia no afecta negativamente la adopción.
* **Irrelevante:** No merece la pena destinar recursos a su verificación.

#### Sección 3: Retroalimentación Cualitativa
Espacio abierto donde los expertos sugirieron modificaciones o proponen la inclusión de nuevos subfactores dinámicos.

---

## Bibliografía Destacada de la Tesis Doctoral

A continuación se reúne una selección de las referencias bibliográficas fundamentales citadas a lo largo de la tesis doctoral:

* **[1] Adewumi, A., Misra, S., Omoregbe, N., & Sanz, L. F. (2019).** *Fosses: Framework for open-source software evaluation and selection.* Software: Practice and Experience, 49(5), 780–812.
* **[6] Aversano, L., & Tortorella, M. (2013).** *Quality evaluation of FLOSS projects: Application to ERP systems.* Information and Software Technology, 55(7), 1260–1276.
* **[10] Badampudi, D., Wohlin, C., & Petersen, K. (2016).** *Software component decision-making: In-house, OSS, COTS or outsourcing—A systematic literature review.* Journal of Systems and Software, 121, 105–124.
* **[14] Benlian, A., & Hess, T. (2011).** *Comparing the relative importance of evaluation criteria in proprietary and open-source enterprise application software selection.* Information Systems Journal, 21(6), 503–525.
* **[16] Bouras, C., Filopoulos, A., Kokkinos, V., Michalopoulos, S., Papadopoulos, D., & Tseliou, G. (2014).** *Policy recommendations for public administrators on free and open source software usage.* Telematics and Informatics, 31(2), 237–252.
* **[17] Bouras, C., Kokkinos, V., & Tseliou, G. (2013).** *Methodology for public administrators for selecting between open source and proprietary software.* Telematics and Informatics, 30(2), 100–110.
* **[29] Macredie, R. D., & Mijinyawa, K. (2011).** *A theory-grounded framework of open source software adoption in SMEs.* European Journal of Information Systems, 20(2), 237–250.
* **[32] Subsecretaría de Informática del Ecuador. (2009).** *Estrategia para la implantación de Software Libre en la Administración Pública (Decreto Presidencial 1014).* Quito, Ecuador.
* **[51] Hauge, Ø., Ayala, C., & Conradi, R. (2010).** *Adoption of open source software in software-intensive organizations—A systematic literature review.* Information and Software Technology, 52(11), 1133–1154.
* **[66] Kitchenham, B. (2004).** *Procedures for performing systematic reviews.* Keele University Technical Report, 33, 1–26.
* **[82] Macho, H., Robles, G., & González-Barahona, J. (2015).** *Evaluation of FLOSS by analyzing its software evolution: An example using the Moodle platform.* Journal of Information Technology Research, 8(1), 62–81.
* **[85] Marsan, J., & Paré, G. (2013).** *Antecedents of open source software adoption in health care organizations: A qualitative survey of experts in Canada.* International Journal of Medical Informatics, 82(8), 731–741.
* **[102] Petersen, K., Feldt, R., Mujtaba, S., & Mattsson, M. (2008).** *Systematic mapping studies in software engineering.* In 12th International Conference on Evaluation and Assessment in Software Engineering (EASE), 1–10.
* **[115] Rea, V., Neira, P., Galindo, J., & Benavides, D. (2020).** *Open Source Adoption Factors—A Systematic Literature Review.* IEEE Access, 8, 94594–94609.
* **[118] Rossi, B., Russo, B., & Succi, G. (2012).** *Adoption of free/libre open source software in public organizations: Factors of impact.* Information Technology & People, 25(2), 156–187.
* **[121] Runeson, P., Höst, M., Rainer, A., & Regnell, B. (2012).** *Case study research in software engineering: Guidelines and examples.* John Wiley & Sons.
* **[124] Saini, S., Singh, S. K., & Sharma, M. (2015).** *FLOSS Adoption Index (FAI) for enterprise applications.* Procedia Computer Science, 46, 1120–1127.
* **[137] Stallman, R. (2002).** *Free Software, Free Society: Selected Essays of Richard M. Stallman.* GNU Press.
