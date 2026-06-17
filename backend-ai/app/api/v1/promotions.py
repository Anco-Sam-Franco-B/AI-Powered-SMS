import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool
from app.core.security import verify_token
from app.ml.pipeline import TrainingPipeline
from app.ml.models.promotion_recommender import PromotionRecommender
from app.config import settings
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/promotions", tags=["Promotions"])


class PromotionRequest(BaseModel):
    student_id: int


class PromotionResponse(BaseModel):
    student_id: int
    recommendation: str
    confidence: float
    risk_level: str
    explanation: str


class BatchPromotionResponse(BaseModel):
    recommendations: list[PromotionResponse]
    total_count: int
    promote_count: int
    retain_count: int
    probation_count: int


@router.post("/recommend", response_model=PromotionResponse)
async def recommend_promotion(req: PromotionRequest, user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync, poolclass=NullPool)

    try:
        with engine.connect() as conn:
            marks_df = pd.read_sql("SELECT * FROM marks", conn)
            attendance_df = pd.read_sql("SELECT * FROM attendance", conn)
            students_df = pd.read_sql("SELECT * FROM students", conn)

        pipeline = TrainingPipeline()
        features = pipeline.build_features(marks_df, attendance_df, students_df)

        if features.empty:
            raise HTTPException(400, "Could not build features")

        sid_features = features[features["student_id"] == req.student_id]
        if sid_features.empty:
            raise HTTPException(404, f"Student {req.student_id} not found")

        recommender = PromotionRecommender()
        results = recommender.predict_with_details(sid_features, [req.student_id])
        result = results[0]

        avg_marks = sid_features["acad_avg_marks"].values[0] if "acad_avg_marks" in sid_features.columns else 0

        return PromotionResponse(
            student_id=req.student_id,
            recommendation=result["recommendation"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            explanation=f"Based on academic performance (avg: {avg_marks:.1f}), "
                        f"the recommended decision is '{result['recommendation']}' "
                        f"with {result['confidence']:.1%} confidence.",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Promotion recommendation failed: {str(e)}")


@router.post("/recommend-batch", response_model=BatchPromotionResponse)
async def batch_promotion_recommend(user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync, poolclass=NullPool)

    try:
        with engine.connect() as conn:
            marks_df = pd.read_sql("SELECT * FROM marks", conn)
            attendance_df = pd.read_sql("SELECT * FROM attendance", conn)
            students_df = pd.read_sql("SELECT * FROM students", conn)

        pipeline = TrainingPipeline()
        features = pipeline.build_features(marks_df, attendance_df, students_df)

        if features.empty:
            raise HTTPException(400, "Could not build features for any student")

        recommender = PromotionRecommender()
        results = recommender.predict_with_details(features)

        promote = sum(1 for r in results if r["recommendation"] == "promote")
        retain = sum(1 for r in results if r["recommendation"] == "retain")
        probation = sum(1 for r in results if r["recommendation"] == "probation")

        responses = []
        for r, (_, row) in zip(results, features.iterrows()):
            avg_marks = row.get("acad_avg_marks", "N/A")
            responses.append(PromotionResponse(
                student_id=r["student_id"],
                recommendation=r["recommendation"],
                confidence=r["confidence"],
                risk_level=r["risk_level"],
                explanation=f"Avg marks: {avg_marks:.1f}. Decision: {r['recommendation']}.",
            ))

        return BatchPromotionResponse(
            recommendations=responses,
            total_count=len(responses),
            promote_count=promote,
            retain_count=retain,
            probation_count=probation,
        )
    except Exception as e:
        raise HTTPException(500, f"Batch promotion failed: {str(e)}")
