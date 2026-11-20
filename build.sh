#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "==> Instalando dependencias..."
pip install -r requirements.txt

echo "==> Recolectando archivos estáticos..."
python manage.py collectstatic --no-input

echo "==> Aplicando migraciones de base de datos..."
python manage.py migrate

echo "==> Poblando catálogo metodológico oficial..."
python manage.py seed_catalog

echo "==> Creando usuarios demo para presentación..."
python crear_usuarios.py

echo "==> ¡Despliegue completado exitosamente!"

