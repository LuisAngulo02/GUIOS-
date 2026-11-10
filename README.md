# GUIOSPRO FLOSS Web (GUIOS+) — Sistema de Apoyo a las Decisiones para la Adopción de Software Libre

[![Django](https://img.shields.io/badge/Django-5.x-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

> **Evaluación inteligente y científica para la adopción de soluciones de Software Libre y Fuentes Abiertas (FLOSS).**

---

## 1. Descripción del Sistema

**GUIOSPRO FLOSS Web** (interfaz de usuario **GUIOS+**) es una plataforma web empresarial que implementa de forma íntegra y automatizada la guía metodológica **GUIOS**, desarrollada por el **PhD. Víctor Hugo Rea Sánchez** en su tesis doctoral *"Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas"* (Universidad de Sevilla, 2022).

La metodología combina evidencia empírica de una Revisión Sistemática de la Literatura ($4.429$ estudios analizados y $54$ estudios primarios seleccionados) con la consulta a $57$ expertos en FLOSS de Ecuador y España, estableciendo un catálogo oficial estructurado en:
- **3 Dimensiones:** Tecnológica, Organizacional y Económica.
- **18 Factores de Adopción:** Compatibilidad, Seguridad, Fiabilidad, TCO, Soporte, etc.
- **61 Subfactores Específicos:** Criterios medibles en escala discreta de 1 a 4.

---

## 2. Arquitectura Tecnológica

El sistema implementa una arquitectura desacoplada de 3 capas orientada a microservicios:

```
┌────────────────────────────────────────────────────────┐
│               CAPA 1: CLIENTE (SPA)                    │
│   React 18 + Vite + Tailwind CSS + Lucide Icons        │
│   Estado global reactivo, validaciones en tiempo real │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON / JWT)
┌───────────────────────────▼────────────────────────────┐
│               CAPA 2: SERVICIO (API REST)              │
│   Django 5.x + Django REST Framework (DRF)             │
│   - Autenticación SimpleJWT con blacklist & lockout    │
│   - Motor matemático GUIOS (IR, PM, FODA, Dictamen)    │
│   - Generación de informes PDF con ReportLab           │
│   - RBAC (Administrador / Evaluador) y Auditoría       │
└───────────────────────────┬────────────────────────────┘
                            │ ORM Django (SQL 3FN)
┌───────────────────────────▼────────────────────────────┐
│               CAPA 3: PERSISTENCIA (BD)                │
│   PostgreSQL 15+                                       │
│   - Normalización 3FN con bajas lógicas (soft delete)  │
│   - Preservación histórica de dictámenes (snapshots)   │
│   - Bitácora de operaciones administrativas            │
└────────────────────────────────────────────────────────┘
```

---

## 3. Flujo Metodológico de Evaluación

1. **Paso 0 — Configuración del Caso:** Contexto del software a evaluar, descripción y fuentes.
2. **Paso 1 — Factores Relevantes:** Asignación de la *Importancia del Decisor* ($ID \in [1, 4]$) y cálculo automático de la *Importancia Relativa* ($IR = \lfloor (IS + ID)/2 \rfloor$). Los factores irrelevantes ($IR = 1$) se descartan.
3. **Paso 2 — Calificación de Subfactores:** Calificación granular (1 a 4) de cada reactivo asociado a los factores relevantes y registro de justificaciones/observaciones.
4. **Paso 3 — Matriz FODA y Recomendación Final:**
   - Cálculo de la Ponderación Media ($PM \in [1.00, 4.00]$).
   - Clasificación FODA con umbral en $3.00$ y alcance (Interno/Externo).
   - Identificación de **Factores Críticos** ($PM < 3.00$ con $IR \ge 3$).
   - Emisión del dictamen oficial:
     - **Recomendación A:** Adoptar sin observaciones.
     - **Recomendación B:** Es posible adoptar (riesgos solo en factores opcionales).
     - **Recomendación C:** Requiere recursos antes de adoptar (existen factores críticos).
5. **Historial y Comparador:** Consulta de evaluaciones finalizadas e inspección comparativa lado a lado entre alternativas de software.
6. **Exportación de Informe:** Descarga instantánea del informe ejecutivo y metodológico oficial en formato PDF.

---

## 4. Instalación y Ejecución Local

### Prerrequisitos
- **Python 3.10+** (recomendado 3.12)
- **Node.js 18+** y **npm**
- **PostgreSQL 13+** con base de datos creada (ej. `guiospro_db`)

---

### Paso 1: Configurar el Backend (Django)

1. Abre una terminal en la raíz del proyecto y activa el entorno virtual:
   ```powershell
   # En Windows PowerShell
   .\venv\Scripts\Activate.ps1
   ```
2. Instala las dependencias de Python (si aún no están instaladas):
   ```bash
   pip install -r requirements.txt
   ```
3. Configura tus variables de entorno en el archivo `.env` en la raíz (o utiliza los valores por defecto locales).
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

1. Abre una segunda terminal y navega al directorio del cliente:
   ```bash
   cd frontend
   ```
2. Instala los módulos de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   *El frontend estará disponible en: `http://localhost:5173/`*

---

## 5. Credenciales Semilla por Defecto

| Rol | Correo Electrónico | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@guiosplus.org` | `Admin2026!` | Control total, gestión de usuarios, auditoría, CRUD de factores y catálogo. |
| **Evaluador** | `evaluador@guiosplus.org` | `Evaluador2026!` | Creación de evaluaciones, matriz FODA, historial, comparador y descarga PDF. |

---

## 6. Pruebas Automatizadas y Calidad

Para ejecutar la batería completa de pruebas unitarias y de integración del backend:

```bash
python manage.py test
```
*Garantiza el 100% de éxito en 19 suites de prueba (autenticación JWT, RBAC, motor matemático GUIOS, protección de histórico, generador PDF y CRUD del catálogo).*

Para verificar la compilación y tipado del frontend:

```bash
cd frontend
npm run build
```

---

## 7. Estructura del Repositorio

```
GUIOSAD/
├── docs/                                  # Documentación de tesis y arquitectura
│   ├── context.md                         # Especificación maestra de requisitos y UI
│   ├── PLAN_DE_DESARROLLO.md              # Estado de avance y hoja de ruta
│   └── tesis/                             # Resumen de los 8 capítulos de la tesis
│
├── guiospro_backend/                      # Configuración Django (settings, urls, wsgi)
│   ├── settings.py                        # SimpleJWT, CORS, Throttling, Security headers
│   └── urls.py                            # Rutas globales de la API REST
│
├── guio_core/                             # Aplicación central de la metodología GUIOS
│   ├── models.py                          # Esquema de BD: Dimension, Factor, Subfactor, Evaluacion
│   ├── views.py                           # ViewSets para evaluaciones, catálogo admin y métricas
│   ├── serializers.py                     # Serializadores DRF con validaciones metodológicas
│   ├── engine.py                          # Motor de cálculo matemático (IR, PM, FODA, Dictamen)
│   ├── pdf_generator.py                   # Generador de reportes oficiales con ReportLab
│   ├── tests.py                           # Pruebas automatizadas de flujo y catálogo
│   └── management/commands/seed_catalog.py# Poblador de fixtures de la tesis
│
├── users/                                 # Aplicación de seguridad y cuentas
│   ├── views.py                           # Login, registro, logout, gestión de cuentas y auditoría
│   ├── serializers.py                     # Validaciones de usuario y cambio de contraseña
│   └── tests.py                           # Pruebas de RBAC y bloqueo de fuerza bruta
│
├── frontend/                              # SPA React (Vite)
│   ├── src/
│   │   ├── pages/                         # Vistas principales (Dashboard, Pasos 1-3, Administracion)
│   │   ├── components/                    # Componentes modulares y visuales (Badges, Modales, FODA)
│   │   ├── context/                       # EvaluationContext (Estado global reactivo)
│   │   └── services/apiService.js         # Cliente Axios/Fetch para la API REST con JWT
│   ├── package.json
│   └── vite.config.js
│
├── manage.py
├── requirements.txt
└── README.md
```

---

## 8. Plan de Desarrollo y Roadmap

Para conocer el detalle de los requerimientos completados (Sprints 1 al 3) y las tareas pendientes (Contenedorización Docker, CI/CD y APIs Académicas con IA), consulta:

👉 [**Plan Maestro de Desarrollo (`docs/PLAN_DE_DESARROLLO.md`)**](docs/PLAN_DE_DESARROLLO.md)

---

## 9. Licencia y Créditos

- **Autor de la Tesis Doctoral:** Dr. Víctor Hugo Rea Sánchez (Universidad de Sevilla).
- **Directores de Tesis:** Dr. Pablo Neira Ayuso, Dr. David Benavides Cuevas.
- **Licencia:** AGPL-3.0 (GNU Affero General Public License v3.0). Compatible con investigación y uso institucional público.
