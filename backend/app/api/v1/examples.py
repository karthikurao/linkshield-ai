# backend/app/api/v1/examples.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import uuid

router = APIRouter()

# Models
class PhishingExample(BaseModel):
    id: str
    type: str  # "email", "sms", "website"
    difficulty: str  # "easy", "medium", "hard"
    content: dict
    clues: List[dict]
    solution: dict
    
# Mock data - in a real app, this would be in a database
MOCK_EXAMPLES = [
    {
        "id": "ex001",
        "type": "email",
        "difficulty": "medium",
        "content": {
            "sender": "security@paypaI-secure.com",
            "subject": "Your account has been limited",
            "body": "Dear Customer, We detected unusual activity on your account. Click here to verify your information and restore full access: https://paypal-secure-verification.com/restore",
            "date": "Today, 10:15 AM"
        },
        "clues": [
            {"id": "c1", "text": "Check the sender's email domain carefully", "category": "sender"},
            {"id": "c2", "text": "Look for urgency tactics in the message", "category": "content"},
            {"id": "c3", "text": "Examine the URL in the link", "category": "link"}
        ],
        "solution": {
            "is_phishing": True,
            "explanation": "This is a phishing attempt. The sender's domain uses a capital 'I' instead of lowercase 'l' (paypaI vs paypal). The link goes to a fake domain that's not the official PayPal website. The message creates urgency to pressure you into clicking without thinking."
        }
    },
    {
        "id": "ex002",
        "type": "website",
        "difficulty": "hard",
        "content": {
            "title": "Amazon Sign In",
            "url": "https://amazom-secure.login-check.com/signin",
            "body": "Please sign in to your Amazon account to continue shopping",
            "logo": "amazon_logo.png"
        },
        "clues": [
            {"id": "c1", "text": "Check the URL in the address bar", "category": "url"},
            {"id": "c2", "text": "Look for SSL/TLS indicators", "category": "security"},
            {"id": "c3", "text": "Examine the domain name closely", "category": "url"}
        ],
        "solution": {
            "is_phishing": True,
            "explanation": "This is a phishing website. The domain 'amazom-secure.login-check.com' is not owned by Amazon. Legitimate Amazon logins only occur on amazon.com domains. The misspelling of 'amazon' as 'amazom' is a common phishing tactic."
        }
    },
    {
        "id": "ex003",
        "type": "sms",
        "difficulty": "easy",
        "content": {
            "sender": "+1-845-123-4567",
            "body": "ALERT: Your bank card has been suspended. Call 888-555-1234 immediately or click: http://bank-verify.co/restore",
            "url": "http://bank-verify.co/restore"
        },
        "clues": [
            {"id": "c1", "text": "Consider if your bank would contact you this way", "category": "method"},
            {"id": "c2", "text": "Check for personalization in the message", "category": "content"},
            {"id": "c3", "text": "Examine the URL domain", "category": "url"}
        ],
        "solution": {
            "is_phishing": True,
            "explanation": "This is a phishing SMS. Banks rarely use SMS to notify about account suspensions, and they would include your name and last digits of your card. The URL is suspicious and not from a legitimate bank domain. The message creates false urgency to make you act quickly without thinking."
        }
    }
]

@router.get("/", response_model=List[PhishingExample])
async def get_phishing_examples():
    """Get educational phishing examples for training purposes"""
    return MOCK_EXAMPLES

@router.get("/{example_id}", response_model=PhishingExample)
async def get_phishing_example(example_id: str):
    """Get a specific phishing example by ID"""
    for example in MOCK_EXAMPLES:
        if example["id"] == example_id:
            return example
    
    raise HTTPException(status_code=404, detail="Example not found")
