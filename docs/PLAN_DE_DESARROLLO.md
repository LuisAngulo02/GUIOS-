# Plan Maestro de Desarrollo — GUIOSPRO FLOSS Web (GUIOS+)

**Proyecto:** Sistema de Apoyo a las Decisiones para la Adopción de Software Libre (GUIOSAD / GUIOS+)  
**Base Teórica:** Tesis Doctoral *"Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas"* (PhD. Víctor Hugo Rea Sánchez, Universidad de Sevilla, 2022)  
**Versión Actual:** 1.0.0-RC1  
**Fecha de Actualización:** Noviembre 2026  
**Repositorio:** [LuisAngulo02/GUIOS-](https://github.com/LuisAngulo02/GUIOS-)  

---

## 1. Visión General del Sistema y Estado del Proyecto

GUIOSPRO FLOSS Web (**GUIOS+**) es una plataforma web de nivel empresarial que automatiza el proceso de toma de decisiones para la adopción de software libre y de código abierto en organizaciones públicas y privadas.

El proyecto ha completado su fase central de desarrollo funcional y metodológico (**Sprints 1, 2 y 3 al 100%**), integrando la formulación matemática de la tesis doctoral con una arquitectura desacoplada moderna (**Django REST Framework + React SPA + PostgreSQL 3FN**), trazabilidad por auditoría y generación de informes oficiales en PDF.

```mermaid
flowchart LR
    A["Frontend React SPA (Vite + Tailwind)"] <-->|"REST API + JWT Auth"| B["Backend DRF (Python 3.12)"]
    B <-->|"ORM / SQL 3FN"| C[("PostgreSQL 15+")]
    B -->|"ReportLab Engine"| D["Informe Oficial PDF"]
    B <-->|"Auditoría Automática"| E["Log de Auditoría"]
```

---

## 2. Lo que ya tenemos implementado (Completado al 100%)

### 2.1. Sprint 1: Autenticación, Usuarios y Catálogo Maestro (HU-01 a HU-04)
- [x] **HU-01 (RF-01) — Registro e Inicio de Sesión Seguro:**
  - Autenticación con JSON Web Tokens (**SimpleJWT**) con par de claves `access` y `refresh`.
  - Contraseñas protegidas mediante algoritmos de derivación **Bcrypt**.
  - Política de seguridad contra fuerza bruta: control de `intentos_fallidos` (bloqueo temporal en `bloqueado_hasta` al 5.º intento por 15 minutos).
  - Erradicación de enumeración de cuentas en respuestas de error.
  - Lista negra de tokens (`token_blacklist`) y endpoint de cierre de sesión `/auth/logout/`.
- [x] **HU-02 (RF-02) — Gestión de Roles y Cuentas de Usuario:**
  - Control de Acceso Basado en Roles (**RBAC**) con roles diferenciados: `Administrador` y `Evaluador`.
  - Panel de administración de usuarios en React con filtrado reactivo por texto, rol y estado.
  - Implementación de **Baja Lógica** (`activo = FALSE`): las cuentas nunca se borran físicamente para no invalidar el histórico de evaluaciones.
  - Protección de degradación: prohibición estricta de auto-degradarse o eliminar la última cuenta administradora activa.
  - Bitácora de auditoría en tiempo real en la tabla `log_auditoria` de PostgreSQL.
- [x] **HU-03 (RF-03, RF-04) — Gestión del Catálogo de Evaluación GUIOS:**
  - Migración y población automática de los datos oficiales de la tesis (**3 Dimensiones, 18 Factores y 61 Subfactores `SF-01` a `SF-61`**).
  - Endpoints DRF administrativos `/api/v1/guios/admin/` protegidos con permiso `EsAdministrador`.
  - Pestaña interactiva **"Factores GUIOS"** con árbol jerárquico reactivo (Dimensión $\rightarrow$ Factor $\rightarrow$ Subfactores).
  - Modales para creación y edición de factores (escala de importancia 1-4, alcance `Interno`, `Externo`, `Ambos`) y subfactores con código único.
  - Bajas lógicas protegidas en catálogo para no alterar evaluaciones previas.
- [x] **HU-04 (RF-05, RF-06, RF-07) — Paso 1: Factores Relevantes e Importancia Relativa:**
  - Interfaz interactiva para asignación de la Importancia del Decisor ($ID \in [1, 4]$).
  - Cálculo instantáneo de la Importancia Relativa en el cliente y validación en backend:
    $$IR = \left\lfloor \frac{IS + ID}{2} \right\rfloor$$
  - Filtro estricto de relevancia: exclusión de factores con $IR = 1$ (`Irrelevante`) del paso posterior.
  - Gestión contextual del factor **Soporte** (alcance `Ambos`), exigiendo al evaluador especificar si es `Interno` o `Externo`.

---

### 2.2. Sprint 2: Evaluación Metodológica y Motor de Decisión (HU-05 y HU-06)
- [x] **HU-05 (RF-08) — Paso 2: Ponderación de Subfactores y Observaciones:**
  - Evaluación granular de cada reactivo en escala Likert discreta de 1 a 4:
    1. *No cumple el requisito*
    2. *Desconozco si cumple el requisito*
    3. *Cumple parcialmente el requisito*
    4. *Cumple el requisito*
  - Campo de texto para registrar justificaciones/observaciones por reactivo.
  - Cálculo dinámico de la Ponderación Media del Factor ($PM$):
    $$pm_i = \frac{1}{k}\sum_{j=1}^{k} PS_{i,j}$$
  - Bloqueo metodológico de completitud: validación estricta que impide avanzar al resultado o calcular recomendaciones si existen subfactores pendientes.
- [x] **HU-06 (RF-09, RF-10) — Paso 3: Matriz FODA y Dictamen Final:**
  - Clasificación automática en cuadrantes FODA con umbral fijo en $3.00$:
    - **Fortaleza:** $pm_i \ge 3.00$ y Alcance `Interno`.
    - **Oportunidad:** $pm_i \ge 3.00$ y Alcance `Externo`.
    - **Debilidad:** $pm_i < 3.00$ y Alcance `Interno`.
    - **Amenaza:** $pm_i < 3.00$ y Alcance `Externo`.
  - Detección de **Factores Críticos**: factores con $pm_i < 3.00$ cuya $IR$ sea **Importante ($3$)** o **Fundamental ($4$)**.
  - Reglas de Decisión Oficiales (Matriz de Decisión 2021):
    - **Recomendación A (Adoptar):** Ninguna debilidad ni amenaza ($pm_i \ge 3.00$ en todos).
    - **Recomendación B (Es posible adoptar con reservas):** Existen debilidades/amenazas únicamente en factores con $IR$ Opcional ($2$).
    - **Recomendación C (Requiere recursos antes de adoptar):** Al menos un factor crítico identificado.
  - Indicadores complementarios: **Índice de Viabilidad FLOSS (%)** y **Nivel de Confianza Metodológico** (Alto, Medio, Bajo).
  - Congelamiento inmutable del dictamen y desglose en la base de datos al finalizar la evaluación.

---

### 2.3. Sprint 3: Historial, Comparación y Reportes Oficiales (HU-07 y HU-08)
- [x] **HU-07 (RF-11, RF-12) — Dashboard e Historial de Evaluaciones:**
  - Vista general con métricas agregadas (totales, completadas, activas, viabilidad promedio).
  - Tabla de historial con filtros por nombre de software, rango de fechas y estado (`en_progreso`, `completada`).
  - Comparador lado a lado de 2 evaluaciones simultáneas para toma de decisiones comparativa entre soluciones alternativas.
  - Visualización congelada de evaluaciones finalizadas (inmunes a cambios posteriores en el catálogo).
- [x] **HU-08 (RF-13) — Generación y Descarga de Informe Oficial en PDF:**
  - Motor generador en backend con **ReportLab**:
    - Portada institucional formal con metadatos del software y evaluador.
    - Resumen metodológico y métricas globales (Viabilidad, Confianza, FODA).
    - Desglose por factores y subfactores evaluados con calificaciones y observaciones.
    - Cuadrantes FODA con resaltado visual de factores críticos.
    - Dictamen final con textos orientadores oficiales de la tesis doctoral.
  - Sanitización de strings contra inyección XML (`xml.sax.saxutils.escape`).

---

### 2.4. Hardening de Seguridad y Aseguramiento de Calidad (Transversal)
- [x] **Throttling y Rate Limiting:** Configurado en DRF para mitigar ataques DoS y fuerza bruta (10 peticiones/min en endpoints de autenticación, 60/min usuarios anónimos, 300/min usuarios autenticados).
- [x] **Cabeceras de Seguridad:** Activadas protecciones XSS, Clickjacking (`X-Frame-Options: DENY`), y `X-Content-Type-Options: nosniff`.
- [x] **Pruebas Automatizadas:** 19/19 pruebas unitarias y de integración pasando al 100% en Django (`guio_core` y `users`).
- [x] **Build Limpio Frontend:** Empaquetado exitoso en Vite/React sin errores de dependencias ni de sintaxis.

---

## 3. Matriz de Cobertura de Requisitos

| Código | Requisito / Historia | Tipo | Estado | Módulo Responsable |
| :--- | :--- | :---: | :---: | :--- |
| **RF-01 / HU-01** | Autenticación y Cuentas | Funcional | **Completado (100%)** | `users/` (JWT + Bcrypt) |
| **RF-02 / HU-02** | Gestión de Usuarios y Roles | Funcional | **Completado (100%)** | `users/`, `Administracion.jsx` |
| **RF-03 / HU-03** | Población Inicial del Catálogo | Funcional | **Completado (100%)** | `seed_catalog.py`, `guio_core` |
| **RF-04 / HU-03** | Mantenimiento del Catálogo (CRUD) | Funcional | **Completado (100%)** | `guio_core/views.py`, `Administracion.jsx` |
| **RF-05 / HU-04** | Ponderación de Importancia del Decisor | Funcional | **Completado (100%)** | `Paso1Factores.jsx`, `engine.py` |
| **RF-06 / HU-04** | Cálculo Automático de Importancia Relativa | Funcional | **Completado (100%)** | `engine.py`, `guiosFormula.js` |
| **RF-07 / HU-04** | Selección y Configuración de Alcance | Funcional | **Completado (100%)** | `Paso1Factores.jsx`, `guio_core` |
| **RF-08 / HU-05** | Calificación Granular de Subfactores | Funcional | **Completado (100%)** | `Paso2Subfactores.jsx` |
| **RF-09 / HU-06** | Generación de la Matriz FODA | Funcional | **Completado (100%)** | `Paso3Resultado.jsx`, `engine.py` |
| **RF-10 / HU-06** | Generación del Dictamen de Adopción | Funcional | **Completado (100%)** | `engine.py`, `guio_core` |
| **RF-11 / HU-07** | Consulta y Filtrado del Historial | Funcional | **Completado (100%)** | `Dashboard.jsx`, `HistorialModal.jsx` |
| **RF-12 / HU-07** | Comparación de Evaluaciones | Funcional | **Completado (100%)** | `ComparadorEvaluaciones.jsx` |
| **RF-13 / HU-08** | Exportación de Reporte en PDF | Funcional | **Completado (100%)** | `pdf_generator.py` |
| **RF-14 / Post-S3**| Búsqueda Asistida de Evidencia (IA) | Ampliación | **Pendiente / Roadmap** | `services/academicApis.js` |
| **RNF-01 a 06** | Rendimiento, Seguridad y Auditoría | No Funcional | **Completado (100%)** | Rate limiting, Bcrypt, Logs, Snapshots |

---

## 4. Lo que Falta por Implementar (Roadmap del Sistema)

Excluyendo la infraestructura de despliegue (Docker) y pipelines de CI/CD para priorizar la funcionalidad directa de la aplicación, las áreas y mejoras pendientes son:

```mermaid
flowchart TD
    A["Sistema Actual Funcional (Sprints 1, 2 y 3)"] --> B["1. Flujo Completo 'Nueva Evaluación'"]
    A --> C["2. Conexión Real de Evidencia Bibliográfica (RF-14)"]
    A --> D["3. Configuración de Keywords de Búsqueda por Factor"]
    A --> E["4. Exportación de Matriz FODA a Excel/CSV"]
    A --> F["5. Pruebas de Usuario y Validación de Casos Reales"]

    B --> B1["Modal para inicializar evaluación en blanco en PostgreSQL y resetear contexto"]
    C --> C1["Conectores a APIs públicas (OpenAlex / Semantic Scholar) en lugar de mocks"]
    D --> D1["Persistir en BD las palabras clave personalizadas de la pestaña de Admin"]
    E --> E1["Descarga de matriz FODA y factores en CSV/XLSX además del PDF"]
    F --> F1["Validación con caso de estudio de la tesis (ej. LibreOffice / Moodle en UNEMI)"]
```

### 4.1. Tarea 1: Flujo Completo de Creación de "Nueva Evaluación" en Blanco
- [ ] En `Dashboard.jsx`, al presionar `+ Nueva evaluación`, abrir un modal formal de creación que:
  - Solicite: Nombre del software, Área/Contexto y Objetivo institucional.
  - Cree el registro en PostgreSQL vía `POST /api/v1/guios/evaluations/`.
  - Limpie y resetee el estado reactivo de `EvaluationContext` (calificaciones en blanco y factores inicializados con los valores base del catálogo).
  - Redirija limpiamente al **Paso 1** con la nueva evaluación activa.

### 4.2. Tarea 2: Conexión Real del Módulo de Evidencia Bibliográfica (RF-14)
- [ ] Sustituir los datos de prueba (`MOCK_EVIDENCIA`) en `frontend/src/pages/Evidencia.jsx` y `Configuracion.jsx`:
  - Implementar un endpoint en el backend `/api/v1/guios/evidencia/` que consulte o almacene las fuentes documentales y citas.
  - Conexión opcional a la API pública y gratuita de **OpenAlex** o **Semantic Scholar** para obtener conteos reales de artículos sobre el software indicado.
  - Cálculo de la tasa de citas para actualizar el cuartil de $IL$ (Importancia de la Literatura).

### 4.3. Tarea 3: Persistencia de Palabras Clave y Filtros por Factor (Admin)
- [ ] En la pestaña **"Palabras clave por factor"** de `Administracion.jsx`:
  - Actualmente las keywords se editan en memoria; agregar persistencia para guardar las cadenas booleanas personalizadas en una tabla de configuración o metadatos de factores.

### 4.4. Tarea 4: Exportación de Datos en Formato Tabular (Excel / CSV)
- [ ] Además del informe oficial en PDF (HU-08), permitir a los evaluadores descargar:
  - La matriz FODA consolidada en formato CSV/Excel.
  - El listado de reactivos con sus observaciones para archivo interno de la organización.

### 4.5. Tarea 5: Validación Metodológica con el Caso de Estudio de la Tesis
- [ ] Cargar y evaluar el caso de estudio oficial de la Universidad Estatal de Milagro (UNEMI) documentado en el Capítulo 6 de la tesis (migración a LibreOffice):
  - Verificar que las calificaciones de los subfactores reproduzcan exactamente el dictamen de la tesis (**Recomendación C** debido a factores críticos tecnológicos).

---

## 5. Próximos Pasos Recomendados

1. **Revisión del usuario de lo implementado:** Comprobar login, roles, catálogo de factores (HU-03), evaluación completa (Pasos 1 a 3), dashboard, comparador y descarga de PDF.
2. **Definir cuál de las tareas funcionales anteriores deseas priorizar:** (ej. creación de nueva evaluación en blanco, exportación CSV o conectar la evidencia bibliográfica).
