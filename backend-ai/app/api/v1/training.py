from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_token
from app.tasks.train_model import train_model_task, retrain_trigger_task
from app.schemas.training import TriggerTrainingRequest, TrainingStatusResponse
from app.models.training_job import TrainingJob
from app.core.database import SessionLocal
from app.ml.registry import model_registry
from sqlalchemy import select

router = APIRouter(prefix="/training", tags=["Training"])


@router.post("/trigger")
def trigger_training(req: TriggerTrainingRequest, user=Depends(verify_token)):
    task = retrain_trigger_task.delay(model_type=req.model_type)
    return {"status": "triggered", "task_id": task.id, "model_type": req.model_type}


@router.get("/status")
def training_status(user=Depends(verify_token)):
    with SessionLocal() as session:
        result = session.execute(
            select(TrainingJob).order_by(TrainingJob.created_at.desc()).limit(10)
        )
        jobs = result.scalars().all()

    return [
        TrainingStatusResponse(
            job_id=j.id,
            model_type=j.model_type,
            status=j.status,
            metrics=j.metrics,
            error_message=j.error_message,
            started_at=str(j.started_at) if j.started_at else None,
            completed_at=str(j.completed_at) if j.completed_at else None,
        )
        for j in jobs
    ]


@router.get("/models")
def list_models(user=Depends(verify_token)):
    models = model_registry.list_models()
    return {"models": models}


@router.get("/models/champion")
def champion_model(user=Depends(verify_token)):
    all_models = model_registry.list_models()
    champions = [m for m in all_models if m.get("status") == "champion"]
    return {"champions": champions}
