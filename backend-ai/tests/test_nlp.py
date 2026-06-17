import pytest
from app.nlp.intent_classifier import IntentClassifier
from app.nlp.query_parser import QueryParser


def test_intent_classifier():
    classifier = IntentClassifier()

    tests = [
        ("how is student 101 performing?", "query_student_performance"),
        ("what is the attendance of student 102", "query_attendance"),
        ("class average for mathematics", "query_class_average"),
        ("who are the at-risk students", "find_at_risk"),
        ("compare student 101 and 102", "compare_students"),
        ("help", "general_help"),
    ]

    for query, expected in tests:
        intent, confidence = classifier.classify(query)
        assert intent == expected, f"Expected {expected}, got {intent} for '{query}'"
        assert confidence >= 0


def test_query_parser():
    parser = QueryParser()

    entities = parser.extract_entities("show marks of student 101 in mathematics")
    assert entities is not None

    entities2 = parser.extract_entities("who are the top 10 students")
    assert entities2.get("limit") == 10

    entities3 = parser.extract_entities("attendance for term 1")
    assert entities3.get("term") is not None
