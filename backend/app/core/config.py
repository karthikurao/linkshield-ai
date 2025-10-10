# backend/app/core/config.py
from dotenv import load_dotenv
import os

# This line loads the environment variables from the .env file
# in the parent directory (i.e., your backend/ directory)
load_dotenv()

# You can also load your settings into variables here for easy access
PROJECT_NAME = os.getenv("PROJECT_NAME", "LinkShield AI")
API_V1_STR = os.getenv("API_V1_STR", "/api/v1")
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")

# Add JWT settings for testing
SECRET_KEY = os.getenv("SECRET_KEY", "test_secret_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Settings object for backward compatibility with tests
class Settings:
    SECRET_KEY = SECRET_KEY
    ALGORITHM = ALGORITHM
    ACCESS_TOKEN_EXPIRE_MINUTES = ACCESS_TOKEN_EXPIRE_MINUTES

settings = Settings()