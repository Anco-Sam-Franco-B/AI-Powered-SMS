import numpy as np
import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.metrics import mean_absolute_error
from app.ml.registry import model_registry
import json


class AttendanceForecaster:
    def __init__(self):
        self.model_name = "attendance_forecaster"
        self.version = 0
        self.model_data = None

    def train(self, time_series: pd.Series, periods: int = 4) -> dict:
        ts = time_series.asfreq("W").fillna(method="ffill")
        if len(ts) < 4:
            return {"error": "Not enough data points for forecasting (need at least 4 weeks)"}

        train_size = max(len(ts) - periods, 2)
        train, test = ts[:train_size], ts[train_size:]

        try:
            model = ExponentialSmoothing(train, seasonal_periods=min(4, len(train) // 2), trend="add", seasonal="add")
            fitted = model.fit()
            forecast = fitted.forecast(periods)
        except Exception:
            model = ExponentialSmoothing(train, trend="add")
            fitted = model.fit()
            forecast = fitted.forecast(periods)

        if len(test) > 0:
            mae = float(mean_absolute_error(test, forecast[:len(test)]))
        else:
            mae = 0.0

        self.model_data = {
            "train_values": train.tolist() if hasattr(train, "tolist") else list(train),
            "last_seasonal": fitted.season if hasattr(fitted, "season") else None,
        }

        self.version = model_registry.latest_version(self.model_name) + 1
        model_registry.save_model(
            self.model_data, self.model_name, self.version,
            {"mae": mae, "train_points": len(train)},
            {"periods": periods}
        )

        return {"mae": mae, "train_points": len(train)}

    def forecast(self, steps: int = 4) -> list[dict]:
        if self.model_data is None:
            loaded = model_registry.load_model(self.model_name)
            self.model_data = loaded

        train = pd.Series(self.model_data["train_values"])
        try:
            model = ExponentialSmoothing(train, seasonal_periods=min(4, len(train) // 2), trend="add", seasonal="add")
            fitted = model.fit()
            forecast = fitted.forecast(steps)
        except Exception:
            model = ExponentialSmoothing(train, trend="add")
            fitted = model.fit()
            forecast = fitted.forecast(steps)

        results = []
        for i, v in enumerate(forecast):
            results.append({"week": i + 1, "forecasted_rate": round(float(v), 2)})
        return results
