import pandas as pd
import numpy as np


def extract_temporal_features(marks_data: pd.DataFrame) -> pd.DataFrame:
    if marks_data.empty:
        return pd.DataFrame()

    marks_data = marks_data.copy()
    marks_data["created_at"] = pd.to_datetime(marks_data["created_at"])
    marks_data = marks_data.sort_values(["student_id", "created_at"])

    features_list = []
    for sid, group in marks_data.groupby("student_id"):
        group = group.reset_index(drop=True)
        if len(group) < 2:
            features_list.append({
                "student_id": sid,
                "temp_improvement_rate": 0.0,
                "temp_volatility": 0.0,
                "temp_consistency": 1.0,
                "temp_recent_trend": 0.0,
            })
            continue

        scores = group["marks"].values
        improvement_rate = np.polyfit(range(len(scores)), scores, 1)[0]
        volatility = np.std(np.diff(scores)) if len(scores) > 1 else 0
        consistency = 1.0 / (1.0 + volatility)
        recent_trend = (scores[-1] - scores[-2]) / (scores[-2] + 1e-8)

        features_list.append({
            "student_id": sid,
            "temp_improvement_rate": improvement_rate,
            "temp_volatility": volatility,
            "temp_consistency": consistency,
            "temp_recent_trend": recent_trend,
        })

    df = pd.DataFrame(features_list)
    return df
