"""
Script rápido para crear o restablecer usuarios para presentaciones y demostraciones.
Uso directo:
    python crear_usuarios.py
    python crear_usuarios.py "Nombre Usuario" correo@ejemplo.com Password123* evaluador
    python crear_usuarios.py --nombre "Ana Gómez" --email ana@test.com --password "Test1234*" --rol administrador
"""

import os
import sys
import argparse

# Configurar entorno Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "guiospro_backend.settings")

import django
django.setup()

from guio_core.models import Usuario, Rol

USUARIOS_DEMO = [
    {
        "nombre": "Administrador Principal",
        "email": "admin@guiosplus.org",
        "password": "Admin123*",
        "rol": Rol.TipoRol.ADMINISTRADOR,
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "nombre": "Admin Presentación",
        "email": "admin@presentacion.com",
        "password": "Admin123*",
        "rol": Rol.TipoRol.ADMINISTRADOR,
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "nombre": "Evaluador Técnico TI",
        "email": "evaluador@guiosplus.org",
        "password": "Evaluador123*",
        "rol": Rol.TipoRol.EVALUADOR,
        "is_staff": False,
        "is_superuser": False,
    },
    {
        "nombre": "Evaluador Presentación",
        "email": "evaluador@presentacion.com",
        "password": "Evaluador123*",
        "rol": Rol.TipoRol.EVALUADOR,
        "is_staff": False,
        "is_superuser": False,
    },
]

def crear_o_actualizar_usuario(nombre, email, password, rol_str, is_staff=False, is_superuser=False):
    email = email.strip().lower()
    rol_obj, _ = Rol.objects.get_or_create(nombre=rol_str)
    
    usuario, creado = Usuario.objects.get_or_create(
        email=email,
        defaults={
            "nombre": nombre,
            "id_rol": rol_obj,
            "activo": True,
            "intentos_fallidos": 0,
            "bloqueado_hasta": None,
            "is_staff": is_staff,
            "is_superuser": is_superuser,
        }
    )
    
    # Actualizar datos, desbloquear y fijar contraseña
    usuario.nombre = nombre
    usuario.id_rol = rol_obj
    usuario.activo = True
    usuario.intentos_fallidos = 0
    usuario.bloqueado_hasta = None
    if is_staff:
        usuario.is_staff = True
    if is_superuser:
        usuario.is_superuser = True
    usuario.set_password(password)
    usuario.save()
    
    accion = "CREADO" if creado else "ACTUALIZADO / DESBLOQUEADO"
    return accion, usuario

def main():
    parser = argparse.ArgumentParser(description="Creación rápida de usuarios GUIOS+ para presentaciones.")
    parser.add_argument("pos_nombre", nargs="?", default=None, help="Nombre completo")
    parser.add_argument("pos_email", nargs="?", default=None, help="Correo electrónico")
    parser.add_argument("pos_password", nargs="?", default=None, help="Contraseña")
    parser.add_argument("pos_rol", nargs="?", default=None, choices=["administrador", "evaluador"], help="Rol (administrador/evaluador)")
    
    parser.add_argument("--nombre", dest="opt_nombre", help="Nombre completo")
    parser.add_argument("--email", dest="opt_email", help="Correo electrónico")
    parser.add_argument("--password", dest="opt_password", help="Contraseña")
    parser.add_argument("--rol", dest="opt_rol", choices=["administrador", "evaluador"], help="Rol")
    
    args = parser.parse_args()
    
    nombre = args.opt_nombre or args.pos_nombre
    email = args.opt_email or args.pos_email
    password = args.opt_password or args.pos_password
    rol = args.opt_rol or args.pos_rol
    
    print("=" * 70)
    print("🔐 GESTIÓN RÁPIDA DE USUARIOS GUIOS+ (MODO PRESENTACIÓN)")
    print("=" * 70)
    
    if email and password:
        nombre = nombre or "Usuario " + rol.capitalize() if rol else "Usuario Demo"
        rol = rol or "evaluador"
        is_admin = (rol == "administrador")
        accion, u = crear_o_actualizar_usuario(nombre, email, password, rol, is_staff=is_admin, is_superuser=is_admin)
        print(f"\n✓ [{accion}]")
        print(f"  • Nombre:   {u.nombre}")
        print(f"  • Email:    {u.email}")
        print(f"  • Clave:    {password}")
        print(f"  • Rol:      {u.id_rol.nombre.upper()}")
        print(f"  • Estado:   Activo y listo para iniciar sesión")
    else:
        print("\nCreando/Restableciendo usuarios demo predeterminados para la presentación:\n")
        for u_data in USUARIOS_DEMO:
            accion, u = crear_o_actualizar_usuario(
                nombre=u_data["nombre"],
                email=u_data["email"],
                password=u_data["password"],
                rol_str=u_data["rol"],
                is_staff=u_data["is_staff"],
                is_superuser=u_data["is_superuser"]
            )
            print(f"  [{accion}]")
            print(f"  • Rol:      {u.id_rol.nombre.upper()}")
            print(f"  • Usuario:  {u.email}")
            print(f"  • Password: {u_data['password']}")
            print(f"  • Nombre:   {u.nombre}")
            print("-" * 50)
            
    print("\n🚀 ¡Listo! Ya puedes iniciar sesión de inmediato en http://localhost:5173")
    print("=" * 70)

if __name__ == "__main__":
    main()

