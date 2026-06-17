from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, func
from app.core.database import Base


class ModelRegistry(Base):
    __tablename__ = "ai_model_registry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(100), nullable=False)
    model_version = Column(Integer, nullable=False)
    model_type = Column(String(50), nullable=False)
    artifact_path = Column(String(500))
    metrics = Column(JSON)
    params = Column(JSON)
    status = Column(String(20), default="challenger")
    training_dataset_hash = Column(String(64))
    trained_at = Column(DateTime(timezone=True), server_default=func.now())
