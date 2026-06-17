from app.ml.pipeline import TrainingPipeline
from app.ml.registry import ModelRegistry
from app.ml.evaluation import Evaluator
from app.ml.drift_detector import DriftDetector

pipeline = TrainingPipeline()
evaluator = Evaluator()
drift_detector = DriftDetector()
