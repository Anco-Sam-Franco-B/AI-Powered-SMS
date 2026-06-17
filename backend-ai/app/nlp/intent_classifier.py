import re
from typing import Tuple


INTENTS = [
    "query_student_performance",
    "query_attendance",
    "query_class_average",
    "compare_students",
    "trend_analysis",
    "find_at_risk",
    "generate_report",
    "query_course_info",
    "query_schedule",
    "general_help",
]

INTENT_PATTERNS = {
    "query_student_performance": [
        r"how (is|was) .* (performing|doing|scoring)",
        r"(show|get|find|what (is|are)) .* (marks?|grade|score|result)s?",
        r"performance of (student|learner|pupil)",
        r"(marks?|grade|score|result) of (student|learner|pupil)",
    ],
    "query_attendance": [
        r"(attendance|present|absent) (rate|record|report|percentage)",
        r"how many (days|times) (was|has) .* (present|absent)",
        r"attendance of (student|learner|pupil|class)",
    ],
    "query_class_average": [
        r"(average|mean|avg) (marks?|score|grade|performance) of (class|course|subject)",
        r"class (average|mean|avg)",
        r"how (is|was) the class (doing|performing)",
    ],
    "compare_students": [
        r"compare (student|learner|pupil)s?",
        r"who (is|has) the (best|highest|top|lowest)",
        r"rank (student|learner|pupil)s?",
        r"(better|worse) than",
    ],
    "trend_analysis": [
        r"trend",
        r"(improvement|decline|progress|change) over (time|term|year|semester)",
        r"how (has|have) .* (changed|improved|declined)",
    ],
    "find_at_risk": [
        r"(at.?risk|struggling|falling behind|failing)",
        r"who (needs|require) (help|support|intervention)",
        r"(students?|learners?) at risk",
    ],
    "generate_report": [
        r"generate (report|summary|overview)",
        r"(create|make|build) (report|summary)",
        r"report (card|sheet) for",
    ],
    "query_course_info": [
        r"(tell|show|what) .* (course|subject|trade|class)",
        r"course (information|details|description)",
    ],
    "query_schedule": [
        r"(schedule|timetable|when) (is|does|will)",
        r"(class|lesson|course) (time|schedule|timetable)",
    ],
}


class IntentClassifier:
    def __init__(self):
        self.compiled = {}
        for intent, patterns in INTENT_PATTERNS.items():
            self.compiled[intent] = [re.compile(p, re.IGNORECASE) for p in patterns]

    def classify(self, query: str) -> Tuple[str, float]:
        query = query.strip()
        best_intent = "general_help"
        best_score = 0.0

        for intent, patterns in self.compiled.items():
            for pattern in patterns:
                match = pattern.search(query)
                if match:
                    score = len(match.group()) / len(query)
                    if score > best_score:
                        best_score = score
                        best_intent = intent

        if best_score < 0.1:
            return "general_help", 0.0

        return best_intent, round(best_score, 4)
