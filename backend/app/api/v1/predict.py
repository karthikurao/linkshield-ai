# backend/app/api/v1/predict.py
from fastapi import APIRouter, Depends # Keep APIRouter and Depends
from starlette.requests import Request # Import from starlette
from starlette.exceptions import HTTPException # Import from starlette
from starlette import status # Import from starlette
from app.models.url import URLScanRequest, URLScanResponse, ErrorResponse
from app.services.app_service import run_prediction, get_fallback_prediction
# Assuming auth_utils is also updated as per previous instructions
from .auth_utils import get_current_user_sub 

router = APIRouter()

@router.post(
    "/", 
    response_model=URLScanResponse,
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse, "description": "ML model is not available"},
        status.HTTP_500_INTERNAL_SERVER_ERROR: {"model": ErrorResponse, "description": "Internal server error during prediction"}
    },
    summary="Scan a URL for malicious content",
    description="Accepts a URL and returns a prediction on whether it's benign, malicious, or suspicious.",
    tags=["Prediction"]
)
async def scan_url_endpoint(
    request_data: URLScanRequest, 
    request: Request,
    user_id: str = Depends(get_current_user_sub) # Protect the endpoint
):
    model = request.app.state.model
    tokenizer = request.app.state.tokenizer
    device = request.app.state.device
    model_load_error = request.app.state.model_load_error
    
    url_to_scan = str(request_data.url)
    
    # Check if model is available
    if model_load_error or not all([model, tokenizer, device]):
        print(f"Model not available, using fallback prediction: {model_load_error}")
        # Instead of raising an exception, use a fallback mechanism
        fallback_result = get_fallback_prediction(url_to_scan, user_id)
        # Log that we're using fallback
        print(f"Fallback prediction for {url_to_scan}: {fallback_result.status} with confidence {fallback_result.confidence}")
        return fallback_result
    
    # If model is available, use it
    prediction_result = run_prediction(url_to_scan, model, tokenizer, device, user_id)
    
    return prediction_result