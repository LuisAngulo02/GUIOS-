# Módulo 3: Motivación y Estado del Arte de la Adopción FLOSS

**Parte II: Antecedentes | Capítulo 3 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

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
