"""
Cargador de datos y repositorio del sistema GUIOSAD / GUIOS-PRO.
Lee los datasets maestros en la carpeta 'data/' para alimentar la base de datos y validaciones.
"""
from pathlib import Path
from typing import Dict, List
import pandas as pd

from guio_core.engine.domain_models import Dimension, Factor, ImportanceLevel, Scope, Subfactor


class DataLoader:
    """Carga y procesa los datasets CSV para el sistema GUIOSAD."""

    def __init__(self, data_dir: Path = None):
        if data_dir is None:
            # Directorio 'data' en la raíz del proyecto
            self.data_dir = Path(__file__).resolve().parent.parent.parent / "data"
        else:
            self.data_dir = Path(data_dir)

        self.factors_file = self.data_dir / "factors.csv"
        self.guiosad_data_file = self.data_dir / "guiosad_data.csv"

        if not self.factors_file.exists():
            raise FileNotFoundError(f"No se encontró el archivo de factores: {self.factors_file}")
        if not self.guiosad_data_file.exists():
            raise FileNotFoundError(f"No se encontró el archivo de datos: {self.guiosad_data_file}")

    def load_raw_dataframes(self):
        """Lee los CSV delimitados por tabulaciones con codificación UTF-8."""
        factors_df = pd.read_csv(self.factors_file, sep="\t", encoding="utf-8")
        guiosad_df = pd.read_csv(self.guiosad_data_file, sep="\t", encoding="utf-8")
        return factors_df, guiosad_df

    def load_catalog(self) -> List[Dimension]:
        """
        Construye la jerarquía completa en memoria: Dimensión -> Factor -> Subfactor.
        """
        factors_df, guiosad_df = self.load_raw_dataframes()

        factors_meta: Dict[str, dict] = {}
        for _, row in factors_df.iterrows():
            fname = str(row["Factor"]).strip()
            sug_val = int(row["Sugerida"])
            scope_val = str(row["Alcance"]).strip()
            factors_meta[fname] = {
                "sugerida": ImportanceLevel.from_index(sug_val - 1),
                "scope": Scope(scope_val),
            }

        dimensions: List[Dimension] = []
        dim_col = guiosad_df.columns[0]
        factor_col = guiosad_df.columns[1]
        subfactor_col = guiosad_df.columns[2]
        dim_names = guiosad_df[dim_col].unique().tolist()

        for d_name in dim_names:
            dimension = Dimension(name=d_name)
            sub_df = guiosad_df[guiosad_df[dim_col] == d_name]
            factor_names = sub_df[factor_col].unique().tolist()

            for f_name in factor_names:
                meta = factors_meta.get(
                    f_name,
                    {
                        "sugerida": ImportanceLevel.OPCIONAL,
                        "scope": Scope.INTERNO,
                    },
                )
                factor = Factor(
                    name=f_name,
                    dimension_name=d_name,
                    suggested_importance=meta["sugerida"],
                    scope=meta["scope"],
                )

                subfactor_names = sub_df[sub_df[factor_col] == f_name][subfactor_col].tolist()
                for sf_name in subfactor_names:
                    factor.subfactors.append(Subfactor(name=sf_name, factor_name=f_name))

                dimension.factors.append(factor)

            dimensions.append(dimension)

        return dimensions
