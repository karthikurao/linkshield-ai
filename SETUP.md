# LinkShield AI - Repository Setup

This document explains how to set up the LinkShield AI project after cloning from GitHub.

## Prerequisites

- Python 3.11 (already bundled in `backenv/` virtual environment)
- Node.js 18+
- npm or yarn
- SQLite (bundled with Python)

## Backend Setup

1. Navigate to the backend directory:
   `ash
   cd backend
   `

2. Activate the existing virtual environment (Windows PowerShell):
   `
   .\backenv\Scripts\Activate.ps1
   `

   > macOS/Linux users can recreate the environment with `python -m venv backenv` and install the requirements below.

3. Install dependencies:
   `ash
   pip install -r requirements.txt
   `

4. Copy the example environment file and adjust secrets as needed:
   `
   copy .env.example .env
   `

5. Start the backend server:
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

## Deployment

Refer to `docs/deployment_guide.md` for local or container-based deployment options.
