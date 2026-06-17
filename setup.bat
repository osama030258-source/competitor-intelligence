@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Competitor Intelligence Platform...

:: Check for required tools
where python >nul 2>nul
if errorlevel 1 (
    echo ❌ Python is required
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo ❌ Node.js is required
    exit /b 1
)

echo ✅ All required tools found

:: Check Docker
docker-compose --version >nul 2>nul
if errorlevel 1 (
    echo ⚠️  docker-compose not found, skipping Docker services
) else (
    echo 📦 Starting PostgreSQL and Redis...
    docker-compose up -d
    timeout /t 5
)

:: Backend setup
echo 🔧 Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
echo ⚠️  Please edit backend\.env with your GROQ_API_KEY
cd ..

:: Frontend setup
echo 🎨 Setting up frontend...
cd frontend
call npm install
copy .env.example .env.local
cd ..

echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit backend\.env and add your GROQ_API_KEY from console.groq.com
echo 2. Terminal 1: cd backend ^&^& venv\Scripts\activate ^&^& python app.py
echo 3. Terminal 2: cd backend ^&^& venv\Scripts\activate ^&^& celery -A workers.tasks worker --loglevel=info
echo 4. Terminal 3: cd frontend ^&^& npm run dev
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:8000
