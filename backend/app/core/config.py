# backend/app/core/config.py
from dotenv import load_dotenv
import os

# This line loads the environment variables from the .env file
# in the parent directory (i.e., your backend/ directory)
load_dotenv()

# You can also load your settings into variables here for easy access
PROJECT_NAME = os.getenv("PROJECT_NAME", "LinkShield AI")
API_V1_STR = os.getenv("API_V1_STR", "/api/v1")
COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
AWS_REGION = os.getenv("AWS_REGION")
SCAN_HISTORY_TABLE_NAME = os.getenv("SCAN_HISTORY_TABLE_NAME")
COGNITO_APP_CLIENT_ID = os.getenv("COGNITO_APP_CLIENT_ID")
VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")