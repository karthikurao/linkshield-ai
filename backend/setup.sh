#!/bin/bash
# setup.sh - Backend Environment Setup Script

echo "🔧 Setting up LinkShield AI Backend Environment..."

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    source venv/Scripts/activate
else
    # Linux/Mac
    source venv/bin/activate
fi

# Upgrade pip
echo "⬆️  Upgrading pip..."
python -m pip install --upgrade pip

# Install requirements
echo "📥 Installing Python packages..."
pip install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "To activate the environment:"
echo "  Windows: .\\venv\\Scripts\\Activate.ps1"
echo "  Linux/Mac: source venv/bin/activate"
echo ""
echo "To start the server:"
echo "  uvicorn app.main:app --reload"
