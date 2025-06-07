# LinkShield AI - Repository Setup

This document explains how to set up the LinkShield AI project after cloning from GitHub.

## Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn
- AWS Account (Free Tier)

## Backend Setup

1. Navigate to the backend directory:
   `ash
   cd backend
   `

2. Create a virtual environment:
   `ash
   python -m venv venv
   `

3. Activate the virtual environment:
   - Windows:
     `ash
     venv\Scripts\activate
     `
   - macOS/Linux:
     `ash
     source venv/bin/activate
     `

4. Install dependencies:
   `ash
   pip install -r requirements.txt
   `

5. Create a .env file with your AWS credentials:
   `
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   `

6. Start the backend server:
   `ash
   uvicorn main:app --reload
   `

## Frontend Setup

1. Navigate to the frontend directory:
   `ash
   cd frontend
   `

2. Install dependencies:
   `ash
   npm install
   # or
   yarn
   `

3. Create a .env file with your API endpoint:
   `
   VITE_API_URL=http://localhost:8000
   `

4. Start the development server:
   `ash
   npm run dev
   # or
   yarn dev
   `

## ML Training (Optional)

If you need to work with the ML models:

1. The full dataset files have been excluded from the repository due to size constraints.
2. Sample datasets are provided for development purposes.
3. To use the full datasets, contact the repository maintainers or recreate them using the scripts in the ml_training directory.

## AWS Services Used (Free Tier)

- AWS Cognito: User authentication
- AWS Lambda: Serverless backend functions
- AWS API Gateway: REST API endpoints
- AWS S3: Storage for static assets

## Deployment

Follow the instructions in the deployment guide to deploy the application to AWS.
