# GUIOSPRO FLOSS Web (GUIOS+) — Sistema de Apoyo a las Decisiones para la Adopción de Software Libre

[![Django](https://img.shields.io/badge/Django-5.x-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

> **Evaluación inteligente, científica y automatizada para la adopción estratégica de soluciones de Software Libre y Fuentes Abiertas (FLOSS).**

> [!TIP]
> Consulta la guía visual y matemática completa de principio a fin en **[FLUJO_DEL_SISTEMA.md](FLUJO_DEL_SISTEMA.md)**.

---

## 1. Descripción del Sistema

**GUIOSPRO FLOSS Web** (interfaz de usuario **GUIOS+**) es una plataforma web empresarial que implementa de forma íntegra y automatizada la guía metodológica **GUIOS**, desarrollada por el **PhD. Víctor Hugo Rea Sánchez** en su tesis doctoral *"Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas"* (Universidad de Sevilla, 2022).

La metodología combina evidencia empírica de una Revisión Sistemática de la Literatura ($4.429$ estudios analizados y $54$ estudios primarios seleccionados) con la consulta a $57$ expertos en FLOSS de Ecuador y España, estableciendo un catálogo oficial estructurado en:
- **3 Dimensiones:** Tecnológica, Organizacional y Económica.
- **18 Factores de Adopción:** Compatibilidad, Seguridad, Fiabilidad, TCO, Soporte, etc.
- **61 Subfactores Específicos:** Criterios medibles en escala discreta de 1 a 4 con justificación y evidencia.

Además, el sistema integra motores de **Inteligencia Artificial Académica y Consultas Bibliográficas en Vivo** (OpenAlex Polite Pool, Google Gemini y Scopus) para estimar automáticamente la Importancia Sugerida ($IS$) preliminar antes del juicio humano.

---

## 2. Arquitectura Tecnológica

El sistema implementa una arquitectura desacoplada de 3 capas orientada a microservicios:

```
┌────────────────────────────────────────────────────────┐
│               CAPA 1: CLIENTE (SPA)                    │
│   React 18 + Vite + Tailwind CSS + Lucide Icons        │
│   - Estado reactivo global (EvaluationContext)         │
│   - Comparador en paralelo con exportación a Excel     │
│   - Panel administrativo y de auditoría empresarial    │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / JWT)
┌───────────────────────────▼────────────────────────────┐
│               CAPA 2: SERVICIO (API REST)              │
│   Django 5.x + Django REST Framework (DRF)             │
│   - Autenticación SimpleJWT con blacklist & lockout    │
│   - Motor matemático GUIOS (IR, PM, FODA, Dictamen)    │
│   - Integración con OpenAlex API y Gemini IA           │
│   - Generación de informes ejecutivos PDF (ReportLab)  │
│   - RBAC (Administrador / Evaluador) y Auditoría       │
└───────────────────────────┬────────────────────────────┘
                            │ ORM Django (SQL 3FN)
┌───────────────────────────▼────────────────────────────┐
│               CAPA 3: PERSISTENCIA (BD)                │
│   PostgreSQL 15+                                       │
│   - Normalización 3FN con bajas lógicas (soft delete)  │
│   - Parámetros de cálculo globales y bitácora          │
│   - Historial de consultas científicas y auditoría     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Flujo Metodológico de Evaluación

```
[ + Nueva Evaluación ]
         │
         ▼
[ Paso 0: Configuración y Evidencia ] ──► (OpenAlex / Gemini IA / Scopus) ──► Calcula IS preliminar
         │
         ▼
[ Paso 1: Factores Relevantes ]      ──► Evaluador califica ID ──► IR = ⌊(IS + ID)/2⌋ (Umbral ≥ 2)
         │
         ▼
[ Paso 2: Evaluación Subfactores ]   ──► Calificación granular (1-4) + Observación / Evidencia
         │
         ▼
[ Paso 3: Dictamen y Matriz FODA ]   ──► Ponderación Media (PM), Factores Críticos, FODA y Dictamen
         │
         ▼
[ Informes & Comparativa ]           ──► PDF Oficial, Excel (.xls corporativo) y CSV
```

1. **Nueva Evaluación:** Crea el expediente de software, versión y contexto en blanco, redirigiendo automáticamente al Paso 0.
2. **Paso 0 — Configuración y Evidencia Bibliográfica:** Conexión con bases de datos científicas e IA para rastrear publicaciones, citas mundiales y calcular la Importancia Sugerida ($IS$) preliminar.
3. **Paso 1 — Factores Relevantes:** Asignación de la *Importancia del Decisor* ($ID \in [1, 4]$) y cálculo de la *Importancia Relativa* ($IR = \lfloor (IS + ID)/2 \rfloor$). Factores con $IR = 1$ se descartan automáticamente por irrelevantes.
4. **Paso 2 — Calificación de Subfactores:** Calificación granular (1 a 4) de cada reactivo con área de texto multilínea para redactar observaciones, argumentos técnicos y enlaces a evidencias.
5. **Paso 3 — Matriz FODA y Recomendación Final:**
   - Cálculo de la Ponderación Media ($PM \in [1.00, 4.00]$).
   - Clasificación FODA con umbral metodológico en $3.00$ y asignación de alcance (Interno/Externo).
   - Detección de **Factores Críticos** ($PM < 3.00$ con $IR \ge 3$).
   - Emisión del dictamen oficial:
     - **Recomendación A:** Adoptar sin observaciones.
     - **Recomendación B:** Es posible adoptar (riesgos solo en factores opcionales).
     - **Recomendación C:** Requiere recursos antes de adoptar (existen factores críticos).
6. **Comparador en Paralelo (Side-by-Side):** Análisis simultáneo de 2 soluciones FLOSS con cálculo de diferencias técnicas (+0.25 ventaja), filtros por factores críticos y exportación directa a Excel y CSV.
7. **Eliminación y Gestión de Evaluaciones:** Borrado seguro con confirmación modal y registro de auditoría en la base de datos.
8. **Exportación de Informes:**
   - PDF oficial con sellos metodológicos y membrete institucional generado vía ReportLab.
   - Libro de Excel (.xls) profesional estilizado con paleta corporativa (`#2F5444`) y desglose de los 61 reactivos.

---

## 4. Módulo de Administración

El sistema cuenta con un panel administrativo completo dividido en 6 pestañas especializadas:
1. **Usuarios:** Control de accesos, roles (Administrador / Evaluador) y estado activo.
2. **Fuentes Bibliográficas:** Monitoreo y estado de conexión de proveedores científicos (OpenAlex, Scopus, Google Gemini, Semantic Scholar).
3. **Factores GUIOS:** Visualización y edición del catálogo oficial de 18 factores de la tesis.
4. **Palabras Clave por Factor:** Mapeo de descriptores en español e inglés para búsquedas bibliográficas automatizadas.
5. **Historial de Consultas:** Registro persistente de consultas académicas ejecutadas por software y contexto con conteo de documentos recuperados.
6. **Parámetros de Cálculo:** Configuración de ventana temporal (ej. 2016–2026), selección de idiomas (ES · EN · PT / Solo Español / Solo Inglés / Todos) y modo de cálculo.

---

## 5. Instalación y Ejecución Local

### Prerrequisitos
- **Python 3.10+** (recomendado 3.12 o 3.13)
- **Node.js 18+** y **npm**
- **PostgreSQL 13+** con base de datos creada (ej. `guiospro_db`)

---

### Paso 1: Configurar el Backend (Django)

1. Abre una terminal en la raíz del proyecto y activa el entorno virtual:
   ```powershell
   # En Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
2. Instala las dependencias de Python:
   ```bash
   pip install -r requirements.txt
   ```
3. Configura tus variables de entorno en el archivo `.env`:
   ```env
   SECRET_KEY=tu_clave_secreta
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DB_NAME=guiospro_db
   DB_USER=postgres
   DB_PASSWORD=tu_password
   DB_HOST=127.0.0.1
   DB_PORT=5432
   OPENALEX_EMAIL=guiospro@research.local
   GEMINI_API_KEY=tu_api_key_de_gemini
   GEMINI_MODEL=gemini-flash-lite-latest

   # Correo Electrónico Saliente y Recuperación de Contraseña (SMTP)
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=tu_correo@gmail.com
   EMAIL_HOST_PASSWORD=tu_contraseña_de_aplicacion
   DEFAULT_FROM_EMAIL=GUIOS+ <tu_correo@gmail.com>
   FRONTEND_URL=http://localhost:5173
   ```
4. Aplica las migraciones de base de datos:
   ```bash
   python manage.py migrate
   ```
5. Carga los datos semilla oficiales (Roles, Dimensiones, Factores, Subfactores y Recomendaciones de la tesis):
   ```bash
   python manage.py seed_catalog
   ```
6. Inicia el servidor de desarrollo Django:
   ```bash
   python manage.py runserver
   ```
   *El backend estará disponible en: `http://127.0.0.1:8000/`*

---

### Paso 2: Configurar el Frontend (React + Vite)

1. Abre una segunda terminal y navega al directorio del frontend:
   ```bash
   cd frontend
   ```
2. Instala los paquetes de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   *El frontend estará disponible en: `http://localhost:5173/`*

---

## 6. Credenciales Semilla por Defecto

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@guiosplus.org` | `Admin2026!` | Control total, gestión de usuarios, auditoría, parámetros de cálculo y catálogo. |
| **Evaluador** | `evaluador@guiosplus.org` | `Evaluador2026!` | Creación y eliminación de evaluaciones, matriz FODA, historial, comparador, PDF y Excel. |

> *Nota: También se incluye el botón de acceso directo para cargar el **Caso de Validación Oficial UNEMI · LibreOffice** (Capítulo 6 de la tesis) con 18 factores y 61 reactivos calificados.*

---

## 7. Pruebas Automatizadas y Calidad

Para ejecutar la batería completa de pruebas unitarias y de integración del backend:

```bash
python manage.py test guio_core users
```
*Garantiza el 100% de éxito en **31 suites de prueba** (autenticación JWT, bloqueo por fuerza bruta, recuperación de contraseña con token criptográfico y envío SMTP, motor matemático GUIOS, protección de histórico, parámetros de cálculo, consultas científicas, generador PDF y CRUD del catálogo).*

Para verificar la compilación del frontend:

```bash
cd frontend
npm run build
```

---

## 8. Estructura del Repositorio

```
GUIOSAD/
├── FLUJO_DEL_SISTEMA.md                   # Guía visual y matemática del flujo integral
├── docs/                                  # Documentación de tesis y arquitectura
│   ├── context.md                         # Especificación maestra de requisitos y UI
│   ├── PLAN_DE_DESARROLLO.md              # Estado de avance y hoja de ruta
│   └── tesis/                             # Resumen metodológico de los 8 capítulos
│
├── guiospro_backend/                      # Configuración Django (settings, urls, wsgi)
│   ├── settings.py                        # SimpleJWT, CORS, Throttling, SMTP, Security headers
│   └── urls.py                            # Rutas globales de la API REST
│
├── guio_core/                             # Aplicación central de la metodología GUIOS
│   ├── models.py                          # Esquema de BD: Factores, Evaluaciones, ParametroGlobal
│   ├── views.py                           # ViewSets para evaluaciones, historial, admin y métricas
│   ├── serializers.py                     # Serializadores DRF con validaciones metodológicas
│   ├── engine.py                          # Motor de cálculo matemático (IR, PM, FODA, Dictamen)
│   ├── pdf_generator.py                   # Generador de reportes oficiales con ReportLab
│   ├── services/
│   │   ├── academic_ai_service.py         # Cliente OpenAlex Polite Pool y Google Gemini
│   │   ├── subfactor_ai_service.py        # Asistente de precalificación ágil con IA
│   │   └── recommendation_ai_service.py   # Recomendaciones personalizadas con IA
│   ├── tests.py                           # Pruebas automatizadas de flujo y catálogo
│   └── management/commands/seed_catalog.py# Poblador de fixtures de la tesis
│
├── users/                                 # Aplicación de seguridad, autenticación y cuentas
│   ├── views.py                           # Login, registro, logout, reseteo de clave, auditoría
│   ├── serializers.py                     # Validaciones de usuario y contraseñas
│   └── tests.py                           # 14 pruebas de RBAC, fuerza bruta y restablecimiento
│
├── frontend/                              # SPA React (Vite)
│   ├── src/
│   │   ├── pages/                         # Dashboard, Pasos 0-3, Administracion, ResetPassword
│   │   ├── components/                    # Modales, Badges, Comparador Side-by-Side
│   │   ├── context/                       # EvaluationContext (Estado global reactivo)
│   │   └── services/apiService.js         # Cliente API REST con autenticación JWT
│   ├── package.json
│   └── vite.config.js
│
├── manage.py
├── requirements.txt
└── README.md
```

---

## 9. Licencia y Créditos

- **Autor de la Tesis Doctoral:** Dr. Víctor Hugo Rea Sánchez (Universidad de Sevilla).
- **Directores de Tesis:** Dr. Pablo Neira Ayuso, Dr. David Benavides Cuevas.
- **Licencia:** AGPL-3.0 (GNU Affero General Public License v3.0). Compatible con investigación y uso institucional público.
