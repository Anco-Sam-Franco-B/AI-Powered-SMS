import pandas as pd
from sqlalchemy import create_engine
from app.config import settings
from app.tasks.celery_app import celery_app
from app.tasks.train_model import DatabaseTask


@celery_app.task(base=DatabaseTask, bind=True)
def generate_report_task(self, report_type: str, params: dict = None):
    engine = self.engine

    if report_type == "class_performance":
        if params and params.get("class_id"):
            query = f"""
                SELECT s.student_id, s.first_name, s.last_name,
                       c.course_name, m.marks, m.grade, t.term_name
                FROM marks m
                JOIN students s ON m.student_id = s.id
                JOIN courses c ON m.course_id = c.id
                JOIN academic_terms t ON m.term_id = t.id
                WHERE s.class_id = {params['class_id']}
                ORDER BY s.student_id, t.term_name
            """
        else:
            query = """
                SELECT s.student_id, s.first_name, s.last_name,
                       c.course_name, m.marks, m.grade, t.term_name
                FROM marks m
                JOIN students s ON m.student_id = s.id
                JOIN courses c ON m.course_id = c.id
                JOIN academic_terms t ON m.term_id = t.id
                ORDER BY s.student_id, t.term_name
            """
        df = pd.read_sql(query, engine)
        report_data = df.to_dict(orient="records")
        stats = {
            "total_students": df["student_id"].nunique(),
            "average_marks": round(float(df["marks"].mean()), 2),
            "highest_marks": float(df["marks"].max()),
            "lowest_marks": float(df["marks"].min()),
        }
        return {"status": "success", "data": report_data, "stats": stats}

    elif report_type == "attendance_summary":
        query = """
            SELECT s.student_id, s.first_name, s.last_name,
                   c.course_name,
                   COUNT(*) as total_classes,
                   SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
                   ROUND(100.0 * SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*), 1) as attendance_rate
            FROM attendance a
            JOIN students s ON a.student_id = s.id
            JOIN courses c ON a.course_id = c.id
            GROUP BY s.student_id, s.first_name, s.last_name, c.course_name
            ORDER BY attendance_rate ASC
        """
        df = pd.read_sql(query, engine)
        return {"status": "success", "data": df.to_dict(orient="records")}

    return {"status": "failed", "error": f"Unknown report type: {report_type}"}
