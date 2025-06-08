#!/usr/bin/env python
# backend/test_fallback.py
"""
Test script to verify the fallback mechanism for LinkShield AI.
This script tests both the health endpoint and direct scanning with the fallback mechanism.
"""

import requests
import json
import sys
import os
from pathlib import Path

def test_health_endpoint():
    """Test the health endpoint to check model status"""
    print("\n=== Testing Health Endpoint ===")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            data = response.json()
            print(f"Health Status: {json.dumps(data, indent=2)}")
            
            if "model_status" in data:
                if data["model_status"] == "fallback":
                    print("\n✅ Fallback mechanism is active as expected")
                elif data["model_status"] == "loaded":
                    print("\n⚠️ Model is loaded - fallback mechanism not in use")
                else:
                    print(f"\n❌ Unexpected model status: {data['model_status']}")
            else:
                print("\n❌ Model status not found in response")
        else:
            print(f"\n❌ Health endpoint returned status code {response.status_code}")
    except Exception as e:
        print(f"\n❌ Error testing health endpoint: {e}")

def test_prediction_endpoint():
    """Test the prediction endpoint with a sample URL"""
    print("\n=== Testing Prediction Endpoint ===")
    try:
        test_url = "http://suspicious-looking-bank-login.com/account/verify"
        response = requests.post(
            "http://localhost:8000/api/v1/predict",
            json={"url": test_url}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nPrediction for URL '{test_url}':")
            print(f"  Status: {data.get('status', 'N/A')}")
            print(f"  Confidence: {data.get('confidence', 'N/A')}")
            print(f"  Model Version: {data.get('model_version', 'N/A')}")
            print("\nDetails:")
            for detail in data.get('details', []):
                print(f"  - {detail}")
            
            if "model_version" in data and "fallback" in data["model_version"].lower():
                print("\n✅ Fallback mechanism was used for prediction")
            else:
                print("\n⚠️ Regular ML model was used for prediction, not the fallback")
        else:
            print(f"\n❌ Prediction endpoint returned status code {response.status_code}")
            if response.text:
                print(f"Response: {response.text}")
    except Exception as e:
        print(f"\n❌ Error testing prediction endpoint: {e}")

def check_model_files():
    """Check if the model files exist"""
    print("\n=== Checking Model Files ===")
    
    # Find the model directory
    script_dir = Path(__file__).resolve().parent
    model_dir = script_dir / "ml_models" / "phishing-url-detector"
    
    if not model_dir.exists():
        print(f"\n❌ Model directory not found: {model_dir}")
        return False
    
    # Check for required files
    required_files = ["pytorch_model.bin", "config.json", "vocab.txt", "tokenizer_config.json"]
    missing_files = [f for f in required_files if not (model_dir / f).exists()]
    
    if missing_files:
        print(f"\n❌ Missing model files: {', '.join(missing_files)}")
        return False
    else:
        print("\n✅ All required model files found!")
        return True

if __name__ == "__main__":
    print("LinkShield AI - Fallback Mechanism Test")
    print("======================================")
    
    # Check if backend server is running
    try:
        requests.get("http://localhost:8000/")
        print("\n✅ Backend server is running")
    except:
        print("\n❌ Backend server is not running. Please start it first with 'uvicorn app.main:app --reload'")
        sys.exit(1)
    
    # Run tests
    check_model_files()
    test_health_endpoint()
    test_prediction_endpoint()
    
    print("\n======================================")
    print("Test complete!")
