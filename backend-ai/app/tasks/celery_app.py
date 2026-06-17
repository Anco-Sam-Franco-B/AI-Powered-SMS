from celery import Celery
from app.config import settings

celery_app = Celery(
    "student_ai",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_always_eager=True,
    task_eager_propagates=True,
    beat_schedule={
        "weekly-retrain": {
            "task": "app.tasks.train_model.retrain_trigger_task",
            "schedule": 7 * 24 * 3600,
            "kwargs": {"model_type": "all"},
        },
        "daily-drift-check": {
            "task": "app.tasks.train_model.retrain_trigger_task",
            "schedule": 24 * 3600,
            "kwargs": {"model_type": "drift_check"},
        },
    },
)
