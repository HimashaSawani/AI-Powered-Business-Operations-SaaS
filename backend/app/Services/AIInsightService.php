<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Section 32 — Service: AI Insight Service
 *
 * HTTP wrapper around the Python FastAPI AI microservice.
 * Handles retry logic, timeouts, and graceful fallback responses.
 *
 * Routes:
 * - POST /api/ai/classify-ticket       → NLP ticket classification
 * - POST /api/ai/customer-health-score → 6-factor health score
 * - POST /api/ai/forecast-benchmark    → Model benchmark comparison
 */
class AIInsightService
{
    private string $baseUrl;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('services.ai_service.url', 'http://127.0.0.1:8001');
        $this->timeout = config('services.ai_service.timeout', 10);
    }

    /**
     * Classify a support ticket using NLP.
     * Returns category, priority, sentiment, confidence, and team routing.
     */
    public function classifyTicket(string $subject, string $message, ?string $customerName = null): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->retry(2, 500)
                ->post("{$this->baseUrl}/api/ai/classify-ticket", [
                    'subject'       => $subject,
                    'message'       => $message,
                    'customer_name' => $customerName,
                ]);

            if ($response->successful()) {
                Log::channel('ai_service')->info('Ticket classified', [
                    'subject'    => substr($subject, 0, 50),
                    'category'   => $response->json('category'),
                    'confidence' => $response->json('confidence'),
                ]);

                return $response->json();
            }

            Log::channel('ai_service')->warning('AI classify-ticket returned non-200', [
                'status' => $response->status(),
            ]);
        } catch (\Exception $e) {
            Log::channel('ai_service')->error('AI service unreachable for ticket classification', [
                'error' => $e->getMessage(),
            ]);
        }

        // Graceful fallback — rule-based classification
        return $this->fallbackTicketClassification($subject, $message);
    }

    /**
     * Calculate 6-factor customer health score via Python model.
     */
    public function customerHealthScore(array $customerData): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->retry(2, 500)
                ->post("{$this->baseUrl}/api/ai/customer-health-score", $customerData);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::channel('ai_service')->error('AI health score unreachable', [
                'error' => $e->getMessage(),
            ]);
        }

        return ['health_score' => 50, 'risk_level' => 'AT_RISK', 'factors' => []];
    }

    /**
     * Run forecast benchmark comparison across Moving Average, ARIMA, Random Forest.
     */
    public function forecastBenchmark(array $history, int $horizon = 30): array
    {
        try {
            $response = Http::timeout(30) // Forecasting takes longer
                ->post("{$this->baseUrl}/api/ai/forecast-benchmark", [
                    'history' => $history,
                    'horizon' => $horizon,
                ]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Exception $e) {
            Log::channel('ai_service')->error('AI forecast-benchmark unreachable', [
                'error' => $e->getMessage(),
            ]);
        }

        return ['error' => 'Forecast service temporarily unavailable.'];
    }

    /**
     * Rule-based fallback ticket classification when Python AI is unavailable.
     */
    private function fallbackTicketClassification(string $subject, string $message): array
    {
        $text = strtolower($subject . ' ' . $message);

        $category = match (true) {
            str_contains($text, 'charge') || str_contains($text, 'billing') || str_contains($text, 'invoice') => 'billing',
            str_contains($text, 'login') || str_contains($text, 'password') || str_contains($text, 'access') => 'authentication',
            str_contains($text, 'bug') || str_contains($text, 'error') || str_contains($text, 'crash')        => 'technical',
            default                                                                                             => 'general',
        };

        $sentiment = match (true) {
            str_contains($text, 'charged twice') || str_contains($text, 'angry') || str_contains($text, 'unacceptable') => 'negative',
            str_contains($text, 'thank') || str_contains($text, 'great')                                                => 'positive',
            default                                                                                                      => 'neutral',
        };

        return [
            'category'           => $category,
            'priority'           => $sentiment === 'negative' ? 'high' : 'medium',
            'sentiment'          => $sentiment,
            'confidence'         => 0.72, // Lower confidence for rule-based fallback
            'assigned_team'      => $category === 'billing' ? 'Billing & Payments Team' : 'Support Engineering',
            'suggested_auto_reply' => 'We have received your ticket and will respond within 24 hours.',
            'fallback'           => true,
        ];
    }
}
