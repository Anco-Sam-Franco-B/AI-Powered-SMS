import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from app.ml.registry import model_registry


class PerformancePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.model_name = "performance_predictor"
        self.version = 0

    def _get_feature_columns(self) -> list:
        return [
            "acad_avg_marks", "acad_std_marks", "acad_max_marks", "acad_min_marks",
            "acad_median_marks", "acad_total_courses", "acad_total_terms",
            "acad_marks_trend", "acad_above_average_ratio", "acad_grade_a_count",
            "acad_fail_count",
            "att_present_ratio", "att_absent_ratio", "att_late_ratio",
            "temp_improvement_rate", "temp_volatility", "temp_consistency", "temp_recent_trend",
            "demo_age", "demo_years_enrolled",
        ]

    def build_features(self, academic_df, attendance_df, temporal_df, demographic_df) -> pd.DataFrame:
        dfs = [df.set_index("student_id") if "student_id" in df.columns else df
               for df in [academic_df, attendance_df, temporal_df, demographic_df]
               if df is not None and not df.empty]

        if not dfs:
            return pd.DataFrame()

        combined = dfs[0]
        for df in dfs[1:]:
            combined = combined.join(df, how="outer")

        combined = combined.fillna(0)
        return combined.reset_index()

    def train(self, features: pd.DataFrame, target_column: str = "target_marks") -> dict:
        feature_cols = [c for c in self._get_feature_columns() if c in features.columns]
        self.feature_columns = feature_cols

        X = features[feature_cols].values
        y = features[target_column].values if target_column in features.columns else None

        if y is None:
            raise ValueError(f"Target column '{target_column}' not found in features")

        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        self.model = RandomForestRegressor(
            n_estimators=200, max_depth=15, min_samples_leaf=5,
            random_state=42, n_jobs=-1
        )
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        metrics = {
            "rmse": float(np.sqrt(mean_squared_error(y_test, y_pred))),
            "mae": float(mean_absolute_error(y_test, y_pred)),
            "r2": float(r2_score(y_test, y_pred)),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
        }

        self.version = model_registry.latest_version(self.model_name) + 1
        model_registry.save_model(
            {"model": self.model, "scaler": self.scaler, "feature_columns": feature_cols},
            self.model_name, self.version, metrics,
            {"n_estimators": 200, "max_depth": 15, "min_samples_leaf": 5}
        )

        return metrics

    def predict(self, features: pd.DataFrame) -> np.ndarray:
        if self.model is None:
            loaded = model_registry.load_model(self.model_name)
            self.model = loaded["model"]
            self.scaler = loaded["scaler"]
            self.feature_columns = loaded.get("feature_columns", self._get_feature_columns())

        feature_cols = [c for c in self.feature_columns if c in features.columns]
        X = features[feature_cols].values
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

    def predict_with_confidence(self, features: pd.DataFrame) -> list[dict]:
        preds = self.predict(features)
        if hasattr(self.model, "estimators_"):
            all_preds = np.array([tree.predict(self.scaler.transform(features[self.feature_columns].values))
                                  for tree in self.model.estimators_])
            std = all_preds.std(axis=0)
        else:
            std = np.ones_like(preds) * 0.1

        results = []
        for i, (p, s) in enumerate(zip(preds, std)):
            confidence = max(0, min(1, 1.0 - (s / 20.0)))
            results.append({
                "predicted_marks": float(round(p, 2)),
                "confidence": float(round(confidence, 4)),
                "risk_level": "high" if p < 50 else "medium" if p < 65 else "low",
                "std_dev": float(round(s, 2)),
            })
        return results
