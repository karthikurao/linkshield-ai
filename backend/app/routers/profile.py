from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from app.services.app_service import (
    update_user_attributes, 
    get_user_profile,  # You'll need to add this function
    change_password,   # You'll need to add this function
    initiate_forgot_password,  # You'll need to add this function
    confirm_forgot_password    # You'll need to add this function
)
from app.core.auth import get_current_user
from pydantic import BaseModel, EmailStr

# Define models for requests
class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    username: str

class ResetPasswordRequest(BaseModel):
    username: str
    confirmation_code: str
    new_password: str

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's complete profile"""
    return get_user_profile(current_user["username"])

@router.put("/update")
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile attributes"""
    return update_user_attributes(
        current_user["username"], 
        profile_data.dict(exclude_unset=True, exclude_none=True)
    )

@router.post("/change-password")
async def update_password(
    request: PasswordChangeRequest,
    current_user: dict = Depends(get_current_user),
    authorization: str = Header(...)
):
    """Change password for authenticated user"""
    token = authorization.replace("Bearer ", "")
    return change_password(token, request.current_password, request.new_password)

@router.post("/forgot-password")
async def request_password_reset(request: ForgotPasswordRequest):
    """Request a password reset code"""
    return initiate_forgot_password(request.username)

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Complete password reset with code"""
    return confirm_forgot_password(
        request.username,
        request.confirmation_code,
        request.new_password
    )