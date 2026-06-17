import pandas as pd
from sqlalchemy import create_engine, text
from app.config import settings


class DatabaseSync:
    def __init__(self):
        self.engine = create_engine(settings.database_url_sync)

    def get_students(self) -> pd.DataFrame:
        return pd.read_sql("SELECT * FROM students WHERE is_active = true", self.engine)

    def get_courses(self) -> pd.DataFrame:
        return pd.read_sql("SELECT * FROM courses", self.engine)

    def get_marks(self, term_id: int = None) -> pd.DataFrame:
        if term_id:
            return pd.read_sql(f"SELECT * FROM marks WHERE term_id = {term_id}", self.engine)
        return pd.read_sql("SELECT * FROM marks", self.engine)

    def get_attendance(self, course_id: int = None) -> pd.DataFrame:
        if course_id:
            return pd.read_sql(f"SELECT * FROM attendance WHERE course_id = {course_id}", self.engine)
        return pd.read_sql("SELECT * FROM attendance", self.engine)

    def get_classes(self) -> pd.DataFrame:
        return pd.read_sql("SELECT * FROM classes", self.engine)

    def get_active_term(self) -> dict:
        with self.engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM academic_terms WHERE is_active = true LIMIT 1")
            )
            row = result.fetchone()
            if row:
                return dict(row._mapping)
        return {}

    def get_dataset_hash(self) -> str:
        import hashlib
        checksums = []
        for table in ["marks", "attendance", "students"]:
            try:
                df = pd.read_sql(f"SELECT COUNT(*), MAX(created_at) FROM {table}", self.engine)
                checksums.append(str(df.values))
            except Exception:
                checksums.append("empty")
        return hashlib.sha256("|".join(checksums).encode()).hexdigest()[:16]
