import pandas as pd
from typing import Optional


class ExcelParser:
    @staticmethod
    def parse(file_path: str) -> Optional[pd.DataFrame]:
        try:
            if file_path.endswith(".csv"):
                return pd.read_csv(file_path)
            else:
                return pd.read_excel(file_path, engine="openpyxl")
        except Exception as e:
            raise ValueError(f"Failed to parse Excel file: {e}")

    @staticmethod
    def validate_columns(df: pd.DataFrame, required_columns: list[str]) -> list[str]:
        missing = [col for col in required_columns if col not in df.columns]
        return missing

    @staticmethod
    def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        df = df.dropna(how="all")
        df = df.drop_duplicates()
        return df
