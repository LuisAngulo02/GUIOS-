"""
Módulo de compatibilidad para GUIOSAD.
Utiliza la arquitectura modular del paquete 'core' y carga los datasets desde 'data/'.
"""
from typing import List
from pathlib import Path
from core.models import Dimension, Factor, Subfactor, ImportanceLevel, SubfactorComplianceLevel, Scope, FodaCategory
from core.data_loader import DataLoader
from core.engine import GuiosadEngine


class Guiosad:
    """Clase principal de GUIOSAD que envuelve los datos y la configuración del sistema."""

    levels_lbls = [
        ImportanceLevel.IRRELEVANTE.label,
        ImportanceLevel.OPCIONAL.label,
        ImportanceLevel.IMPORTANTE.label,
        ImportanceLevel.FUNDAMENTAL.label,
    ]
    sub_levels_lbls = [
        SubfactorComplianceLevel.NO_CUMPLE.label,
        SubfactorComplianceLevel.DESCONOZCO.label,
        SubfactorComplianceLevel.CUMPLE_PARCIALMENTE.label,
        SubfactorComplianceLevel.CUMPLE.label,
    ]
    scope_levels = [Scope.INTERNO.value, Scope.EXTERNO.value, Scope.AMBOS.value]
    foda_levels = [
        FodaCategory.FORTALEZA.value,
        FodaCategory.OPORTUNIDAD.value,
        FodaCategory.DEBILIDAD.value,
        FodaCategory.AMENAZA.value,
    ]

    def __init__(self, data_dir: Path = None):
        self.loader = DataLoader(data_dir=data_dir)
        self.dimensions: List[Dimension] = self.loader.load_catalog()

        self.factors: List[Factor] = []
        self.factors_lbls: List[str] = []
        self.subfactors_list: List[List[str]] = []
        self.subfactors: List[Subfactor] = []
        self.data: List[dict] = []

        for dim in self.dimensions:
            for fact in dim.factors:
                self.factors.append(fact)
                self.factors_lbls.append(fact.name)

                subfactor_names = [s.name for s in fact.subfactors]
                self.subfactors_list.append(subfactor_names)
                self.subfactors.extend(fact.subfactors)

                # Estructura de diccionario compatible con código previo
                fdict = {
                    "name": fact.name,
                    "IS": fact.suggested_importance.value,
                    "ID": 1,
                    "IR": 1,
                    "relevant": True,
                    "subfactors": [{"name": s.name, "weight": 1} for s in fact.subfactors],
                    "global": 1,
                    "scope": fact.scope.value,
                    "foda": "Debilidad",
                }
                self.data.append(fdict)

    def get_suggested_importances(self) -> List[int]:
        """Retorna las importancias sugeridas (1 a 4) de cada factor."""
        return [f.suggested_importance.value for f in self.factors]

    def get_scopes(self) -> List[str]:
        """Retorna el alcance ('Interno', 'Externo', 'Ambos') de cada factor."""
        return [f.scope.value for f in self.factors]

    @staticmethod
    def assigment_function(input1: str, input2: str) -> str:
        """Calcula la importancia relativa entre dos niveles textuales."""
        idx1 = Guiosad.levels_lbls.index(input1)
        idx2 = Guiosad.levels_lbls.index(input2)
        res_idx = (idx1 + idx2) // 2
        return Guiosad.levels_lbls[res_idx]

    @staticmethod
    def relevant(input1: str, input2: str) -> bool:
        """Determina si un factor es relevante (IR > Irrelevante)."""
        idx1 = Guiosad.levels_lbls.index(input1)
        idx2 = Guiosad.levels_lbls.index(input2)
        res_idx = (idx1 + idx2) // 2
        return res_idx > 0


if __name__ == "__main__":
    g = Guiosad()
    print(f"Catálogo cargado con éxito:")
    print(f"- Dimensiones: {len(g.dimensions)}")
    print(f"- Factores: {len(g.factors)}")
    print(f"- Subfactores: {len(g.subfactors)}")