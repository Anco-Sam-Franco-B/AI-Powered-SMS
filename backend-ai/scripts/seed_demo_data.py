import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from app.config import settings
from datetime import datetime, timedelta
import random


def seed_demo_data():
    engine = create_engine(settings.database_url_sync)

    with engine.connect() as conn:
        conn.execute(text("DELETE FROM marks"))
        conn.execute(text("DELETE FROM attendance"))
        conn.execute(text("DELETE FROM students"))
        conn.execute(text("DELETE FROM courses"))
        conn.execute(text("DELETE FROM classes"))
        conn.commit()

    # Classes
    classes = pd.DataFrame([
        {"class_name": "Class A", "academic_year_id": 1},
        {"class_name": "Class B", "academic_year_id": 1},
    ])
    classes.to_sql("classes", engine, if_exists="append", index=False)

    # Students
    students = []
    first_names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack",
                   "Kate", "Liam", "Mia", "Noah", "Olivia", "Peter", "Quinn", "Rose", "Sam", "Tina"]
    for i, name in enumerate(first_names):
        students.append({
            "student_id": f"STU{1000 + i}",
            "first_name": name,
            "last_name": "Student",
            "email": f"{name.lower()}@school.com",
            "age": random.randint(15, 20),
            "class_id": (i % 2) + 1,
            "enrollment_date": datetime.now() - timedelta(days=random.randint(100, 500)),
            "is_active": True,
        })
    students_df = pd.DataFrame(students)
    students_df.to_sql("students", engine, if_exists="append", index=False)

    # Courses
    courses = pd.DataFrame([
        {"course_code": "MATH101", "course_name": "Mathematics", "instructor": "Dr. Smith", "credits": 4, "department": "Science"},
        {"course_code": "ENG101", "course_name": "English", "instructor": "Ms. Jones", "credits": 3, "department": "Languages"},
        {"course_code": "SCI101", "course_name": "General Science", "instructor": "Dr. Adams", "credits": 4, "department": "Science"},
        {"course_code": "HIST101", "course_name": "History", "instructor": "Mr. Brown", "credits": 3, "department": "Social Studies"},
        {"course_code": "COMP101", "course_name": "Computer Studies", "instructor": "Mr. Taylor", "credits": 4, "department": "Technology"},
    ])
    courses.to_sql("courses", engine, if_exists="append", index=False)

    # Marks
    marks = []
    for sid in students_df["id"].tolist():
        for cid in courses["id"].tolist():
            for term_id in [1, 2]:
                marks.append({
                    "student_id": sid,
                    "course_id": cid,
                    "term_id": term_id,
                    "marks": round(np.random.normal(65, 15), 2),
                    "grade": np.random.choice(["A", "B", "C", "D", "F"], p=[0.2, 0.3, 0.3, 0.1, 0.1]),
                })
    marks_df = pd.DataFrame(marks)
    marks_df.to_sql("marks", engine, if_exists="append", index=False)

    # Attendance
    attendance = []
    for sid in students_df["id"].tolist():
        for cid in courses["id"].tolist():
            for day in range(1, 31):
                date = datetime.now() - timedelta(days=day)
                status = np.random.choice(["present", "present", "present", "absent", "late"], p=[0.6, 0.15, 0.1, 0.1, 0.05])
                attendance.append({
                    "student_id": sid,
                    "course_id": cid,
                    "class_date": date.date(),
                    "status": status,
                    "recorded_by": 1,
                })
    attendance_df = pd.DataFrame(attendance)
    attendance_df.to_sql("attendance", engine, if_exists="append", index=False)

    print("Demo data seeded successfully!")
    print(f"  - {len(students_df)} students")
    print(f"  - {len(courses)} courses")
    print(f"  - {len(marks_df)} marks records")
    print(f"  - {len(attendance_df)} attendance records")


if __name__ == "__main__":
    seed_demo_data()
