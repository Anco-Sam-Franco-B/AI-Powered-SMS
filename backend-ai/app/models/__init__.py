from app.models.model_registry import ModelRegistry
from app.models.prediction import Prediction
from app.models.feedback import FeedbackLog
from app.models.training_job import TrainingJob

all_models = [ModelRegistry, Prediction, FeedbackLog, TrainingJob]
