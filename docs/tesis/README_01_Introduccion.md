# Módulo 1: Introducción y Contexto de la Investigación

**Parte I: Preliminares | Capítulo 1 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

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
