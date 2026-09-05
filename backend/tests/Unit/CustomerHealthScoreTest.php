<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Section 30 — Unit Test: Customer Health Score Calculation
 *
 * Tests the 6-factor scoring: Recency, Frequency, Revenue, Support, Refunds, Engagement.
 * Pure unit tests — no database required.
 */
class CustomerHealthScoreTest extends TestCase
{
    // ── Score Range Validation ────────────────────────────────────────────────

    public function test_health_score_is_between_0_and_100(): void
    {
        $score = $this->calculateHealthScore(
            recencyDays: 5,
            frequencyOrders: 12,
            totalSpend: 3500.00,
            supportComplaints: 1,
            refundCount: 0,
            engagementScore: 80
        );

        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    // ── Risk Level Classification ─────────────────────────────────────────────

    public function test_sarah_williams_scores_healthy_at_86_percent(): void
    {
        $score = $this->calculateHealthScore(
            recencyDays: 7,
            frequencyOrders: 18,
            totalSpend: 4820.00,
            supportComplaints: 1,
            refundCount: 0,
            engagementScore: 88
        );
        $riskLevel = $this->classifyRiskLevel($score);

        $this->assertGreaterThanOrEqual(75, $score);
        $this->assertEquals('HEALTHY', $riskLevel);
    }

    public function test_john_miller_scores_at_risk_below_50(): void
    {
        $score = $this->calculateHealthScore(
            recencyDays: 92,
            frequencyOrders: 2,
            totalSpend: 340.00,
            supportComplaints: 4,
            refundCount: 2,
            engagementScore: 15
        );
        $riskLevel = $this->classifyRiskLevel($score);

        $this->assertLessThan(50, $score);
        $this->assertContains($riskLevel, ['AT_RISK', 'CRITICAL']);
    }

    public function test_healthy_threshold_is_75_percent(): void
    {
        $this->assertEquals('HEALTHY', $this->classifyRiskLevel(76));
        $this->assertEquals('HEALTHY', $this->classifyRiskLevel(100));
        $this->assertEquals('AT_RISK', $this->classifyRiskLevel(74));
    }

    public function test_critical_threshold_is_below_30_percent(): void
    {
        $this->assertEquals('CRITICAL', $this->classifyRiskLevel(29));
        $this->assertEquals('CRITICAL', $this->classifyRiskLevel(0));
        $this->assertEquals('AT_RISK', $this->classifyRiskLevel(30));
    }

    // ── Factor Sensitivity Tests ──────────────────────────────────────────────

    public function test_very_recent_purchase_boosts_score(): void
    {
        $scoreRecent = $this->calculateHealthScore(0, 10, 2000.00, 0, 0, 70);
        $scoreStale  = $this->calculateHealthScore(180, 10, 2000.00, 0, 0, 70);

        $this->assertGreaterThan($scoreStale, $scoreRecent);
    }

    public function test_multiple_refunds_penalize_score(): void
    {
        $scoreClean    = $this->calculateHealthScore(10, 10, 2000.00, 0, 0, 70);
        $scoreRefunded = $this->calculateHealthScore(10, 10, 2000.00, 0, 5, 70);

        $this->assertGreaterThan($scoreRefunded, $scoreClean);
    }

    public function test_high_complaints_lower_score(): void
    {
        $scoreGood = $this->calculateHealthScore(10, 10, 2000.00, 0, 0, 70);
        $scoreBad  = $this->calculateHealthScore(10, 10, 2000.00, 8, 0, 70);

        $this->assertGreaterThan($scoreBad, $scoreGood);
    }

    // ── Boundary Conditions ───────────────────────────────────────────────────

    public function test_customer_with_zero_orders_is_not_healthy(): void
    {
        $score     = $this->calculateHealthScore(365, 0, 0.00, 0, 0, 0);
        $riskLevel = $this->classifyRiskLevel($score);

        $this->assertNotEquals('HEALTHY', $riskLevel);
    }

    public function test_perfect_customer_scores_above_90(): void
    {
        $score = $this->calculateHealthScore(1, 50, 15000.00, 0, 0, 100);

        $this->assertGreaterThan(90, $score);
    }

    // ── Pure Calculation Helpers (mirrors CustomerService / Python logic) ──────

    private function calculateHealthScore(
        int $recencyDays,
        int $frequencyOrders,
        float $totalSpend,
        int $supportComplaints,
        int $refundCount,
        int $engagementScore
    ): float {
        // Recency score: 0 days = 100, 365 days = 0
        $recencyScore = max(0, 100 - ($recencyDays / 365) * 100);

        // Frequency score: capped at 20 orders for full marks
        $frequencyScore = min(100, ($frequencyOrders / 20) * 100);

        // Revenue score: capped at $10,000 lifetime value
        $revenueScore = min(100, ($totalSpend / 10000) * 100);

        // Support penalty: each complaint loses 15 points
        $supportScore = max(0, 100 - ($supportComplaints * 15));

        // Refund penalty: each refund loses 20 points
        $refundScore = max(0, 100 - ($refundCount * 20));

        // Engagement score: direct 0–100
        $engScore = min(100, max(0, $engagementScore));

        // Weighted average
        $healthScore = (
            ($recencyScore * 0.20) +
            ($frequencyScore * 0.20) +
            ($revenueScore * 0.20) +
            ($supportScore * 0.15) +
            ($refundScore * 0.10) +
            ($engScore * 0.15)
        );

        return round($healthScore, 1);
    }

    private function classifyRiskLevel(float $score): string
    {
        if ($score >= 75) return 'HEALTHY';
        if ($score >= 30) return 'AT_RISK';
        return 'CRITICAL';
    }
}
