import numpy as np
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from typing import Optional


class Evaluator:
    @staticmethod
    def regression_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
        return {
            "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
            "mae": float(mean_absolute_error(y_true, y_pred)),
            "r2": float(r2_score(y_true, y_pred)),
            "mape": float(np.mean(np.abs((y_true - y_pred) / (y_true + 1e-8))) * 100),
        }

    @staticmethod
    def classification_metrics(
        y_true: np.ndarray, y_pred: np.ndarray,
        y_prob: Optional[np.ndarray] = None, average: str = "binary"
    ) -> dict:
        metrics = {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, average=average, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, average=average, zero_division=0)),
            "f1": float(f1_score(y_true, y_pred, average=average, zero_division=0)),
        }
        if y_prob is not None:
            try:
                metrics["roc_auc"] = float(roc_auc_score(y_true, y_prob))
            except Exception:
                metrics["roc_auc"] = 0.0
        return metrics

    @staticmethod
    def compare_with_champion(champion_metrics: dict, challenger_metrics: dict, metric: str = "rmse") -> bool:
        if not champion_metrics:
            return True
        if metric not in champion_metrics or metric not in challenger_metrics:
            return False
        if metric in ("rmse", "mae", "mape"):
            return challenger_metrics[metric] < champion_metrics[metric]
        return challenger_metrics[metric] > champion_metrics[metric]
