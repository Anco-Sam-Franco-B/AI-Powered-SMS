from pydantic import BaseModel
from typing import Optional, Any


class PerformancePredictionRequest(BaseModel):
    student_id: int
    course_id: Optional[int] = None
    term_id: Optional[int] = None


class BatchPredictionRequest(BaseModel):
    student_ids: list[int]
    course_id: Optional[int] = None
    term_id: Optional[int] = None


class PredictionResponse(BaseModel):
    student_id: int
    prediction_type: str
    predicted_value: Any
    confidence: float
    risk_level: str
    explanation: Optional[str] = None


class BatchPredictionResponse(BaseModel):
    predictions: list[PredictionResponse]
    total_count: int
