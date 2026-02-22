# backend/app/core/config.py
from dotenv import load_dotenv
import os
import warnings

# This line loads the environment variables from the .env file
# in the parent directory (i.e., your backend/ directory)
load_dotenv()

# You can also load your settings into variables here for easy access
PROJECT_NAME = os.getenv("PROJECT_NAME", "LinkShield AI")
API_V1_STR = os.getenv("API_V1_STR", "/api/v1")
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")

# JWT settings — read from environment variables; no hardcoded fallback secrets.
# SECRET_KEY and JWT_SECRET_KEY must be set via environment variables or a .env file.
SECRET_KEY = os.getenv("SECRET_KEY", "")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")

if not SECRET_KEY:
    warnings.warn(
        "SECRET_KEY is not set. Please configure it via environment variable or .env file.",
        stacklevel=2,
    )

if not JWT_SECRET_KEY:
    warnings.warn(
        "JWT_SECRET_KEY is not set. Please configure it via environment variable or .env file.",
        stacklevel=2,
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Settings object for backward compatibility with tests
class Settings:
    SECRET_KEY = SECRET_KEY
    ALGORITHM = ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES = ACCESS_TOKEN_EXPIRE_MINUTES

settings = Settings()