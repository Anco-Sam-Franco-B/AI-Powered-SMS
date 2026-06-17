import pandas as pd
from datetime import datetime


def extract_demographic_features(students_data: pd.DataFrame) -> pd.DataFrame:
    if students_data.empty:
        return pd.DataFrame()

    df = students_data.copy()

    if "date_of_birth" in df.columns:
        df["date_of_birth"] = pd.to_datetime(df["date_of_birth"], errors="coerce")
        df["age"] = df["date_of_birth"].apply(
            lambda x: datetime.now().year - x.year if pd.notna(x) else None
        )

    if "enrollment_date" in df.columns:
        df["enrollment_date"] = pd.to_datetime(df["enrollment_date"], errors="coerce")
        df["years_enrolled"] = (datetime.now() - df["enrollment_date"]).dt.days / 365.25
    else:
        df["years_enrolled"] = 0

    features = df[["id"]].copy()
    features.columns = ["student_id"]

    if "age" in df.columns:
        features["demo_age"] = df["age"].fillna(df["age"].median())
    if "years_enrolled" in df.columns:
        features["demo_years_enrolled"] = df["years_enrolled"].fillna(0)

    if "is_active" in df.columns:
        features["demo_is_active"] = df["is_active"].astype(int)

    return features
