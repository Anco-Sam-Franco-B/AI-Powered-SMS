import pandas as pd
import numpy as np


def extract_academic_features(marks_data: pd.DataFrame) -> pd.DataFrame:
    if marks_data.empty:
        return pd.DataFrame()

    grouped = marks_data.groupby("student_id")
    features = pd.DataFrame(index=grouped.groups.keys())

    features["avg_marks"] = grouped["marks"].mean()
    features["std_marks"] = grouped["marks"].std().fillna(0)
    features["max_marks"] = grouped["marks"].max()
    features["min_marks"] = grouped["marks"].min()
    features["median_marks"] = grouped["marks"].median()
    features["total_courses"] = grouped["course_id"].nunique()
    features["total_terms"] = grouped["term_id"].nunique()
    features["marks_trend"] = grouped["marks"].apply(
        lambda x: np.polyfit(range(len(x)), x, 1)[0] if len(x) > 1 else 0
    )
    features["above_average_ratio"] = grouped["marks"].apply(
        lambda x: (x > x.mean()).mean()
    )
    features["grade_a_count"] = grouped["marks"].apply(
        lambda x: (x >= 80).sum()
    )
    features["fail_count"] = grouped["marks"].apply(
        lambda x: (x < 50).sum()
    )

    features.reset_index(inplace=True)
    features.columns = ["student_id", *[f"acad_{c}" for c in features.columns if c != "student_id"]]
    return features


def compute_gpa(marks: pd.Series) -> float:
    def mark_to_gpa(m):
        if m >= 80: return 4.0
        if m >= 75: return 3.7
        if m >= 70: return 3.3
        if m >= 65: return 3.0
        if m >= 60: return 2.7
        if m >= 55: return 2.3
        if m >= 50: return 2.0
        return 0.0
    return marks.apply(mark_to_gpa).mean()
