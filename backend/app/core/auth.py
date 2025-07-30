# backend/app/core/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import InvalidTokenError
from datetime import datetime, timedelta
import os

# Security scheme for JWT Bearer token
security = HTTPBearer()

# In a real application, these would be environment variables
# For this example, we'll use hardcoded values
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "linkshield_development_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def create_access_token(data: dict):
    """Create a new JWT token for a user"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    """Decode and validate a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get the current user from JWT token"""
    token = credentials.credentials
    
    # For development/demo purposes: Allow a dummy user if no token is provided or invalid
    # In a real app, you would raise an exception here
    if not token:
        # Fallback dummy user for testing/demo
        return {
            "username": "demo_user",
            "sub": "demo_user_id",
            "email": "demo@example.com",
            "is_demo": True
        }
    
    payload = decode_token(token)
    if not payload:
        # Fallback dummy user for testing/demo
        return {
            "username": "demo_user",
            "sub": "demo_user_id",
            "email": "demo@example.com",
            "is_demo": True
        }
    
    return payload

# Optional: Function to verify the user has admin privileges
def admin_required(current_user: dict = Depends(get_current_user)):
    """Check if the current user has admin privileges"""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource"
        )
    return current_user
