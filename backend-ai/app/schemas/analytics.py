from pydantic import BaseModel
from typing import Optional


class AttendanceAnalyticsRequest(BaseModel):
    course_id: Optional[int] = None
    term_id: Optional[int] = None
    weeks_forecast: int = 4


class AttendanceAnalyticsResponse(BaseModel):
    course_id: int
    current_rate: float
    forecasted_rates: list[dict]
    trend: str
    at_risk_students: list[dict]
    total_students: int


class AtRiskStudent(BaseModel):
    student_id: int
    student_name: str
    risk_score: float
    risk_factors: list[str]
    recommended_action: str
