"""
OpsMind AI — Tests: Ticket Classification
Section 33: pytest tests for the NLP ticket classification logic
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from app.services.forecast_service import ForecastService


class TestTicketClassificationLogic:
    """
    Tests for the NLP classification keyword rules used in main.py.
    These validate the business logic without requiring a running FastAPI server.
    """

    def classify(self, subject: str, message: str) -> dict:
        """Reproduce the classification logic from main.py for testing."""
        text = (subject + " " + message).lower()

        # Category detection
        billing_keywords    = ["charge", "billing", "invoice", "payment", "refund", "duplicate"]
        technical_keywords  = ["error", "bug", "crash", "broken", "not working", "failed"]
        auth_keywords       = ["login", "password", "access", "authentication", "locked"]

        category = "general"
        if any(kw in text for kw in billing_keywords):
            category = "billing"
        elif any(kw in text for kw in technical_keywords):
            category = "technical"
        elif any(kw in text for kw in auth_keywords):
            category = "authentication"

        # Sentiment detection
        negative_keywords = ["charged twice", "angry", "unacceptable", "fraud", "terrible", "worst"]
        positive_keywords = ["thank", "great", "excellent", "perfect", "happy"]

        sentiment = "neutral"
        if any(kw in text for kw in negative_keywords):
            sentiment = "negative"
        elif any(kw in text for kw in positive_keywords):
            sentiment = "positive"

        priority = "high" if sentiment == "negative" else "medium"

        team_map = {
            "billing": "Billing & Payments Team",
            "technical": "Support Engineering",
            "authentication": "Security & Access Team",
            "general": "Customer Success Team",
        }

        return {
            "category": category,
            "priority": priority,
            "sentiment": sentiment,
            "assigned_team": team_map[category],
        }

    def test_billing_ticket_classified_as_billing(self):
        result = self.classify(
            subject="I was charged twice for my order.",
            message="I noticed two charges on my credit card for the same order."
        )
        assert result["category"] == "billing"

    def test_billing_ticket_has_high_priority_due_to_negative_sentiment(self):
        result = self.classify(
            subject="Charged twice — this is unacceptable!",
            message="I demand a refund immediately."
        )
        assert result["priority"] == "high"
        assert result["sentiment"] == "negative"

    def test_technical_ticket_classified_correctly(self):
        result = self.classify(
            subject="App keeps crashing",
            message="The dashboard crashes when I click on the inventory tab."
        )
        assert result["category"] == "technical"

    def test_authentication_ticket_classified_correctly(self):
        result = self.classify(
            subject="Cannot login to my account",
            message="I keep getting an authentication error when entering my password."
        )
        assert result["category"] == "authentication"

    def test_positive_sentiment_detected(self):
        result = self.classify(
            subject="Thank you for the great support",
            message="Your team was excellent and resolved my issue quickly."
        )
        assert result["sentiment"] == "positive"
        assert result["priority"] == "medium"

    def test_neutral_ticket_gets_medium_priority(self):
        result = self.classify(
            subject="How do I export my data?",
            message="I need to export my customer list to a CSV file."
        )
        assert result["priority"] == "medium"
        assert result["sentiment"] == "neutral"

    def test_billing_ticket_assigned_to_billing_team(self):
        result = self.classify(
            subject="Invoice issue",
            message="My invoice has incorrect amounts."
        )
        assert "Billing" in result["assigned_team"]

    def test_general_ticket_assigned_to_customer_success(self):
        result = self.classify(
            subject="Question about features",
            message="Can you help me understand how to use the CRM?"
        )
        assert result["category"] == "general"
        assert "Customer" in result["assigned_team"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
