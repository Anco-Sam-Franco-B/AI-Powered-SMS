import pandas as pd


def extract_attendance_features(attendance_data: pd.DataFrame) -> pd.DataFrame:
    if attendance_data.empty:
        return pd.DataFrame()

    grouped = attendance_data.groupby(["student_id", "course_id"])

    records = []
    for (sid, cid), group in grouped:
        total = len(group)
        present = (group["status"] == "present").sum()
        absent = (group["status"] == "absent").sum()
        late = (group["status"] == "late").sum()

        if total > 0:
            avg_attendance = group.groupby(group["class_date"].dt.date if hasattr(group["class_date"], "dt") else group["class_date"]).size().mean()
        else:
            avg_attendance = 0

        records.append({
            "student_id": sid,
            "course_id": cid,
            "att_total": total,
            "att_present_ratio": present / total if total > 0 else 0,
            "att_absent_ratio": absent / total if total > 0 else 0,
            "att_late_ratio": late / total if total > 0 else 0,
            "att_avg_daily": avg_attendance,
        })

    df = pd.DataFrame(records)
    return df


def compute_attendance_rate(attendance_data: pd.DataFrame) -> float:
    if attendance_data.empty:
        return 0.0
    present = (attendance_data["status"] == "present").sum()
    total = len(attendance_data)
    return present / total if total > 0 else 0.0
