"""Lightweight integration tests for the public API surface."""

import os
import sys

import pytest

# Ensure the backend package is discoverable when tests run from the repo root
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from fastapi.testclient import TestClient

from app.main import app
from app.services import app_service


@pytest.fixture(scope="session")
def client():
    """Provide a FastAPI test client with startup/shutdown events."""
    with TestClient(app) as test_client:
        yield test_client


def test_health_endpoint_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "model_status" in data
    assert "model_details" in data


def test_predict_endpoint_without_auth_uses_fallback(client):
    response = client.post("/api/v1/predict/", json={"url": "https://example.com"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["url"].rstrip("/") == "https://example.com"
    assert payload["status"] in {"benign", "suspicious", "malicious"}
    assert 0.0 <= payload["confidence"] <= 1.0
    assert payload["scan_id"]


def test_analyze_endpoint_returns_structured_response(monkeypatch, client):
    """Patch expensive analytics helpers to keep the test deterministic."""

    def fake_analyze(url: str):
        return ["URL structure appears normal"]

    def fake_domain_info(url: str):
        return ["Domain is well established (created 365 days ago)."]

    monkeypatch.setattr(app_service, "analyze_url_for_details", fake_analyze)
    monkeypatch.setattr(app_service, "get_domain_info", fake_domain_info)

    response = client.get("/api/v1/analyze-url/", params={"url": "https://example.com"})

    assert response.status_code == 200
    payload = response.json()
    assert payload["url"].rstrip("/") == "https://example.com"
    assert payload["riskLevel"] in {"low", "medium", "high"}
    assert 0.0 <= payload["confidence"] <= 1.0
    assert payload["riskScore"] >= 0
    assert isinstance(payload["riskFactors"], list)
    assert len(payload["riskFactors"]) > 0
