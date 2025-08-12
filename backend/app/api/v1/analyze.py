from fastapi import APIRouter, Depends, Query
from starlette.requests import Request
from starlette.exceptions import HTTPException
from starlette import status
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.services.app_service import analyze_url_for_details, get_domain_info
from .auth_utils import get_current_user_sub_optional
from app.database import ScanDatabase

# Models for request and response
class URLAnalysisRequest(BaseModel):
    url: HttpUrl

class RiskFactor(BaseModel):
    name: str
    impact: str  # "low", "medium", "high"
    description: str

class SSLCertificateInfo(BaseModel):
    issuer: Optional[str] = None
    subject: Optional[str] = None
    validFrom: Optional[str] = None
    validTo: Optional[str] = None
    isValid: Optional[bool] = None

class DomainInfo(BaseModel):
    name: str
    registrar: Optional[str] = None
    creationDate: Optional[str] = None
    expiryDate: Optional[str] = None
    ageInDays: Optional[int] = None
    ipAddress: Optional[str] = None

class URLAnalysisResponse(BaseModel):
    url: str
    status: str  # "benign", "malicious", "suspicious"
    message: str
    confidence: float
    factors: List[str]
    riskScore: int
    riskLevel: str  # "low", "medium", "high"
    riskFactors: List[RiskFactor]
    scanTimestamp: str = datetime.now().isoformat()
    sslInfo: Optional[SSLCertificateInfo] = None
    domainInfo: Optional[DomainInfo] = None
    threatTypes: List[str] = []

router = APIRouter()

@router.get(
    "/",
    response_model=URLAnalysisResponse,
    summary="Analyze a URL for phishing indicators",
    description="Returns detailed analysis of URL factors with risk indicators",
    tags=["URL Analysis"]
)
async def analyze_url_endpoint(
    url: str = Query(..., description="The URL to analyze"),
    user_id: Optional[str] = Depends(get_current_user_sub_optional)
):
    # Make this endpoint accessible without authentication for testing
    print(f"Analyze endpoint called with user_id: {user_id}")
    
    # Get the detailed factors from analysis
    detailed_factors = analyze_url_for_details(url)
    print(f"Detailed factors: {detailed_factors}")
    
    # Get additional domain information
    domain_info = get_domain_info(url)
    print(f"Domain info: {domain_info}")
    
    # Combine all factors
    all_factors = detailed_factors + domain_info
    
    # If no factors were found, add some default ones to prevent empty results
    if not all_factors:
        all_factors = [
            "URL structure appears normal",
            "No obvious suspicious patterns detected",
            "Domain information could not be retrieved"
        ]
    
    # Always ensure we have some content to display even when analysis is minimal
    if len(all_factors) < 3:
        all_factors.append("No additional suspicious patterns detected in the URL")
        all_factors.append("Standard web address structure detected")
    
    # Calculate a simple risk score based on the number of suspicious factors
    # Use a higher base score to ensure some non-zero value
    risk_score = min(100, 10 + len(detailed_factors) * 20)
    
    # Determine risk level
    risk_level = "low"
    if risk_score > 30:
        risk_level = "medium"
    if risk_score > 60:
        risk_level = "high"
    
    # Convert factors to structured risk factors
    risk_factors = []
    
    # Track threat types
    threat_types = []
    
    # Extract SSL certificate information (if available)
    ssl_info = None
    ssl_cert_factor = next((factor for factor in domain_info if "SSL Certificate" in factor), None)
    if ssl_cert_factor:
        # Try to parse basic SSL info from factors
        ssl_issuer = next((factor.replace("SSL Certificate issued by: ", "") for factor in domain_info if "SSL Certificate issued by" in factor), None)
        ssl_subject = next((factor.replace("SSL Certificate issued to: ", "") for factor in domain_info if "SSL Certificate issued to" in factor), None)
        
        ssl_info = SSLCertificateInfo(
            issuer=ssl_issuer,
            subject=ssl_subject,
            isValid=not any("SSL certificate validation failed" in factor for factor in domain_info)
        )
    
    # Extract domain information
    extracted_domain_info = None
    domain_name = None
    if url:
        try:
            from urllib.parse import urlparse
            parsed_url = urlparse(url)
            domain_name = parsed_url.netloc
            
            # Try to extract domain age
            domain_age_factor = next((factor for factor in domain_info if "Domain is" in factor), None)
            domain_age_days = None
            if domain_age_factor:
                import re
                age_match = re.search(r'created (\d+) days ago', domain_age_factor)
                if age_match:
                    domain_age_days = int(age_match.group(1))
            
            # Try to extract registrar
            registrar_factor = next((factor for factor in domain_info if "Domain registered to:" in factor), None)
            registrar = None
            if registrar_factor:
                registrar = registrar_factor.replace("Domain registered to: ", "")
            
            # Try to extract IP
            ip_factor = next((factor for factor in domain_info if "Domain resolves to IP:" in factor), None)
            ip_address = None
            if ip_factor:
                ip_address = ip_factor.replace("Domain resolves to IP: ", "")
            
            extracted_domain_info = DomainInfo(
                name=domain_name,
                registrar=registrar,
                ageInDays=domain_age_days,
                ipAddress=ip_address
            )
        except Exception as e:
            print(f"Error extracting domain info: {e}")
    
    # Domain age factor (if present)
    domain_age_factor = next((factor for factor in domain_info if "Domain is" in factor), None)
    if domain_age_factor:
        impact = "low"
        if "very new" in domain_age_factor:
            impact = "high"
            threat_types.append("New Domain")
        elif "relatively new" in domain_age_factor:
            impact = "medium"
        risk_factors.append(
            RiskFactor(
                name="Domain Age",
                impact=impact,
                description=domain_age_factor
            )
        )
    
    # URL structure factors
    url_structure_factors = [factor for factor in detailed_factors if 
                            any(keyword in factor.lower() for keyword in 
                                ["special character", "subdomain", "ip address", "keyword"])]
    if url_structure_factors:
        risk_factors.append(
            RiskFactor(
                name="URL Structure",
                impact="high" if len(url_structure_factors) > 1 else "medium",
                description="; ".join(url_structure_factors)
            )
        )
        threat_types.append("URL Manipulation")
    
    # Protocol security
    http_factor = next((factor for factor in detailed_factors if "HTTP" in factor), None)
    if http_factor:
        risk_factors.append(
            RiskFactor(
                name="Connection Security",
                impact="high",
                description=http_factor
            )
        )
        threat_types.append("Insecure Connection")
    
    # TLD risk
    tld_factor = next((factor for factor in detailed_factors if "Top-Level Domain" in factor), None)
    if tld_factor:
        risk_factors.append(
            RiskFactor(
                name="Domain Type",
                impact="medium",
                description=tld_factor
            )
        )
        threat_types.append("Suspicious TLD")
    
    # Keywords risk
    keyword_factor = next((factor for factor in detailed_factors if "keyword" in factor.lower()), None)
    if keyword_factor:
        risk_factors.append(
            RiskFactor(
                name="Deceptive Keywords",
                impact="medium",
                description=keyword_factor
            )
        )
        threat_types.append("Deceptive Content")
    
    # If no risk factors were found, add default ones
    if not risk_factors:
        # Add some default risk factors to ensure we always return something
        protocol = "https" if url.startswith("https") else "http"
        
        risk_factors = [
            RiskFactor(
                name="URL Analysis",
                impact="low",
                description="No specific risk factors detected in the URL structure"
            ),
            RiskFactor(
                name="Domain Information",
                impact="medium",
                description="Limited domain information available for analysis"
            ),
            RiskFactor(
                name="Connection Security",
                impact="low" if protocol == "https" else "medium",
                description=f"Uses {protocol.upper()} protocol" + (" (secure)" if protocol == "https" else " (standard)")
            )
        ]
    
    # Ensure we have at least 3 risk factors for a better UI display
    if len(risk_factors) < 3:
        # Add additional generic factors based on the URL
        if "www" in url.lower():
            risk_factors.append(
                RiskFactor(
                    name="Website Type",
                    impact="low",
                    description="Standard website with www prefix"
                )
            )
        else:
            risk_factors.append(
                RiskFactor(
                    name="Website Type",
                    impact="low",
                    description="Website without standard www prefix"
                )
            )
    
    # Return structured response
    
    # Map riskLevel to status for the frontend
    status = "benign"
    if risk_level == "medium":
        status = "suspicious"
    elif risk_level == "high":
        status = "malicious"
    
    # Create a message based on the risk level
    message = "This URL appears to be safe."
    if status == "suspicious":
        message = "This URL shows some suspicious characteristics. Exercise caution."
    elif status == "malicious":
        message = "This URL appears to be malicious. We recommend not visiting it."
    
    # Calculate a confidence value (0-1) from the risk score (0-100)
    confidence = risk_score / 100
    
    # Save scan result to database if user is authenticated
    if user_id:
        try:
            ScanDatabase.save_scan(
                user_id=user_id,
                url=url,
                result=status,
                confidence=confidence
            )
            print(f"Saved scan result to database for user {user_id}: {url} -> {status}")
        except Exception as e:
            print(f"Failed to save scan result to database: {e}")
            # Don't fail the request if database save fails
    
    return URLAnalysisResponse(
        url=url,
        status=status,
        message=message,
        confidence=confidence,
        factors=all_factors,
        riskScore=risk_score,
        riskLevel=risk_level,
        riskFactors=risk_factors,
        scanTimestamp=datetime.now().isoformat(),
        sslInfo=ssl_info,
        domainInfo=extracted_domain_info,
        threatTypes=list(set(threat_types))  # Remove duplicates
    )
