# backend/app/models/url.py
from typing import List, Optional
from pydantic import BaseModel, HttpUrl

class URLScanRequest(BaseModel):
    url: HttpUrl # Pydantic's HttpUrl type provides URL validation

class URLScanResponse(BaseModel):
    url: str
    scan_id: str
    status: str
    message: str
    confidence: float
    model_version: str
    details: List[str]
    user_id: Optional[str] = None
    scan_timestamp: str

class ErrorResponse(BaseModel):
    error: str

# At the bottom of backend/app/models/url.py

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None

class ProfileUpdateResponse(BaseModel):
    status: str
    message: str
    updated_attributes: List[str]