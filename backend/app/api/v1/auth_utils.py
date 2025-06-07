# backend/app/api/v1/auth_utils.py
import json
import requests
from starlette.requests import Request
from starlette.exceptions import HTTPException
from starlette import status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import jwk, jwt
from jose.exceptions import JWTError
from app.core import config # Import our config module

# Load configuration from the config module
COGNITO_USER_POOL_ID = config.COGNITO_USER_POOL_ID
AWS_REGION = config.AWS_REGION
# --- GET THE APP CLIENT ID FROM CONFIG ---
COGNITO_APP_CLIENT_ID = config.COGNITO_APP_CLIENT_ID

if not all([COGNITO_USER_POOL_ID, AWS_REGION, COGNITO_APP_CLIENT_ID]):
    raise Exception("Cognito User Pool ID, App Client ID, and AWS Region must be set in environment variables.")

# ... (jwks fetching logic remains the same) ...
jwks_url = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
try:
    response = requests.get(jwks_url)
    response.raise_for_status()
    jwks = response.json()
except requests.exceptions.RequestException as e:
    raise Exception(f"Failed to fetch JWKS from Cognito: {e}")


async def get_current_user_sub(request: Request) -> str:
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    if token.startswith("Bearer "):
        token = token.split("Bearer ")[1]

    try:
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = { "kty": key["kty"], "kid": key["kid"], "use": key["use"], "n": key["n"], "e": key["e"] }
        
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Unable to find appropriate key in JWKS")

        # --- MODIFIED jwt.decode() CALL ---
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            # Verify the issuer (your user pool)
            issuer=f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}",
            # Verify the audience (your app client)
            audience=COGNITO_APP_CLIENT_ID,
        )
        # --- END MODIFICATION ---
        
        return payload["sub"]

    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not validate credentials: {e}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error during authentication: {e}")