"""
Comando de Django para poblar los datos semilla oficiales de GUIOSPRO FLOSS Web
según la Tesis Doctoral de Víctor Hugo Rea Sánchez y docs/context.md:
- 2 Roles (administrador, evaluador)
- 3 Dimensiones (Tecnológica, Organizacional, Económica)
- 18 Factores (con IS y Alcance exactos)
- 61 Subfactores (SF-01 a SF-61 con enunciados literales)
- 3 Recomendaciones (A, B, C con títulos, reglas y textos orientadores)
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from guio_core.models import Rol, Dimension, Factor, Subfactor, Recomendacion


class Command(BaseCommand):
    help = "Puebla el catálogo maestro oficial de GUIOSPRO (Roles, Dimensiones, 18 Factores, 61 Subfactores y Recomendaciones)"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Iniciando la carga del catálogo oficial GUIOS..."))

        with transaction.atomic():
            self.seed_roles()
            self.seed_recomendaciones()
            self.seed_catalogo()

        self.stdout.write(self.style.SUCCESS("¡Catálogo maestro poblado con éxito en PostgreSQL!"))

    def seed_roles(self):
        self.stdout.write("- Poblando Roles...")
        roles = [
            Rol.TipoRol.ADMINISTRADOR,
            Rol.TipoRol.EVALUADOR,
        ]
        for r_name in roles:
            obj, created = Rol.objects.get_or_create(nombre=r_name)
            if created:
                self.stdout.write(f"  + Rol creado: {obj.get_nombre_display()}")
            else:
                self.stdout.write(f"  = Rol existente: {obj.get_nombre_display()}")

    def seed_recomendaciones(self):
        self.stdout.write("- Poblando Recomendaciones...")
        recomendaciones_data = [
            {
                "tipo": Recomendacion.TipoRecomendacion.TIPO_A,
                "titulo": "Adoptar sin observaciones",
                "descripcion_regla": (
                    "Todos los factores relevantes evaluados han sido identificados como Fortalezas u Oportunidades "
                    "(Ponderación Media >= 3.00 en todos los factores relevantes). No existen debilidades ni amenazas."
                ),
                "texto_orientador": (
                    "Recomendación A: Adoptar. Todos los factores han sido identificados como Oportunidades y/o "
                    "Fortalezas. Esto quiere decir que la organización cumple satisfactoriamente con la mayoría de "
                    "requisitos para adoptar la solución FLOSS. Si existen subfactores específicos que no alcanzaron "
                    "el valor óptimo (4), se sugiere establecer mejoras puntuales."
                ),
            },
            {
                "tipo": Recomendacion.TipoRecomendacion.TIPO_B,
                "titulo": "Es posible adoptar con sugerencias por revisar",
                "descripcion_regla": (
                    "Se han detectado amenazas y/o debilidades (Ponderación Media < 3.00) únicamente en factores cuya "
                    "Importancia Relativa (IR) es Opcional (2). No se detectó ninguna debilidad ni amenaza en factores "
                    "Importantes o Fundamentales."
                ),
                "texto_orientador": (
                    "Recomendación B: Es posible adoptar. A pesar que se han detectado amenazas y/o debilidades en "
                    "factores cuya importancia relativa es opcional, se sugiere revisar los criterios que no cumplen con "
                    "lo mínimo requerido para adoptar. Se recomienda establecer un plan de mitigación sobre los subfactores "
                    "afectados (capacitación complementaria, consultoría externa, reducción de dependencia tecnológica)."
                ),
            },
            {
                "tipo": Recomendacion.TipoRecomendacion.TIPO_C,
                "titulo": "Requiere recursos antes de adoptar",
                "descripcion_regla": (
                    "Se han detectado factores críticos: al menos una Debilidad o Amenaza (Ponderación Media < 3.00) "
                    "en un factor cuya Importancia Relativa (IR) es Importante (3) o Fundamental (4)."
                ),
                "texto_orientador": (
                    "Recomendación C: La organización debe de proporcionar los recursos necesarios que garanticen una "
                    "adopción satisfactoria. Si se trata de factores internos deben de ser aspectos a mejorar dentro de "
                    "la organización (planes de entrenamiento, desarrolladores internos, soporte técnico propio) y si "
                    "son factores externos, dedicar recursos de ingeniería para mejorar o adaptar el software."
                ),
            },
        ]

        for r in recomendaciones_data:
            obj, created = Recomendacion.objects.update_or_create(
                tipo=r["tipo"],
                defaults={
                    "titulo": r["titulo"],
                    "descripcion_regla": r["descripcion_regla"],
                    "texto_orientador": r["texto_orientador"],
                    "activo": True,
                },
            )
            accion = "creada" if created else "actualizada"
            self.stdout.write(f"  + Recomendación {obj.tipo} ({accion})")

    def seed_catalogo(self):
        self.stdout.write("- Poblando Dimensiones, Factores y Subfactores (Tesis Doctoral)...")

        # Estructura oficial validada por 57 expertos:
        catalogo = [
            {
                "dimension": Dimension.NombreDimension.TECNOLOGICA,
                "factores": [
                    {
                        "nombre": "Compatibilidad",
                        "descripcion": "Capacidad del software FLOSS para coexistir, interactuar y acoplarse con la infraestructura, hardware, formatos y software existente.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-01", "Una empresa proporciona una infraestructura de nube lista para usar para este software."),
                            ("SF-02", "Los programas informáticos pueden exportar formatos propietarios."),
                            ("SF-03", "El software interactúa y se integra con el software propietario existente."),
                            ("SF-04", "El software está certificado para operar en su nicho de mercado."),
                            ("SF-05", "El software es compatible con los casos de uso y las funcionalidades más comunes."),
                            ("SF-06", "El software es compatible con múltiples componentes de hardware."),
                            ("SF-07", "El software utiliza formatos estándar."),
                            ("SF-08", "El software es compatible con varios sistemas operativos diferentes (el software es multiplataforma)."),
                        ],
                    },
                    {
                        "nombre": "Personalización",
                        "descripcion": "Facilidad para modificar, extender y adaptar el software a las necesidades particulares de la organización con o sin alteración de código fuente.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-09", "El acceso al código fuente es un incentivo para la organización."),
                            ("SF-10", "El software se puede ampliar fácilmente para satisfacer las necesidades de la organización modificando el código fuente."),
                            ("SF-11", "Las innovaciones se introducen en el software a un ritmo rápido."),
                            ("SF-12", "El software es fácil de personalizar sin necesidad de actualizar el código fuente (fácil de personalizar desde el panel de control)."),
                            ("SF-13", "El software soporta nuevas funciones a través de módulos (el software es modular)."),
                            ("SF-14", "Hay un repositorio público de extensiones para este software."),
                        ],
                    },
                    {
                        "nombre": "Prueba",
                        "descripcion": "Facilidad para desplegar, instalar y evaluar preliminarmente el software sin comprometer la infraestructura en producción.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-15", "El software es fácil de desplegar y de probar (fácil de instalar y de probar)."),
                        ],
                    },
                    {
                        "nombre": "Fiabilidad",
                        "descripcion": "Estabilidad, madurez, control de accesos e historial de vulnerabilidades del software FLOSS.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-16", "El software tiene un buen historial en cuanto a errores de seguridad (el software es seguro)."),
                            ("SF-17", "El software es fiable y estable."),
                            ("SF-18", "El software es más flexible que la solución propietaria."),
                            ("SF-19", "El software es más confiable que la solución propietaria."),
                            ("SF-20", "El programa proporciona una amplia variedad de funciones de control de acceso."),
                        ],
                    },
                    {
                        "nombre": "Reusabilidad",
                        "descripcion": "Capacidad de emplear el software o sus bibliotecas en otras soluciones y permisividad de la licencia para extensiones.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-21", "La licencia permite extensiones propietarias."),
                            ("SF-22", "El software se ofrece como una biblioteca / marco de trabajo."),
                        ],
                    },
                    {
                        "nombre": "Usabilidad",
                        "descripcion": "Calidad de la interfaz gráfica, curva de aprendizaje y nivel de satisfacción de los usuarios finales frente a alternativas propietarias.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-23", "El software proporciona una interfaz gráfica de usuario (GUI)."),
                            ("SF-24", "El software es más fácil de usar que la alternativa propietaria."),
                            ("SF-25", "El software es fácil de aprender."),
                            ("SF-26", "El usuario está descontento con el software propietario."),
                        ],
                    },
                    {
                        "nombre": "Mantenibilidad",
                        "descripcion": "Grado de actividad y continuidad del desarrollo y mantenimiento del software por parte de la comunidad o mantenedores.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-27", "El software es mantenido activamente por los desarrolladores."),
                        ],
                    },
                    {
                        "nombre": "Portabilidad",
                        "descripcion": "Independencia de motores de bases de datos (DBMS) y disponibilidad de aplicaciones clientes en múltiples plataformas o móviles.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-28", "Una versión de aplicación móvil de este software está disponible."),
                            ("SF-29", "El software es independiente del sistema de administración de base de datos (DBMS)."),
                        ],
                    },
                    {
                        "nombre": "Documentación",
                        "descripcion": "Disponibilidad, actualidad, claridad y calidad de la documentación de usuario y desarrollo en diversos formatos.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-30", "La documentación de desarrollo cubre todas las características."),
                            ("SF-31", "El software está bien documentado."),
                            ("SF-32", "La documentación está disponible en múltiples formatos."),
                            ("SF-33", "La documentación es fácil de entender."),
                            ("SF-34", "La documentación está actualizada."),
                            ("SF-35", "La documentación está escrita por escritores especializados (no desarrolladores)."),
                            ("SF-36", "La documentación del software es de alta calidad."),
                            ("SF-37", "El software viene con documentación de desarrollo."),
                            ("SF-38", "El software viene con documentación de usuario."),
                            ("SF-39", "La documentación del usuario cubre todas las características."),
                            ("SF-40", "Los formatos de datos están bien documentados."),
                        ],
                    },
                ],
            },
            {
                "dimension": Dimension.NombreDimension.ORGANIZACIONAL,
                "factores": [
                    {
                        "nombre": "Formación",
                        "descripcion": "Habilidades técnicas del personal de la organización, capacidad de autoaprendizaje y existencia de planes formativos.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.INTERNO,
                        "subfactores": [
                            ("SF-41", "La adopción de este software permite a los usuarios mejorar las habilidades técnicas de TI."),
                            ("SF-42", "El personal de la organización puede aprender fácilmente por sí mismo a utilizar este software."),
                            ("SF-43", "El personal de la organización está capacitado para resolver problemas tecnológicos."),
                            ("SF-44", "Los planes de entrenamiento de este software están disponibles."),
                        ],
                    },
                    {
                        "nombre": "Tiempo de adopción",
                        "descripcion": "Estimación del tiempo y complejidad en cumplir los requisitos de instalación, despliegue y puesta en marcha.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.INTERNO,
                        "subfactores": [
                            ("SF-45", "Los requisitos de instalación y despliegue del software son fáciles de cumplir."),
                            ("SF-46", "El tiempo requerido para adoptar este software es bajo."),
                        ],
                    },
                    {
                        "nombre": "Casos de estudio de adopción FLOSS",
                        "descripcion": "Existencia de referencias documentadas e informes públicos de éxito en organizaciones de características similares.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-47", "Hay informes públicos de organizaciones similares disponibles en Internet que describen el éxito de la adopción de este software."),
                        ],
                    },
                    {
                        "nombre": "Centralidad de la tecnología de la información",
                        "descripcion": "Rol estratégico de la infraestructura de TI y cómo el software impacta en la centralización y entorno de trabajo.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.INTERNO,
                        "subfactores": [
                            ("SF-48", "La adopción de este software mejora el entorno de trabajo de los usuarios."),
                            ("SF-49", "Centralizar la infraestructura de TI ayuda a acelerar la adopción de este software."),
                        ],
                    },
                    {
                        "nombre": "Apoyo de la alta dirección",
                        "descripcion": "Respaldo y compromiso de los líderes y directivos hacia la adopción del software libre.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.INTERNO,
                        "subfactores": [
                            ("SF-50", "La alta dirección apoya la adopción exitosa de este software."),
                        ],
                    },
                    {
                        "nombre": "Bloqueo de proveedores",
                        "descripcion": "Capacidad del software para mitigar el cautiverio o dependencia excesiva de proveedores propietarios (vendor lock-in).",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.EXTERNO,
                        "subfactores": [
                            ("SF-51", "El software reduce las dependencias de los proveedores en su entorno."),
                        ],
                    },
                    {
                        "nombre": "Soporte",
                        "descripcion": "Disponibilidad de soporte por comunidad, consultoría comercial o equipo interno (factor mixto con alcance configurable).",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.AMBOS,
                        "subfactores": [
                            ("SF-52", "El soporte de la comunidad para este software está disponible."),
                            ("SF-53", "Soporte de expertos y consultores externos para consultas específicas está disponible."),
                            ("SF-54", "El soporte comercial de este software está disponible 24/7/365."),
                            ("SF-55", "Es fácil contratar personal informático en la comunidad que conozca este software."),
                            ("SF-56", "Hay desarrolladores en su organización que saben cómo desarrollar este software."),
                            ("SF-57", "Soporte comercial para la personalización de software está disponible."),
                        ],
                    },
                    {
                        "nombre": "Actitud hacia el cambio",
                        "descripcion": "Disposición del personal técnico y usuarios ante nuevas herramientas y grado de resistencia al cambio tecnológico.",
                        "importancia_literatura": 2,
                        "alcance": Factor.AlcanceFactor.INTERNO,
                        "subfactores": [
                            ("SF-58", "El personal técnico encargado del despliegue y soporte en la organización respalda la adopción de este software."),
                            ("SF-59", "El personal de la organización muestra poca resistencia al cambio tecnológico."),
                        ],
                    },
                ],
            },
            {
                "dimension": Dimension.NombreDimension.ECONOMICA,
                "factores": [
                    {
                        "nombre": "Coste total de propiedad",
                        "descripcion": "Evaluación del TCO considerando costes de licencia, hardware, implantación, soporte y ausencia de costes ocultos.",
                        "importancia_literatura": 3,
                        "alcance": Factor.AlcanceFactor.INTERNO,
                        "subfactores": [
                            ("SF-60", "Es poco probable que haya costos ocultos al adoptar este software."),
                            ("SF-61", "La adopción de este software es menos costosa que la alternativa propietaria (patentada)."),
                        ],
                    },
                ],
            },
        ]

        total_factores = 0
        total_subfactores = 0

        for dim_data in catalogo:
            dimension, _ = Dimension.objects.get_or_create(
                nombre=dim_data["dimension"],
                defaults={"activo": True},
            )

            for f_data in dim_data["factores"]:
                factor, _ = Factor.objects.update_or_create(
                    nombre=f_data["nombre"],
                    defaults={
                        "descripcion": f_data["descripcion"],
                        "id_dimension": dimension,
                        "importancia_literatura": f_data["importancia_literatura"],
                        "alcance": f_data["alcance"],
                        "activo": True,
                    },
                )
                total_factores += 1

                for codigo_sf, desc_sf in f_data["subfactores"]:
                    Subfactor.objects.update_or_create(
                        codigo=codigo_sf,
                        defaults={
                            "descripcion": desc_sf,
                            "id_factor": factor,
                            "activo": True,
                        },
                    )
                    total_subfactores += 1

        self.stdout.write(f"  + {Dimension.objects.count()} Dimensiones registradas.")
        self.stdout.write(f"  + {total_factores} Factores registrados.")
        self.stdout.write(f"  + {total_subfactores} Subfactores registrados (SF-01 a SF-61).")
