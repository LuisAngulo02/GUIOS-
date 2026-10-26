"""
Módulo de Modelos de Datos del Sistema GUIOSAD / GUIOS-PRO.
Basado en la Tesis Doctoral de Víctor Hugo Rea Sánchez (Universidad de Sevilla / UNEMI).
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional


class ImportanceLevel(int, Enum):
    """Niveles de importancia según la metodología GUIOS."""
    IRRELEVANTE = 1
    OPCIONAL = 2
    IMPORTANTE = 3
    FUNDAMENTAL = 4

    @classmethod
    def from_index(cls, index: int) -> "ImportanceLevel":
        """Retorna el nivel correspondiente a un índice 0-indexed."""
        mapping = [cls.IRRELEVANTE, cls.OPCIONAL, cls.IMPORTANTE, cls.FUNDAMENTAL]
        if 0 <= index < len(mapping):
            return mapping[index]
        raise ValueError(f"Índice {index} fuera de rango para ImportanceLevel.")

    @property
    def label(self) -> str:
        labels = {
            ImportanceLevel.IRRELEVANTE: "Irrelevante",
            ImportanceLevel.OPCIONAL: "Opcional",
            ImportanceLevel.IMPORTANTE: "Importante",
            ImportanceLevel.FUNDAMENTAL: "Fundamental",
        }
        return labels[self]

    @property
    def index(self) -> int:
        """Índice 0 a 3 utilizado en la matriz matricial de decisión."""
        return self.value - 1


class SubfactorComplianceLevel(int, Enum):
    """Nivel de cumplimiento de un subfactor (reactivo/pregunta)."""
    NO_CUMPLE = 1
    DESCONOZCO = 2
    CUMPLE_PARCIALMENTE = 3
    CUMPLE = 4

    @property
    def label(self) -> str:
        labels = {
            SubfactorComplianceLevel.NO_CUMPLE: "No cumple el requisito",
            SubfactorComplianceLevel.DESCONOZCO: "Desconozco si cumple requisito",
            SubfactorComplianceLevel.CUMPLE_PARCIALMENTE: "Cumple parcialmente el requisito",
            SubfactorComplianceLevel.CUMPLE: "Cumple el requisito",
        }
        return labels[self]


class Scope(str, Enum):
    """Ámbito de impacto del factor para la matriz FODA."""
    INTERNO = "Interno"
    EXTERNO = "Externo"
    AMBOS = "Ambos"


class FodaCategory(str, Enum):
    """Clasificación en la matriz FODA / DAFO."""
    FORTALEZA = "Fortaleza"
    OPORTUNIDAD = "Oportunidad"
    DEBILIDAD = "Debilidad"
    AMENAZA = "Amenaza"


class RecommendationType(str, Enum):
    """
    Tipos de recomendación de adopción según la metodología GUIOS y la Matriz 2021:
    - RECOMENDACION_A: Riesgo crítico detectado. No es viable adoptar sin mitigar debilidades/amenazas clave.
    - RECOMENDACION_B: Viable adoptar con reservas (revisar aspectos opcionales con baja puntuación).
    - RECOMENDACION_C: Adoptar plenamente (todos los factores evaluados son fortalezas u oportunidades).
    """
    RECOMENDACION_A = "Recomendación A"
    RECOMENDACION_B = "Recomendación B"
    RECOMENDACION_C = "Recomendación C"


@dataclass
class Subfactor:
    name: str
    compliance_score: int = 1  # 1 a 4
    factor_name: Optional[str] = None


@dataclass
class Factor:
    name: str
    dimension_name: str
    suggested_importance: ImportanceLevel = ImportanceLevel.OPCIONAL  # IS
    decisor_importance: ImportanceLevel = ImportanceLevel.IRRELEVANTE  # ID
    relative_importance: ImportanceLevel = ImportanceLevel.IRRELEVANTE  # IR
    scope: Scope = Scope.INTERNO
    subfactors: List[Subfactor] = field(default_factory=list)
    average_weight: float = 0.0  # PM
    foda: Optional[FodaCategory] = None
    is_relevant: bool = False


@dataclass
class Dimension:
    name: str
    factors: List[Factor] = field(default_factory=list)


@dataclass
class RecommendationResult:
    recommendation_type: RecommendationType
    title: str
    description: str
    style_category: str  # 'good', 'warning', 'bad'
    total_evaluated: int = 0
    strengths_count: int = 0
    opportunities_count: int = 0
    weaknesses_count: int = 0
    threats_count: int = 0
