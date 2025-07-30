# backend/app/api/v1/history.py
from fastapi import APIRouter, status, Depends
from typing import List
from app.models.url import URLScanResponse, ErrorResponse 
from app.database import ScanDatabase
from .auth_utils import get_current_user_sub

router = APIRouter()

@router.get(
    "/",
    response_model=List[dict],
    summary="Retrieve recent URL scan history",
    tags=["History"]
)
async def retrieve_history(
    limit: int = 20,
    user_id: str = Depends(get_current_user_sub)
):
    """
    Retrieves a list of the most recent URL scan results for the authenticated user.
    - **limit**: The maximum number of items to return (default: 20).
    """
    history_items = ScanDatabase.get_user_scan_history(user_id=user_id, limit=limit)
    return history_items