@echo off
REM setup.bat - Backend Environment Setup Script for Windows

echo 🔧 Setting up LinkShield AI Backend Environment...

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    exit /b 1
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📥 Installing Python packages...
pip install -r requirements.txt

echo ✅ Setup complete!
echo.
echo To activate the environment:
echo   venv\Scripts\activate.bat
echo.
echo To start the server:
echo   uvicorn app.main:app --reload

pause
