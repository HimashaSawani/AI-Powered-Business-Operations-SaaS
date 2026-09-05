"""
OpsMind AI — Pydantic Schemas: Forecasting
Section 33: Modular schema definitions
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ForecastRequest(BaseModel):
    history: List[float] = Field(..., min_length=3, description="Historical demand values")
    horizon: int = Field(30, ge=1, le=365, description="Forecast horizon in days")


class BenchmarkResult(BaseModel):
    model_name: str
    mae: float
    rmse: float
    mape: float
    projected_30d_demand: float
    is_best_fit: bool


class ForecastBenchmarkResponse(BaseModel):
    product_id: Optional[int] = None
    best_fit_model: str
    projected_30d_demand: float
    models: List[BenchmarkResult]
    safety_stock: Optional[float] = None
    reorder_point: Optional[float] = None
