# LinkShield AI - Advanced Phishing URL Detection

![LinkShield AI Logo](https://via.placeholder.com/150x150?text=LinkShield+AI)

## Project Overview

LinkShield AI is an advanced cybersecurity solution that uses machine learning to detect and prevent phishing attacks. Built with a modern tech stack including React, FastAPI, and BERT-based models, LinkShield provides real-time URL scanning and threat detection.

## Key Features

- **Real-time URL Scanning**: Instantly analyze URLs for phishing indicators
- **ML-Powered Detection**: Advanced BERT-based model trained on phishing datasets
- **User-Friendly Interface**: Clean, responsive UI with dark/light mode support
- **Scan History**: Track and review previous URL scans
- **User Profiles**: Personalized experience with user accounts
- **Serverless Architecture**: Scalable backend deployed on AWS Lambda

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Vite (build tool)
- React Router
- Context API for state management

### Backend
- FastAPI (Python)
- Serverless Framework
- JWT Authentication
- AWS Lambda

### Machine Learning
- HuggingFace Transformers
- PyTorch
- BERT-based model fine-tuned for URL classification
- Custom training pipeline

## Installation and Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- AWS CLI configured (for deployment)
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/linkshield-ai.git
cd linkshield-ai/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload
```

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
