# backend/app/services/app_service.py
from fastapi import HTTPException, status
from app.models.url import URLScanResponse
# try to import transformers, but don't fail if it's not available
try:
    from transformers import BertForSequenceClassification, BertTokenizer
    transformers_available = True
except ImportError:
    transformers_available = False
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
import time
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
    suspicious_words = ['secure', 'login', 'verify', 'account', 'banking', 'update', 'confirm', 
                       'suspended', 'urgent', 'security', 'alert', 'billing', 'payment']
    found_words = [word for word in suspicious_words if word in hostname.lower()]
    if found_words:
        risk_score += len(found_words) * 8  # Increased from 5 to 8
        risk_factors.append({
            "name": "Suspicious Keywords", 
            "impact": "high",  # Changed from medium to high
            "description": f"Domain contains potentially deceptive terms: {', '.join(found_words)}"
        })
        details.append(f"URL contains potentially sensitive keywords: {', '.join(found_words)}.")
    
    # 6a. Check for brand impersonation keywords (NEW)
    brand_keywords = ['paypal', 'amazon', 'netflix', 'microsoft', 'google', 'apple', 'facebook', 'instagram']
    found_brands = [brand for brand in brand_keywords if brand in hostname.lower()]
    if found_brands:
        # Check if it's actually the legitimate domain
        is_legitimate = any(hostname.endswith(f"{brand}.com") for brand in found_brands)
        if not is_legitimate:
            risk_score += 20  # High penalty for brand impersonation
            risk_factors.append({
                "name": "Brand Impersonation", 
                "impact": "critical", 
                "description": f"URL appears to impersonate: {', '.join(found_brands)}"
            })
            details.append(f"⚠️ CRITICAL: URL may be impersonating {', '.join(found_brands)}.")
    
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
    
    # Determine risk level based on score (ADJUSTED THRESHOLDS - MORE AGGRESSIVE)
    if risk_score < 40:  # Lowered from 30 to 40
        risk_level = "low"
        status = "benign"
    elif risk_score < 60:  # Lowered from 70 to 60
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
        path = parsed_url.path
        query = parsed_url.query
        
        # 1. HTTPS Check
        if parsed_url.scheme != 'https':
            details.append("Uses insecure HTTP protocol instead of HTTPS.")
        
        # 2. IP Address as Hostname
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
            details.append("URL hostname is a raw IP address (Suspicious).")

        # 3. Subdomain Count
        if hostname:
            parts = hostname.split('.')
            subdomain_count = len(parts) - 2 if len(parts) > 2 else 0
            if subdomain_count > 2: # e.g., mail.google.com has 1 subdomain. more than 2 can be suspicious.
                details.append(f"Contains {subdomain_count} subdomains, which can be a sign of obfuscation.")
                
            # Check for excessively long subdomain
            if any(len(part) > 30 for part in parts):
                details.append("Contains unusually long subdomain names, which can be suspicious.")

        # 4. Suspicious TLDs
        suspicious_tlds = ['.xyz', '.top', '.club', '.info', '.loan', '.gq', '.tk', '.ml', '.ga', '.cf', '.pw']
        if hostname and '.' in hostname:
            tld = '.' + hostname.split('.')[-1]
            if tld in suspicious_tlds:
                details.append(f"Uses an uncommon or suspicious Top-Level Domain (TLD): {tld}.")

        # 5. Suspicious Keywords
        suspicious_keywords = [
            'login', 'secure', 'account', 'update', 'signin', 'verify', 'password', 
            'bank', 'paypal', 'netflix', 'amazon', 'apple', 'microsoft', 'support',
            'billing', 'confirm', 'security', 'alert', 'suspended'
        ]
        found_keywords = []
        for keyword in suspicious_keywords:
            if keyword in url.lower():
                found_keywords.append(keyword)
                
        if found_keywords:
            details.append(f"URL contains potentially sensitive keywords: {', '.join(found_keywords[:3])}.")
            if len(found_keywords) > 3:
                details.append(f"URL contains {len(found_keywords)} suspicious keywords in total.")

        # 6. Special characters analysis
        special_chars = ['@', '?', '=', '%', '&', '+', '$', '#', '~', '*']
        special_char_counts = {char: url.count(char) for char in special_chars if url.count(char) > 0}
        if special_char_counts:
            unusual_chars = [f"{char} ({count})" for char, count in special_char_counts.items() if count > 2]
            if unusual_chars:
                details.append(f"Contains unusual frequency of special characters: {', '.join(unusual_chars)}.")
        
        # 7. Check for URL encoding abuse
        encoding_count = url.count('%')
        if encoding_count > 5:
            details.append(f"Contains excessive URL encoding ({encoding_count} instances), which can hide malicious content.")
        
        # 8. Path depth analysis
        if path:
            path_depth = len([p for p in path.split('/') if p])
            if path_depth > 4:
                details.append(f"URL has a deep path structure ({path_depth} levels), which can be suspicious.")
        
        # 9. Query parameter analysis
        if query:
            query_params = query.split('&')
            if len(query_params) > 7:
                details.append(f"URL contains many query parameters ({len(query_params)}), which can be suspicious.")
                
            # Check for excessive parameter length
            long_params = [param for param in query_params if len(param) > 50]
            if long_params:
                details.append(f"Contains {len(long_params)} unusually long query parameters.")
        
        # 10. Check for typosquatting attempts (common brand misspellings)
        common_brands = {
            'google': ['gogle', 'googel', 'g00gle', 'gooogle'],
            'microsoft': ['microsft', 'micr0soft', 'mikrosoft', 'micrsoft'],
            'facebook': ['faceb00k', 'facbook', 'facebok', 'faceboook'],
            'apple': ['appl', 'aple', 'appple'],
            'amazon': ['amaz0n', 'amazn', 'amazonn'],
            'paypal': ['payp', 'paypall', 'paypai', 'paypaI'],
            'netflix': ['netflik', 'netflx', 'netflix-']
        }
        
        for brand, typos in common_brands.items():
            if any(typo in hostname.lower() for typo in typos) and brand not in hostname.lower():
                details.append(f"URL may be attempting to mimic {brand.capitalize()} (possible typosquatting).")
                break
        
        # 11. Check for excessive URL length
        if len(url) > 100:
            details.append(f"URL is unusually long ({len(url)} characters), which can be suspicious.")

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
                
                # Add registrar information
                if domain_info.registrar:
                    details.append(f"Domain registered to: {domain_info.registrar}")
                
                # Add expiration date if available
                if domain_info.expiration_date:
                    expiry_date = domain_info.expiration_date
                    if isinstance(expiry_date, list):
                        expiry_date = expiry_date[0]
                    days_to_expiry = (expiry_date - datetime.now()).days
                    if days_to_expiry < 30:
                        details.append(f"Domain is expiring soon (in {days_to_expiry} days) - potentially suspicious.")
                    else:
                        details.append(f"Domain expires in {days_to_expiry} days.")
        except Exception as e:
            print(f"WHOIS lookup failed: {e}")
        
        # 2. DNS Records Check
        try:
            ip_address = socket.gethostbyname(domain)
            details.append(f"Domain resolves to IP: {ip_address}")
            
            # Check if IP is in known suspicious ranges
            suspicious_ip_ranges = [
                ('192.168.', 'Private network'),
                ('10.', 'Private network'),
                ('172.16.', 'Private network'),
                ('127.', 'Localhost'),
                ('169.254.', 'Link-local')
            ]
            
            for ip_range, range_type in suspicious_ip_ranges:
                if ip_address.startswith(ip_range):
                    details.append(f"IP address is in {range_type} range - highly suspicious for a public website.")
                    break
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
                            
                            # Verify certificate match with domain
                            if domain != cn_subject and not (cn_subject.startswith('*.') and domain.endswith(cn_subject[2:])):
                                details.append(f"SSL Certificate domain mismatch: {cn_subject} vs {domain} - potentially suspicious.")
                            
                            # Check certificate validity
                            if 'notBefore' in cert and 'notAfter' in cert:
                                not_before = ssl.cert_time_to_seconds(cert['notBefore'])
                                not_after = ssl.cert_time_to_seconds(cert['notAfter'])
                                current_time = time.time()
                                
                                if current_time < not_before:
                                    details.append("SSL Certificate is not yet valid - potentially suspicious.")
                                elif current_time > not_after:
                                    details.append("SSL Certificate has expired - potentially suspicious.")
                                else:
                                    days_remaining = (not_after - current_time) / (24 * 3600)
                                    if days_remaining < 30:
                                        details.append(f"SSL Certificate expires soon (in {int(days_remaining)} days).")
                                    else:
                                        details.append(f"SSL Certificate is valid for {int(days_remaining)} more days.")
            except Exception as e:
                details.append("SSL certificate validation failed - potentially suspicious.")
                print(f"SSL validation error: {e}")
        
        # 4. Check reputation with VirusTotal API (if you have an API key)
        if hasattr(config, 'VIRUSTOTAL_API_KEY') and config.VIRUSTOTAL_API_KEY:
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
        
        # 5. Additional checks for popular legitimate domains
        popular_domains = [
            'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
            'youtube.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'netflix.com',
            'github.com', 'stackoverflow.com', 'wikipedia.org', 'yahoo.com', 'reddit.com'
        ]
        
        domain_without_prefix = domain
        if domain.startswith('www.'):
            domain_without_prefix = domain[4:]
            
        if domain_without_prefix in popular_domains:
            details.append(f"Domain is a well-known legitimate website ({domain_without_prefix}).")
        
        # 6. Check for suspicious domain patterns
        suspicious_patterns = [
            '-security', '-login', '-account', '-update', '-verify', 
            'secure-', 'login-', 'account-', 'update-', 'verify-'
        ]
        
        for pattern in suspicious_patterns:
            if pattern in domain_without_prefix:
                details.append(f"Domain contains suspicious pattern '{pattern}' - potentially deceptive.")
                break
                
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


# --- NEW: Enhanced Phishing Detection with Sensitivity Adjustment ---
def apply_sensitivity_adjustment(url: str, ml_status: str, ml_confidence: float, details: List[str]) -> tuple:
    """
    Applies rule-based sensitivity adjustments to improve phishing detection.
    This function can override the ML model's prediction if strong phishing indicators are found.
    
    Returns: (adjusted_status, adjusted_confidence, additional_details)
    """
    parsed_url = urlparse(url)
    hostname = parsed_url.hostname or ""
    path = parsed_url.path
    query = parsed_url.query
    
    # Initialize suspicion score
    suspicion_score = 0
    override_details = []
    
    # 1. AGGRESSIVE: Check for phishing keywords (high priority)
    high_risk_keywords = [
        'verify', 'account', 'suspended', 'update', 'confirm', 'secure',
        'login', 'signin', 'password', 'security', 'alert', 'urgent',
        'billing', 'payment', 'bank', 'paypal', 'netflix', 'amazon',
        'apple', 'microsoft', 'google', 'verification', 'locked'
    ]
    
    found_keywords = [kw for kw in high_risk_keywords if kw in url.lower()]
    if found_keywords:
        suspicion_score += len(found_keywords) * 15
        override_details.append(f"⚠️ ALERT: Contains {len(found_keywords)} high-risk phishing keyword(s): {', '.join(found_keywords[:3])}")
    
    # 2. Check for suspicious TLDs (commonly used in phishing)
    suspicious_tlds = ['.xyz', '.tk', '.top', '.club', '.gq', '.ml', '.ga', '.cf', '.info', '.loan', '.pw', '.buzz', '.click']
    if any(hostname.endswith(tld) for tld in suspicious_tlds):
        suspicion_score += 20
        tld = '.' + hostname.split('.')[-1] if '.' in hostname else ''
        override_details.append(f"⚠️ ALERT: Uses high-risk TLD: {tld}")
    
    # 3. Check for IP address as hostname (major red flag)
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", hostname):
        suspicion_score += 30
        override_details.append("🚨 CRITICAL: URL uses IP address instead of domain name - strong phishing indicator")
    
    # 4. Check for excessive subdomains (obfuscation technique)
    subdomain_count = len(hostname.split('.')) - 2 if hostname and len(hostname.split('.')) > 2 else 0
    if subdomain_count > 3:
        suspicion_score += 15
        override_details.append(f"⚠️ ALERT: Excessive subdomains ({subdomain_count}) - possible obfuscation")
    
    # 5. Check for HTTP instead of HTTPS (security risk)
    if parsed_url.scheme == 'http':
        suspicion_score += 15
        override_details.append("⚠️ WARNING: Uses insecure HTTP protocol")
    
    # 6. Check for typosquatting patterns
    typosquatting_patterns = [
        'g00gle', 'gogle', 'amaz0n', 'micr0soft', 'faceb00k', 
        'payp', 'netfl', 'appl-', 'twiter', 'lnkedin', 'instgrm'
    ]
    if any(pattern in hostname.lower() for pattern in typosquatting_patterns):
        suspicion_score += 25
        override_details.append("🚨 CRITICAL: Possible typosquatting detected - impersonation attempt")
    
    # 7. Check for suspicious character patterns
    if '@' in hostname or '%' in hostname[:50]:  # @ in hostname or early encoding
        suspicion_score += 20
        override_details.append("⚠️ ALERT: Suspicious characters in hostname - possible deception")
    
    # 8. Check for very long URLs (common in phishing)
    if len(url) > 150:
        suspicion_score += 10
        override_details.append(f"⚠️ WARNING: Unusually long URL ({len(url)} characters)")
    
    # 9. Check for multiple hyphens in domain (suspicious pattern)
    if hostname.count('-') > 2:
        suspicion_score += 10
        override_details.append(f"⚠️ WARNING: Multiple hyphens in domain ({hostname.count('-')})")
    
    # 10. Check for URL encoding abuse
    if url.count('%') > 3:
        suspicion_score += 15
        override_details.append(f"⚠️ ALERT: Excessive URL encoding ({url.count('%')} instances)")
    
    # Decision logic: Override ML prediction if suspicion is high
    adjusted_status = ml_status
    adjusted_confidence = ml_confidence
    
    # AGGRESSIVE OVERRIDE: If suspicion score is high, override benign predictions
    if suspicion_score >= 50:
        # Force malicious classification with high confidence
        adjusted_status = "malicious"
        adjusted_confidence = min(0.95, 0.70 + (suspicion_score / 200))
        override_details.insert(0, f"🔴 OVERRIDE: High suspicion score ({suspicion_score}/100) - Classified as MALICIOUS")
    elif suspicion_score >= 30 and ml_status == "benign":
        # Override benign to suspicious
        adjusted_status = "suspicious"
        adjusted_confidence = min(0.85, 0.60 + (suspicion_score / 250))
        override_details.insert(0, f"🟡 OVERRIDE: Moderate suspicion score ({suspicion_score}/100) - Classified as SUSPICIOUS")
    elif suspicion_score >= 20 and ml_status == "benign":
        # Lower confidence in benign prediction
        adjusted_confidence = max(0.40, ml_confidence - (suspicion_score / 100))
        override_details.insert(0, f"⚠️ ADJUSTMENT: Reduced confidence due to suspicious indicators (score: {suspicion_score}/100)")
    
    return adjusted_status, adjusted_confidence, override_details


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
        ml_predicted_status = status_map.get(prediction_idx, "unknown")
        
        # 2. Get explainability details with enhanced domain analysis
        explainability_details = analyze_url_for_details(url)
        
        # Fetch additional domain information
        domain_info = get_domain_info(url)
        if domain_info:
            explainability_details.extend(domain_info)
        
        # 3. **NEW: Apply sensitivity adjustment and rule-based override**
        adjusted_status, adjusted_confidence, override_details = apply_sensitivity_adjustment(
            url, ml_predicted_status, confidence, explainability_details
        )
        
        # Add override details to the response
        if override_details:
            explainability_details = override_details + explainability_details
        
        # Update message to reflect adjustments
        if adjusted_status != ml_predicted_status:
            message = f"URL classified as {adjusted_status.upper()} (ML predicted: {ml_predicted_status}, adjusted by security rules)."
        else:
            message = f"URL classified as {adjusted_status.upper()}."
        
        # 4. Create the response object with adjusted values
        scan_id = f"scn_{uuid.uuid4().hex[:12]}"

        # Include user info in response
        response_data = URLScanResponse(
            url=url,
            scan_id=scan_id,
            status=adjusted_status,  # Use adjusted status
            message=message,
            confidence=round(adjusted_confidence, 4),  # Use adjusted confidence
            model_version="linkshield-bert-v1.0-enhanced",  # Update version
            details=explainability_details,
            user_id=user_id,  # Add user ID if provided
            scan_timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        # 5. Save to DB and return
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