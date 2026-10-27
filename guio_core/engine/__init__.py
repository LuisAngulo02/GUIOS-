"""
Motor de cálculo y modelos de dominio de GUIOSAD integrados en la app guio_core.
"""
from guio_core.engine.domain_models import (
    Dimension,
    Factor,
    Subfactor,
    ImportanceLevel,
    SubfactorComplianceLevel,
    Scope,
    FodaCategory,
    RecommendationType,
    RecommendationResult,
)
from guio_core.engine.calculator import GuiosadEngine
from guio_core.engine.data_loader import DataLoader

__all__ = [
    "Dimension",
    "Factor",
    "Subfactor",
    "ImportanceLevel",
    "SubfactorComplianceLevel",
    "Scope",
    "FodaCategory",
    "RecommendationType",
    "RecommendationResult",
    "GuiosadEngine",
    "DataLoader",
]
