import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from celery import Task
from app.config import settings
from app.ml.pipeline import TrainingPipeline
from app.ml.registry import model_registry
from app.ml.drift_detector import DriftDetector
from app.tasks.celery_app import celery_app
from app.models.training_job import TrainingJob


class DatabaseTask(Task):
    _engine = None

    @property
    def engine(self):
        if self._engine is None:
            self._engine = create_engine(settings.database_url_sync, poolclass=NullPool)
        return self._engine


@celery_app.task(base=DatabaseTask, bind=True, max_retries=3)
def train_model_task(self, model_type: str, dataset_info: dict = None):
    engine = self.engine
    pipeline = TrainingPipeline()

    try:
        with engine.connect() as conn:
            marks_df = pd.read_sql("SELECT * FROM marks", conn)
            attendance_df = pd.read_sql("SELECT * FROM attendance", conn)
            students_df = pd.read_sql("SELECT * FROM students", conn)

        if model_type == "all":
            results = pipeline.run_all(marks_df, attendance_df, students_df)
        elif model_type == "performance":
            features = pipeline.build_features(marks_df, attendance_df, students_df)
            results = pipeline.train_performance_predictor(features, marks_df)
        elif model_type == "risk":
            features = pipeline.build_features(marks_df, attendance_df, students_df)
            results = pipeline.train_risk_classifier(features, marks_df)
        elif model_type == "promotion":
            features = pipeline.build_features(marks_df, attendance_df, students_df)
            results = pipeline.train_promotion_recommender(features, marks_df)
        elif model_type == "drift_check":
            features = pipeline.build_features(marks_df, attendance_df, students_df)
            if not features.empty:
                detector = DriftDetector()
                champion = model_registry.get_champion("performance_predictor")
                if champion and champion.get("metrics"):
                    baseline_rmse = champion["metrics"].get("rmse", 0.5)
                    results = {"drift_check": "completed", "baseline_rmse": baseline_rmse}
                else:
                    results = {"drift_check": "no_champion_model", "action": "train_new"}
            else:
                results = {"drift_check": "no_data"}
        else:
            results = {"error": f"Unknown model_type: {model_type}"}

        return {"status": "success", "model_type": model_type, "results": results}

    except Exception as e:
        self.retry(exc=e, countdown=60)
        return {"status": "failed", "error": str(e)}


@celery_app.task(base=DatabaseTask, bind=True)
def batch_predict_task(self, student_ids: list[int], prediction_type: str):
    engine = self.engine
    results = []

    try:
        if prediction_type == "performance":
            from app.ml.models import PerformancePredictor
            predictor = PerformancePredictor()

            with engine.connect() as conn:
                marks_df = pd.read_sql("SELECT * FROM marks", conn)
                attendance_df = pd.read_sql("SELECT * FROM attendance", conn)
                students_df = pd.read_sql("SELECT * FROM students", conn)
            pipeline = TrainingPipeline()
            features = pipeline.build_features(marks_df, attendance_df, students_df)

            if not features.empty:
                sid_features = features[features["student_id"].isin(student_ids)]
                if not sid_features.empty:
                    preds = predictor.predict_with_confidence(sid_features)
                    for i, row in sid_features.iterrows():
                        results.append({
                            "student_id": int(row["student_id"]),
                            **preds[len(results)],
                        })

        return {"status": "success", "predictions": results, "count": len(results)}

    except Exception as e:
        return {"status": "failed", "error": str(e)}


@celery_app.task(base=DatabaseTask, bind=True)
def retrain_trigger_task(self, model_type: str = "all"):
    if model_type == "drift_check":
        result = train_model_task.delay("drift_check")
    else:
        result = train_model_task.delay(model_type)
    return {"status": "triggered", "task_id": result.id, "model_type": model_type}
