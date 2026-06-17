# Competitor Intelligence Platform

A production-ready AI-powered competitive intelligence system that analyzes market sectors using LangChain + Groq LLM and provides strategic recommendations.

## Features

- **AI-Powered Research**: Automatically research market sectors using Groq's Llama 3 model
- **Strategic Analysis**: Get categorized market assessments and recommendations
- **Real-time Status**: Track analysis progress with live polling
- **Smart Filtering**: Filter results by market tier and keyword
- **Production-Ready**: Complete backend API, async task processing, and modern frontend

## Tech Stack

### Backend
- **Framework**: Flask + Flask-CORS + Flask-SQLAlchemy
- **Database**: SQLite (default, no external dependency) - PostgreSQL supported
- **Task Queue**: Celery + Redis (optional for async tasks)
- **LLM**: LangChain + ChatGroq (Llama 3 8B)
- **Language**: Python 3.9+

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Local Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- Free Groq API key (from [console.groq.com](https://console.groq.com))
- Optional: Docker (if you want to use PostgreSQL + Redis instead of SQLite)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Database tables are created automatically on first run
# Just start the Flask app:

# Start Flask app (terminal 1)
python app.py
```

The app will automatically:
- Create the SQLite database file (`competitor_intel.db`)
- Initialize all required tables
- Be ready to accept API requests on `http://localhost:8000`

**Note about Celery (async tasks):** 
- Celery/Redis are optional. If Redis is not running, the app will still work but tasks may not process asynchronously.
- To run Celery worker (optional, terminal 2):
```bash
celery -A workers.tasks worker --loglevel=info
```

### Optional: Docker Setup (PostgreSQL & Redis)

If you prefer PostgreSQL and Redis instead of SQLite:

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Then configure .env to use PostgreSQL:
DATABASE_URL=postgresql://postgres:password@localhost:5432/competitor_intel
REDIS_URL=redis://localhost:6379/0

# Start Flask app as above
python app.py

# Start Celery worker (optional, terminal 2)
celery -A workers.tasks worker --loglevel=info
```

See `docker-compose.yml` for more details on optional Docker services.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# .env.local is already set to http://localhost:8000/api

# Start dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.

## API Endpoints

### POST /api/agents/run
Run a new competitive analysis.

**Request:**
```json
{
  "sector": "Fintech"
}
```

**Response (202 Accepted):**
```json
{
  "log_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Analysis started"
}
```

### GET /api/agents/status/<log_id>
Get current analysis status.

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sector_keyword": "Fintech",
  "status": "completed",
  "research_output": "{...}",
  "analysis_output": "{...}",
  "category_tier": "High Growth Market",
  "created_at": "2024-01-15T10:30:00",
  "completed_at": "2024-01-15T10:35:00"
}
```

### GET /api/agents/history?tier=<tier>&keyword=<keyword>
Get last 50 analyses with optional filtering.

**Query Parameters:**
- `tier`: Filter by "High Growth Market", "Niche/Saturated", or "Strategic Pivot Required"
- `keyword`: Filter by sector keyword (partial match, case-insensitive)

**Response:**
```json
[
  {
    "id": "...",
    "sector_keyword": "Fintech",
    "status": "completed",
    "category_tier": "High Growth Market",
    ...
  }
]
```

## Database Schema

### AnalysisLog Model

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| sector_keyword | String | Market sector being analyzed |
| status | String | pending \| researching \| analyzing \| completed \| failed |
| research_output | Text | JSON research findings |
| analysis_output | Text | JSON analysis and recommendations |
| category_tier | String | High Growth Market \| Niche/Saturated \| Strategic Pivot Required |
| created_at | DateTime | Analysis creation timestamp |
| completed_at | DateTime | Analysis completion timestamp |

## Status Flow

```
pending → researching → analyzing → completed
                                  ↘
                                    failed (on error)
```

## Market Tiers

- **High Growth Market**: Rapid expansion, high entry potential, significant investment opportunity
- **Niche/Saturated**: Limited growth, mature market, highly competitive
- **Strategic Pivot Required**: Declining trends, limited opportunity, requires business model innovation

## Environment Variables

### Backend (.env)

```
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
# SQLite database (default, no external dependency)
DATABASE_URL=sqlite:///competitor_intel.db
# Optional: Redis for async task queue
REDIS_URL=redis://localhost:6379/0
GROQ_API_KEY=your-groq-api-key-here
```

**Alternatives:**
- To use PostgreSQL: `DATABASE_URL=postgresql://postgres:password@localhost:5432/competitor_intel`
- Without Redis: Simply omit REDIS_URL (tasks will run synchronously)

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Getting Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste into your `.env` file as `GROQ_API_KEY`

## Sample Test Input

```json
{
  "sector": "Fintech"
}
```

## Running Tests

### Backend
```bash
cd backend
pytest tests/
```

### Frontend
```bash
cd frontend
npm run test
```

## Production Deployment

### Backend (Example: Docker)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:create_app()"]
```

### Frontend (Example: Vercel)
```bash
npm run build
npm start
```

## Troubleshooting

### SQLite Database File Not Created
- If `competitor_intel.db` is not created, ensure you have write permissions in the backend directory
- The database is created automatically on first app run

### PostgreSQL Connection Error (if using PostgreSQL)
- Verify Docker container is running: `docker ps`
- Check DATABASE_URL in .env
- For SQLite users: This error can be ignored, SQLite will be used instead

### Redis Connection Error
- If not using async tasks, this can be safely ignored
- Celery will attempt to use Redis if REDIS_URL is set
- To run without Redis, simply don't start the Celery worker

### Groq API Errors
- Verify API key is valid
- Check rate limits (free tier: 30 requests/minute)
- Ensure GROQ_API_KEY env var is set

### Frontend Not Connecting to Backend
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Ensure CORS is properly configured (should allow http://localhost:3000)

### Using Docker When Not Needed
- If you prefer not to use Docker, simply omit the `docker-compose up` step
- SQLite will work out of the box without Docker

## Project Structure

```
competitor-intelligence/
├── backend/
│   ├── app.py                 # Flask application factory
│   ├── extensions.py          # Flask extensions initialization
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── models/
│   │   └── analysis.py        # SQLAlchemy AnalysisLog model
│   ├── routes/
│   │   └── agents.py          # API endpoints (run, status, history)
│   ├── agents/
│   │   └── pipeline.py        # Research and Analyst agents
│   └── workers/
│       └── tasks.py           # Celery async tasks
└── frontend/
    ├── app/
    │   ├── page.tsx           # Main application page
    │   ├── layout.tsx         # Root layout
    │   └── globals.css        # Global styles
    ├── components/
    │   ├── StatusBadge.tsx    # Status display component
    │   ├── TierBadge.tsx      # Market tier component
    │   └── IntelCard.tsx      # Analysis results card
    ├── lib/
    │   ├── types.ts           # TypeScript type definitions
    │   └── api.ts             # Axios API client
    ├── package.json           # NPM dependencies
    ├── tsconfig.json          # TypeScript configuration
    ├── next.config.js         # Next.js configuration
    ├── tailwind.config.ts     # Tailwind CSS configuration
    ├── postcss.config.js      # PostCSS configuration
    └── .env.local             # Local environment variables
```

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
