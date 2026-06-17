import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from app.ml.registry import model_registry


class PromotionRecommender:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_columns = None
        self.model_name = "promotion_recommender"
        self.version = 0

    def _get_feature_columns(self) -> list:
        return [
            "acad_avg_marks", "acad_std_marks", "acad_min_marks", "acad_fail_count",
            "acad_total_courses", "acad_marks_trend",
            "att_present_ratio", "att_absent_ratio",
            "temp_improvement_rate", "temp_consistency",
            "demo_age", "demo_years_enrolled",
        ]

    def train(self, features: pd.DataFrame, target_column: str = "promotion_decision") -> dict:
        feature_cols = [c for c in self._get_feature_columns() if c in features.columns]
        self.feature_columns = feature_cols

        X = features[feature_cols].values
        y_raw = features[target_column].values if target_column in features.columns else None

        if y_raw is None:
            raise ValueError(f"Target column '{target_column}' not found")

        y = self.label_encoder.fit_transform(y_raw)

        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model = RandomForestClassifier(
            n_estimators=200, max_depth=10, min_samples_leaf=3,
            random_state=42, class_weight="balanced", n_jobs=-1
        )
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        metrics = {
            "accuracy": float(accuracy),
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
        }

        self.version = model_registry.latest_version(self.model_name) + 1
        model_registry.save_model(
            {
                "model": self.model, "scaler": self.scaler,
                "label_encoder": self.label_encoder, "feature_columns": feature_cols
            },
            self.model_name, self.version, metrics,
            {"n_estimators": 200, "max_depth": 10}
        )

        return metrics

    def predict(self, features: pd.DataFrame) -> np.ndarray:
        if self.model is None:
            loaded = model_registry.load_model(self.model_name)
            self.model = loaded["model"]
            self.scaler = loaded["scaler"]
            self.label_encoder = loaded["label_encoder"]
            self.feature_columns = loaded.get("feature_columns", self._get_feature_columns())

        feature_cols = [c for c in self.feature_columns if c in features.columns]
        X = features[feature_cols].values
        X_scaled = self.scaler.transform(X)
        preds = self.model.predict(X_scaled)
        return self.label_encoder.inverse_transform(preds)

    def predict_with_details(self, features: pd.DataFrame, student_ids: list = None) -> list[dict]:
        try:
            if self.model is None:
                loaded = model_registry.load_model(self.model_name)
                self.model = loaded["model"]
                self.scaler = loaded["scaler"]
                self.label_encoder = loaded["label_encoder"]
                self.feature_columns = loaded.get("feature_columns", self._get_feature_columns())

            feature_cols = [c for c in self.feature_columns if c in features.columns]
            X = features[feature_cols].values
            X_scaled = self.scaler.transform(X)
            preds = self.model.predict(X_scaled)
            probs = self.model.predict_proba(X_scaled)

            labels = self.label_encoder.classes_
            results = []
            for i, (p, prob) in enumerate(zip(preds, probs)):
                decision = self.label_encoder.inverse_transform([p])[0]
                confidence = float(max(prob))
                results.append({
                    "student_id": student_ids[i] if student_ids and i < len(student_ids) else i,
                    "recommendation": str(decision),
                    "confidence": round(confidence, 4),
                    "probabilities": {str(l): float(prob[j]) for j, l in enumerate(labels)},
                    "risk_level": "low" if decision == "promote" else "medium" if decision == "probation" else "high",
                })
            return results
        except Exception:
            return self._heuristic_promotion(features, student_ids)

    def _heuristic_promotion(self, features: pd.DataFrame, student_ids: list = None) -> list[dict]:
        results = []
        for i, (_, row) in enumerate(features.iterrows()):
            sid = int(row.get("student_id", i))
            avg_marks = row.get("acad_avg_marks", 0)
            present_ratio = row.get("att_present_ratio", 0)
            fail_count = row.get("acad_fail_count", 0)

            if avg_marks >= 60 and present_ratio >= 0.75 and fail_count <= 1:
                recommendation = "promote"
                confidence = min(0.5 + (avg_marks - 60) / 200, 0.95)
                risk_level = "low"
            elif avg_marks >= 40 and present_ratio >= 0.5 and fail_count <= 3:
                recommendation = "probation"
                confidence = min(0.4 + (avg_marks - 40) / 150, 0.85)
                risk_level = "medium"
            else:
                recommendation = "retain"
                confidence = min(0.5 + max(0, 40 - avg_marks) / 100, 0.95)
                risk_level = "high"

            results.append({
                "student_id": int(sid),
                "recommendation": recommendation,
                "confidence": round(confidence, 4),
                "probabilities": {},
                "risk_level": risk_level,
            })
        return results
