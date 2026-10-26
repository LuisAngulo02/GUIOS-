"""
Cargador de datos y repositorio del sistema GUIOSAD.
Lee de forma robusta los archivos en la carpeta 'data/'.
"""
from pathlib import Path
from typing import Dict, List
import pandas as pd

from core.models import Dimension, Factor, ImportanceLevel, Scope, Subfactor


class DataLoader:
    """Carga y procesa los datasets CSV para el sistema GUIOSAD."""

    def __init__(self, data_dir: Path = None):
        if data_dir is None:
            # Directorio 'data' relativo a la raíz del proyecto
            self.data_dir = Path(__file__).resolve().parent.parent / "data"
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
        Construye la jerarquía completa: Dimensión -> Factor -> Subfactor.
        """
        factors_df, guiosad_df = self.load_raw_dataframes()

        # Mapeo rápido de factores a su configuración base (IS y Alcance)
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
        dim_col = guiosad_df.columns[0]  # 'Dimensión'
        factor_col = guiosad_df.columns[1]  # 'Factor'
        subfactor_col = guiosad_df.columns[2]  # 'Subfactor'
        dim_names = guiosad_df[dim_col].unique().tolist()

        for d_name in dim_names:
            dimension = Dimension(name=d_name)
            df_dim = guiosad_df[guiosad_df[dim_col] == d_name]
            factors_in_dim = df_dim[factor_col].unique().tolist()

            for f_name in factors_in_dim:
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

                # Cargar subfactores correspondientes
                df_sub = df_dim[df_dim["Factor"] == f_name]
                for _, s_row in df_sub.iterrows():
                    sub_text = str(s_row["Subfactor"]).strip()
                    subfactor = Subfactor(name=sub_text, factor_name=f_name)
                    factor.subfactors.append(subfactor)

                dimension.factors.append(factor)

            dimensions.append(dimension)

        return dimensions
