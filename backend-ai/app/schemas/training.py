from pydantic import BaseModel
from typing import Optional


class TriggerTrainingRequest(BaseModel):
    model_type: str
    dataset_id: Optional[str] = None
    force: bool = False


class TrainingStatusResponse(BaseModel):
    job_id: int
    model_type: str
    status: str
    metrics: Optional[dict] = None
    error_message: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
