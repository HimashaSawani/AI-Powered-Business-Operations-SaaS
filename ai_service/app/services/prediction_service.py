"""
OpsMind AI — Service: Prediction Service
Section 33: Safety stock and stockout prediction calculations
"""

import math


class PredictionService:
    """Service for inventory safety stock and reorder point predictions."""

    def safety_stock(
        self,
        z_score: float,
        demand_std_dev: float,
        lead_time_days: int
    ) -> float:
        """
        Safety Stock formula: Z × σ_demand × √(lead_time)
        
        Args:
            z_score:        Service level factor (1.65 = 95%, 1.96 = 97.5%, 2.33 = 99%)
            demand_std_dev: Standard deviation of daily demand
            lead_time_days: Supplier lead time in days
        """
        return round(z_score * demand_std_dev * math.sqrt(lead_time_days), 2)

    def reorder_point(
        self,
        avg_daily_demand: float,
        lead_time_days: int,
        safety_stock: float
    ) -> float:
        """
        Reorder Point = (Average Daily Demand × Lead Time) + Safety Stock
        """
        return round((avg_daily_demand * lead_time_days) + safety_stock, 2)

    def recommended_order_quantity(
        self,
        projected_demand: float,
        current_stock: int,
        safety_stock: float
    ) -> int:
        """
        Recommended order = Projected 30-day demand + Safety Stock - Current Stock
        """
        return max(0, math.ceil(projected_demand + safety_stock - current_stock))

    def days_until_stockout(
        self,
        current_stock: int,
        avg_daily_demand: float
    ) -> float:
        """Estimated days before stockout at current demand rate."""
        if avg_daily_demand <= 0:
            return float('inf')
        return round(current_stock / avg_daily_demand, 1)

    def stockout_risk_level(
        self,
        current_stock: int,
        avg_daily_demand: float,
        lead_time_days: int,
        safety_stock: float
    ) -> str:
        """
        Classifies stockout risk based on available stock vs reorder point.
        Returns: CRITICAL | HIGH | MEDIUM | LOW
        """
        reorder = self.reorder_point(avg_daily_demand, lead_time_days, safety_stock)

        if current_stock <= 0:
            return "CRITICAL"
        elif current_stock <= safety_stock:
            return "CRITICAL"
        elif current_stock <= reorder:
            return "HIGH"
        elif current_stock <= reorder * 1.25:
            return "MEDIUM"
        else:
            return "LOW"
