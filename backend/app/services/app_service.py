# backend/app/services/app_service.py
from fastapi import HTTPException, status
from app.models.url import URLScanResponse
from transformers import BertForSequenceClassification, BertTokenizer
import torch
import uuid
import boto3
from decimal import Decimal
import os
from datetime import datetime, timezone
from typing import List, Optional
from urllib.parse import urlparse
import re
import socket
import ssl
import requests
import whois
from datetime import datetime

# Import configuration which loads environment variables
from app.core import config

# ... (AWS Service Client Initialization remains the same) ...
try:
    dynamodb = boto3.resource('dynamodb', region_name=config.AWS_REGION)
    cognito_client = boto3.client('cognito-idp', region_name=config.AWS_REGION)
    scan_history_table = dynamodb.Table(config.SCAN_HISTORY_TABLE_NAME)
except Exception as e:
    print(f"Error initializing AWS clients: {e}")
    dynamodb = cognito_client = scan_history_table = None


# --- NEW: Fallback Prediction Function ---
def get_fallback_prediction(url: str, user_id: Optional[str] = None) -> URLScanResponse:
    """
    Provides a fallback prediction when the ML model is not available.
    Uses rule-based heuristics to estimate phishing likelihood.
    """
    print(f"Using fallback prediction for URL: {url}")
    parsed_url = urlparse(url)
    hostname = parsed_url.hostname or ""
    path = parsed_url.path
    query = parsed_url.query
    
    # Initialize score (0-100)
    risk_score = 50  # Start with neutral score
    risk_factors = []
    details = []
    
    # Analyze URL components
    
    # 1. Check if uses HTTPS
    if parsed_url.scheme != 'https':
        risk_score += 10
        risk_factors.append({
            "name": "Insecure Protocol", 
            "impact": "medium", 
            "description": "Uses HTTP instead of secure HTTPS connection"
        })
        details.append("Uses insecure HTTP protocol instead of HTTPS.")
    
    # 2. Check for suspicious TLD
    suspicious_tlds = ['.xyz', '.tk', '.top', '.club', '.gq', '.ml', '.ga', '.cf', '.info']
    if any(hostname.endswith(tld) for tld in suspicious_tlds):
        risk_score += 15
        risk_factors.append({
            "name": "Suspicious TLD", 
            "impact": "high", 
            "description": f"Uses suspicious top-level domain: {parsed_url.netloc.split('.')[-1]}"
        })
        details.append(f"Uses potentially suspicious top-level domain: {parsed_url.netloc.split('.')[-1]}")
    
    # 3. Check for IP address as hostname
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
        risk_score += 20
        risk_factors.append({
            "name": "IP Address URL", 
            "impact": "high", 
            "description": "Uses an IP address instead of a domain name"
        })
        details.append("URL uses an IP address instead of a domain name (highly suspicious).")
    
    # 4. Check for excessive subdomains
    subdomain_count = len(hostname.split('.')) - 2 if hostname and len(hostname.split('.')) > 2 else 0
    if subdomain_count > 3:
        risk_score += 10
        risk_factors.append({
            "name": "Many Subdomains", 
            "impact": "medium", 
            "description": f"Contains an unusual number of subdomains ({subdomain_count})"
        })
        details.append(f"Contains {subdomain_count} subdomains, which can be a sign of obfuscation.")
    
    # 5. Check for long hostname
    if len(hostname) > 30:
        risk_score += 5
        risk_factors.append({
            "name": "Long Domain", 
            "impact": "low", 
            "description": f"Domain name is unusually long ({len(hostname)} characters)"
        })
        details.append(f"Domain name is unusually long ({len(hostname)} characters).")
    
    # 6. Check for suspicious words in hostname
    suspicious_words = ['secure', 'login', 'verify', 'account', 'banking', 'update', 'confirm']
    found_words = [word for word in suspicious_words if word in hostname.lower()]
    if found_words:
        risk_score += len(found_words) * 5
        risk_factors.append({
            "name": "Suspicious Keywords", 
            "impact": "medium", 
            "description": f"Domain contains potentially deceptive terms: {', '.join(found_words)}"
        })
        details.append(f"URL contains potentially sensitive keywords: {', '.join(found_words)}.")
    
    # 7. Check for special characters in hostname
    if re.search(r"[^\w\-\.]", hostname):
        risk_score += 15
        risk_factors.append({
            "name": "Special Characters", 
            "impact": "high", 
            "description": "URL contains unusual special characters"
        })
        details.append("URL contains unusual special characters, which can be used for deception.")
    
    # 8. Check path length
    if len(path) > 100:
        risk_score += 5
        risk_factors.append({
            "name": "Long Path", 
            "impact": "low", 
            "description": f"URL path is unusually long ({len(path)} characters)"
        })
        details.append(f"URL path is excessively long ({len(path)} characters).")
    
    # 9. Check for excessive query parameters
    query_params = query.split('&') if query else []
    if len(query_params) > 10:
        risk_score += 5
        risk_factors.append({
            "name": "Many Parameters", 
            "impact": "low", 
            "description": f"URL contains many query parameters ({len(query_params)})"
        })
        details.append(f"URL contains many query parameters ({len(query_params)}).")
    
    # Get additional domain information if available
    try:
        domain_info = get_domain_info(url)
        if domain_info:
            details.extend(domain_info)
    except Exception as e:
        print(f"Error getting domain info: {e}")
    
    # Cap the score at 100
    risk_score = min(risk_score, 100)
    
    # Determine risk level based on score
    if risk_score < 30:
        risk_level = "low"
        status = "benign"
    elif risk_score < 70:
        risk_level = "medium"
        status = "suspicious"
    else:
        risk_level = "high"
        status = "malicious"
    
    # Add note that this is a fallback prediction
    details.append("Note: This prediction was made using fallback heuristics as the ML model is currently unavailable.")
    
    # Create scan_id and timestamp
    scan_id = str(uuid.uuid4())
    scan_timestamp = datetime.now(timezone.utc).isoformat()
    
    # Create result
    result = URLScanResponse(
        url=url,
        scan_id=scan_id,
        status=status,
        message=f"URL classified as {status.upper()} using fallback detection.",
        confidence=risk_score / 100,  # Convert to 0-1 range
        model_version="linkshield-fallback-v1.0",
        details=details,
        user_id=user_id,
        scan_timestamp=scan_timestamp
    )
      # Save scan to history if user is authenticated
    if user_id and scan_history_table:
        try:
            # Store the scan result in the history table
            item = {                'scan_id': result.scan_id,
                'user_id': user_id,
                'url': result.url,
                'status': result.status,
                'confidence': Decimal(str(result.confidence)),
                'scan_timestamp': result.scan_timestamp,
                'risk_level': risk_level,
                'risk_score': Decimal(str(risk_score))
            }
            scan_history_table.put_item(Item=item)
            print(f"Stored scan in history for user {user_id}: {result.scan_id}")
        except Exception as e:
            print(f"Error storing scan in history: {e}")
    
    return result

def analyze_url_for_details(url: str) -> List[str]:
    """Analyzes a URL for phishing indicators and returns detailed explanations."""
    details = []
    try:
        parsed_url = urlparse(url)
        hostname = parsed_url.netloc
        
        # 1. HTTPS Check
        if parsed_url.scheme != 'https':
            details.append("Uses insecure HTTP protocol instead of HTTPS.")
        
        # 2. IP Address as Hostname
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
            details.append("URL hostname is a raw IP address (Suspicious).")

        # 3. Subdomain Count
        if hostname:
            subdomain_count = len(hostname.split('.'))
            if subdomain_count > 3: # e.g., mail.google.com is 3. more than that can be suspicious.
                details.append(f"Contains {subdomain_count} subdomains, which can be a sign of obfuscation.")

        # 4. Suspicious TLDs
        suspicious_tlds = ['.xyz', '.top', '.club', '.info', '.loan', '.gq', '.tk']
        tld = os.path.splitext(hostname)[1]
        if tld in suspicious_tlds:
            details.append(f"Uses an uncommon or suspicious Top-Level Domain (TLD): {tld}.")

        # 5. Suspicious Keywords
        suspicious_keywords = ['login', 'secure', 'account', 'update', 'signin', 'verify', 'password']
        for keyword in suspicious_keywords:
            if keyword in url.lower():
                details.append(f"URL contains a potentially sensitive keyword: '{keyword}'.")
                break # Only report the first one found for brevity

        # 6. Count of special characters
        special_chars = ['@', '?', '=', '%', '&']
        special_char_count = sum(url.count(char) for char in special_chars)
        if special_char_count > 3:
            details.append(f"Contains a high number of special characters ({special_char_count}).")

    except Exception as e:
        print(f"Error during URL analysis: {e}")
        details.append("Could not perform detailed structural analysis on the URL.")
    
    return details


def get_domain_info(url: str) -> List[str]:
    """
    Fetches additional domain information for enhanced explainability.
    """
    details = []
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        if not domain:
            return details
        
        # 1. Domain Age Check
        try:
            domain_info = whois.whois(domain)
            if domain_info.creation_date:
                creation_date = domain_info.creation_date
                if isinstance(creation_date, list):
                    creation_date = creation_date[0]
                
                domain_age_days = (datetime.now() - creation_date).days
                if domain_age_days < 30:
                    details.append(f"Domain is very new (created {domain_age_days} days ago) - potentially suspicious.")
                elif domain_age_days < 90:
                    details.append(f"Domain is relatively new (created {domain_age_days} days ago).")
                else:
                    details.append(f"Domain is well established (created {domain_age_days} days ago).")
                
                details.append(f"Domain registered to: {domain_info.registrar or 'Unknown'}")
        except Exception as e:
            print(f"WHOIS lookup failed: {e}")
        
        # 2. DNS Records Check
        try:
            ip_address = socket.gethostbyname(domain)
            details.append(f"Domain resolves to IP: {ip_address}")
        except:
            details.append("Could not resolve domain to an IP address - potentially suspicious.")
          # 3. SSL Certificate Check
        if parsed_url.scheme == 'https':
            try:
                context = ssl.create_default_context()
                with socket.create_connection((domain, 443)) as sock:
                    with context.wrap_socket(sock, server_hostname=domain) as ssock:
                        cert = ssock.getpeercert()
                        if cert and 'subject' in cert:
                            subject_parts = dict(x[0] for x in cert.get('subject', []))
                            issuer_parts = dict(x[0] for x in cert.get('issuer', []))
                            
                            # Access the common name more safely
                            cn_subject = subject_parts.get('commonName', 'Unknown')
                            cn_issuer = issuer_parts.get('commonName', 'Unknown')
                            
                            details.append(f"SSL Certificate issued to: {cn_subject}")
                            details.append(f"SSL Certificate issued by: {cn_issuer}")
            except Exception as e:
                details.append("SSL certificate validation failed - potentially suspicious.")
        
        # 4. Check reputation with VirusTotal API (if you have an API key)
        if config.VIRUSTOTAL_API_KEY:  # Assume you have this in your config
            try:
                api_url = f"https://www.virustotal.com/api/v3/domains/{domain}"
                headers = {"x-apikey": config.VIRUSTOTAL_API_KEY}
                response = requests.get(api_url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    reputation = data.get("data", {}).get("attributes", {}).get("reputation", 0)
                    if reputation < 0:
                        details.append(f"Domain has negative reputation score ({reputation}) from VirusTotal.")
                    else:
                        details.append(f"Domain has positive reputation score ({reputation}) from VirusTotal.")
            except Exception as e:
                print(f"VirusTotal API error: {e}")
                
    except Exception as e:
        print(f"Error gathering domain information: {e}")
    
    return details


# --- (update_user_attributes, save_scan_to_dynamodb, get_scan_history remain the same) ---
# ...
def update_user_attributes(username: str, attributes_to_update: dict):
    if not cognito_client or not config.COGNITO_USER_POOL_ID:
        raise HTTPException(status_code=503, detail="Cognito service not configured.")
    
    # Map frontend attribute names to Cognito attribute names if needed
    cognito_attr_map = {
        'name': 'name',
        'email': 'email',
        'phone_number': 'phone_number'
        # Add any other mappings here if needed
    }
    
    # Convert to the format Cognito expects and apply mapping
    user_attributes = []
    updated_attrs = []
    
    for key, value in attributes_to_update.items():
        if value is not None and value != '':  # Skip None or empty values
            cognito_key = cognito_attr_map.get(key, key)
            user_attributes.append({'Name': cognito_key, 'Value': value})
            updated_attrs.append(key)
    
    # Print for debugging
    print(f"Updating attributes for user {username}: {user_attributes}")
    
    try:
        if user_attributes:  # Only call the API if there are attributes to update
            cognito_client.admin_update_user_attributes(
                UserPoolId=config.COGNITO_USER_POOL_ID,
                Username=username,
                UserAttributes=user_attributes
            )
            
            return {
                "status": "success",
                "message": "Profile updated successfully",
                "updated_attributes": updated_attrs
            }
        else:
            return {
                "status": "info",
                "message": "No attributes to update",
                "updated_attributes": []
            }
    except Exception as e:
        print(f"Error updating user attributes: {e}")
        raise HTTPException(status_code=500, detail=f"Could not update user attributes: {str(e)}")

def save_scan_to_dynamodb(scan_result: URLScanResponse):
    # (no changes to this function)
    if not scan_history_table: return
    try:
        item_to_save = scan_result.dict()
        item_to_save['scan_timestamp'] = datetime.now(timezone.utc).isoformat()
        if item_to_save.get('confidence') is not None: item_to_save['confidence'] = Decimal(str(item_to_save['confidence']))
        scan_history_table.put_item(Item=item_to_save)
    except Exception as e: print(f"Error saving scan result to DynamoDB: {e}")

def get_scan_history(limit: int = 10) -> List[dict]:
    # (no changes to this function)
    if not scan_history_table: return []
    try:
        response = scan_history_table.scan(Limit=limit)
        items = sorted(response.get('Items', []), key=lambda item: item.get('scan_timestamp', ''), reverse=True)
        return items
    except Exception as e: print(f"Error fetching scan history from DynamoDB: {e}"); return []


# --- UPDATED: run_prediction function to include new analysis ---
def run_prediction(
    url: str, 
    model: BertForSequenceClassification, 
    tokenizer: BertTokenizer,
    device: torch.device,
    user_id: str = None  # Add user_id parameter
) -> URLScanResponse:
    if model is None or tokenizer is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="ML model or tokenizer is not available.")

    try:
        # 1. Get model prediction (same as before)
        inputs = tokenizer(url, padding=True, truncation=True, max_length=128, return_tensors="pt").to(device)
        with torch.no_grad():
            outputs = model(**inputs)
        
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=1).squeeze()
        prediction_idx = torch.argmax(probabilities).item()
        confidence = probabilities[prediction_idx].item()
        
        status_map = {0: "benign", 1: "malicious"}
        predicted_status = status_map.get(prediction_idx, "unknown")
        
        # 2. Get explainability details with enhanced domain analysis
        explainability_details = analyze_url_for_details(url)
        
        # Fetch additional domain information
        domain_info = get_domain_info(url)
        if domain_info:
            explainability_details.extend(domain_info)
        
        # 3. Create the response object
        message = f"URL classified as {predicted_status.upper()}."
        scan_id = f"scn_{uuid.uuid4().hex[:12]}"

        # Include user info in response
        response_data = URLScanResponse(
            url=url,
            scan_id=scan_id,
            status=predicted_status,
            message=message,
            confidence=round(confidence, 4),
            model_version="linkshield-bert-v1.0",
            details=explainability_details,
            user_id=user_id,  # Add user ID if provided
            scan_timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        # 4. Save to DB and return
        save_scan_to_dynamodb(response_data)
        
        return response_data

    except Exception as e:
        print(f"Error during model inference for URL {url}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing URL with ML model: {str(e)}")


# --- NEW: User Profile and Authentication Management Functions ---
def get_user_profile(username: str):
    """
    Retrieves the complete user profile from Cognito.
    """
    if not cognito_client or not config.COGNITO_USER_POOL_ID:
        raise HTTPException(status_code=503, detail="Cognito service not configured.")
    
    try:
        user_response = cognito_client.admin_get_user(
            UserPoolId=config.COGNITO_USER_POOL_ID,
            Username=username
        )
        
        # Extract user attributes into a dictionary
        attributes = {}
        for attr in user_response.get('UserAttributes', []):
            attributes[attr['Name']] = attr['Value']
        
        # For debugging
        print(f"Retrieved attributes for user {username}: {attributes}")
            
        # Make sure all expected fields are present, even if Cognito doesn't return them
        return {
            "username": username,
            "user_id": attributes.get('sub', ''),
            "email": attributes.get('email', ''),
            "email_verified": attributes.get('email_verified', 'false') == 'true',
            "name": attributes.get('name', ''),
            "phone_number": attributes.get('phone_number', ''),
            "created_at": user_response.get('UserCreateDate').isoformat() if user_response.get('UserCreateDate') else None,
            "last_modified": user_response.get('UserLastModifiedDate').isoformat() if user_response.get('UserLastModifiedDate') else None
        }
        
    except Exception as e:
        print(f"Error retrieving user profile: {e}")
        raise HTTPException(status_code=500, detail=f"Could not retrieve user profile: {str(e)}")

def change_password(access_token: str, previous_password: str, new_password: str):
    """
    Changes the password for an authenticated user.
    """
    if not cognito_client:
        raise HTTPException(status_code=503, detail="Cognito service not configured.")
    
    try:
        cognito_client.change_password(
            AccessToken=access_token,
            PreviousPassword=previous_password,
            ProposedPassword=new_password
        )
        return {"status": "success", "message": "Password changed successfully"}
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail=f"Could not change password: {str(e)}")
        
def initiate_forgot_password(username: str):
    """
    Initiates the forgot password flow by sending a reset code.
    """
    if not cognito_client:
        raise HTTPException(status_code=503, detail="Cognito service not configured.")
    
    try:
        response = cognito_client.forgot_password(
            ClientId=config.COGNITO_APP_CLIENT_ID,
            Username=username
        )
        return {
            "status": "success",
            "message": "Password reset code sent successfully",
            "delivery": response.get('CodeDeliveryDetails', {})
        }
    except Exception as e:
        print(f"Error initiating password reset: {e}")
        raise HTTPException(status_code=500, detail=f"Could not initiate password reset: {str(e)}")

def confirm_forgot_password(username: str, confirmation_code: str, new_password: str):
    """
    Completes the forgot password flow by confirming the code and setting a new password.
    """
    if not cognito_client:
        raise HTTPException(status_code=503, detail="Cognito service not configured.")
    
    try:
        cognito_client.confirm_forgot_password(
            ClientId=config.COGNITO_APP_CLIENT_ID,
            Username=username,
            ConfirmationCode=confirmation_code,
            Password=new_password
        )
        return {"status": "success", "message": "Password reset successfully"}
    except Exception as e:
        print(f"Error confirming password reset: {e}")
        raise HTTPException(status_code=500, detail=f"Could not reset password: {str(e)}")

# This part of the file was removed because it was a duplicate function
# The get_fallback_prediction function is already defined earlier in the file