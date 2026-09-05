"""
OpsMind AI — Pydantic Schemas: Ticket Classification
Section 33: Modular schema definitions
"""

from pydantic import BaseModel
from typing import Optional


class TicketClassificationRequest(BaseModel):
    ticket_id: Optional[int] = None
    subject: str
    message: str
    customer_name: Optional[str] = None


class TicketClassificationResponse(BaseModel):
    ticket_id: Optional[int] = None
    category: str          # billing, technical, authentication, general
    priority: str          # high, medium, low
    sentiment: str         # negative, neutral, positive
    confidence: float      # 0.0 – 1.0
    assigned_team: str
    suggested_auto_reply: str
    fallback: bool = False
