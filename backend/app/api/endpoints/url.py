@router.post("/scan", response_model=URLScanResponse)
async def scan_url(
    url_data: URLScanRequest, 
    current_user: dict = Depends(get_current_user)
):
    url = url_data.url
    
    # Get user ID from the current user (if authenticated)
    user_id = current_user.get("sub") if current_user else None
    
    return run_prediction(
        url=url,
        model=app.state.model,
        tokenizer=app.state.tokenizer,
        device=app.state.device,
        user_id=user_id  # Pass the user ID
    )