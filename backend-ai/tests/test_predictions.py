import pytest
import pandas as pd
import numpy as np
from app.ml.models.performance_predictor import PerformancePredictor
from app.ml.models.risk_classifier import RiskClassifier
from app.ml.models.promotion_recommender import PromotionRecommender


def test_performance_predictor():
    predictor = PerformancePredictor()
    n = 50
    features = pd.DataFrame({
        "student_id": range(n),
        "acad_avg_marks": np.random.uniform(30, 95, n),
        "acad_std_marks": np.random.uniform(5, 20, n),
        "acad_max_marks": np.random.uniform(60, 100, n),
        "acad_min_marks": np.random.uniform(20, 50, n),
        "acad_median_marks": np.random.uniform(35, 85, n),
        "acad_total_courses": np.random.randint(3, 8, n),
        "acad_total_terms": np.random.randint(1, 3, n),
        "acad_marks_trend": np.random.uniform(-5, 5, n),
        "acad_above_average_ratio": np.random.uniform(0, 1, n),
        "acad_grade_a_count": np.random.randint(0, 5, n),
        "acad_fail_count": np.random.randint(0, 3, n),
        "att_present_ratio": np.random.uniform(0.5, 1, n),
        "att_absent_ratio": np.random.uniform(0, 0.5, n),
        "att_late_ratio": np.random.uniform(0, 0.2, n),
        "temp_improvement_rate": np.random.uniform(-2, 2, n),
        "temp_volatility": np.random.uniform(0, 10, n),
        "temp_consistency": np.random.uniform(0, 1, n),
        "temp_recent_trend": np.random.uniform(-0.5, 0.5, n),
        "demo_age": np.random.uniform(15, 25, n),
        "demo_years_enrolled": np.random.uniform(1, 5, n),
        "target_marks": np.random.uniform(30, 95, n),
    })

    metrics = predictor.train(features, target_column="target_marks")
    assert "rmse" in metrics
    assert metrics["rmse"] > 0

    results = predictor.predict_with_confidence(features.head(3))
    assert len(results) == 3
    assert all("predicted_marks" in r for r in results)
    assert all("confidence" in r for r in results)


def test_risk_classifier():
    classifier = RiskClassifier()
    n = 50
    features = pd.DataFrame({
        "student_id": range(n),
        "acad_avg_marks": np.random.uniform(30, 95, n),
        "acad_std_marks": np.random.uniform(5, 20, n),
        "acad_min_marks": np.random.uniform(20, 50, n),
        "acad_fail_count": np.random.randint(0, 3, n),
        "acad_total_courses": np.random.randint(3, 8, n),
        "att_present_ratio": np.random.uniform(0.5, 1, n),
        "att_absent_ratio": np.random.uniform(0, 0.5, n),
        "temp_improvement_rate": np.random.uniform(-2, 2, n),
        "temp_volatility": np.random.uniform(0, 10, n),
        "temp_consistency": np.random.uniform(0, 1, n),
        "demo_age": np.random.uniform(15, 25, n),
        "demo_years_enrolled": np.random.uniform(1, 5, n),
        "is_at_risk": np.random.randint(0, 2, n),
    })

    metrics = classifier.train(features, target_column="is_at_risk")
    assert "accuracy" in metrics

    results = classifier.predict_with_details(features.head(3))
    assert len(results) == 3
    assert all("is_at_risk" in r for r in results)


def test_promotion_recommender():
    recommender = PromotionRecommender()
    n = 50
    features = pd.DataFrame({
        "student_id": range(n),
        "acad_avg_marks": np.random.uniform(30, 95, n),
        "acad_std_marks": np.random.uniform(5, 20, n),
        "acad_min_marks": np.random.uniform(20, 50, n),
        "acad_fail_count": np.random.randint(0, 3, n),
        "acad_total_courses": np.random.randint(3, 8, n),
        "acad_marks_trend": np.random.uniform(-5, 5, n),
        "att_present_ratio": np.random.uniform(0.5, 1, n),
        "att_absent_ratio": np.random.uniform(0, 0.5, n),
        "temp_improvement_rate": np.random.uniform(-2, 2, n),
        "temp_consistency": np.random.uniform(0, 1, n),
        "demo_age": np.random.uniform(15, 25, n),
        "demo_years_enrolled": np.random.uniform(1, 5, n),
        "promotion_decision": np.random.choice(["promote", "retain", "probation"], n),
    })

    metrics = recommender.train(features, target_column="promotion_decision")
    assert "accuracy" in metrics
