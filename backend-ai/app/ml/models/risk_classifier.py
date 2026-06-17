import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from app.ml.registry import model_registry


class RiskClassifier:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.model_name = "risk_classifier"
        self.version = 0
        self.classes_ = None

    def _get_feature_columns(self) -> list:
        return [
            "acad_avg_marks", "acad_std_marks", "acad_min_marks", "acad_fail_count",
            "acad_total_courses",
            "att_present_ratio", "att_absent_ratio",
            "temp_improvement_rate", "temp_volatility", "temp_consistency",
            "demo_age", "demo_years_enrolled",
        ]

    def train(self, features: pd.DataFrame, target_column: str = "is_at_risk") -> dict:
        feature_cols = [c for c in self._get_feature_columns() if c in features.columns]
        self.feature_columns = feature_cols

        X = features[feature_cols].values
        y = features[target_column].values if target_column in features.columns else None

        if y is None:
            raise ValueError(f"Target column '{target_column}' not found")

        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model = GradientBoostingClassifier(
            n_estimators=150, max_depth=5, learning_rate=0.1,
            random_state=42, subsample=0.8
        )
        self.model.fit(X_train, y_train)
        self.classes_ = self.model.classes_

        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1] if len(self.classes_) == 2 else None

        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, average="binary")),
            "recall": float(recall_score(y_test, y_pred, average="binary")),
            "f1": float(f1_score(y_test, y_pred, average="binary")),
            "roc_auc": float(roc_auc_score(y_test, y_prob)) if y_prob is not None else 0.0,
            "train_samples": int(len(X_train)),
            "test_samples": int(len(X_test)),
        }

        self.version = model_registry.latest_version(self.model_name) + 1
        model_registry.save_model(
            {"model": self.model, "scaler": self.scaler, "feature_columns": feature_cols},
            self.model_name, self.version, metrics,
            {"n_estimators": 150, "max_depth": 5, "learning_rate": 0.1}
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

    def predict_proba(self, features: pd.DataFrame) -> np.ndarray:
        if self.model is None:
            loaded = model_registry.load_model(self.model_name)
            self.model = loaded["model"]
            self.scaler = loaded["scaler"]
            self.feature_columns = loaded.get("feature_columns", self._get_feature_columns())

        feature_cols = [c for c in self.feature_columns if c in features.columns]
        X = features[feature_cols].values
        X_scaled = self.scaler.transform(X)
        return self.model.predict_proba(X_scaled)

    def predict_with_details(self, features: pd.DataFrame, student_ids: list = None) -> list[dict]:
        try:
            probs = self.predict_proba(features)
            preds = self.predict(features)
        except Exception:
            return self._heuristic_risk(features, student_ids)

        results = []
        for i, (p, prob) in enumerate(zip(preds, probs)):
            risk_score = float(prob[1]) if len(prob) > 1 else float(prob[0])
            results.append({
                "student_id": student_ids[i] if student_ids and i < len(student_ids) else i,
                "is_at_risk": bool(p),
                "risk_score": round(risk_score, 4),
                "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.3 else "low",
                "confidence": round(max(prob), 4),
            })
        return results

    def _heuristic_risk(self, features: pd.DataFrame, student_ids: list = None) -> list[dict]:
        results = []
        for i, (_, row) in enumerate(features.iterrows()):
            sid = int(row.get("student_id", i))
            score = 0.0
            factors = []

            if "acad_avg_marks" in row:
                marks = row["acad_avg_marks"]
                if marks < 40: score += 0.4
                elif marks < 60: score += 0.2

            if "att_present_ratio" in row:
                ratio = row["att_present_ratio"]
                if ratio < 0.6: score += 0.4
                elif ratio < 0.8: score += 0.2

            if "acad_fail_count" in row:
                fails = row["acad_fail_count"]
                if fails > 2: score += 0.2
                elif fails > 0: score += 0.1

            risk_score = min(score, 1.0)
            results.append({
                "student_id": int(sid) if not isinstance(sid, int) else sid,
                "is_at_risk": risk_score > 0.4,
                "risk_score": round(risk_score, 4),
                "risk_level": "high" if risk_score > 0.7 else "medium" if risk_score > 0.3 else "low",
                "confidence": round(max(risk_score, 1 - risk_score), 4),
            })
        return results
