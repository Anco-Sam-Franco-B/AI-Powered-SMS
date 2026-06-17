from sqlalchemy import Column, Integer, String, DateTime, JSON, func
from app.core.database import Base


class TrainingJob(Base):
    __tablename__ = "ai_training_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_type = Column(String(50), nullable=False)
    status = Column(String(20), default="pending")
    triggered_by = Column(String(50))
    dataset_info = Column(JSON)
    metrics = Column(JSON)
    error_message = Column(String(500))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
