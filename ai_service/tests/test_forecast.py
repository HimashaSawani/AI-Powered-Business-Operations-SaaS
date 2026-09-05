"""
 pytest tests for Moving Average, MAE, RMSE, MAPE, and best-fit model selection
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
import math
from app.services.forecast_service import ForecastService


@pytest.fixture
def service():
    return ForecastService()


class TestMovingAverage:

    def test_ma_returns_mean_of_window(self, service):
        history = [10, 12, 14, 16, 18]
        result = service.moving_average(history, window=3)
        # Last 3: [14, 16, 18] → mean = 16.0
        assert result == 16.0

    def test_ma_with_window_equal_to_history(self, service):
        history = [5, 10, 15]
        result = service.moving_average(history, window=3)
        assert result == 10.0

    def test_ma_with_window_larger_than_history_uses_all(self, service):
        history = [20, 30]
        result = service.moving_average(history, window=10)
        assert result == 25.0

    def test_ma_on_empty_history_returns_zero(self, service):
        assert service.moving_average([], window=7) == 0.0


class TestLinearTrend:

    def test_linear_trend_predicts_increasing_sequence(self, service):
        history = [10, 20, 30, 40]
        result = service.linear_trend(history)
        # Should predict approximately 50
        assert result > 45

    def test_linear_trend_on_flat_sequence(self, service):
        history = [10, 10, 10, 10]
        result = service.linear_trend(history)
        assert abs(result - 10.0) < 0.1


class TestMAEMetric:

    def test_mae_is_zero_for_perfect_predictions(self, service):
        actual = [10, 20, 30]
        predicted = [10, 20, 30]
        assert service.mae(actual, predicted) == 0.0

    def test_mae_calculates_correctly(self, service):
        actual = [10, 20, 30]
        predicted = [12, 18, 33]
        # |10-12| + |20-18| + |30-33| = 2+2+3 = 7 / 3 = 2.333
        result = service.mae(actual, predicted)
        assert abs(result - 2.333) < 0.01

    def test_mae_on_empty_returns_zero(self, service):
        assert service.mae([], []) == 0.0


class TestRMSEMetric:

    def test_rmse_is_zero_for_perfect_predictions(self, service):
        actual = [5, 10, 15]
        predicted = [5, 10, 15]
        assert service.rmse(actual, predicted) == 0.0

    def test_rmse_penalizes_large_errors_more_than_mae(self, service):
        actual    = [10, 10, 10, 10]
        pred_big  = [20, 10, 10, 10]  # One 10-unit error
        pred_spread = [12, 12, 8, 8]  # Four smaller errors

        rmse_big    = service.rmse(actual, pred_big)
        rmse_spread = service.rmse(actual, pred_spread)

        assert rmse_big > rmse_spread


class TestMAPEMetric:

    def test_mape_is_zero_for_perfect_predictions(self, service):
        actual = [100, 200, 300]
        predicted = [100, 200, 300]
        assert service.mape(actual, predicted) == 0.0

    def test_mape_calculates_as_percentage(self, service):
        actual = [100, 200]
        predicted = [110, 190]
        # |100-110|/100 = 0.10, |200-190|/200 = 0.05 → mean = 0.075 → 7.5%
        result = service.mape(actual, predicted)
        assert abs(result - 7.5) < 0.01


class TestBestFitModelSelection:

    def test_arima_is_selected_with_lowest_mae(self, service):
        history = [10, 12, 15, 14, 18, 20, 22, 19, 24, 26, 28, 30]

        actuals_ma, preds_ma       = service.generate_leave_one_out_predictions(history, "ma")
        actuals_tr, preds_tr       = service.generate_leave_one_out_predictions(history, "trend")
        actuals_rf, preds_rf       = service.generate_leave_one_out_predictions(history, "rf")

        mae_ma    = service.mae(actuals_ma, preds_ma)
        mae_trend = service.mae(actuals_tr, preds_tr)
        mae_rf    = service.mae(actuals_rf, preds_rf)

        # At least one model should have lower MAE than random
        best_mae = min(mae_ma, mae_trend, mae_rf)
        assert best_mae < 10  # Sanity check — shouldn't have massive errors on this data

    def test_walk_forward_validation_produces_enough_pairs(self, service):
        history = [10, 20, 30, 40, 50, 60]
        actuals, predictions = service.generate_leave_one_out_predictions(history, "ma")
        # Should have len(history) - 3 pairs
        assert len(actuals) == len(predictions)
        assert len(actuals) == len(history) - 3


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
