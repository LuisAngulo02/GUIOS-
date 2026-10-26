# Módulo 5: Elaboración de la Guía GUIOS e Indicadores de Importancia

**Capítulo 5 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

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
