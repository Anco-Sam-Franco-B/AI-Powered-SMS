from pydantic import BaseModel
from typing import Optional


class ChatQuery(BaseModel):
    query: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    answer: str
    intent: str
    confidence: float
    data: Optional[list | dict] = None
    sources: Optional[list[str]] = None


class FeedbackRequest(BaseModel):
    query_text: str
    predicted_answer: str
    corrected_answer: Optional[str] = None
    rating: int
    intent: Optional[str] = None
