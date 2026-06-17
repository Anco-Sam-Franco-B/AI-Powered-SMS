import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import create_engine, text
from app.core.security import verify_token
from app.ml.pipeline import TrainingPipeline
from app.ml.models.attendance_forecaster import AttendanceForecaster
from app.ml.models.risk_classifier import RiskClassifier
from app.schemas.analytics import (
    AttendanceAnalyticsRequest, AttendanceAnalyticsResponse, AtRiskStudent,
)
from app.config import settings
import numpy as np

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/attendance")
async def attendance_analytics(req: AttendanceAnalyticsRequest, user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync)

    try:
        if req.course_id:
            attendance_df = pd.read_sql(
                f"SELECT * FROM attendance WHERE course_id = {req.course_id}", engine
            )
        else:
            attendance_df = pd.read_sql("SELECT * FROM attendance", engine)

        if attendance_df.empty:
            return {
                "course_id": req.course_id or 0,
                "current_rate": 0,
                "forecasted_rates": [],
                "trend": "no_data",
                "at_risk_students": [],
                "total_students": 0,
            }

        total = len(attendance_df)
        present = (attendance_df["status"] == "present").sum()
        current_rate = round(present / total * 100, 1) if total > 0 else 0

        forecaster = AttendanceForecaster()
        try:
            forecast = forecaster.forecast(steps=req.weeks_forecast)
            forecast_rates = [{"week": i + 1, "forecasted_rate": round(100 * f["forecasted_rate"], 1)}
                              for i, f in enumerate(forecast)]
        except Exception:
            forecast_rates = []

        trend = "improving" if forecast_rates and forecast_rates[-1]["forecasted_rate"] > current_rate else "declining"

        at_risk = attendance_df.groupby("student_id").apply(
            lambda x: (x["status"] == "absent").sum() / len(x)
        ).reset_index(name="absence_rate")
        at_risk = at_risk[at_risk["absence_rate"] > 0.25]
        at_risk_students = [
            {"student_id": int(r["student_id"]), "absence_rate": round(float(r["absence_rate"]) * 100, 1)}
            for _, r in at_risk.iterrows()
        ]

        return {
            "course_id": req.course_id or 0,
            "current_rate": current_rate,
            "forecasted_rates": forecast_rates,
            "trend": trend,
            "at_risk_students": at_risk_students,
            "total_students": int(attendance_df["student_id"].nunique()),
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(500, f"Attendance analysis failed: {str(e)}\n{traceback.format_exc()}")


@router.get("/at-risk-students", response_model=list[AtRiskStudent])
async def list_at_risk_students(threshold: float = Query(0.5, ge=0, le=1),
                                  user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync)

    try:
        marks_df = pd.read_sql("SELECT * FROM marks", engine)
        attendance_df = pd.read_sql("SELECT * FROM attendance", engine)
        students_df = pd.read_sql("SELECT * FROM students", engine)

        pipeline = TrainingPipeline()
        features = pipeline.build_features(marks_df, attendance_df, students_df)

        if features.empty:
            return []

        classifier = RiskClassifier()
        results = classifier.predict_with_details(features)

        student_map = {}
        for _, s in students_df.iterrows():
            student_map[s["id"]] = f"{s['first_name']} {s['last_name']}"

        at_risk = []
        for r in results:
            if r["risk_score"] >= threshold:
                factors = []
                sid_feat = features[features["student_id"] == r["student_id"]]
                if not sid_feat.empty:
                    if "att_present_ratio" in sid_feat.columns and sid_feat["att_present_ratio"].values[0] < 0.75:
                        factors.append("Low attendance")
                    if "acad_avg_marks" in sid_feat.columns and sid_feat["acad_avg_marks"].values[0] < 50:
                        factors.append("Low average marks")
                    if "acad_fail_count" in sid_feat.columns and sid_feat["acad_fail_count"].values[0] > 1:
                        factors.append("Multiple failed courses")

                action = "Schedule teacher consultation" if r["risk_level"] == "high" else "Monitor and provide support"

                at_risk.append(AtRiskStudent(
                    student_id=r["student_id"],
                    student_name=student_map.get(r["student_id"], f"Student #{r['student_id']}"),
                    risk_score=r["risk_score"],
                    risk_factors=factors or ["Risk score indicates attention needed"],
                    recommended_action=action,
                ))

        return at_risk

    except Exception as e:
        import traceback
        raise HTTPException(500, f"Failed to identify at-risk students: {str(e)}\n{traceback.format_exc()}")


@router.get("/class-summary/{class_id}")
async def class_summary(class_id: int, user=Depends(verify_token)):
    engine = create_engine(settings.database_url_sync)

    try:
        query = f"""
            SELECT s.student_id, s.first_name, s.last_name,
                   AVG(m.marks) as avg_marks,
                   COUNT(DISTINCT m.course_id) as course_count
            FROM students s
            JOIN marks m ON s.id = m.student_id
            WHERE s.class_id = {class_id}
            GROUP BY s.student_id, s.first_name, s.last_name
        """
        df = pd.read_sql(query, engine)

        if df.empty:
            return {"class_id": class_id, "message": "No data for this class"}

        return {
            "class_id": class_id,
            "total_students": len(df),
            "class_average": round(float(df["avg_marks"].mean()), 2),
            "highest_scorer": df.loc[df["avg_marks"].idxmax(), ["first_name", "last_name", "avg_marks"]].to_dict(),
            "students_above_75": int((df["avg_marks"] >= 75).sum()),
            "students_below_50": int((df["avg_marks"] < 50).sum()),
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to get class summary: {str(e)}")
