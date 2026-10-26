"""
Paquete core de GUIOSAD.
Provee los modelos de datos, cargador y motor de decisión lógica de GUIOSAD / GUIOS-PRO.
"""
from core.models import (
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
from core.engine import GuiosadEngine
from core.data_loader import DataLoader

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
