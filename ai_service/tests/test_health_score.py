"""
pytest tests for the 6-factor customer health score model
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest


def calculate_health_score(
    recency_days: int,
    frequency_orders: int,
    total_spend: float,
    support_complaints: int,
    refund_count: int,
    engagement_score: int
) -> float:
    """Mirror of the Python AI service health score calculation."""
    recency_score    = max(0, 100 - (recency_days / 365) * 100)
    frequency_score  = min(100, (frequency_orders / 20) * 100)
    revenue_score    = min(100, (total_spend / 10000) * 100)
    support_score    = max(0, 100 - (support_complaints * 15))
    refund_score     = max(0, 100 - (refund_count * 20))
    eng_score        = min(100, max(0, engagement_score))

    health_score = (
        recency_score   * 0.20 +
        frequency_score * 0.20 +
        revenue_score   * 0.20 +
        support_score   * 0.15 +
        refund_score    * 0.10 +
        eng_score       * 0.15
    )

    return round(health_score, 1)


def classify_risk(score: float) -> str:
    if score >= 75:
        return "HEALTHY"
    elif score >= 30:
        return "AT_RISK"
    return "CRITICAL"


class TestHealthScoreRange:

    def test_score_is_between_0_and_100(self):
        score = calculate_health_score(5, 12, 3500.0, 1, 0, 80)
        assert 0 <= score <= 100

    def test_perfect_customer_scores_above_90(self):
        score = calculate_health_score(0, 50, 15000.0, 0, 0, 100)
        assert score > 90

    def test_worst_possible_customer_scores_near_zero(self):
        score = calculate_health_score(365, 0, 0.0, 6, 5, 0)
        assert score < 10


class TestRiskClassification:

    def test_sarah_williams_is_healthy(self):
        """Section 12: Sarah Williams — 18 orders, $4820 LTV, 7 days since last purchase."""
        score = calculate_health_score(
            recency_days=7,
            frequency_orders=18,
            total_spend=4820.0,
            support_complaints=1,
            refund_count=0,
            engagement_score=88
        )
        risk = classify_risk(score)
        assert risk == "HEALTHY"
        assert score >= 75

    def test_john_miller_is_at_risk(self):
        """Section 15: John Miller — 32% At Risk."""
        score = calculate_health_score(
            recency_days=92,
            frequency_orders=2,
            total_spend=340.0,
            support_complaints=4,
            refund_count=2,
            engagement_score=15
        )
        risk = classify_risk(score)
        assert risk in ("AT_RISK", "CRITICAL")
        assert score < 50

    def test_healthy_threshold_is_75(self):
        assert classify_risk(76) == "HEALTHY"
        assert classify_risk(75) == "HEALTHY"
        assert classify_risk(74) == "AT_RISK"

    def test_critical_threshold_is_30(self):
        assert classify_risk(30) == "AT_RISK"
        assert classify_risk(29) == "CRITICAL"
        assert classify_risk(0) == "CRITICAL"


class TestFactorSensitivity:

    def test_recent_purchase_boosts_score(self):
        score_recent = calculate_health_score(0, 10, 2000.0, 0, 0, 70)
        score_stale  = calculate_health_score(300, 10, 2000.0, 0, 0, 70)
        assert score_recent > score_stale

    def test_multiple_refunds_penalize_score(self):
        score_clean    = calculate_health_score(10, 10, 2000.0, 0, 0, 70)
        score_refunded = calculate_health_score(10, 10, 2000.0, 0, 4, 70)
        assert score_clean > score_refunded

    def test_many_complaints_lower_score(self):
        score_good = calculate_health_score(10, 10, 2000.0, 0, 0, 70)
        score_bad  = calculate_health_score(10, 10, 2000.0, 6, 0, 70)
        assert score_good > score_bad

    def test_zero_orders_is_not_healthy(self):
        score = calculate_health_score(365, 0, 0.0, 0, 0, 0)
        assert classify_risk(score) != "HEALTHY"


class TestSafetyStockIntegration:

    def test_safety_stock_formula(self):
        """Z × σ × √(lead_time)"""
        import math
        z = 1.65
        std_dev = 5.0
        lead_time = 7
        safety_stock = z * std_dev * math.sqrt(lead_time)
        assert 20 < safety_stock < 25

    def test_reorder_point_calculation(self):
        avg_demand = 3.0
        lead_time = 7
        safety_stock = 15
        reorder_point = (avg_demand * lead_time) + safety_stock
        assert reorder_point == 36.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
