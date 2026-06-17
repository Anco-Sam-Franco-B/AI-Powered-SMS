from app.tasks.celery_app import celery_app
from app.tasks.train_model import train_model_task, batch_predict_task, retrain_trigger_task
