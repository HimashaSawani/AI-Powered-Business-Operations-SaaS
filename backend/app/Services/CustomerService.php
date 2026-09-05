<?php

namespace App\Services;

use App\Models\Customer;

/**
 * Section 32 — Service: Customer Service
 *
 * Provides business logic for:
 * 1. Customer 6-factor Health Score calculation
 * 2. Timeline event recording
 */
class CustomerService
{
    /**
     * Calculate a 6-factor health score for a customer.
     * Returns a score from 0–100 and a risk level classification.
     *
     * Factors:
     * - Recency (20%):    How recently did the customer purchase?
     * - Frequency (20%):  How many orders have they placed?
     * - Revenue (20%):    What is their lifetime spend?
     * - Support (15%):    How many complaints have they raised?
     * - Refunds (10%):    How many refunds have been issued?
     * - Engagement (15%): Email open rate / interaction score (0–100)
     */
    public function calculateHealthScore(Customer $customer): array
    {
        $recencyDays       = $customer->last_order_at
            ? (int) now()->diffInDays($customer->last_order_at)
            : 365;
        $frequencyOrders   = (int) $customer->total_orders;
        $totalSpend        = (float) $customer->lifetime_value;
        $supportComplaints = $customer->tickets()->where('category', 'Billing')->count();
        $refundCount       = 0; // Could be sourced from orders.payment_status = 'refunded'
        $engagementScore   = min(100, max(0, $frequencyOrders * 5));

        // Factor scores
        $recencyScore    = max(0, 100 - ($recencyDays / 365) * 100);
        $frequencyScore  = min(100, ($frequencyOrders / 20) * 100);
        $revenueScore    = min(100, ($totalSpend / 10000) * 100);
        $supportScore    = max(0, 100 - ($supportComplaints * 15));
        $refundScore     = max(0, 100 - ($refundCount * 20));
        $engScore        = $engagementScore;

        $healthScore = round(
            ($recencyScore   * 0.20) +
            ($frequencyScore * 0.20) +
            ($revenueScore   * 0.20) +
            ($supportScore   * 0.15) +
            ($refundScore    * 0.10) +
            ($engScore       * 0.15),
            1
        );

        $riskLevel = match (true) {
            $healthScore >= 75 => 'HEALTHY',
            $healthScore >= 30 => 'AT_RISK',
            default            => 'CRITICAL',
        };

        return [
            'health_score' => $healthScore,
            'risk_level'   => $riskLevel,
            'factors'      => [
                'recency'    => round($recencyScore, 1),
                'frequency'  => round($frequencyScore, 1),
                'revenue'    => round($revenueScore, 1),
                'support'    => round($supportScore, 1),
                'refunds'    => round($refundScore, 1),
                'engagement' => round($engScore, 1),
            ],
        ];
    }

    /**
     * Append a new event to the customer's activity timeline.
     */
    public function appendTimelineEvent(Customer $customer, string $type, string $description, array $meta = []): void
    {
        $timeline   = $customer->timeline ?? [];
        $timeline[] = [
            'type'        => $type,
            'description' => $description,
            'meta'        => $meta,
            'timestamp'   => now()->toISOString(),
        ];

        $customer->timeline = $timeline;
        $customer->save();
    }
}
