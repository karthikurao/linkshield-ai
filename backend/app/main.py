# backend/app/main.py
from fastapi import FastAPI
from starlette.requests import Request # Correct import
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import predict as predict_v1, history as history_v1, profile as profile_v1
from transformers import BertForSequenceClassification, BertTokenizer
import os
import torch

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
    # ... (rest of startup logic)
    try:
        if not os.path.exists(MODEL_DIR):
            error_msg = f"Model directory not found at {MODEL_DIR}."
            app.state.model = None
            app.state.tokenizer = None
            app.state.model_load_error = error_msg
            print(error_msg)
            return

        app.state.model = BertForSequenceClassification.from_pretrained(MODEL_DIR)
        app.state.model.to(device)
        app.state.model.eval()
        app.state.tokenizer = BertTokenizer.from_pretrained(MODEL_DIR)
        app.state.model_load_error = None
        print("ML Model and Tokenizer loaded successfully.")

    except Exception as e:
        app.state.model = None
        app.state.tokenizer = None
        app.state.model_load_error = f"Failed to load ML model/tokenizer: {e}"
        print(app.state.model_load_error)

# Include API routers
app.include_router(predict_v1.router, prefix="/api/v1/predict", tags=["Prediction v1"])
app.include_router(history_v1.router, prefix="/api/v1/history", tags=["History v1"])
app.include_router(profile_v1.router, prefix="/api/v1/profile", tags=["Profile v1"])

# Include our new detailed factors endpoint
from app.api.endpoints import predict as predict_detailed
app.include_router(predict_detailed.router, prefix="/api/factors", tags=["URL Factor Analysis"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to LinkShield AI API! Navigate to /docs for API documentation."}

@app.get("/health", tags=["Health"])
async def health_check(request: Request):
    # ... (health check logic)
    model_status = "loaded"
    if request.app.state.model_load_error:
        model_status = f"failed to load ({request.app.state.model_load_error})"
    elif not request.app.state.model:
        model_status = "not loaded"
    return {"status": "ok", "device": str(request.app.state.device), "model_status": model_status}

from mangum import Mangum
handler = Mangum(app)

# In your ProfileView.vue - make sure URLs match your backend routes
# Should be using:
# const response = await fetch('/api/v1/profile/me', {
#   headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
# });