# LinkShield AI

A modern web application for detecting malicious URLs using machine learning. Built with FastAPI backend and React frontend.

## 🚀 Features

- **AI-Powered URL Analysis**: Uses BERT-based machine learning model to detect phishing and malicious URLs
- **Real-time Scanning**: Fast URL analysis with detailed risk assessment
- **User Authentication**: Secure JWT-based authentication system
- **Scan History**: Track and review your previous URL scans
- **Modern UI**: Clean, responsive interface with dark/light theme support
- **Guest Mode**: Try the service with limited scans before signing up

## 🏗️ Project Structure

```
linkshield-ai/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   │   ├── analyze.py     # URL analysis
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── history.py     # Scan history
│   │   │   ├── predict.py     # URL prediction
│   │   │   └── profile.py     # User profiles
│   │   ├── core/              # Core utilities
│   │   ├── models/            # Data models
│   │   ├── services/          # Business logic
│   │   ├── database.py        # Database operations
│   │   └── main.py           # FastAPI app
│   ├── ml_models/            # ML model files
│   └── requirements.txt      # Python dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # React context
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── App.jsx          # Main app component
│   └── package.json         # Node.js dependencies
├── docs/                     # Documentation
└── ml_training/              # ML training scripts
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:8000
```

**Backend (.env):**
```
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_DAYS=7
```

## 📊 Database

The application uses SQLite for data storage with the following main tables:
- `users` - User account information
- `url_scans` - Scan history and results
- `user_profiles` - Extended user profile data

## 🤖 Machine Learning

The system uses a fine-tuned BERT model for URL classification:
- **Model**: BERT for Sequence Classification
- **Task**: Binary classification (safe/malicious)
- **Input**: URL strings
- **Output**: Prediction confidence and risk factors

## 🚀 Deployment

### Production Build
1. Build frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Set production environment variables
3. Use production WSGI server (e.g., Gunicorn)
4. Configure reverse proxy (e.g., Nginx)

### Docker (Optional)
Build and run using Docker:
```bash
# Backend
docker build -t linkshield-backend ./backend
docker run -p 8000:8000 linkshield-backend

# Frontend
docker build -t linkshield-frontend ./frontend
docker run -p 3000:3000 linkshield-frontend
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### API Testing
Use the included test script:
```bash
python backend/tests/test_api.py
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints
- `POST /api/v1/predict/` - Scan a URL
- `GET /api/v1/analyze-url` - Detailed URL analysis
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/history` - Get scan history
- `GET /api/v1/profile/me` - Get user profile

## 🛡️ Security Features

- JWT-based authentication with 7-day expiration
- Password hashing using bcrypt
- CORS protection
- Input validation and sanitization
- Rate limiting (planned)
- SQL injection prevention

## 🎨 UI Features

- **Modern Design**: Clean, professional interface
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Layout**: Mobile-friendly design
- **Real-time Feedback**: Loading states and error handling
- **Accessibility**: ARIA labels and keyboard navigation

## 🔄 Development Workflow

1. **Feature Development**: Create feature branches
2. **Code Review**: All changes reviewed before merge
3. **Testing**: Unit and integration tests required
4. **Documentation**: Update docs with new features

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](./docs/)
- [API Reference](./docs/api.md)
- [Deployment Guide](./docs/deployment_guide.md)
- [Security Guide](./docs/security_best_practices.md)

## 📞 Support

For support, please check the documentation or open an issue on GitHub.
