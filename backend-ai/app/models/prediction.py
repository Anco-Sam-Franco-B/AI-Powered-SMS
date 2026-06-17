from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, func
from app.core.database import Base


class Prediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, nullable=False)
    model_id = Column(Integer, ForeignKey("ai_model_registry.id"))
    prediction_type = Column(String(50), nullable=False)
    prediction_value = Column(JSON, nullable=False)
    confidence = Column(Float)
    features_hash = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
