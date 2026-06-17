import joblib
import json
import os
import hashlib
import glob as glob_mod
from pathlib import Path
from typing import Optional
from app.config import settings


class ModelRegistry:
    def __init__(self):
        self.storage_path = Path(settings.model_storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def _model_path(self, model_name: str, version: int) -> Path:
        return self.storage_path / f"{model_name}_v{version}.joblib"

    def _meta_path(self, model_name: str, version: int) -> Path:
        return self.storage_path / f"{model_name}_v{version}.json"

    def save_model(self, model, model_name: str, version: int, metrics: dict = None, params: dict = None):
        path = self._model_path(model_name, version)
        joblib.dump(model, path)

        meta = {
            "model_name": model_name,
            "version": version,
            "metrics": metrics or {},
            "params": params or {},
        }
        meta_path = self._meta_path(model_name, version)
        with open(meta_path, "w") as f:
            json.dump(meta, f, indent=2, default=str)

        return str(path)

    def load_model(self, model_name: str, version: Optional[int] = None):
        if version is None:
            version = self.latest_version(model_name)
        path = self._model_path(model_name, version)
        if not path.exists():
            raise FileNotFoundError(f"Model {model_name} v{version} not found")
        return joblib.load(path)

    def latest_version(self, model_name: str) -> int:
        pattern = str(self.storage_path / f"{model_name}_v*.joblib")
        files = glob_mod.glob(pattern)
        if not files:
            return 0
        versions = [int(f.split("_v")[-1].split(".")[0]) for f in files]
        return max(versions)

    def list_models(self) -> list[dict]:
        models = []
        for meta_file in self.storage_path.glob("*_v*.json"):
            with open(meta_file) as f:
                models.append(json.load(f))
        return sorted(models, key=lambda x: x.get("version", 0), reverse=True)

    def get_champion(self, model_name: str) -> Optional[dict]:
        models = [m for m in self.list_models() if m["model_name"] == model_name and m.get("status") == "champion"]
        return models[0] if models else None

    def dataset_hash(self, data) -> str:
        raw = str(data.values.tobytes() if hasattr(data, "values") else str(data))
        return hashlib.sha256(raw.encode()).hexdigest()[:16]


model_registry = ModelRegistry()
