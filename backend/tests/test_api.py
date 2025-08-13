"""
Basic API tests for LinkShield AI
"""
import pytest
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

try:
    from fastapi.testclient import TestClient
    from app.main import app
    from app.core.config import settings
    import jwt
    from datetime import datetime, timedelta
    
    client = TestClient(app)
    TEST_CLIENT_AVAILABLE = True
except Exception as e:
    print(f"Warning: Could not initialize test client: {e}")
    TEST_CLIENT_AVAILABLE = False


def create_test_token(user_id="test_user", exp_minutes=30):
    """Create a test JWT token for authentication"""
    try:
        expire = datetime.utcnow() + timedelta(minutes=exp_minutes)
        to_encode = {"sub": user_id, "exp": expire}
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
        return encoded_jwt
    except Exception:
        return "test_token"


@pytest.fixture
def auth_header():
    token = create_test_token()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_url():
    return "https://example.com/login"


@pytest.fixture
def phishing_url():
    return "https://suspicious-login-secure.example.com/verify-account"


def test_environment_setup():
    """Test that the environment is set up correctly"""
    assert os.path.exists(os.path.join(os.path.dirname(__file__), '..', 'app'))
    assert os.path.exists(os.path.join(os.path.dirname(__file__), '..', 'app', 'main.py'))


@pytest.mark.skipif(not TEST_CLIENT_AVAILABLE, reason="Test client not available")
def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] in ["healthy", "ok"]


@pytest.mark.skipif(not TEST_CLIENT_AVAILABLE, reason="Test client not available")
def test_predict_endpoint_without_auth():
    """Test the predict endpoint without authentication"""
    response = client.post(
        "/api/v1/predict/",
        json={"url": "https://google.com"}
    )
    # Should work without auth (guest access)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data


@pytest.mark.skipif(not TEST_CLIENT_AVAILABLE, reason="Test client not available")
def test_analyze_endpoint_without_auth():
    """Test the analyze endpoint without authentication"""
    response = client.post(
        "/api/v1/analyze-url/",
        json={"url": "https://google.com"}
    )
    # Should work without auth (guest access)
    assert response.status_code == 200
    data = response.json()
    assert "url" in data


def test_token_creation():
    """Test JWT token creation"""
    token = create_test_token("test_user", 30)
    assert token is not None
    assert len(token) > 10  # Basic sanity check


def test_basic_imports():
    """Test that required modules can be imported"""
    try:
        import fastapi
        import uvicorn
        import pydantic
        import jwt
        assert True
    except ImportError as e:
        pytest.fail(f"Failed to import required module: {e}")


if __name__ == "__main__":
    # Allow running tests directly
    pytest.main([__file__, "-v"])

# Tests
def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_scan_url_without_auth():
    """Test URL scan endpoint without authentication"""
    response = client.post(
        "/api/v1/scan",
        json={"url": "https://example.com"}
    )
    assert response.status_code == 401

def test_scan_legitimate_url(auth_header, sample_url):
    """Test scanning a legitimate URL"""
    response = client.post(
        "/api/v1/scan",
        headers=auth_header,
        json={"url": sample_url}
    )
    assert response.status_code == 200
    data = response.json()
    assert "scan_id" in data
    assert "url" in data
    assert data["url"] == sample_url
    assert "is_phishing" in data
    assert data["is_phishing"] is False
    assert "confidence" in data
    assert data["confidence"] > 0.7

def test_scan_phishing_url(auth_header, phishing_url):
    """Test scanning a phishing URL"""
    response = client.post(
        "/api/v1/scan",
        headers=auth_header,
        json={"url": phishing_url}
    )
    assert response.status_code == 200
    data = response.json()
    assert "is_phishing" in data
    assert data["is_phishing"] is True
    assert "confidence" in data
    assert data["confidence"] > 0.7

def test_invalid_url_format(auth_header):
    """Test scanning with invalid URL format"""
    response = client.post(
        "/api/v1/scan",
        headers=auth_header,
        json={"url": "not-a-valid-url"}
    )
    assert response.status_code == 422

def test_get_scan_history(auth_header):
    """Test retrieving scan history"""
    response = client.get(
        "/api/v1/history",
        headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert "scans" in data
    assert isinstance(data["scans"], list)

def test_get_scan_by_id(auth_header):
    """Test retrieving a specific scan by ID"""
    # First create a scan
    scan_response = client.post(
        "/api/v1/scan",
        headers=auth_header,
        json={"url": "https://example.com"}
    )
    scan_data = scan_response.json()
    scan_id = scan_data["scan_id"]
    
    # Then retrieve it
    response = client.get(
        f"/api/v1/scan/{scan_id}",
        headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert data["scan_id"] == scan_id
    assert data["url"] == "https://example.com"

def test_user_profile(auth_header):
    """Test retrieving user profile"""
    response = client.get(
        "/api/v1/profile",
        headers=auth_header
    )
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "email" in data
    assert "name" in data

def test_expired_token():
    """Test using an expired token"""
    expired_token = create_test_token(exp_minutes=-10)
    headers = {"Authorization": f"Bearer {expired_token}"}
    
    response = client.get(
        "/api/v1/profile",
        headers=headers
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Token has expired"

def test_analyze_url():
    """Test the analyze URL endpoint"""
    response = client.get(
        "/api/v1/analyze-url/",
        params={"url": "https://example.com"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    assert data["url"] == "https://example.com"
    assert "status" in data
    assert "confidence" in data
    assert "riskScore" in data
    assert "riskLevel" in data
    assert "riskFactors" in data
    assert isinstance(data["riskFactors"], list)
