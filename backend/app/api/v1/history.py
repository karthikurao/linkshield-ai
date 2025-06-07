# backend/app/api/v1/history.py
from fastapi import APIRouter, status, Depends
from typing import List
from app.models.url import URLScanResponse, ErrorResponse 
# --- THIS IS THE CORRECTED IMPORT ---
from app.services.app_service import get_scan_history

router = APIRouter()

@router.get(
    "/",
    response_model=List[URLScanResponse],
    summary="Retrieve recent URL scan history",
    tags=["History"]
)
async def retrieve_history(limit: int = 20):
    """
    Retrieves a list of the most recent URL scan results.
    - **limit**: The maximum number of items to return (default: 20).
    """
    history_items = get_scan_history(limit=limit)
    return history_items