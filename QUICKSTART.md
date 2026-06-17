# 🚀 Quick Start Guide

## 5-Minute Setup (No Docker Required!)

### Prerequisites
- Python 3.9+
- Node.js 18+
- Groq API key (free from [console.groq.com](https://console.groq.com))
- Optional: Docker (for PostgreSQL + Redis instead of SQLite)

### Step 1: Clone & Navigate
```bash
cd competitor-intelligence
```

### Step 2: Setup Backend
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and add your `GROQ_API_KEY`:
```
GROQ_API_KEY=gsk_your_key_here
```

**That's it!** The SQLite database will be created automatically when you start the app.

### Step 3: Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

The `.env.local` is already configured for local development.

### Step 4: Run Services (2 terminals minimum)

**Terminal 1 - Flask API:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```
API runs on http://localhost:8000
Database file created at: `backend/competitor_intel.db`

**Terminal 2 - Next.js Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:3000

### Step 5: Test
Open http://localhost:3000 and try:
- Enter "Fintech" in the sector field
- Click "Run Analysis"
- Watch the real-time progress with status updates

## That's All!

No Docker, no PostgreSQL, no Redis needed. Just Python and Node.js.

---

## Optional: Adding Async Tasks with Redis

Want to run analysis tasks asynchronously instead of synchronously?

### Terminal 3 (Optional - Celery Worker)
```bash
cd backend
source venv/bin/activate
celery -A workers.tasks worker --loglevel=info
```

**Note:** You'll need Redis running:
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

Or use `docker-compose up -d` to start both PostgreSQL and Redis.

---

## Environment Variables

### Backend (`backend/.env`)
```
FLASK_ENV=development
SECRET_KEY=dev-key-12345  # Change in production
# Default: SQLite database (no external dependency)
DATABASE_URL=sqlite:///competitor_intel.db
# Optional: Redis for async tasks
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=gsk_your_key_here  # Get from console.groq.com
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## API Endpoints

### Run Analysis
```bash
curl -X POST http://localhost:8000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{"sector": "Fintech"}'
```

Response (202):
```json
{
  "log_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Analysis started"
}
```

### Check Status
```bash
curl http://localhost:8000/api/agents/status/550e8400-e29b-41d4-a716-446655440000
```

### Get History
```bash
curl http://localhost:8000/api/agents/history
curl "http://localhost:8000/api/agents/history?tier=High%20Growth%20Market&keyword=fintech"
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port
lsof -ti:8000 | xargs kill -9  # macOS/Linux
# Windows: Use Task Manager or:
netstat -ano | findstr :8000
```

### Database Connection Error
```bash
# Check Docker is running
docker ps

# Recreate database if needed
docker exec -it postgres-ci psql -U postgres -c "CREATE DATABASE competitor_intel;"
```

### Groq API Rate Limited
- Free tier: 30 requests/minute
- Wait a minute and retry
- Or upgrade to paid plan

### Frontend Can't Connect to Backend
- Verify backend is running: `curl http://localhost:8000/api/health`
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Ensure CORS is enabled (it is by default)

## Production Deployment

### Using Docker Compose (Production)
```bash
export GROQ_API_KEY=your_key_here
docker-compose -f docker-compose.prod.yml up -d
```

### Deploy Frontend to Vercel
```bash
cd frontend
npm install -g vercel
vercel
```

### Deploy Backend (Example: Railway, Render, Heroku)
Push the repo to your platform and set environment variables.

## Testing the System

### Sample Requests
```bash
# Test 1: Fintech sector
curl -X POST http://localhost:8000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{"sector": "Fintech"}'

# Test 2: Healthcare
curl -X POST http://localhost:8000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{"sector": "Healthcare Technology"}'

# Test 3: E-commerce
curl -X POST http://localhost:8000/api/agents/run \
  -H "Content-Type: application/json" \
  -d '{"sector": "E-commerce"}'
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                    │
│          http://localhost:3000                          │
└────────────────────────┬────────────────────────────────┘
                         │
                    HTTP API calls
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Backend (Flask)                        │
│          http://localhost:8000/api                      │
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │ REST API     │────│ PostgreSQL   │                 │
│  │ Routes       │    │ (Database)   │                 │
│  └──────┬───────┘    └──────────────┘                 │
│         │                                              │
│    ┌────▼──────────┐   ┌──────────────┐              │
│    │ Flask App     │───│ Research Agent (LLM)         │
│    │ + Celery      │   │ Analyst Agent (LLM)          │
│    └────┬──────────┘   └──────────────┘              │
│         │                                              │
│    ┌────▼──────────┐   ┌──────────────┐              │
│    │ Celery Worker │───│ Groq LLM     │              │
│    │ (Task Queue)  │   │ (Llama 3 8B) │              │
│    └───────────────┘   └──────────────┘              │
│                                                       │
│  ┌──────────────────────────────────────────┐       │
│  │        Redis (Task Queue Broker)         │       │
│  └──────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

## Getting Help

- Check README.md for detailed documentation
- Review .env.example files for configuration options
- Check logs in terminals for error messages
- Verify all services are running: `docker ps`, ports 8000 and 3000 accessible

## Next Steps

1. ✅ Understand the architecture
2. 📊 Run some analyses and explore the UI
3. 🔧 Customize the agents and prompts in `backend/agents/pipeline.py`
4. 🎨 Customize the frontend styling in `frontend/app/globals.css`
5. 🚀 Deploy to production

Happy analyzing! 🎯
