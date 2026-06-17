import json
from typing import Optional, Any
from app.config import settings


INTENT_TEMPLATES = {
    "query_student_performance": "Here is the performance data for the student.",
    "query_attendance": "Here is the attendance information.",
    "query_class_average": "The class average is {average}.",
    "compare_students": "Here is the comparison between students.",
    "trend_analysis": "Based on the trend analysis: {summary}.",
    "find_at_risk": "Found {count} student(s) that may need attention.",
    "generate_report": "Report generated successfully.",
    "query_course_info": "Here is the course information.",
    "query_schedule": "Schedule information.",
    "general_help": "I can help you with: student performance, attendance, class averages, comparing students, trend analysis, finding at-risk students, generating reports, and course information. Try asking like: 'How is student 101 performing?' or 'What is the attendance of class A?'",
}


class ResponseGenerator:
    def __init__(self):
        self._llm_available = None

    @property
    def llm_available(self):
        if self._llm_available is None:
            self._check_ollama()
        return self._llm_available

    def _check_ollama(self):
        try:
            import httpx
            r = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=3)
            self._llm_available = r.status_code == 200
        except Exception:
            self._llm_available = False

    def generate(self, intent: str, data: Optional[Any] = None, query: str = "") -> str:
        template = INTENT_TEMPLATES.get(intent, "I'm not sure how to answer that.")

        if intent == "general_help":
            return template

        if data is not None:
            if isinstance(data, list):
                if len(data) == 0:
                    return "No data found matching your query."
                if intent == "find_at_risk":
                    return template.format(count=len(data)) + f" {json.dumps(data[:5], default=str)}"
                return template + f" Found {len(data)} result(s)."

            if isinstance(data, dict):
                avg = data.get("average", data.get("avg", None))
                if avg is not None:
                    return template.format(average=round(float(avg), 2))

        return template

    def generate_with_llm(self, query: str, context: str, data: Optional[Any] = None) -> str:
        if not self.llm_available:
            return self.generate("general_help") + f"\n\nNote: Local LLM is not running. Install Ollama (ollama run llama3.2) for enhanced responses."

        try:
            import httpx
            prompt = f"""You are a helpful teacher's assistant for a student management system. Answer the teacher's question based on the context provided.

Context:
{context}

Data:
{json.dumps(data, default=str) if data else 'No specific data'}

Teacher's question: {query}

Provide a clear, concise, and helpful response. Focus on actionable insights."""
            r = httpx.post(
                f"{settings.ollama_base_url}/api/generate",
                json={"model": settings.llm_model, "prompt": prompt, "stream": False},
                timeout=30,
            )
            if r.status_code == 200:
                return r.json().get("response", self.generate("general_help"))
        except Exception:
            pass

        return self.generate("general_help")
