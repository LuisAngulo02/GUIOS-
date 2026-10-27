from django.contrib import admin
from .models import (
    Rol,
    Usuario,
    Dimension,
    Factor,
    Subfactor,
    Recomendacion,
    Evaluacion,
    ResultadoFactor,
    ResultadoSubfactor,
    ResultadoFoda,
    LogAuditoria,
)


@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre")
    search_fields = ("nombre",)


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "nombre", "id_rol", "activo", "bloqueado_hasta", "fecha_creacion")
    list_filter = ("id_rol", "activo", "is_staff")
    search_fields = ("email", "nombre")
    readonly_fields = ("fecha_creacion", "last_login")


@admin.register(Dimension)
class DimensionAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "activo")
    list_filter = ("activo",)


@admin.register(Factor)
class FactorAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre", "id_dimension", "importancia_literatura", "alcance", "activo")
    list_filter = ("id_dimension", "alcance", "activo")
    search_fields = ("nombre", "descripcion")


@admin.register(Subfactor)
class SubfactorAdmin(admin.ModelAdmin):
    list_display = ("id", "codigo", "id_factor", "descripcion", "activo")
    list_filter = ("id_factor", "activo")
    search_fields = ("codigo", "descripcion")


@admin.register(Recomendacion)
class RecomendacionAdmin(admin.ModelAdmin):
    list_display = ("id", "tipo", "titulo", "activo", "fecha_actualizacion")
    list_filter = ("tipo", "activo")


class ResultadoFactorInline(admin.TabularInline):
    model = ResultadoFactor
    extra = 0


class ResultadoSubfactorInline(admin.TabularInline):
    model = ResultadoSubfactor
    extra = 0


class ResultadoFodaInline(admin.TabularInline):
    model = ResultadoFoda
    extra = 0


@admin.register(Evaluacion)
class EvaluacionAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre_software", "id_usuario", "estado", "id_recomendacion", "fecha_inicio", "fecha_fin")
    list_filter = ("estado", "id_recomendacion")
    search_fields = ("nombre_software", "id_usuario__email", "id_usuario__nombre")
    inlines = [ResultadoFactorInline, ResultadoSubfactorInline, ResultadoFodaInline]


@admin.register(LogAuditoria)
class LogAuditoriaAdmin(admin.ModelAdmin):
    list_display = ("id", "fecha", "id_usuario", "accion", "entidad", "id_entidad")
    list_filter = ("accion", "entidad")
    search_fields = ("accion", "entidad", "id_entidad", "detalle")
    readonly_fields = ("fecha",)
