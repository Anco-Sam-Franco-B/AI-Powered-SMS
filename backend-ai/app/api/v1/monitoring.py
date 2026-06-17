import numpy as np
import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy import create_engine, text
from app.core.security import verify_token
from app.ml.drift_detector import DriftDetector
from app.ml.registry import model_registry
from app.config import settings

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get("/drift")
async def check_drift(user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync)
    detector = DriftDetector()

    try:
        marks_df = pd.read_sql("SELECT marks FROM marks", engine)
        attendance_df = pd.read_sql("SELECT status FROM attendance", engine)

        drift_results = {}

        if not marks_df.empty:
            drift_results["marks"] = detector.ks_test(marks_df["marks"].values, marks_df["marks"].values)

        if not attendance_df.empty:
            att_numeric = (attendance_df["status"] == "present").astype(int).values
            drift_results["attendance"] = detector.ks_test(att_numeric, att_numeric)

        champion = model_registry.get_champion("performance_predictor")
        champion_info = {
            "model_name": champion.get("model_name"),
            "version": champion.get("version"),
            "metrics": champion.get("metrics"),
        } if champion else {"message": "No champion model"}

        return {
            "drift_detected": any(r.get("drifted", False) for r in drift_results.values()),
            "results": drift_results,
            "champion_model": champion_info,
            "registered_models": len(model_registry.list_models()),
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/health")
async def health_check():
    try:
        engine = create_engine(settings.database_url_sync)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False

    try:
        import redis
        r = redis.from_url(settings.redis_url)
        r.ping()
        redis_healthy = True
    except Exception:
        redis_healthy = False

    models_count = len(model_registry.list_models())

    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "healthy" if db_healthy else "unhealthy",
        "redis": "healthy" if redis_healthy else "unhealthy",
        "registered_models": models_count,
        "version": settings.app_version,
    }
