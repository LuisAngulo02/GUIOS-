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

## Estructura Modular del Repositorio (Navegación)

Para garantizar la integridad y exactitud de toda la información contenida en la tesis doctoral, la memoria se presenta en 8 módulos Markdown (`.md`) organizados de manera sistemática:

| Archivo | Parte / Capítulo | Contenido Principal |
| :--- | :--- | :--- |
| **`README.md`** | **Portada y Resumen** | Ficha técnica, Resumen en español/inglés e índice general del repositorio. |
| **`README_01_Introduccion.md`** | **Parte I / Capítulo 1** | Contexto FLOSS, Ecuador (Decreto 1014, Código Ingenios), Latinoamérica, problema, contribuciones científicas y estructura de la tesis. |
| **`README_02_FLOSS_y_Licencias.md`** | **Parte II / Capítulo 2** | Definición de FLOSS, Software Libre vs. Open Source, 4 Libertades de Stallman, DRM, clasificación completa de licencias (Copyleft, Copyleft débil, No copyleft, Dominio público). |
| **`README_03_Motivacion_y_Estado_del_Arte.md`** | **Parte II / Capítulo 3** | Justificación del estudio, análisis de la literatura científica en Scopus (2004-2019), frentes de Pareto, comparativa con SLR previas y metodologías existentes. |
| **`README_04_Revision_Sistematica_y_Factores.md`** | **Parte III / Capítulo 4** | Metodología RSL (Petersen & Kitchenham), filtrado de 4.429 a 54 estudios primarios, desglose exhaustivo de los 22 factores (tecnológicos, organizacionales y económicos) y tipos de investigación según Wieringa. |
| **`README_05_Guia_GUIOS_Metodologia.md`** | **Capítulo 5** | Proceso de elaboración de GUIOS, 18 factores finales, 61 subfactores, encuesta a 57 expertos, cálculo de indicadores ($IE, IL, IS, ID, IR$) y formulación de matriz FODA/DAFO. |
| **`README_06_Validacion_GUIOS_PRO_Caso_Estudio.md`** | **Capítulo 6** | Flujo de trabajo en 6 pasos de GUIOS, arquitectura de la herramienta GUIOS PRO (Python + Flexx v0.80), y piloto de caso de estudio en la UNEMI con LibreOffice. |
| **`README_07_Conclusiones_y_Trabajos_Futuros.md`** | **Parte IV / Capítulo 7** | Conclusiones generales, discusión crítica sobre decisiones metodológicas, amenazas a la validez, limitaciones y líneas de investigación futuras. |
| **`README_08_Apendices_y_Bibliografia.md`** | **Parte V / Apéndice A & Bib** | Instrumento completo de la encuesta a expertos en FLOSS (preguntas, opciones, perfil) y referencias bibliográficas principales citadas en la tesis. |
