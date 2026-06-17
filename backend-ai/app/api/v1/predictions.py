import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import verify_token
from app.ml.pipeline import TrainingPipeline
from app.ml.models.performance_predictor import PerformancePredictor
from app.ml.models.risk_classifier import RiskClassifier
from app.schemas.prediction import (
    PerformancePredictionRequest, BatchPredictionRequest,
    PredictionResponse, BatchPredictionResponse,
)
from app.config import settings
from app.tasks.train_model import batch_predict_task

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/student-performance", response_model=PredictionResponse)
async def predict_performance(req: PerformancePredictionRequest, user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync)

    try:
        marks_df = pd.read_sql("SELECT * FROM marks", engine)
        attendance_df = pd.read_sql("SELECT * FROM attendance", engine)
        students_df = pd.read_sql("SELECT * FROM students", engine)

        pipeline = TrainingPipeline()
        features = pipeline.build_features(marks_df, attendance_df, students_df)

        if features.empty:
            raise HTTPException(400, "Could not build features. Ensure student data exists.")

        sid_features = features[features["student_id"] == req.student_id]
        if sid_features.empty:
            raise HTTPException(404, f"Student {req.student_id} not found or insufficient data")

        predictor = PerformancePredictor()
        result = predictor.predict_with_confidence(sid_features)[0]

        return PredictionResponse(
            student_id=req.student_id,
            prediction_type="performance",
            predicted_value=result["predicted_marks"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            explanation=f"Predicted average marks: {result['predicted_marks']:.1f}. "
                        f"Confidence: {result['confidence']:.1%}. Risk level: {result['risk_level']}.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Prediction failed: {str(e)}")


@router.post("/batch", response_model=BatchPredictionResponse)
async def batch_predict(req: BatchPredictionRequest, user=Depends(verify_token)):
    task = batch_predict_task.delay(req.student_ids, "performance")
    return BatchPredictionResponse(
        predictions=[],
        total_count=len(req.student_ids),
    )


@router.post("/at-risk", response_model=list[dict])
async def at_risk_students(threshold: float = 0.5, user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync)

    try:
        marks_df = pd.read_sql("SELECT * FROM marks", engine)
        attendance_df = pd.read_sql("SELECT * FROM attendance", engine)
        students_df = pd.read_sql("SELECT * FROM students", engine)

        pipeline = TrainingPipeline()
        features = pipeline.build_features(marks_df, attendance_df, students_df)

        if features.empty:
            return []

        classifier = RiskClassifier()
        results = classifier.predict_with_details(features)
        filtered = [r for r in results if r["risk_score"] >= threshold]
        return filtered

    except Exception as e:
        raise HTTPException(500, f"Risk analysis failed: {str(e)}")
