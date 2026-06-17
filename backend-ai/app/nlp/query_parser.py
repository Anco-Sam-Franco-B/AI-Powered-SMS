import re
from typing import Optional


class QueryParser:
    def extract_entities(self, query: str) -> dict:
        entities = {
            "student_name": None,
            "student_id": None,
            "course_name": None,
            "course_id": None,
            "class_name": None,
            "term": None,
            "year": None,
            "limit": None,
        }

        student_patterns = [
            r"(?:student|learner|pupil)\s+(?:named|called|with\s+(?:id|name))?\s*['\"]?(\w+\s*\w*)['\"]?",
            r"(?:of|for)\s+(\w+(?:\s+\w+)?)(?:\s+(?:in|from|at))?",
        ]
        for p in student_patterns:
            m = re.search(p, query, re.IGNORECASE)
            if m:
                entities["student_name"] = m.group(1).strip()
                break

        id_pattern = r"(?:id|ID|Id)\s*[:=#]?\s*(\d+)"
        m = re.search(id_pattern, query)
        if m:
            entities["student_id"] = int(m.group(1))

        course_patterns = [
            r"(?:course|subject|trade)\s+(?:named|called|code)?\s*['\"]?(\w+(?:\s*\w+)*)['\"]?",
            r"(?:in|for)\s+(\w+(?:\s+\w+)?)\s+(?:course|subject|trade|class)",
        ]
        for p in course_patterns:
            m = re.search(p, query, re.IGNORECASE)
            if m:
                entities["course_name"] = m.group(1).strip()
                break

        for term_name in ["term 1", "term 2", "term 3", "first term", "second term", "third term"]:
            if term_name in query.lower():
                entities["term"] = term_name
                break

        year_pattern = r"(\d{4}/\d{4})"
        m = re.search(year_pattern, query)
        if m:
            entities["year"] = m.group(1)

        limit_pattern = r"(?:top|first|last)\s*(\d+)\s*(?:students?|learners?|pupils?)"
        m = re.search(limit_pattern, query, re.IGNORECASE)
        if m:
            entities["limit"] = int(m.group(1))

        return entities

    def to_natural_sql(self, intent: str, entities: dict) -> Optional[str]:
        if intent == "query_student_performance":
            if entities.get("student_id"):
                return f"SELECT marks, grade FROM marks WHERE student_id = {entities['student_id']}"
            if entities.get("student_name"):
                return f"SELECT marks, grade FROM marks JOIN students ON marks.student_id = students.id WHERE students.first_name ILIKE '%{entities['student_name']}%'"
        elif intent == "query_attendance":
            if entities.get("student_id"):
                return f"SELECT status, class_date FROM attendance WHERE student_id = {entities['student_id']}"
        elif intent == "query_class_average":
            if entities.get("course_name"):
                return f"SELECT AVG(marks) as average FROM marks JOIN courses ON marks.course_id = courses.id WHERE courses.course_name ILIKE '%{entities['course_name']}%'"
            return "SELECT AVG(marks) as average FROM marks"
        elif intent == "find_at_risk":
            return "SELECT student_id, AVG(marks) as avg_marks FROM marks GROUP BY student_id HAVING AVG(marks) < 50"
        elif intent == "query_course_info":
            if entities.get("course_name"):
                return f"SELECT * FROM courses WHERE course_name ILIKE '%{entities['course_name']}%'"

        return None
