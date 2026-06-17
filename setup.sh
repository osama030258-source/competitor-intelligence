#!/bin/bash
set -e

echo "🚀 Starting Competitor Intelligence Platform..."

# Check for required tools
command -v docker-compose >/dev/null 2>&1 || { echo "❌ docker-compose is required"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 is required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ node is required"; exit 1; }

echo "✅ All required tools found"

# Start Docker services
echo "📦 Starting PostgreSQL and Redis..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 5

# Backend setup
echo "🔧 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
echo "⚠️  Please edit backend/.env with your GROQ_API_KEY"
cd ..

# Frontend setup
echo "🎨 Setting up frontend..."
cd frontend
npm install
cp .env.example .env.local
cd ..

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and add your GROQ_API_KEY from console.groq.com"
echo "2. Terminal 1: cd backend && source venv/bin/activate && python app.py"
echo "3. Terminal 2: cd backend && source venv/bin/activate && celery -A workers.tasks worker --loglevel=info"
echo "4. Terminal 3: cd frontend && npm run dev"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:8000"
