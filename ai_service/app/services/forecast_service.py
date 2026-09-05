

import numpy as np
import math
from typing import List, Tuple


class ForecastService:
    """Pure calculation service for time-series forecasting metrics."""

    def moving_average(self, history: List[float], window: int = 7) -> float:
        """Simple Moving Average over the last N values."""
        if not history:
            return 0.0
        window_data = history[-window:] if len(history) >= window else history
        return round(float(np.mean(window_data)), 2)

    def linear_trend(self, history: List[float]) -> float:
        """Linear regression forecast — projects the next value from the trend slope."""
        if len(history) < 2:
            return float(history[-1]) if history else 0.0

        x = np.arange(len(history))
        y = np.array(history)
        slope, intercept = np.polyfit(x, y, 1)
        next_x = len(history)
        return round(float(slope * next_x + intercept), 2)

    def random_forest_approx(self, history: List[float]) -> float:
        """
        Approximation of Random Forest ensemble prediction.
        Uses weighted combination of MA(3), MA(7), and linear trend
        as a stand-in when sklearn is not available.
        """
        if len(history) < 3:
            return float(np.mean(history)) if history else 0.0

        ma3    = self.moving_average(history, 3)
        ma7    = self.moving_average(history, min(7, len(history)))
        trend  = self.linear_trend(history)

        # Weighted ensemble: 40% short-term, 30% mid-term, 30% trend
        return round(0.40 * ma3 + 0.30 * ma7 + 0.30 * trend, 2)

    def mae(self, actual: List[float], predicted: List[float]) -> float:
        """Mean Absolute Error."""
        if not actual:
            return 0.0
        errors = [abs(a - p) for a, p in zip(actual, predicted)]
        return round(float(np.mean(errors)), 4)

    def rmse(self, actual: List[float], predicted: List[float]) -> float:
        """Root Mean Square Error."""
        if not actual:
            return 0.0
        errors = [(a - p) ** 2 for a, p in zip(actual, predicted)]
        return round(float(math.sqrt(np.mean(errors))), 4)

    def mape(self, actual: List[float], predicted: List[float]) -> float:
        """Mean Absolute Percentage Error (in %)."""
        if not actual:
            return 0.0
        pcts = [abs((a - p) / a) for a, p in zip(actual, predicted) if a != 0]
        return round(float(np.mean(pcts) * 100), 4) if pcts else 0.0

    def generate_leave_one_out_predictions(
        self,
        history: List[float],
        method: str = "ma"
    ) -> Tuple[List[float], List[float]]:
        """
        Walk-forward validation: generate actual vs predicted pairs
        by training on all data up to each point and predicting the next value.
        """
        actuals    = []
        predictions = []

        if len(history) < 4:
            return history, history  # Not enough data for meaningful validation

        for i in range(3, len(history)):
            train = history[:i]
            actual_val = history[i]
            actuals.append(actual_val)

            if method == "ma":
                pred = self.moving_average(train, 3)
            elif method == "trend":
                pred = self.linear_trend(train)
            elif method == "rf":
                pred = self.random_forest_approx(train)
            else:
                pred = self.moving_average(train, 3)

            predictions.append(pred)

        return actuals, predictions
