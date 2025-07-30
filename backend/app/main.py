# backend/app/main.py
from fastapi import FastAPI
from starlette.requests import Request # Correct import
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import predict as predict_v1, history as history_v1, profile as profile_v1, analyze as analyze_v1
from app.api.v1 import community, examples, threat_intel, auth
from transformers import BertForSequenceClassification, BertTokenizer
import os
import torch
from datetime import datetime, timezone

app = FastAPI(
    title="LinkShield AI API",
    description="API for detecting malicious URLs using machine learning.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml_models", "phishing-url-detector")

@app.on_event("startup")
async def startup_event():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    app.state.device = device
    print(f"Backend running on device: {device}")
    
    # Initialize model variables
    app.state.model = None
    app.state.tokenizer = None
    app.state.model_load_error = None
    
    try:
        # Check if model directory exists
        if not os.path.exists(MODEL_DIR):
            error_msg = f"Model directory not found at {MODEL_DIR}."
            app.state.model_load_error = error_msg
            print(error_msg)
            return
        
        # Check if required model files exist
        required_files = ["pytorch_model.bin", "config.json", "vocab.txt", "tokenizer_config.json"]
        missing_files = [f for f in required_files if not os.path.exists(os.path.join(MODEL_DIR, f))]
        
        if missing_files:
            error_msg = f"Missing model files: {', '.join(missing_files)}. Using fallback prediction."
            app.state.model_load_error = error_msg
            print(error_msg)
            
            # Try to load tokenizer only if the required files exist
            if all(f in missing_files for f in ["pytorch_model.bin", "config.json"]) and not all(f in missing_files for f in ["vocab.txt", "tokenizer_config.json"]):
                try:
                    app.state.tokenizer = BertTokenizer.from_pretrained(MODEL_DIR)
                    print("Tokenizer loaded successfully, but model is missing.")
                except Exception as e:
                    print(f"Failed to load tokenizer: {e}")
            return
        
        # Load model and tokenizer if all files exist
        app.state.model = BertForSequenceClassification.from_pretrained(MODEL_DIR)
        app.state.model.to(device)
        app.state.model.eval()
        app.state.tokenizer = BertTokenizer.from_pretrained(MODEL_DIR)
        print("ML Model and Tokenizer loaded successfully.")

    except Exception as e:
        app.state.model_load_error = f"Failed to load ML model/tokenizer: {e}"
        print(app.state.model_load_error)

# Include API routers
app.include_router(predict_v1.router, prefix="/api/v1/predict", tags=["Prediction v1"])
app.include_router(history_v1.router, prefix="/api/v1/history", tags=["History v1"])
app.include_router(profile_v1.router, prefix="/api/v1/profile", tags=["Profile v1"])
app.include_router(analyze_v1.router, prefix="/api/v1/analyze-url", tags=["URL Analysis v1"])

# Add authentication router
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])

# Add new routers for community features
app.include_router(community.router, prefix="/api/v1/community-reports", tags=["Community Reports"])
app.include_router(examples.router, prefix="/api/v1/phishing-examples", tags=["Phishing Examples"])
app.include_router(threat_intel.router, prefix="/api/v1/threat-intel", tags=["Threat Intelligence"])

# Include our new detailed factors endpoint
from app.api.endpoints import predict as predict_detailed
app.include_router(predict_detailed.router, prefix="/api/factors", tags=["URL Factor Analysis"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to LinkShield AI API! Navigate to /docs for API documentation."}

@app.get("/health", tags=["Health"])
async def health_check(request: Request):
    # Check application health status
    model_status = "loaded"
    model_details = {}
    
    if request.app.state.model_load_error:
        model_status = "fallback"
        model_details = {
            "error": request.app.state.model_load_error,
            "fallback_active": True,
            "message": "Using rule-based fallback prediction instead of ML model"
        }
    elif not request.app.state.model:
        model_status = "not loaded"
        model_details = {
            "fallback_active": True,
            "message": "ML model not loaded, using fallback prediction"
        }
    else:
        model_details = {
            "fallback_active": False,
            "model_type": "BERT for Sequence Classification",
            "device": str(request.app.state.device)
        }
    
    # Check if model directory exists and which files are missing
    if os.path.exists(MODEL_DIR):
        files_present = os.listdir(MODEL_DIR)
        required_files = ["pytorch_model.bin", "config.json", "vocab.txt", "tokenizer_config.json"]
        missing_files = [f for f in required_files if f not in files_present]
        model_details["model_dir"] = MODEL_DIR
        model_details["files_present"] = files_present
        model_details["missing_files"] = missing_files
    else:
        model_details["model_dir_exists"] = False
    
    return {
        "status": "ok", 
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "device": str(request.app.state.device), 
        "model_status": model_status,
        "model_details": model_details
    }

from mangum import Mangum
handler = Mangum(app)

# In your ProfileView.vue - make sure URLs match your backend routes
# Should be using:
# const response = await fetch('/api/v1/profile/me', {
#   headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
# });