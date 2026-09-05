"""
OpsMind AI — Pydantic Schemas: Customer Health Score
Section 33: Modular schema definitions
"""

from pydantic import BaseModel, Field
from typing import Dict, Optional


class CustomerHealthRequest(BaseModel):
    customer_id: int
    name: str
    recency_days: int = Field(..., ge=0, description="Days since last purchase")
    frequency_orders: int = Field(..., ge=0)
    total_spend: float = Field(..., ge=0.0)
    support_complaints: int = Field(0, ge=0)
    refund_count: int = Field(0, ge=0)
    engagement_score: int = Field(50, ge=0, le=100)


class CustomerHealthFactors(BaseModel):
    recency: float
    frequency: float
    revenue: float
    support: float
    refunds: float
    engagement: float


class CustomerHealthResponse(BaseModel):
    customer_id: int
    name: str
    health_score: float    # 0–100
    risk_level: str        # HEALTHY, AT_RISK, CRITICAL
    factors: CustomerHealthFactors
    recommended_actions: list[str]
