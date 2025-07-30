# backend/app/api/v1/profile.py
from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from app.database import UserDatabase
from .auth_utils import get_current_user_sub
from pydantic import BaseModel
from typing import Optional

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: str

class ProfileUpdateResponse(BaseModel):
    status: str
    message: str
    user: ProfileResponse

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
async def get_profile(user_id: str = Depends(get_current_user_sub)):
    """Get the current user's profile information"""
    user = UserDatabase.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return ProfileResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"]
    )

@router.put("/me", response_model=ProfileUpdateResponse)
async def update_profile(
    profile_data: ProfileUpdateRequest,
    user_id: str = Depends(get_current_user_sub)
):
    """Update the current user's profile information"""
    # Get current user data
    user = UserDatabase.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update only provided fields
    update_name = profile_data.name if profile_data.name is not None else None
    update_email = profile_data.email if profile_data.email is not None else None
    
    if update_name is None and update_email is None:
        # No updates provided
        return ProfileUpdateResponse(
            status="success",
            message="No changes to update",
            user=ProfileResponse(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                created_at=user["created_at"]
            )
        )
    
    # Perform the update
    success = UserDatabase.update_user_profile(
        user_id=user_id,
        name=update_name,
        email=update_email
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
    
    # Get updated user data
    updated_user = UserDatabase.get_user_by_id(user_id)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve updated profile"
        )
    
    return ProfileUpdateResponse(
        status="success",
        message="Profile updated successfully",
        user=ProfileResponse(
            id=updated_user["id"],
            name=updated_user["name"],
            email=updated_user["email"],
            created_at=updated_user["created_at"]
        )
    )
