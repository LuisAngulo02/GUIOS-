# Módulo 7: Conclusiones, Limitaciones y Trabajos Futuros

**Parte IV: Observaciones Finales | Capítulo 7 del Documento de Tesis Doctoral**  
**Tesis:** Factores para la Adopción de Soluciones Basadas en Software Libre y Fuentes Abiertas  
**Autor:** Víctor Hugo Rea Sánchez  

---

## 1. Conclusiones Principales de la Tesis

Las principales conclusiones derivadas del trabajo de investigación son:

1. **Necesidad de Guiado Formal:** Se demostró empíricamente que la adopción de software libre sin un procedimiento estructurado incrementa los riesgos operacionales y financieros en las organizaciones. Un marco estandarizado evita situaciones de "reinvención de la rueda".
2. **Eficacia de la Granularidad Fina:** La estructuración en tres niveles (**3 dimensiones, 18 factores finales y 61 subfactores**) ofrece el nivel de detalle necesario para evaluar de forma exhaustiva aspectos técnicos, de gestión y económicos que suelen pasarse por alto en evaluaciones tradicionales.
3. **Integración de Evidencia Dual (Literatura + Expertos):** El sistema de indicadores formulado ($IE, IL, IS, ID, IR$) logra un equilibrio óptimo entre la evidencia científica acumulada en 14 años de literatura internacional y la experiencia práctica de expertos de campo.
4. **Automatización Viable:** La herramienta prototipo **GUIOS PRO** demuestra que es posible automatizar el análisis multicriterio y la generación de matrices FODA, reduciendo el tiempo de evaluación a solo minutos.
5. **Validación Práctica en el Sector Público:** El caso de estudio piloto en la Universidad Estatal de Milagro (UNEMI) confirmó que GUIOS es una herramienta intuitiva, útil y directamente aplicable en la toma de decisiones institucionales.

---

## 2. Debate Crítico, Limitaciones y Amenazas a la Validez

De forma transparente, en la disertación se analizan las decisiones metodológicas adoptadas y sus posibles limitaciones:

### 2.1. Selección de la Revisión Sistemática de la Literatura (RSL)
* *Decisión:* Se priorizaron artículos de revistas indexadas por pares, excluyendo inicialmente literatura gris y conferencias.
* *Limitación:* Podrían haberse dejado fuera factores emergentes debatidos únicamente en congresos recientes.
* *Mitigación:* Se aplicó muestreo de bola de nieve (*snowballing*) sobre estudios citados para rescatar contribuciones clave.

### 2.2. Representatividad de la Muestra de Expertos
* *Decisión:* Se encuestó a 57 expertos de Ecuador y España.
* *Limitación:* Aunque la muestra cuenta con alta experiencia (>47% con más de 10 años en FLOSS), la tasa de respuesta en ciertos sectores especializados (finanzas, redes) fue menor.

### 2.3. Capacidades de la Herramienta GUIOS PRO
* *Decisión:* Se desarrolló un prototipo en Python con Flexx v0.80 pensado para ejecución local.
* *Limitación:* El prototipo no incluye gestión de usuarios multiinquilino (*multi-tenant*), persistencia en bases de datos relacionales en la nube, ni autenticación de usuarios.

### 2.4. Generación de Planes de Mitigación Automáticos
* *Decisión:* GUIOS clasifica el resultado en recomendaciones (A, B, C) y genera la matriz FODA.
* *Limitación:* La guía identifica las debilidades y amenazas, pero no prescribe automáticamente las acciones correctivas específicas que debe ejecutar la gerencia para resolverlas.

---

## 3. Líneas de Investigación y Trabajos Futuros

El trabajo realizado abre diversas oportunidades de investigación y desarrollo tecnológico:

1. **Desarrollo de GUIOS Web Enterprise (SaaS):** Evolucionar el prototipo GUIOS PRO hacia una plataforma web en la nube multiusuario que permita la colaboración síncrona entre varios evaluadores de una misma institución.
2. **Incorporación de Métodos de Decisión Multicriterio (MCDM):** Explorar e integrar algoritmos formalizados como **AHP** (*Analytic Hierarchy Process*) o **TOPSIS** para refinamiento matemático de las ponderaciones de subfactores.
3. **Módulo de Mitigación Inteligente de Riesgos:** Diseñar un motor de reglas que, al detectar una debilidad o amenaza en la matriz FODA, sugiera automáticamente planes de contingencia recomendados (ej. programas de capacitación específicos o acuerdos de nivel de servicio SLA).
4. **Ampliación del Repositorio de Casos de Estudio:** Aplicar GUIOS en una muestra más amplia de instituciones públicas, Gobiernos Autónomos Descentralizados (GADs) y PYMES en América Latina para consolidar una base de datos pública de diagnósticos de adopción FLOSS.
