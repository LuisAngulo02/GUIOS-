# Módulo 2: FLOSS en la Actualidad y Marco de Licencias

**Parte II: Antecedentes | Capítulo 2 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

---

## 1. Definición Formal de FLOSS

El término **FLOSS** (*Free/Libre/Open Source Software*) se utiliza como un hiperónimo para englobar el software cuyo código fuente es libremente accesible para el público. Este término reúne las filosofías de dos movimientos principales:
1. **Free Software Movement (Software Libre):** Impulsado desde 1983 por **Richard Stallman** a través de la **Free Software Foundation (FSF)**.
2. **Open Source Movement (Código Abierto):** Establecido a finales de los años 90 por Eric Raymond, Bruce Perens y la **Open Source Initiative (OSI)**.

Aunque ambos movimientos comparten la defensa del código accesible y la colaboración transparente, difieren sustancialmente en sus principios éticos y filosóficos.

---

## 2. Los Movimientos Fundamentales: Software Libre vs. Open Source

### 2.1. Movimiento del Software Libre (FSF)
Es una filosofía social y ética enfocada en garantizar la libertad y los derechos fundamentales de los usuarios frente al control impuesto por el software privativo.

#### Las 4 Libertades Fundamentales del Software Libre
Para que un programa sea considerado *Software Libre*, debe garantizar de manera incondicional las siguientes libertades:
* **Libertad 0 (Uso):** La libertad de ejecutar el programa para cualquier propósito, en cualquier entorno y sin restricciones.
* **Libertad 1 (Estudio y Modificación):** La libertad de examinar cómo funciona el programa y modificarlo para adaptarlo a las necesidades específicas. *(Requiere acceso obligatorio al código fuente)*.
* **Libertad 2 (Redistribución):** La libertad de redistribuir copias exactas del programa para compartirlo con la comunidad.
* **Libertad 3 (Mejora y Distribución de Modificados):** La libertad de distribuir copias de las versiones modificadas a terceros, permitiendo que toda la comunidad se beneficie de las mejoras. *(Requiere acceso obligatorio al código fuente)*.

> **Aclaración Semántica:** La FSF enfatiza *"Free as in free speech, not as in free beer"* (libre como en libertad de expresión, no como en cerveza gratis). El software libre se refiere a la libertad de uso, no a la gratuidad comercial; por ende, se permite la comercialización y cobro por servicios o copias de software libre.

### 2.2. Movimiento Open Source (OSI)
El movimiento *Open Source* enfoca sus argumentos en los beneficios pragmáticos y metodológicos del desarrollo colaborativo (calidad del código, rápida corrección de errores, eficiencia de ingeniería). La **Open Source Definition (OSD)** establece 10 criterios, entre los cuales destacan:
1. Libre redistribución del software.
2. Inclusión explícita del código fuente.
3. Permitir modificaciones y trabajos derivados.
4. Integridad del código fuente del autor original.
5. No discriminación contra personas o grupos.
6. No discriminación contra campos de aplicación (comercial, industrial, etc.).

#### Ejemplo de Diferencia Filosófica: La Paradoja de DRM
La **Gestión de Derechos Digitales (DRM)** impone restricciones tecnológicas sobre hardware y software. La FSF rechaza categóricamente el DRM por violar la libertad del usuario (*Tivoización*). En cambio, el movimiento Open Source permite arquitecturas DRM siempre que su código fuente sea abierto (ejemplo: el estándar *DRM Opera* propuesto por Sun Microsystems).

---

## 3. Clasificación de Licencias de Software

Las licencias de software constituyen el instrumento legal que define los derechos y obligaciones concedidos por el autor. En la tesis doctoral se presenta la clasificación sistemática de licencias estructurada en cuatro categorías principales:

```
                         CATEGORÍAS DE LICENCIAS
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
 Software Privativo                                        FLOSS
 (Derechos reservados)                                (Derechos cedidos)
                                                               │
                       ┌───────────────────────┬───────────────┴───────────────┐
                       ▼                       ▼                               ▼
                   Copyleft             Copyleft Débil                    No Copyleft
             (Hereditario estricto)   (Librerías/Módulos)             (Permisivo / Atribución)
                       │                       │                               │
             • GPLv2, GPLv3          • LGPLv2.1, LGPLv3               • BSD (2/3 Clause)
             • AGPL                  • MPL (Mozilla)                  • MIT
                                     • EPL (Eclipse)                  • Apache 2.0
                                                                               │
                                                                               ▼
                                                                       Dominio Público
                                                                       (Unlicense, CC0)
```

### 3.1. Copyleft (Copyleft Fuerte / Estricto)
El término *Copyleft* (creado por Richard Stallman) es una práctica legal que utiliza los derechos de autor para exigir que **todas las versiones modificadas y derivados del software mantengan exactamente la misma licencia libre**.
* **Objetivo:** Impedir que terceros conviertan un software libre en privativo.
* **Principales Licencias:**
  * **GPLv2 / GPLv3 (GNU General Public License):** Estándar de la FSF para software de escritorio y sistemas operativos (ej. Kernel Linux).
  * **AGPL (Affero GPL):** Diseñada específicamente para software ejecutado en red o la nube, obligando a entregar el código fuente a usuarios que interactúan remotamente con la aplicación.

### 3.2. Copyleft Débil (Weak Copyleft)
Relaja los requerimientos hereditarios para permitir que bibliotecas o módulos de software libre sean enlazados o integrados con programas desarrollados bajo licencias privativas.
* **Mecanismo:** Las modificaciones directas sobre la biblioteca libre deben permanecer bajo la licencia libre, pero el programa principal que llama a la biblioteca puede conservar su propia licencia privativa.
* **Principales Licencias:**
  * **LGPLv2.1 / LGPLv3 (GNU Lesser General Public License):** Ampliamente utilizada en librerías de software.
  * **MPL (Mozilla Public License):** Licencia modular usada en proyectos como Firefox y LibreOffice.
  * **EPL (Eclipse Public License):** Utilizada por la Fundación Eclipse.

### 3.3. No Copyleft (Licencias Permisivas)
Otorgan máxima libertad al usuario, permitiendo modificar, redistribuir e incluso incorporar el código libre en productos comerciales y **convertirlos en software privativo**, exigiendo únicamente el reconocimiento y mantenimiento de la nota de derechos de autor original.
* **Principales Licencias:**
  * **BSD (2-Clause / 3-Clause):** Licencia histórica de la Universidad de California en Berkeley.
  * **MIT License:** Una de las licencias más breves y populares en la comunidad contemporánea.
  * **Apache 2.0:** Licencia permisiva que incluye concesión explícita de patentes.

### 3.4. Dominio Público
Pertenecen a esta categoría aquellos trabajos cuyos derechos de autor han expirado o cuyos autores han renunciado expresamente a todo derecho patrimonial sobre la obra.
* **Ejemplos:** Licencias **Unlicense** y **Creative Commons CC0**.
* **Advertencia en FLOSS:** No se recomienda que el FLOSS sea liberado directamente al dominio público sin licencia, ya que la ausencia de protección legal facilita que empresas privadas apropien el código y lo distribuyan en versiones cerradas privativas sin retribuir a la comunidad.
