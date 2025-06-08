# LinkShield AI - Advanced Phishing URL Detection v1.0

![LinkShield AI Logo](https://via.placeholder.com/150x150?text=LinkShield+AI)

## Project Overview

LinkShield AI is an advanced cybersecurity solution that uses machine learning to detect and prevent phishing attacks. Built with a modern tech stack including React, FastAPI, and BERT-based models, LinkShield provides real-time URL scanning and threat detection.

## Key Features

- **Real-time URL Scanning**: Instantly analyze URLs for phishing indicators
- **ML-Powered Detection**: Advanced BERT-based model trained on phishing datasets
- **User-Friendly Interface**: Clean, responsive UI with dark/light mode support
- **Scan History**: Track and review previous URL scans
- **User Profiles**: Personalized experience with AWS Cognito authentication
- **Serverless Architecture**: Scalable backend deployed on AWS Lambda

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Vite (build tool)
- React Router
- AWS Amplify for authentication
- Context API for theme management

### Backend
- FastAPI (Python)
- Serverless Framework
- AWS Cognito Authentication
- AWS Lambda

### Machine Learning
- HuggingFace Transformers
- PyTorch
- BERT-based model fine-tuned for URL classification
- Custom training pipeline

## Version Information

**Current Version**: 1.0.1
**Release Date**: June 8, 2025
**Status**: Stable Release

### Release Notes
- Implemented fallback prediction mechanism when ML model is unavailable
- Enhanced error handling and improved system resilience
- Fixed DynamoDB scan history format
- Initial stable release with complete AWS Amplify authentication integration
- Optimized repository size and structure
- Full documentation

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- AWS Account (for production deployment)

### Quick Start
1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && pip install -r requirements.txt`
4. Start the backend: `cd backend && uvicorn app.main:app --reload`
5. Start the frontend: `cd frontend && npm run dev`

### Missing ML Model?
The application will automatically use a rule-based fallback mechanism if the ML model files are missing:

1. Check model status: Visit `http://localhost:8000/health` to verify
2. Test fallback: Run `python backend/test_fallback.py` to test the fallback mechanism

See [Fallback Mechanism Documentation](docs/fallback_mechanism.md) for more details.

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### ML Model Training (Optional)

```bash
# Navigate to ML training directory
cd ../ml_training

# Create and activate virtual environment
python -m venv venv_ml
source venv_ml/bin/activate  # On Windows: venv_ml\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run training script
python train_bert_model.py
```

## Repository Maintenance

This repository follows best practices to keep its size manageable:

1. **Virtual environments** are not committed to Git
   - Use `pip install -r requirements.txt` to set up your local environment

2. **Node modules** are not committed to Git
   - Use `npm install` to install frontend dependencies

3. **Large ML datasets** are provided as samples only
   - Full datasets can be downloaded separately as needed

4. **Build artifacts** should be generated locally

For detailed maintenance guidelines, see [docs/repository_maintenance.md](docs/repository_maintenance.md).

## Deployment

### Backend Deployment

```bash
# Navigate to backend directory
cd backend

# Deploy to AWS Lambda
serverless deploy
```

### Frontend Deployment

```bash
# Navigate to frontend directory
cd frontend

# Build for production
npm run build

# Deploy to hosting service of choice (AWS S3, Netlify, Vercel, etc.)
```

## Project Structure

```
linkshield-ai/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── models/        # Data models
│   │   └── services/      # Business logic
│   ├── ml_models/         # ML model files
│   └── serverless.yml     # Serverless config
├── frontend/              # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # UI components
│       ├── context/       # React contexts
│       ├── pages/         # Page components
│       └── services/      # API services
├── ml_training/           # ML training code
│   ├── dataset/           # Training datasets
│   └── results/           # Training results
└── docs/                  # Documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- HuggingFace for the Transformers library
- AWS for serverless infrastructure
- The open-source community for various tools and libraries
