from django.core.management.base import BaseCommand
from guio_core.models import Usuario, Rol

class Command(BaseCommand):
    help = "Crea o actualiza usuarios demo para presentaciones rápidas de GUIOS+"

    def add_arguments(self, parser):
        parser.add_argument("--nombre", type=str, help="Nombre completo")
        parser.add_argument("--email", type=str, help="Correo electrónico")
        parser.add_argument("--password", type=str, help="Contraseña")
        parser.add_argument("--rol", type=str, choices=["administrador", "evaluador"], help="Rol asignado")

    def handle(self, *args, **options):
        email = options.get("email")
        password = options.get("password")
        nombre = options.get("nombre")
        rol = options.get("rol")

        def crear_actualizar(nom, em, pwd, rol_str, is_staff=False):
            em = em.strip().lower()
            rol_obj, _ = Rol.objects.get_or_create(nombre=rol_str)
            u, creado = Usuario.objects.get_or_create(
                email=em,
                defaults={
                    "nombre": nom,
                    "id_rol": rol_obj,
                    "activo": True,
                    "intentos_fallidos": 0,
                    "is_staff": is_staff,
                    "is_superuser": is_staff,
                }
            )
            u.nombre = nom
            u.id_rol = rol_obj
            u.activo = True
            u.intentos_fallidos = 0
            u.bloqueado_hasta = None
            if is_staff:
                u.is_staff = True
                u.is_superuser = True
            u.set_password(pwd)
            u.save()
            estado = "CREADO" if creado else "ACTUALIZADO / DESBLOQUEADO"
            self.stdout.write(self.style.SUCCESS(f"✓ [{estado}] {rol_str.upper()}: {em} (Password: {pwd})"))

        if email and password:
            nom = nombre or "Usuario " + (rol.capitalize() if rol else "Demo")
            r = rol or "evaluador"
            crear_actualizar(nom, email, password, r, is_staff=(r == "administrador"))
        else:
            self.stdout.write(self.style.MIGRATE_HEADING("Configurando cuentas demo para presentación:"))
            demos = [
                ("Administrador Principal", "admin@guiosplus.org", "Admin123*", "administrador", True),
                ("Admin Presentación", "admin@presentacion.com", "Admin123*", "administrador", True),
                ("Evaluador Técnico TI", "evaluador@guiosplus.org", "Evaluador123*", "evaluador", False),
                ("Evaluador Presentación", "evaluador@presentacion.com", "Evaluador123*", "evaluador", False),
            ]
            for nom, em, pwd, r, staff in demos:
                crear_actualizar(nom, em, pwd, r, is_staff=staff)

