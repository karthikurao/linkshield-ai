# backend/app/api/v1/community.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel, HttpUrl
from datetime import datetime
import uuid

router = APIRouter()

# Models
class CommunityReport(BaseModel):
    id: str
    url: str
    reason: str
    status: str  # "pending", "confirmed", "rejected"
    reported_by: str
    reported_at: datetime
    votes: int = 0

class ReportRequest(BaseModel):
    url: str
    reason: str

class ReportResponse(BaseModel):
    id: str
    message: str
    status: str

# Mock data - in a real app, this would be in a database
MOCK_REPORTS = [
    {
        "id": "1a2b3c4d",
        "url": "http://malicious-phishing.example.com",
        "reason": "This site is impersonating a bank login page",
        "status": "confirmed",
        "reported_by": "user123",
        "reported_at": datetime.now(),
        "votes": 15
    },
    {
        "id": "2b3c4d5e",
        "url": "http://fake-crypto-wallet.example.net",
        "reason": "Attempting to steal cryptocurrency wallet credentials",
        "status": "pending",
        "reported_by": "user456", 
        "reported_at": datetime.now(),
        "votes": 7
    },
    {
        "id": "3c4d5e6f",
        "url": "https://suspicious-login-form.example.org",
        "reason": "Suspicious login form collecting personal information",
        "status": "confirmed",
        "reported_by": "user789",
        "reported_at": datetime.now(),
        "votes": 23
    }
]

@router.get("/", response_model=List[CommunityReport])
async def get_community_reports(
    filter: str = Query("all", enum=["all", "pending", "confirmed", "rejected"])
):
    """Get community-reported phishing URLs with optional filtering"""
    if filter == "all":
        return MOCK_REPORTS
    
    filtered_reports = [report for report in MOCK_REPORTS if report["status"] == filter]
    return filtered_reports

@router.post("/", response_model=ReportResponse)
async def submit_community_report(
    report: ReportRequest
):
    """Submit a new community report for a suspicious URL"""
    # In a real implementation, this would add to a database
    report_id = str(uuid.uuid4())[:8]
    
    # Acknowledge the submission - in a real app, save to database
    return {
        "id": report_id,
        "message": "Report submitted successfully and pending review",
        "status": "pending"
    }

@router.post("/{report_id}/vote", response_model=dict)
async def vote_on_report(
    report_id: str,
    vote_type: str = Query(..., enum=["up", "down"])
):
    """Vote on an existing community report"""
    # In a real implementation, this would update a vote in the database
    return {
        "message": f"{vote_type.capitalize()}vote recorded successfully",
        "report_id": report_id
    }
