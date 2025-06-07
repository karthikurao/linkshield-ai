from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, HttpUrl
from datetime import datetime
import whois
import re
from urllib.parse import urlparse

# Define our own URLInput if it's not available elsewhere
class URLInput(BaseModel):
    url: str  # Using str instead of HttpUrl for simpler testing

# Simple mock function for testing without auth dependencies
def get_current_user():
    return {"sub": "test-user-id"}

router = APIRouter()

@router.post("/analyze")
def analyze_url(url_data: URLInput, current_user: dict = Depends(get_current_user)):
    """
    Analyze a URL and return structured factors with impact indicators.
    This endpoint enhances the standard prediction with detailed factor analysis.
    """
    # Parse the URL
    url = url_data.url
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    
    # Get domain information (if available)
    domain_info = None
    try:
        domain_info = whois.whois(domain)
    except Exception:
        pass
        
    # Initialize factors list
    factors = []
    
    # Add domain age factor
    if domain_info and "creation_date" in domain_info:
        creation_date = domain_info["creation_date"]
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
            
        domain_age = (datetime.now() - creation_date).days
        factors.append({
            "name": "Domain Age",
            "value": f"{domain_age} days",
            "impact": "positive" if domain_age > 180 else "negative",
            "description": "Older domains are typically more trustworthy"
        })
    
    # Add URL length factor
    url_length = len(url_data.url)
    factors.append({
        "name": "URL Length",
        "value": str(url_length),
        "impact": "negative" if url_length > 75 else "positive",
        "description": "Excessively long URLs may indicate phishing attempts"
    })
    
    # TLD factor
    tld = url.split('.')[-1].lower() if '.' in url else ''
    common_tlds = ['com', 'org', 'net', 'edu', 'gov']
    factors.append({
        "name": "TLD Type",
        "value": tld,
        "impact": "positive" if tld in common_tlds else "negative",
        "description": "Common TLDs are generally safer than unusual ones"
    })
    
    # Special characters in domain
    domain = url.split('//')[-1].split('/')[0] if '//' in url else url.split('/')[0]
    special_chars = sum(1 for c in domain if not c.isalnum() and c != '.' and c != '-')
    factors.append({
        "name": "Special Characters",
        "value": str(special_chars),
        "impact": "negative" if special_chars > 1 else "positive",
        "description": "Multiple special characters in a domain may indicate deception"
    })
    
    # HTTPS factor
    is_https = url.startswith('https://')
    factors.append({
        "name": "HTTPS",
        "value": "Yes" if is_https else "No",
        "impact": "positive" if is_https else "negative",
        "description": "HTTPS indicates the connection is encrypted"
    })
    
    # Suspicious Keywords
    suspicious_keywords = ['login', 'secure', 'account', 'update', 'signin', 'verify', 'password']
    found_keywords = [k for k in suspicious_keywords if k in url.lower()]
    if found_keywords:
        factors.append({
            "name": "Suspicious Keywords",
            "value": ", ".join(found_keywords),
            "impact": "negative",
            "description": "URLs with sensitive terms may be attempting to mimic legitimate sites"
        })
    
    # Subdomain count
    subdomains = domain.split('.')
    subdomain_count = len(subdomains) - 2 if len(subdomains) > 2 else 0
    factors.append({
        "name": "Subdomain Count", 
        "value": str(subdomain_count),
        "impact": "negative" if subdomain_count > 2 else "positive",
        "description": "Excessive subdomains can be used to create misleading URLs"
    })
    
    # Path length
    path_length = len(parsed_url.path)
    factors.append({
        "name": "Path Length",
        "value": str(path_length),
        "impact": "negative" if path_length > 50 else "positive",
        "description": "Extremely long paths can be used to obscure malicious destinations"
    })
    
    # Use mock data for demonstration
    # In a real implementation, these would come from your ML model
    prediction_result = "benign"  # This would come from your ML model
    confidence_score = 0.85  # This would come from your ML model
    
    return {
        "prediction": prediction_result,
        "confidence": confidence_score,
        "url": url_data.url,
        "timestamp": datetime.now().isoformat(),
        "factors": factors
    }