import pandas as pd
import numpy as np
from datetime import datetime
from typing import Optional
from app.ml.registry import model_registry
from app.ml.evaluation import Evaluator
from app.ml.features.academic import extract_academic_features, compute_gpa
from app.ml.features.attendance_features import extract_attendance_features
from app.ml.features.temporal import extract_temporal_features
from app.ml.features.demographic import extract_demographic_features
from app.ml.models import PerformancePredictor, RiskClassifier, PromotionRecommender, AttendanceForecaster


class TrainingPipeline:
    def __init__(self):
        self.evaluator = Evaluator()

    def build_features(self, marks_df: pd.DataFrame, attendance_df: pd.DataFrame,
                       students_df: pd.DataFrame) -> pd.DataFrame:
        acad_feats = extract_academic_features(marks_df)
        att_feats = extract_attendance_features(attendance_df)
        temp_feats = extract_temporal_features(marks_df)
        demo_feats = extract_demographic_features(students_df)

        dfs = []
        for df in [acad_feats, att_feats, temp_feats, demo_feats]:
            if df is not None and not df.empty:
                dfs.append(df.set_index("student_id") if "student_id" in df.columns else df)

        if not dfs:
            return pd.DataFrame()

        combined = dfs[0]
        for df in dfs[1:]:
            combined = combined.join(df, how="outer")

        combined = combined.fillna(0).reset_index()
        combined = combined.rename(columns={"index": "student_id"} if "student_id" not in combined.columns else {})
        return combined

    def train_performance_predictor(self, features: pd.DataFrame, marks_df: pd.DataFrame) -> dict:
        target = marks_df.groupby("student_id")["marks"].mean().reset_index()
        target.columns = ["student_id", "target_marks"]
        data = features.merge(target, on="student_id", how="inner")

        if len(data) < 10:
            return {"error": f"Not enough samples ({len(data)}). Need at least 10."}

        predictor = PerformancePredictor()
        metrics = predictor.train(data, target_column="target_marks")

        champion = model_registry.get_champion(predictor.model_name)
        if champion and self.evaluator.compare_with_champion(champion.get("metrics", {}), metrics, "rmse"):
            pass  # new model is better, promote later

        return metrics

    def train_risk_classifier(self, features: pd.DataFrame, marks_df: pd.DataFrame) -> dict:
        target = marks_df.groupby("student_id")["marks"].mean().reset_index()
        target["is_at_risk"] = (target["marks"] < 50).astype(int)
        data = features.merge(target[["student_id", "is_at_risk"]], on="student_id", how="inner")

        if len(data) < 10:
            return {"error": f"Not enough samples ({len(data)}). Need at least 10."}

        classifier = RiskClassifier()
        metrics = classifier.train(data, target_column="is_at_risk")
        return metrics

    def train_promotion_recommender(self, features: pd.DataFrame, marks_df: pd.DataFrame) -> dict:
        target = marks_df.groupby("student_id")["marks"].mean().reset_index()
        def make_decision(row):
            if row["marks"] >= 65: return "promote"
            if row["marks"] >= 50: return "probation"
            return "retain"
        target["promotion_decision"] = target.apply(make_decision, axis=1)
        data = features.merge(target[["student_id", "promotion_decision"]], on="student_id", how="inner")

        if len(data) < 10:
            return {"error": f"Not enough samples ({len(data)}). Need at least 10."}

        recommender = PromotionRecommender()
        metrics = recommender.train(data, target_column="promotion_decision")
        return metrics

    def train_attendance_forecaster(self, attendance_df: pd.DataFrame, course_id: int) -> dict:
        if attendance_df.empty:
            return {"error": "No attendance data provided"}

        course_att = attendance_df[attendance_df["course_id"] == course_id].copy()
        if course_att.empty:
            return {"error": f"No attendance data for course {course_id}"}

        course_att["class_date"] = pd.to_datetime(course_att["class_date"])
        daily = course_att.groupby("class_date").apply(
            lambda x: (x["status"] == "present").sum() / len(x)
        )

        forecaster = AttendanceForecaster()
        metrics = forecaster.train(daily)
        return metrics

    def run_all(self, marks_df: pd.DataFrame, attendance_df: pd.DataFrame,
                students_df: pd.DataFrame) -> dict:
        features = self.build_features(marks_df, attendance_df, students_df)
        if features.empty:
            return {"error": "No features could be built from the provided data"}

        results = {}
        results["performance"] = self.train_performance_predictor(features, marks_df)
        results["risk"] = self.train_risk_classifier(features, marks_df)
        results["promotion"] = self.train_promotion_recommender(features, marks_df)

        return results
