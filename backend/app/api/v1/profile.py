# backend/app/api/v1/profile.py
from fastapi import APIRouter, Depends, Header, HTTPException
from starlette import status
from app.models.url import ProfileUpdateRequest, ProfileUpdateResponse, ErrorResponse
from app.services.app_service import (
    update_user_attributes,
    get_user_profile,
    change_password as service_change_password,
    initiate_forgot_password,
    confirm_forgot_password,    
)
from .auth_utils import get_current_user_sub
from typing import Optional
from pydantic import BaseModel

# Additional models needed for password management
class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    username: str

class PasswordResetRequest(BaseModel):
    username: str
    confirmation_code: str
    new_password: str

router = APIRouter()

@router.put(
    "/me", 
    response_model=ProfileUpdateResponse,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not authenticated"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Update authenticated user's profile",
    tags=["Profile"]
)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_sub) 
):
    updated_info = update_user_attributes(
        username=user_id,
        attributes_to_update=profile_data.dict()
    )
    return ProfileUpdateResponse(
        status="success",
        message="Profile updated successfully.",
        updated_attributes=updated_info['updated_attributes']
    )

# Add a GET endpoint to retrieve full profile data
@router.get(
    "/me",
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not authenticated"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Get authenticated user's complete profile",
    tags=["Profile"]
)
async def get_profile(user_id: str = Depends(get_current_user_sub)):
    """Get the complete profile of the authenticated user"""
    profile_data = get_user_profile(user_id)
    return profile_data

# Add password change endpoint
@router.post(
    "/change-password",
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse, "description": "Not authenticated"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Change user password",
    tags=["Profile"]
)
async def change_password(
    request: PasswordChangeRequest,
    user_id: str = Depends(get_current_user_sub),
    authorization: str = Header(...)
):
    """Change the password for the authenticated user"""
    
    # Extract access token from header
    token = authorization.replace("Bearer ", "")
    result = service_change_password(token, request.old_password, request.new_password)
    return result

# Add forgot password endpoint (no auth required)
@router.post(
    "/forgot-password",
    responses={
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Initiate forgot password flow",
    tags=["Profile"]
)
async def forgot_password(request: ForgotPasswordRequest):
    """Request a password reset code via email"""
    
    result = initiate_forgot_password(request.username)
    return result

# Add reset password endpoint (no auth required)
@router.post(
    "/reset-password",
    responses={
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Complete password reset with code",
    tags=["Profile"]
)
async def reset_password(request: PasswordResetRequest):
    """Reset password using the verification code"""
    
    result = confirm_forgot_password(
        request.username, 
        request.confirmation_code, 
        request.new_password
    )
    return result