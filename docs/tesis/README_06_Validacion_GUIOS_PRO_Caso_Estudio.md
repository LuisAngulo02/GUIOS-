# Módulo 6: Herramienta GUIOS PRO y Validación en Caso de Estudio Real

**Capítulo 6 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

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
