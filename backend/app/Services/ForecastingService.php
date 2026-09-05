<?php

namespace App\Services;

/**
 * Section 32 — Service: Forecasting Service
 *
 * PHP-side forecasting logic. Complements the Python AI service
 * for lightweight, synchronous predictions that don't require
 * the full ML microservice.
 *
 * Provides:
 * - Moving Average calculation
 * - MAE, RMSE, MAPE error metrics
 * - Best-fit model selection
 * - Safety stock & reorder point estimation
 */
class ForecastingService
{
    /**
     * Simple Moving Average of the last N values.
     */
    public function movingAverage(array $history, int $window = 7): float
    {
        if (empty($history)) {
            return 0.0;
        }
        $slice = array_slice($history, -$window);
        return round(array_sum($slice) / count($slice), 4);
    }

    /**
     * Linear trend forecast — projects next value from slope.
     */
    public function linearTrend(array $history): float
    {
        $n = count($history);
        if ($n < 2) {
            return end($history) ?: 0;
        }

        $xMean = ($n - 1) / 2;
        $yMean = array_sum($history) / $n;

        $numerator   = 0;
        $denominator = 0;
        foreach ($history as $i => $y) {
            $numerator   += ($i - $xMean) * ($y - $yMean);
            $denominator += ($i - $xMean) ** 2;
        }

        $slope     = $denominator != 0 ? $numerator / $denominator : 0;
        $intercept = $yMean - $slope * $xMean;

        return round($intercept + $slope * $n, 2);
    }

    /**
     * MAE — Mean Absolute Error
     */
    public function mae(array $actual, array $predicted): float
    {
        $n = count($actual);
        if ($n === 0) return 0.0;
        $sum = 0;
        for ($i = 0; $i < $n; $i++) {
            $sum += abs($actual[$i] - $predicted[$i]);
        }
        return round($sum / $n, 4);
    }

    /**
     * RMSE — Root Mean Square Error
     */
    public function rmse(array $actual, array $predicted): float
    {
        $n = count($actual);
        if ($n === 0) return 0.0;
        $sum = 0;
        for ($i = 0; $i < $n; $i++) {
            $sum += ($actual[$i] - $predicted[$i]) ** 2;
        }
        return round(sqrt($sum / $n), 4);
    }

    /**
     * MAPE — Mean Absolute Percentage Error
     */
    public function mape(array $actual, array $predicted): float
    {
        $n = count($actual);
        if ($n === 0) return 0.0;
        $sum = 0;
        for ($i = 0; $i < $n; $i++) {
            if ($actual[$i] != 0) {
                $sum += abs(($actual[$i] - $predicted[$i]) / $actual[$i]);
            }
        }
        return round(($sum / $n) * 100, 4);
    }

    /**
     * Select the model with the lowest MAE as best-fit.
     */
    public function selectBestFitModel(array $benchmarks): ?array
    {
        return array_reduce($benchmarks, function ($best, $model) {
            return ($best === null || $model['mae'] < $best['mae']) ? $model : $best;
        }, null);
    }

    /**
     * Safety Stock calculation: Z × σ_demand × √(lead_time_days)
     *
     * @param float $zScore      Service level factor (1.65 = 95%, 1.96 = 97.5%)
     * @param float $demandStdDev Daily demand standard deviation
     * @param int   $leadTimeDays  Supplier lead time in days
     */
    public function safetyStock(float $zScore, float $demandStdDev, int $leadTimeDays): float
    {
        return round($zScore * $demandStdDev * sqrt($leadTimeDays), 2);
    }

    /**
     * Reorder Point = (Average Daily Demand × Lead Time Days) + Safety Stock
     */
    public function reorderPoint(float $avgDailyDemand, int $leadTimeDays, float $safetyStock): float
    {
        return round(($avgDailyDemand * $leadTimeDays) + $safetyStock, 2);
    }
}
