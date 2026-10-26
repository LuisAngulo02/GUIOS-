"""
Motor de Cálculo y Reglas de Decisión de GUIOSAD / GUIOS-PRO.
Implementa las fórmulas matemáticas y la matriz de decisión de la Tesis Doctoral y la Matriz 2021.
"""
from typing import List, Optional
from core.models import (
    Factor,
    FodaCategory,
    ImportanceLevel,
    RecommendationResult,
    RecommendationType,
    Scope,
)


class GuiosadEngine:
    """Motor de cálculo puro desacoplado de la interfaz de usuario."""

    @staticmethod
    def calculate_relative_importance(
        suggested: ImportanceLevel, decisor: ImportanceLevel
    ) -> ImportanceLevel:
        """
        Calcula la Importancia Relativa (IR) cruzando IS e ID:
        IR_index = floor((IS_index + ID_index) / 2)
        """
        r_index = (suggested.index + decisor.index) // 2
        return ImportanceLevel.from_index(r_index)

    @staticmethod
    def is_relevant(relative_importance: ImportanceLevel) -> bool:
        """
        Un factor es relevante para la evaluación si su importancia relativa
        es superior a Irrelevante (es decir: Opcional, Importante o Fundamental).
        """
        return relative_importance != ImportanceLevel.IRRELEVANTE

    @staticmethod
    def calculate_average_weight(scores: List[int]) -> float:
        """
        Calcula la ponderación media (PM) de un factor a partir de las notas de sus subfactores.
        PM = sum(scores) / len(scores)
        """
        if not scores:
            return 0.0
        return sum(scores) / len(scores)

    @staticmethod
    def classify_foda(scope: Scope, average_weight: float) -> FodaCategory:
        """
        Clasifica el factor en la matriz FODA según su alcance y ponderación media (umbral = 3.0):
        - Interno + PM >= 3.0 -> Fortaleza
        - Interno + PM < 3.0  -> Debilidad
        - Externo + PM >= 3.0 -> Oportunidad
        - Externo + PM < 3.0  -> Amenaza
        """
        is_positive = average_weight >= 3.0

        if scope == Scope.INTERNO:
            return FodaCategory.FORTALEZA if is_positive else FodaCategory.DEBILIDAD
        else:  # Externo o configurado como Externo
            return FodaCategory.OPORTUNIDAD if is_positive else FodaCategory.AMENAZA

    @classmethod
    def evaluate_recommendation(cls, evaluated_factors: List[Factor]) -> RecommendationResult:
        """
        Evalúa la lista de factores calificados y emite la recomendación final
        según las reglas de decisión de la Matriz 2021 y el Capítulo 6 de la Tesis:

        - Caso A (Crítico): Al menos una Amenaza o Debilidad en un factor cuya Importancia
          Relativa es Fundamental o Importante.
        - Caso B (Reservas): No hay amenazas/debilidades en factores críticos, pero al menos una
          Amenaza o Debilidad en un factor Opcional.
        - Caso C (Favorable): Todos los factores evaluados son Fortalezas u Oportunidades.
        """
        if not evaluated_factors:
            return RecommendationResult(
                recommendation_type=RecommendationType.RECOMENDACION_A,
                title="Sin evaluación",
                description="No se han evaluado subfactores todavía. Complete la evaluación de los factores relevantes.",
                style_category="neutral",
            )

        strengths = sum(1 for f in evaluated_factors if f.foda == FodaCategory.FORTALEZA)
        opportunities = sum(1 for f in evaluated_factors if f.foda == FodaCategory.OPORTUNIDAD)
        weaknesses = sum(1 for f in evaluated_factors if f.foda == FodaCategory.DEBILIDAD)
        threats = sum(1 for f in evaluated_factors if f.foda == FodaCategory.AMENAZA)

        has_critical_issue = False
        has_optional_issue = False

        for factor in evaluated_factors:
            is_negative = factor.foda in (FodaCategory.DEBILIDAD, FodaCategory.AMENAZA)
            if not is_negative:
                continue

            if factor.relative_importance in (
                ImportanceLevel.IMPORTANTE,
                ImportanceLevel.FUNDAMENTAL,
            ):
                has_critical_issue = True
                break
            elif factor.relative_importance == ImportanceLevel.OPOCIONAL if hasattr(ImportanceLevel, 'OPOCIONAL') else (factor.relative_importance == ImportanceLevel.OPCIONAL):
                has_optional_issue = True

        if has_critical_issue:
            return RecommendationResult(
                recommendation_type=RecommendationType.RECOMENDACION_A,
                title="Recomendación A: No es viable adoptar en el estado actual",
                description=(
                    "Se han detectado amenazas y/o debilidades en factores cuya importancia relativa "
                    "es fundamental o importante. Es indispensable que el decisor revise y mitigue los "
                    "subfactores con baja valoración proporcionando los recursos necesarios "
                    "(humanos, tecnológicos o económicos) antes de autorizar la adopción de la solución FLOSS."
                ),
                style_category="bad",
                total_evaluated=len(evaluated_factors),
                strengths_count=strengths,
                opportunities_count=opportunities,
                weaknesses_count=weaknesses,
                threats_count=threats,
            )
        elif has_optional_issue:
            return RecommendationResult(
                recommendation_type=RecommendationType.RECOMENDACION_B,
                title="Recomendación B: Es posible adoptar con reservas",
                description=(
                    "Es viable proceder con la adopción. Se han detectado debilidades o amenazas únicamente "
                    "en factores de importancia opcional. Se sugiere establecer un plan de seguimiento para "
                    "los criterios que no alcanzaron la valoración óptima."
                ),
                style_category="warning",
                total_evaluated=len(evaluated_factors),
                strengths_count=strengths,
                opportunities_count=opportunities,
                weaknesses_count=weaknesses,
                threats_count=threats,
            )
        else:
            return RecommendationResult(
                recommendation_type=RecommendationType.RECOMENDACION_C,
                title="Recomendación C: Es posible adoptar plenamente",
                description=(
                    "Adopción altamente recomendada. Todos los factores relevantes evaluados han sido "
                    "identificados como Oportunidades o Fortalezas. La organización y la solución FLOSS "
                    "cumplen satisfactoriamente con la mayoría de requisitos necesarios para una transición exitosa."
                ),
                style_category="good",
                total_evaluated=len(evaluated_factors),
                strengths_count=strengths,
                opportunities_count=opportunities,
                weaknesses_count=weaknesses,
                threats_count=threats,
            )
