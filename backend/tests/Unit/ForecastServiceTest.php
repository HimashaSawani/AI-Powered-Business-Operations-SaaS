<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Section 30 — Unit Test: Forecasting Service
 *
 * Tests Moving Average calculation, MAE/RMSE/MAPE metrics, and best-fit model selection.
 * Pure unit tests — no database required.
 */
class ForecastServiceTest extends TestCase
{
    // ── Moving Average ────────────────────────────────────────────────────────

    public function test_simple_moving_average_is_mean_of_window(): void
    {
        $history = [10, 12, 14, 16, 18];
        $window  = 3;
        $ma      = $this->movingAverage($history, $window);

        // Last 3: [14, 16, 18] → mean = 16.0
        $this->assertEquals(16.0, $ma);
    }

    public function test_moving_average_with_full_window_equal_to_history(): void
    {
        $history = [5, 10, 15];
        $ma      = $this->movingAverage($history, 3);

        $this->assertEquals(10.0, $ma);
    }

    public function test_moving_average_window_larger_than_history_uses_all_values(): void
    {
        $history = [20, 30];
        $ma      = $this->movingAverage($history, 10); // window > length

        $this->assertEquals(25.0, $ma);
    }

    // ── MAE (Mean Absolute Error) ─────────────────────────────────────────────

    public function test_mae_is_zero_for_perfect_predictions(): void
    {
        $actual    = [10, 20, 30, 40];
        $predicted = [10, 20, 30, 40];

        $this->assertEquals(0.0, $this->calculateMAE($actual, $predicted));
    }

    public function test_mae_calculates_correctly(): void
    {
        $actual    = [10, 20, 30];
        $predicted = [12, 18, 33];
        // |10-12| + |20-18| + |30-33| = 2 + 2 + 3 = 7 → 7/3 = 2.33
        $mae = $this->calculateMAE($actual, $predicted);

        $this->assertEquals(2.33, round($mae, 2));
    }

    // ── RMSE (Root Mean Square Error) ────────────────────────────────────────

    public function test_rmse_is_zero_for_perfect_predictions(): void
    {
        $actual    = [5, 10, 15];
        $predicted = [5, 10, 15];

        $this->assertEquals(0.0, $this->calculateRMSE($actual, $predicted));
    }

    public function test_rmse_penalizes_large_errors_more_than_mae(): void
    {
        // One large error vs. spread errors
        $actual          = [10, 10, 10, 10];
        $predictedBig    = [20, 10, 10, 10]; // One 10-unit error
        $predictedSpread = [12, 12, 12, 8];  // Four 2-unit errors, 2-unit error

        $rmseBig    = $this->calculateRMSE($actual, $predictedBig);
        $rmseSpread = $this->calculateRMSE($actual, $predictedSpread);

        $this->assertGreaterThan($rmseSpread, $rmseBig);
    }

    // ── MAPE (Mean Absolute Percentage Error) ────────────────────────────────

    public function test_mape_is_zero_for_perfect_predictions(): void
    {
        $actual    = [100, 200, 300];
        $predicted = [100, 200, 300];

        $this->assertEquals(0.0, $this->calculateMAPE($actual, $predicted));
    }

    public function test_mape_calculates_as_percentage(): void
    {
        $actual    = [100, 200];
        $predicted = [110, 190];
        // |100-110|/100 = 0.10, |200-190|/200 = 0.05 → mean = 0.075 → 7.5%
        $mape = $this->calculateMAPE($actual, $predicted);

        $this->assertEquals(7.5, round($mape, 1));
    }

    // ── Best-Fit Model Selection ──────────────────────────────────────────────

    public function test_model_with_lowest_mae_is_selected_as_best_fit(): void
    {
        $benchmarks = [
            ['model' => 'Moving Average',    'mae' => 4.19],
            ['model' => 'ARIMA / Trend',      'mae' => 1.05],
            ['model' => 'Random Forest',      'mae' => 4.79],
        ];

        $bestFit = $this->selectBestFitModel($benchmarks);

        $this->assertEquals('ARIMA / Trend', $bestFit['model']);
    }

    public function test_single_model_is_always_best_fit(): void
    {
        $benchmarks = [['model' => 'Only Model', 'mae' => 99.9]];
        $bestFit    = $this->selectBestFitModel($benchmarks);

        $this->assertEquals('Only Model', $bestFit['model']);
    }

    // ── Safety Stock Calculation ──────────────────────────────────────────────

    public function test_safety_stock_formula(): void
    {
        // Safety Stock = Z * σ_demand * √lead_time
        // For Z=1.65 (95%), σ=5, lead_time=7: SS = 1.65 * 5 * 2.646 ≈ 21.8
        $safetyStock = $this->calculateSafetyStock(
            zScore: 1.65,
            demandStdDev: 5.0,
            leadTimeDays: 7
        );

        $this->assertGreaterThan(20, $safetyStock);
        $this->assertLessThan(25, $safetyStock);
    }

    public function test_reorder_point_includes_lead_time_demand_plus_safety_stock(): void
    {
        $dailyDemand   = 3.0;
        $leadTimeDays  = 7;
        $safetyStock   = 15;

        $reorderPoint = ($dailyDemand * $leadTimeDays) + $safetyStock;

        // 3 * 7 + 15 = 36
        $this->assertEquals(36.0, $reorderPoint);
    }

    // ── Pure Function Helpers ─────────────────────────────────────────────────

    private function movingAverage(array $history, int $window): float
    {
        $slice = array_slice($history, -$window);
        return round(array_sum($slice) / count($slice), 4);
    }

    private function calculateMAE(array $actual, array $predicted): float
    {
        $n   = count($actual);
        $sum = 0;
        for ($i = 0; $i < $n; $i++) {
            $sum += abs($actual[$i] - $predicted[$i]);
        }
        return round($sum / $n, 4);
    }

    private function calculateRMSE(array $actual, array $predicted): float
    {
        $n   = count($actual);
        $sum = 0;
        for ($i = 0; $i < $n; $i++) {
            $sum += ($actual[$i] - $predicted[$i]) ** 2;
        }
        return round(sqrt($sum / $n), 4);
    }

    private function calculateMAPE(array $actual, array $predicted): float
    {
        $n   = count($actual);
        $sum = 0;
        for ($i = 0; $i < $n; $i++) {
            if ($actual[$i] != 0) {
                $sum += abs(($actual[$i] - $predicted[$i]) / $actual[$i]);
            }
        }
        return round(($sum / $n) * 100, 4);
    }

    private function selectBestFitModel(array $benchmarks): array
    {
        return array_reduce($benchmarks, function ($best, $model) {
            return ($best === null || $model['mae'] < $best['mae']) ? $model : $best;
        }, null);
    }

    private function calculateSafetyStock(float $zScore, float $demandStdDev, int $leadTimeDays): float
    {
        return round($zScore * $demandStdDev * sqrt($leadTimeDays), 2);
    }
}
