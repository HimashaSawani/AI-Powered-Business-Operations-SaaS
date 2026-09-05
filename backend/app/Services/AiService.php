<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.ai_service.url', 'http://127.0.0.1:8001');
    }

    /**
     * Call FastAPI microservice to generate high-accuracy ARIMA/Moving Average sales forecast.
     */
    public function getSalesForecast(Product $product, array $recentSalesUnits, int $forecastDays = 30): array
    {
        try {
            $response = Http::timeout(2)
                ->retry(3, 100)
                ->post("{$this->baseUrl}/api/ai/forecast-sales", [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'current_stock' => $product->current_stock,
                    'reorder_level' => $product->reorder_level,
                    'history' => array_map(function ($units, $idx) {
                        return [
                            'date' => now()->subDays(count($units) - $idx)->format('Y-m-d'),
                            'units_sold' => $units,
                        ];
                    }, $recentSalesUnits, array_keys($recentSalesUnits)),
                    'forecast_days' => $forecastDays,
                ]);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $e) {
            Log::warning("AI Microservice unreachable. Falling back to internal statistical engine: {$e->getMessage()}");
        }

        return $this->computeFallbackForecast($product, $recentSalesUnits, $forecastDays);
    }

    /**
     * Calibrated statistical fallback when microservice is offline.
     */
    public function computeFallbackForecast(Product $product, array $recentSalesUnits, int $forecastDays = 30): array
    {
        $avgDaily = round(array_sum($recentSalesUnits) / max(1, count($recentSalesUnits)), 1);
        $daysUntilOut = $product->current_stock > 0 ? (int) floor($product->current_stock / max(1, $avgDaily)) : 0;
        $urgency = $daysUntilOut <= 7 ? 'CRITICAL' : ($daysUntilOut <= 14 ? 'URGENT' : 'HEALTHY');

        $series = [];
        $remaining = $product->current_stock;
        for ($i = 1; $i <= $forecastDays; $i++) {
            $predictedUnits = round($avgDaily * (1 + ($i * 0.015)), 1);
            $remaining = max(0, round($remaining - $predictedUnits));
            $series[] = [
                'day' => $i,
                'date' => now()->addDays($i)->format('Y-m-d'),
                'predicted_units' => $predictedUnits,
                'projected_remaining_stock' => $remaining,
            ];
        }

        return [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'sku' => $product->sku,
            'current_stock' => $product->current_stock,
            'reorder_level' => $product->reorder_level,
            'daily_run_rate' => $avgDaily,
            'estimated_days_until_stockout' => $daysUntilOut,
            'stockout_predicted_date' => now()->addDays($daysUntilOut)->format('Y-m-d'),
            'reorder_recommended' => $product->current_stock <= ($avgDaily * 14),
            'reorder_urgency' => $urgency,
            'recommended_reorder_units' => (int) ceil($avgDaily * 45),
            'forecast_series' => $series,
            'source' => 'fallback_engine',
        ];
    }
}
