# Módulo 4: Revisión Sistemática de la Literatura y Taxonomía de Factores

**Parte III: Contribuciones | Capítulo 4 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

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
