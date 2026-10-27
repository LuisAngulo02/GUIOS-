# CONTEXT.md — GUIOSPRO FLOSS Web (Marca UI: GUIOS+)

## 1. Resumen Ejecutivo, Origen Académico y Regla de Oro
**GUIOSPRO FLOSS Web** (interfaz bajo la marca **GUIOS+**, *"Evaluación inteligente para adopción FLOSS"*) es la evolución tecnológica del prototipo `GUIOSAD v0.1.2` / `GUIOS PRO`. El sistema automatiza la guía metodológica **GUIOS**, creada por el **PhD. Víctor Hugo Rea Sánchez** en su tesis doctoral *"Factores para la adopción de soluciones basadas en software libre y fuentes abiertas"* (Universidad de Sevilla, junio de 2022, dirigida por el Dr. Pablo Neira Ayuso y el Dr. David Benavides Cuevas).

La investigación doctoral filtró $4429$ estudios (obteniendo $54$ estudios primarios de revistas en IEEE, ACM, Scopus y Web of Science entre 2008 y 2019, más $15$ artículos de congresos mediante muestreo de bola de nieve) e identificó inicialmente $22$ factores. Tras depurar $4$ factores sin subfactores propios (integrando los costos de licencia, operación y soporte dentro de TCO y descartando reingeniería de procesos), estableció un marco definitivo validado por **$57$ expertos internacionales en FLOSS** compuesto por **3 dimensiones, 18 factores y 61 subfactores**.

> **REGLA DE ORO INQUEBRANTABLE DEL PROYECTO:**
> El sistema web **preserva íntegramente la lógica matemática y metodológica de la guía GUIOS** definida en la tesis doctoral (escalas discretas de 1 a 4, matriz de Importancia Relativa, cálculo de Ponderación Media de subfactores, clasificación FODA según alcance Interno/Externo con umbral en $3.0$, y regla de recomendación A, B o C). La innovación recae exclusivamente en la arquitectura web de 3 capas, persistencia relacional, gestión multiusuario por roles, trazabilidad de evidencia, exportación de informes en PDF y experiencia de usuario (GUIOS+).

---

## 2. Estado Actual del Código vs. Arquitectura Web Destino

### 2.1. Punto de Partida (Prototipo Actual en el Repositorio)
* **Backend actual:** Python 3.9 con `pandas`, `numpy`, servidor asíncrono `tornado` y toolkit `flexx` (`pscript`, `webruntime`, `dialite`), estructurado en `guiosad.py` y carpeta `core/` (`DataLoader` y `GuiosadEngine`).
* **Frontend actual:** Carpeta `pages/` con HTML5 semántico (`index.html`), Vanilla CSS (`styles.css`) y Vanilla JS en ES Modules (`app.js`, `dataset.js`, `components/`, `hooks/`).
* **Datos actuales:** Archivos planos estáticos (CSV separados por tabulaciones / JSON en carpeta `data/`) sin base de datos relacional, sin autenticación de usuarios ni persistencia de sesiones.

### 2.2. Arquitectura Destino (RNF-01 a RNF-08)
Arquitectura cliente-servidor de **tres capas** empaquetada en contenedores **Docker (`docker-compose`)**:
1. **Capa 1 — Presentación (Frontend):** **React.js** (SPA responsiva, compatible con las 2 últimas versiones de Chrome, Firefox y Edge). Línea gráfica **GUIOS+** en tonos verdes (`#3F6F58` en barra superior, fondo general verde muy claro, tarjetas blancas, botones de acción verdes).
2. **Capa 2 — Lógica de Negocio (Backend API REST):** **Django REST Framework (DRF)** sobre **Python 3.x**.
   * **Seguridad (RNF-02):** Autenticación con tokens **JWT** de expiración configurable y contraseñas cifradas con hash **bcrypt**. Bloqueo temporal de cuenta (`bloqueado_hasta`) tras **$5$ intentos fallidos consecutivos** (`intentos_fallidos`).
   * **Mantenibilidad (RNF-06):** Código bajo principios SOLID, versionado en Git y cobertura de pruebas unitarias $\ge 70\%$ en el motor de cálculo GUIOS.
   * **Rendimiento (RNF-01) y Disponibilidad (RNF-03):** Tiempo de respuesta $< 3\text{ s}$ en el $95\%$ de operaciones interactivas ($< 1\text{ s}$ en recálculos locales, $< 2\text{ s}$ en login/usuarios) y $\le 5\text{ s}$ en generación de PDF en el backend. Disponibilidad $\ge 99\%$ en horario académico.
3. **Capa 3 — Datos (Persistencia):** **PostgreSQL 13+** con esquema relacional normalizado hasta la Tercera Forma Normal (**3FN**).

---

## 3. Fundamento Matemático y Reglas de Negocio Exactas (Tesis Cap. 5 y 6)

### 3.1. Los 5 Indicadores de Importancia de la Tesis (Sección 5.2.3)
Todos los indicadores de importancia operan sobre la misma escala discreta de $4$ niveles:
* $1 =$ **Irrelevante** (*No merece la pena dedicar recursos a cumplir esta característica, puede obviarse*).
* $2 =$ **Opcional** (*Si no está presente no supone un problema para la adopción*).
* $3 =$ **Importante** (*Es deseable que esté presente; si no lo está, pueden surgir problemas en la adopción*).
* $4 =$ **Fundamental** (*Es indispensable; esta característica debe cumplirse obligatoriamente*).

1. **Importancia del Experto ($IE \in \{1, 2, 3, 4\}$):**
   Obtenida en la tesis a partir de la encuesta a $57$ expertos ($77.2\%$ sector público, $15.8\%$ privado, $47.4\%$ con $>10$ años de experiencia en FLOSS). Se promedian las valoraciones de los subfactores del factor en el rango $[1.0, 4.0]$ y se redondea a entero con la regla de la tesis: si el primer decimal es $\le 4$ se mantiene el entero (ej. $3.3 \rightarrow 3$); si es $\ge 5$ sube al siguiente entero (ej. $3.7 \rightarrow 4$). En la tesis (Tabla 5.3), los $18$ factores obtuvieron $IE = 3$.
2. **Importancia de la Literatura ($IL \in \{1, 2, 3, 4\}$):**
   Por cada factor $i$, se divide el total de citas bibliográficas de sus subfactores ($c_i$ o $TC$) entre el número de subfactores del factor ($n$ o $NS$):
   $$r_i = \frac{c_i}{n}$$
   Luego se clasifica $r_i$ según los cuartiles ($r_{q1}, r_{q2}, r_{q3}, r_{q4}$) del conjunto de los $18$ factores:
   $$IL(r_i) = \begin{cases} 1 & \text{si } r_i \le r_{q1} \\ 2 & \text{si } r_{q1} < r_i \le r_{q2} \\ 3 & \text{si } r_{q2} < r_i \le r_{q3} \\ 4 & \text{si } r_{q3} < r_i \le r_{q4} \end{cases}$$
3. **Importancia Sugerida ($IS \in \{1, 2, 3, 4\}$):**
   Unifica $IL$ e $IE$ mediante la matriz de producto cartesiano de la Figura 5.10 de la tesis (inspirada en Rincón et al., 2018), cuya expresión matemática exacta es el promedio entero redondeado hacia abajo:
   $$IS = \left\lfloor \frac{IL + IE}{2} \right\rfloor$$
4. **Importancia del Decisor ($ID \in \{1, 2, 3, 4\}$):**
   Valoración asignada por el Evaluador/Decisor en el **Paso 1** según las necesidades de su organización.
5. **Importancia Relativa ($IR \in \{1, 2, 3, 4\}$):**
   Combina la Importancia Sugerida ($IS$) y la Importancia del Decisor ($ID$) empleando exactamente la misma matriz cartesiana de la Figura 5.10 de la tesis:
   $$IR = \left\lfloor \frac{IS + ID}{2} \right\rfloor$$

#### Matriz Cartesiana Oficial para $IS = f(IL, IE)$ e $IR = f(IS, ID)$ (Figura 5.10, pág. 90 de la Tesis):
| Eje Y ($IE$ o $ID$) \ Eje X ($IL$ o $IS$) | **1 (Irrelevante)** | **2 (Opcional)** | **3 (Importante)** | **4 (Fundamental)** |
| :--- | :---: | :---: | :---: | :---: |
| **4 (Fundamental)** | Opcional ($2$) | Importante ($3$) | Importante ($3$) | Fundamental ($4$) |
| **3 (Importante)** | Opcional ($2$) | Opcional ($2$) | Importante ($3$) | Importante ($3$) |
| **2 (Opcional)** | Irrelevante ($1$) | Opcional ($2$) | Opcional ($2$) | Importante ($3$) |
| **1 (Irrelevante)** | Irrelevante ($1$) | Irrelevante ($1$) | Opcional ($2$) | Opcional ($2$) |

### 3.2. Selección de Factores Relevantes y Alcance (Pasos 1 y 2 de GUIOS — Pestaña 1)
* **Filtro de Relevancia:** Un factor es **Relevante** si y solo si $IR > 1$ (es decir, $IR \in \{\text{Opcional (2)}, \text{Importante (3)}, \text{Fundamental (4)}\}$). Los factores con $IR = 1$ (`Irrelevante`) se excluyen de la Pestaña 2. Si los $18$ factores quedan como `Irrelevante`, el sistema impide avanzar al Paso 2.
* **Clasificación de Alcance (`Interno`, `Externo`, `Ambos`):**
  * **Factores Internos (7):** Determinados por la propia organización adoptante (Formación, Tiempo de adopción, Centralidad de la TI, Apoyo de la alta dirección, Actitud hacia el cambio, Coste total de propiedad, y Soporte si se asume con personal propio).
  * **Factores Externos (12):** Determinados por las características técnicas e intrínsecas del software FLOSS y su ecosistema (los $9$ tecnológicos más Casos de estudio de adopción FLOSS, Bloqueo de proveedores, y Soporte si depende de terceros/comunidad).
  * **Regla del factor Soporte (`Ambos`):** Es el único factor del catálogo base con alcance `Ambos`. Si resulta Relevante ($IR > 1$), el Evaluador está obligado a seleccionar en la Pestaña 1 si se evaluará como `Interno` o `Externo`. Si resulta `Irrelevante`, no se exige selección y `alcance_aplicado` se guarda `NULL`.

### 3.3. Ponderación de Subfactores y Ponderación Media (Pasos 3 y 4 de GUIOS — Pestaña 2)
* **Ponderación del Subfactor ($PS \in \{1, 2, 3, 4\}$):** Cada subfactor de un factor relevante se califica con una de $4$ opciones:
  * $1 =$ **No cumple el requisito**
  * $2 =$ **Desconozco si cumple el requisito** *(en la tesis también llamado "No sé")*
  * $3 =$ **Cumple parcialmente el requisito**
  * $4 =$ **Cumple el requisito**
* **Ponderación Media del Factor ($PM \in [1.00, 4.00]$):**
  Promedio aritmético simple de las calificaciones $PS$ de los $k$ subfactores pertenecientes al factor $i$:
  $$pm_i = \frac{1}{k} \sum_{j=1}^{k} PS_{i,j}$$
  En interfaz se muestra con formato `"x,x / 4,0"` y en base de datos se almacena como `NUMERIC(3,2)`.
* **Bloqueo de completitud:** No se puede avanzar a la Pestaña 3 ni emitir recomendación mientras exista al menos un subfactor sin calificar dentro de los factores relevantes.

### 3.4. Clasificación FODA y Dictamen de Adopción (Pasos 5 y 6 de GUIOS — Pestaña 3)
1. **Regla de Asignación FODA (Ecuación 5.3, pág. 91 de la Tesis):**
   Para cada factor relevante evaluado $i$ con ponderación media $pm_i$ y alcance aplicado $\text{impacto}_i \in \{\text{Interno}, \text{Externo}\}$:
   $$\text{FODA}(pm_i, \text{impacto}_i) = \begin{cases} \text{Fortaleza} & \text{si } pm_i \ge 3.00 \text{ e } \text{impacto}_i = \text{Interno} \\ \text{Oportunidad} & \text{si } pm_i \ge 3.00 \text{ e } \text{impacto}_i = \text{Externo} \\ \text{Debilidad} & \text{si } pm_i < 3.00 \text{ e } \text{impacto}_i = \text{Interno} \\ \text{Amenaza} & \text{si } pm_i < 3.00 \text{ e } \text{impacto}_i = \text{Externo} \end{cases}$$
2. **Marca de Factor Crítico (`critico = TRUE`):**
   Todo factor clasificado como **Debilidad** o **Amenaza** ($pm_i < 3.00$) cuya Importancia Relativa ($IR$) sea **Importante ($3$)** o **Fundamental ($4$)** se marca como **Crítico**.
3. **Regla Exacta del Dictamen (A, B o C):**
   * **Recomendación A — Adoptar:** Todos los factores relevantes evaluados tienen $pm_i \ge 3.00$ (todos son **Fortalezas** u **Oportunidades**).
   * **Recomendación B — Es posible adoptar:** Existen factores con $pm_i < 3.00$ (**Debilidades** o **Amenazas**), pero **únicamente** en factores cuya Importancia Relativa ($IR$) es **Opcional ($2$)** (ningún factor crítico).
   * **Recomendación C — Requiere recursos antes de adoptar:** Existe **al menos un factor** con $pm_i < 3.00$ (**Debilidad** o **Amenaza**) cuya Importancia Relativa ($IR$) es **Importante ($3$)** o **Fundamental ($4$)** (al menos un factor `critico = TRUE`).

#### Textos Oficiales de las Recomendaciones en la Tesis Doctoral (Cap. 6, págs. 104-106):
* **Tipo A (Título corto UI):** *"Adoptar"* / *"Adoptar sin observaciones"*
  * **Texto en prototipo (Fig. 6.6):** *"Recomendación A: Adoptar. Todos los factores han sido identificados como Oportunidades y/o Fortalezas. Esto quiere decir que la organización cumple satisfactoriamente con la mayoría de requisitos para adoptar la solución FLOSS."*
  * **Explicación orientadora de la tesis (pág. 105):** Si existen subfactores puntuales que no alcanzaron el máximo, se sugiere revisar las debilidades/amenazas asociadas a esos subfactores específicos para proponer mejoras puntuales a la alta gerencia.
* **Tipo B (Título corto UI):** *"Es posible adoptar"* / *"Es posible adoptar con sugerencias por revisar"*
  * **Texto en prototipo (Fig. 6.6):** *"Recomendación B: Es posible adoptar. A pesar que se han detectado amenazas y/o debilidades en factores cuya importancia relativa es opcional, por lo tanto, se sugiere revisar los criterios que no cumplen con lo mínimo requerido para adoptar."*
  * **Explicación orientadora de la tesis (pág. 105):** Se sugiere realizar una segunda evaluación específica sobre los subfactores que no cumplen los requisitos en esos factores opcionales (ej. acciones formativas al personal TIC, contratación de consultores externos, documentación en múltiples formatos, reducir dependencia de proveedores o revisar costes ocultos).
* **Tipo C (Título corto UI):** *"Requiere recursos antes de adoptar"*
  * **Texto en prototipo (Fig. 6.5):** *"Recomendación C: La organización debe de proporcionar los recursos necesarios que garanticen una adopción satisfactoria. Si se trata de factores internos deben de ser aspectos a mejorar dentro de la organización y si son factores externos, dedicar recursos de ingeniería para mejorar el software."*
  * **Explicación orientadora de la tesis (pág. 105):** Se sugiere posponer o condicionar la adopción hasta asignar recursos. Si los factores críticos son **internos**, implementar mejoras organizacionales (planes de entrenamiento, soporte técnico 24/7/365, desarrolladores internos capaces de adaptar el software, incentivos para mejorar la actitud hacia el cambio). Si son **externos**, dedicar recursos de ingeniería para mejorar el software (compatibilidad de hardware/SO, facilidad de personalización sin tocar código fuente, facilidad de despliegue y prueba).
  * **Mejora obligatoria en GUIOSPRO FLOSS Web (RF-10):** El dictamen concatenará dinámicamente los nombres de los factores que causaron la Debilidad/Amenaza (distinguiendo los marcados como **Crítico** de los opcionales) y guardará el texto resultante congelado en `evaluaciones.dictamen_texto`.

### 3.5. Indicadores Informativos de la Pestaña 3 (No modifican la letra A, B o C)
* **Balance FODA:** Conteo de Fortalezas ($F$), Oportunidades ($O$), Debilidades ($D$) y Amenazas ($A$), mostrando la relación $(F + O)$ frente a $(D + A)$.
* **Índice de Viabilidad FLOSS ($\%$):**
  $$\text{Índice de Viabilidad} = \left( \frac{\text{Factores relevantes evaluados que son } F \text{ u } O}{\text{Total de factores relevantes evaluados}} \right) \times 100$$
* **Nivel de Confianza (`Alto`, `Medio`, `Bajo`):**
  Sea $\%R$ el porcentaje de subfactores calificados con valor distinto de $2$ (*"Desconozco si cumple el requisito"*):
  * $\%R \ge 90\% \rightarrow$ `Alto`
  * $60\% \le \%R < 90\% \rightarrow$ `Medio`
  * $\%R < 60\% \rightarrow$ `Bajo`

---

## 4. Catálogo Oficial Completo (Datos Semilla / Fixtures de la Tesis)

### 4.1. Tabla Maestra de Dimensiones (3) y Factores (18)
*Nota técnica sobre `Usabilidad`:* En la Tabla 5.3 de la tesis (pág. 88) Usabilidad figura con $IL=2 \rightarrow IS=2$ (Opcional), pero en los archivos CSV del prototipo `GUIOSAD v0.1.2` (pág. 99 de la tesis y pág. 9 del informe Sprint 0) viene precargado como **`Importante (3)`**. Se debe usar el valor de los CSV de GUIOSAD (`3 = Importante` para los $10$ factores mostrados a continuación y `2 = Opcional` para los $8$ restantes) para mantener $100\%$ de compatibilidad con las capturas y pruebas del docente.

| ID | Dimensión | Nombre del Factor | $NS$ (Subfactores) | $TC$ (Citas Tesis) | $IE$ (Experto) | $IL$ (Literatura) | `importancia_literatura` ($IS$ CSV GUIOSAD) | `alcance` |
| :-: | :--- | :--- | :-: | :-: | :-: | :-: | :---: | :---: |
| 1 | Tecnológica | **Compatibilidad** | 8 | 33 | 3 | 3 | **3 (Importante)** | `Externo` |
| 2 | Tecnológica | **Personalización** | 6 | 30 | 3 | 4 | **3 (Importante)** | `Externo` |
| 3 | Tecnológica | **Prueba** | 1 | 4 | 3 | 3 | **3 (Importante)** | `Externo` |
| 4 | Tecnológica | **Fiabilidad** | 5 | 19 | 3 | 3 | **3 (Importante)** | `Externo` |
| 5 | Tecnológica | **Reusabilidad** | 2 | 5 | 3 | 2 | **2 (Opcional)** | `Externo` |
| 6 | Tecnológica | **Usabilidad** | 4 | 14 | 3 | 2 | **3 (Importante)** *(2 en Tabla 5.3)* | `Externo` |
| 7 | Tecnológica | **Mantenibilidad** | 1 | 4 | 3 | 3 | **3 (Importante)** | `Externo` |
| 8 | Tecnológica | **Portabilidad** | 2 | 4 | 3 | 2 | **2 (Opcional)** | `Externo` |
| 9 | Tecnológica | **Documentación** | 11 | 20 | 3 | 1 | **2 (Opcional)** | `Externo` |
| 10 | Organizacional | **Formación** | 4 | 27 | 3 | 4 | **3 (Importante)** | `Interno` |
| 11 | Organizacional | **Tiempo de adopción** | 2 | 2 | 3 | 1 | **2 (Opcional)** | `Interno` |
| 12 | Organizacional | **Casos de estudio de adopción FLOSS** | 1 | 1 | 3 | 1 | **2 (Opcional)** | `Externo` |
| 13 | Organizacional | **Centralidad de la tecnología de la información** | 2 | 2 | 3 | 1 | **2 (Opcional)** | `Interno` |
| 14 | Organizacional | **Apoyo de la alta dirección** | 1 | 5 | 3 | 4 | **2 (Opcional)** *(3 en Tabla 5.3)* | `Interno` |
| 15 | Organizacional | **Bloqueo de proveedores** | 1 | 3 | 3 | 2 | **2 (Opcional)** | `Externo` |
| 16 | Organizacional | **Soporte** | 6 | 43 | 3 | 4 | **3 (Importante)** | `Ambos` |
| 17 | Organizacional | **Actitud hacia el cambio** | 2 | 3 | 3 | 1 | **2 (Opcional)** | `Interno` |
| 18 | Económica | **Coste total de propiedad** | 2 | 24 | 3 | 4 | **3 (Importante)** | `Interno` |

### 4.2. Catálogo Completo de los 61 Subfactores (`SF-01` a `SF-61`)
Extraídos literalmente de la Tabla 5.1 (págs. 75-79), Figuras 5.7 a 5.9 (págs. 84-85) y capturas de `GUIOSAD` de la tesis doctoral:

#### Dimensión 1: Tecnológica (40 subfactores)
* **Factor 1: Compatibilidad (8 subfactores)**
  * `SF-01`: Una empresa proporciona una infraestructura de nube lista para usar para este software.
  * `SF-02`: Los programas informáticos pueden exportar formatos propietarios.
  * `SF-03`: El software interactúa y se integra con el software propietario existente.
  * `SF-04`: El software está certificado para operar en su nicho de mercado.
  * `SF-05`: El software es compatible con los casos de uso y las funcionalidades más comunes.
  * `SF-06`: El software es compatible con múltiples componentes de hardware.
  * `SF-07`: El software utiliza formatos estándar.
  * `SF-08`: El software es compatible con varios sistemas operativos diferentes (el software es multiplataforma).
* **Factor 2: Personalización (6 subfactores)**
  * `SF-09`: El acceso al código fuente es un incentivo para la organización.
  * `SF-10`: El software se puede ampliar fácilmente para satisfacer las necesidades de la organización modificando el código fuente.
  * `SF-11`: Las innovaciones se introducen en el software a un ritmo rápido.
  * `SF-12`: El software es fácil de personalizar sin necesidad de actualizar el código fuente (fácil de personalizar desde el panel de control).
  * `SF-13`: El software soporta nuevas funciones a través de módulos (el software es modular).
  * `SF-14`: Hay un repositorio público de extensiones para este software.
* **Factor 3: Prueba (1 subfactor)**
  * `SF-15`: El software es fácil de desplegar y de probar (fácil de instalar y de probar).
* **Factor 4: Fiabilidad (5 subfactores)**
  * `SF-16`: El software tiene un buen historial en cuanto a errores de seguridad (el software es seguro).
  * `SF-17`: El software es fiable y estable.
  * `SF-18`: El software es más flexible que la solución propietaria.
  * `SF-19`: El software es más confiable que la solución propietaria.
  * `SF-20`: El programa proporciona una amplia variedad de funciones de control de acceso.
* **Factor 5: Reusabilidad (2 subfactores)**
  * `SF-21`: La licencia permite extensiones propietarias.
  * `SF-22`: El software se ofrece como una biblioteca / marco de trabajo.
* **Factor 6: Usabilidad (4 subfactores)**
  * `SF-23`: El software proporciona una interfaz gráfica de usuario (GUI).
  * `SF-24`: El software es más fácil de usar que la alternativa propietaria.
  * `SF-25`: El software es fácil de aprender.
  * `SF-26`: El usuario está descontento con el software propietario.
* **Factor 7: Mantenibilidad (1 subfactor)**
  * `SF-27`: El software es mantenido activamente por los desarrolladores.
* **Factor 8: Portabilidad (2 subfactores)**
  * `SF-28`: Una versión de aplicación móvil de este software está disponible.
  * `SF-29`: El software es independiente del sistema de administración de base de datos (DBMS).
* **Factor 9: Documentación (11 subfactores)**
  * `SF-30`: La documentación de desarrollo cubre todas las características.
  * `SF-31`: El software está bien documentado.
  * `SF-32`: La documentación está disponible en múltiples formatos.
  * `SF-33`: La documentación es fácil de entender.
  * `SF-34`: La documentación está actualizada.
  * `SF-35`: La documentación está escrita por escritores especializados (no desarrolladores).
  * `SF-36`: La documentación del software es de alta calidad.
  * `SF-37`: El software viene con documentación de desarrollo.
  * `SF-38`: El software viene con documentación de usuario.
  * `SF-39`: La documentación del usuario cubre todas las características.
  * `SF-40`: Los formatos de datos están bien documentados.

#### Dimensión 2: Organizacional (19 subfactores)
* **Factor 10: Formación (4 subfactores)**
  * `SF-41`: La adopción de este software permite a los usuarios mejorar las habilidades técnicas de TI.
  * `SF-42`: El personal de la organización puede aprender fácilmente por sí mismo a utilizar este software.
  * `SF-43`: El personal de la organización está capacitado para resolver problemas tecnológicos.
  * `SF-44`: Los planes de entrenamiento de este software están disponibles.
* **Factor 11: Tiempo de adopción (2 subfactores)**
  * `SF-45`: Los requisitos de instalación y despliegue del software son fáciles de cumplir.
  * `SF-46`: El tiempo requerido para adoptar este software es bajo.
* **Factor 12: Casos de estudio de adopción FLOSS (1 subfactor)**
  * `SF-47`: Hay informes públicos de organizaciones similares disponibles en Internet que describen el éxito de la adopción de este software.
* **Factor 13: Centralidad de la tecnología de la información (2 subfactores)**
  * `SF-48`: La adopción de este software mejora el entorno de trabajo de los usuarios.
  * `SF-49`: Centralizar la infraestructura de TI ayuda a acelerar la adopción de este software.
* **Factor 14: Apoyo de la alta dirección (1 subfactor)**
  * `SF-50`: La alta dirección apoya la adopción exitosa de este software.
* **Factor 15: Bloqueo de proveedores (1 subfactor)**
  * `SF-51`: El software reduce las dependencias de los proveedores en su entorno.
* **Factor 16: Soporte (6 subfactores)**
  * `SF-52`: El soporte de la comunidad para este software está disponible.
  * `SF-53`: Soporte de expertos y consultores externos para consultas específicas está disponible.
  * `SF-54`: El soporte comercial de este software está disponible 24/7/365.
  * `SF-55`: Es fácil contratar personal informático en la comunidad que conozca este software.
  * `SF-56`: Hay desarrolladores en su organización que saben cómo desarrollar este software.
  * `SF-57`: Soporte comercial para la personalización de software está disponible.
* **Factor 17: Actitud hacia el cambio (2 subfactores)**
  * `SF-58`: El personal técnico encargado del despliegue y soporte en la organización respalda la adopción de este software.
  * `SF-59`: El personal de la organización muestra poca resistencia al cambio tecnológico.

#### Dimensión 3: Económica (2 subfactores)
* **Factor 18: Coste total de propiedad (2 subfactores)**
  * `SF-60`: Es poco probable que haya costos ocultos al adoptar este software.
  * `SF-61`: La adopción de este software es menos costosa que la alternativa propietaria (patentada).

---

## 5. Esquema Físico de Base de Datos en PostgreSQL (11 Tablas en 3FN)

### 5.1. Reglas de Integridad y Persistencia
* **Baja lógica:** Las entidades maestras (`usuarios`, `dimensiones`, `factores`, `subfactores`, `recomendaciones`) **jamás se eliminan físicamente** (`ON DELETE RESTRICT`); se desactivan cambiando `activo = FALSE` para no romper el historial de evaluaciones.
* **Eliminación en cascada de resultados:** `resultado_factor`, `resultado_subfactor` y `resultado_foda` dependen de `evaluaciones` con `ON DELETE CASCADE`.
* **Inmutabilidad histórica (Copias congeladas):** Al guardar la Pestaña 1 se congela `nombre_factor` en `resultado_factor`; al completar la Pestaña 3 se congela `dictamen_texto` en `evaluaciones`. Así, una evaluación completada se visualiza y exporta en PDF idéntica a como se emitió, aunque el Administrador edite el catálogo después.

### 5.2. Script DDL Oficial Base (PostgreSQL)
```sql
-- Bloque 1. Seguridad y usuarios
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);
INSERT INTO roles (nombre) VALUES ('administrador'), ('evaluador');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- hash bcrypt
    id_rol INT NOT NULL REFERENCES roles (id) ON DELETE RESTRICT,
    activo BOOLEAN NOT NULL DEFAULT TRUE, -- baja lógica
    intentos_fallidos SMALLINT NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
    bloqueado_hasta TIMESTAMPTZ NULL, -- bloqueo tras 5 intentos fallidos
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bloque 2. Catálogo de evaluación (baja lógica mediante "activo")
CREATE TABLE dimensiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);
INSERT INTO dimensiones (nombre) VALUES ('Tecnológica'), ('Organizacional'), ('Económica');

CREATE TABLE factores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    id_dimension INT NOT NULL REFERENCES dimensiones (id) ON DELETE RESTRICT,
    importancia_literatura SMALLINT NOT NULL CHECK (importancia_literatura BETWEEN 1 AND 4),
    alcance VARCHAR(10) NOT NULL DEFAULT 'Externo' CHECK (alcance IN ('Interno', 'Externo', 'Ambos')),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE subfactores (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE, -- SF-01 ... SF-61
    descripcion TEXT NOT NULL,
    id_factor INT NOT NULL REFERENCES factores (id) ON DELETE RESTRICT,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE recomendaciones (
    id SERIAL PRIMARY KEY,
    tipo CHAR(1) NOT NULL UNIQUE CHECK (tipo IN ('A', 'B', 'C')),
    titulo VARCHAR(150) NOT NULL,
    descripcion_regla TEXT NOT NULL,
    texto_orientador TEXT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bloque 3. Evaluaciones
CREATE TABLE evaluaciones (
    id SERIAL PRIMARY KEY,
    nombre_software VARCHAR(180) NOT NULL,
    id_usuario INT NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
    fecha_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completada', 'cancelada')),
    id_recomendacion INT NULL REFERENCES recomendaciones (id) ON DELETE RESTRICT,
    indice_viabilidad NUMERIC(5,2) NULL CHECK (indice_viabilidad BETWEEN 0 AND 100),
    nivel_confianza VARCHAR(5) NULL CHECK (nivel_confianza IN ('Alto', 'Medio', 'Bajo')),
    dictamen_texto TEXT NULL, -- copia congelada del dictamen y factores causantes
    CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

-- Bloque 4. Resultados (se eliminan en cascada junto con su evaluación)
CREATE TABLE resultado_factor (
    id SERIAL PRIMARY KEY,
    id_evaluacion INT NOT NULL REFERENCES evaluaciones (id) ON DELETE CASCADE,
    id_factor INT NOT NULL REFERENCES factores (id) ON DELETE RESTRICT,
    nombre_factor VARCHAR(120) NOT NULL, -- copia congelada
    importancia_decisor SMALLINT NOT NULL CHECK (importancia_decisor BETWEEN 1 AND 4),
    importancia_relativa VARCHAR(15) NOT NULL CHECK (importancia_relativa IN ('Irrelevante', 'Opcional', 'Importante', 'Fundamental')),
    alcance_aplicado VARCHAR(10) NULL CHECK (alcance_aplicado IN ('Interno', 'Externo')),
    UNIQUE (id_evaluacion, id_factor)
);

CREATE TABLE resultado_subfactor (
    id SERIAL PRIMARY KEY,
    id_evaluacion INT NOT NULL REFERENCES evaluaciones (id) ON DELETE CASCADE,
    id_subfactor INT NOT NULL REFERENCES subfactores (id) ON DELETE RESTRICT,
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 4),
    observacion TEXT NULL, -- requerido por RF-08 y HU-05 en Pestaña 2
    UNIQUE (id_evaluacion, id_subfactor)
);

CREATE TABLE resultado_foda (
    id SERIAL PRIMARY KEY,
    id_evaluacion INT NOT NULL REFERENCES evaluaciones (id) ON DELETE CASCADE,
    id_factor INT NOT NULL REFERENCES factores (id) ON DELETE RESTRICT,
    ponderacion_media NUMERIC(3,2) NOT NULL CHECK (ponderacion_media BETWEEN 1 AND 4),
    categoria VARCHAR(12) NOT NULL CHECK (categoria IN ('fortaleza', 'debilidad', 'oportunidad', 'amenaza')),
    critico BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE (id_evaluacion, id_factor)
);

-- Bloque 5. Auditoría de acciones administrativas
CREATE TABLE log_auditoria (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
    accion VARCHAR(60) NOT NULL, -- ej. crear, editar, desactivar, cambiar_rol
    entidad VARCHAR(60) NOT NULL, -- tabla afectada
    id_entidad INT,
    detalle TEXT,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. Especificación de Pantallas e Interfaz GUIOS+ (Figma Make — 8 Vistas)

Todas las vistas post-login comparten:
* **Barra superior verde (`#3F6F58`):** Logotipo `G+ GUIOS+`, insignia de la evaluación activa (ej. `"Moodle · Educación"`), estado `"Guardado"` e información del usuario logueado con su rol.
* **Menú lateral izquierdo (`FLUJO DE EVALUACIÓN`):** `Dashboard` $\rightarrow$ `0. Configuración` $\rightarrow$ `1. Factores` $\rightarrow$ `2. Subfactores` $\rightarrow$ `3. Resultado` $\rightarrow$ `Evidencia` $\rightarrow$ `Administración`, más tarjeta inferior `"¿Necesitas ayuda? Consulta la guía metodológica de GUIOSPRO"`.

1. **Pantalla 1 — Inicio de Sesión (`HU-01`):**
   Fondo verde institucional, tarjeta blanca centrada con ícono de candado, campos `Correo electrónico` y `Contraseña` (con botón `"Mostrar"`), casilla `"Recordar sesión"`, enlace `"¿Olvidaste tu contraseña?"`, botón verde `"Iniciar sesión"`, enlace de registro (asigna rol `evaluador` por defecto) y recuadro de credenciales demo.
2. **Pantalla 2 — Dashboard (`HU-07`):**
   Saludo personalizado, $4$ tarjetas KPI con barra de progreso (`Factores totales: 18`, `Factores relevantes: 9 (50%)`, `Subfactores: 61`, `Factores pendientes: 2`), tarjeta `"Evaluación activa"` (software, contexto, fase actual, fuentes académicas, fecha última consulta, barra de progreso general $\%$ y botones `"Continuar evaluación"` y `"Ver evidencia"`), lista de `"Actividad reciente"`, acceso al `"Historial de Evaluaciones"` (con filtros por fecha, software y estado, y modo de **comparación en paralelo de 2 evaluaciones**) y banda inferior con botón `"+ Nueva evaluación"`.
3. **Pantalla 3 — Paso 0: Configuración automática (`RF-14`):**
   Formulario de contexto de la evaluación (`Software FLOSS`, `Área o contexto`, `Descripción del caso`), interruptores de fuentes bibliográficas (`Scopus`, `OpenAlex`, `Semantic Scholar`), tarjeta informativa (`IL`, `IE`, `IS`), parámetros de consulta (`Ventana temporal: 2016-2026`, `Idiomas: ES · EN · PT`, `Modo: Automático con revisión`), botones `"Calcular importancia sugerida"` y `"Restaurar valores originales"`, y banda verde de resumen de procesamiento.
4. **Pantalla 4 — Paso 1: Factores relevantes (`HU-04`, `RF-05`, `RF-06`, `RF-07`):**
   Banda informativa, contador `"N de 18 factores relevantes"`, buscador por texto, filtros por dimensión/relevancia/alcance, tabla con columnas: `Factor`, `Dimensión`, `IL`, `IE`, `Import. sugerida` (solo lectura), `Tu importancia` (selector interactivo de $4$ niveles), `Import. relativa` (insignia recalculada en vivo en el cliente React), `Alcance` (fijo salvo en `Soporte`, donde despliega selector `Interno`/`Externo`), `Estado` (`Relevante`/`Irrelevante`) y enlace `Evidencia`. Pie de tabla con resumen `"n relevantes · n irrelevantes"` y botones `"Guardar cambios"` y `"Continuar al Paso 2"`.
5. **Pantalla 5 — Paso 2: Evaluación de subfactores (`HU-05`, `RF-08`):**
   Tarjeta superior con el software evaluado, selector `"Factor seleccionado"` (solo factores relevantes) e indicador `"Completado n de N"`. Leyenda visible: `"1 = No cumple · 2 = Desconozco · 3 = Cumple parcialmente · 4 = Cumple"`. Tabla de subfactores con código `SF-xx`, enunciado afirmativo, botonera de escala `1` a `4` (resaltada en verde al seleccionar) y campo de texto `Observación`. Pie de tabla con `"Ponderación media de [Factor]: x,x / 4,0 · Evaluación completa"` y botones `"Guardar"` y `"Continuar al Paso 3"`.
6. **Pantalla 6 — Paso 3: Resultado y recomendación (`HU-06`, `HU-08`, `RF-09`, `RF-10`, `RF-13`):**
   Modo solo lectura. En la parte superior: tarjeta verde destacada con la letra `A`, `B` o `C`, título del dictamen, `"Índice de viabilidad FLOSS: XX% · Confianza alta/media/baja"`; a la derecha, recuadro `"¿Qué significa la Recomendación X?"` con las etiquetas de los factores causantes (críticos y opcionales) y el texto orientador. Al centro: **Matriz FODA $2\times2$** (`Fortalezas`, `Oportunidades`, `Debilidades`, `Amenazas`) con insignia roja `"Crítico"` en los factores que corresponda y conteo de factores por cuadrante. Abajo: tabla `"Resultados por factor"` (`Factor`, `Dimensión`, `Imp. relativa`, `Promedio x,x / 4,0`, `Alcance`, `FODA`) y botón superior `"Exportar PDF"`.
7. **Pantalla 7 — Evidencia bibliográfica (`RF-14`):**
   Resumen de la consulta booleana ejecutada, $3$ tarjetas (`Documentos`, `Citas acumuladas`, `Factores con evidencia`), buscador y tabla de trazabilidad por factor (`Factor`, `Documentos`, `Citas`, `Autores relevantes`, `IL`, `IE`, `IS`, `Fuente principal`, acción `"Ver documentos"`) y botón `"Exportar evidencia"`.
8. **Pantalla 8 — Administración (`HU-02`, `HU-03`, `RF-02`, `RF-04`, `RF-14`):**
   Organizada en pestañas:
   * `Usuarios`: listado de cuentas, cambio de rol (`administrador`/`evaluador`), activación/desactivación por baja lógica (prohibido desactivar la propia cuenta de administrador activo) y registro en `log_auditoria`.
   * `Factores GUIOS` (Catálogo): CRUD jerárquico de Dimensiones, Factores (nombre único, descripción, importancia sugerida 1-4, alcance) y Subfactores (código único `SF-xx`, enunciado) con baja lógica (`activo = FALSE`).
   * `Fuentes bibliográficas`, `Palabras clave por factor`, `Historial de consultas` y `Parámetros de cálculo`: configuración de keywords por factor, vista previa de cadena booleana, interruptor `"Usar sinónimos automáticos"` y botón `"Probar consulta"`.

---

## 7. Hoja de Ruta por Sprints (Product Backlog — 57 Puntos)

| Sprint | ID HU | Historia de Usuario | Requisitos | Prioridad MoSCoW | Puntos | Entregable Técnico Clave |
| :-: | :-: | :--- | :-: | :-: | :-: | :--- |
| **1** | **HU-01** | Registro e Inicio de Sesión | RF-01 | Must have (Alta) | 5 | Auth JWT, hash `bcrypt`, control de `intentos_fallidos` (máx. 5) y `bloqueado_hasta`. |
| **1** | **HU-02** | Gestión de Roles y Usuarios | RF-02 | Must have (Alta) | 5 | Panel Admin de usuarios, baja lógica (`activo=FALSE`), bitácora en `log_auditoria`. |
| **1** | **HU-03** | Gestión del Catálogo de Evaluación | RF-03, RF-04 | Must have (Alta) | 8 | Migración de *fixtures* iniciales ($3$ dim, $18$ fact, $61$ subfact) y CRUD con baja lógica. |
| **1** | **HU-04** | Factores Relevantes — Pestaña 1 | RF-05, RF-06, RF-07 | Must have (Alta) | 8 | UI Paso 1 en React, cálculo instantáneo de $IR = \lfloor(IS+ID)/2\rfloor$, validación de alcance `Ambos`. |
| **2** | **HU-05** | Ponderación de Subfactores — Pestaña 2 | RF-08 | Must have (Alta) | 8 | UI Paso 2, botonera 1-4, campo observación, cálculo en vivo de $PM$, autoguardado y validación de completitud. |
| **2** | **HU-06** | Resultados FODA y Dictamen — Pestaña 3 | RF-09, RF-10 | Must have (Alta) | 13 | Motor backend FODA, marca `critico`, dictamen A/B/C con factores causantes, indicadores informativos y congelamiento de `dictamen_texto`. |
| **3** | **HU-07** | Consulta del Historial de Evaluaciones | RF-11 | Should have (Media) | 5 | Dashboard, listado filtrable (propias para Evaluador, todas para Admin), vista congelada y comparador lado a lado. |
| **3** | **HU-08** | Exportación del Informe en PDF | RF-13 | Could have (Baja) | 5 | Generación de PDF en backend Django ($< 5\text{ s}$) con portada, tablas, Matriz FODA y dictamen oficial. |
| **Post-S3 / IA** | **RF-14** | Estimación Asistida de Importancia Sugerida (IA + APIs Académicas) | RF-14 | Mejora Planificada / IA | — | Conectores a OpenAlex, Semantic Scholar y Scopus + LLM para sinónimos multilingües (ES/EN/PT), análisis de *abstracts* y cálculo asistido de $IL, IE, IS$. |