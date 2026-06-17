from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base


class FeedbackLog(Base):
    __tablename__ = "ai_feedback_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    query_text = Column(Text, nullable=False)
    intent = Column(String(50))
    predicted_answer = Column(Text)
    corrected_answer = Column(Text)
    rating = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
