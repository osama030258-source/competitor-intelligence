@echo off
REM Competitor Intelligence - Quick Start Reference
REM Location: C:\Users\osamakhan\competitor-intelligence

echo.
echo ====================================================================
echo  COMPETITOR INTELLIGENCE - QUICK REFERENCE
echo ====================================================================
echo.
echo Project Location: C:\Users\osamakhan\competitor-intelligence
echo.
echo === QUICK START COMMANDS ===
echo.
echo 1. START BACKEND (Flask API):
echo    cd C:\Users\osamakhan\competitor-intelligence\backend
echo    C:\Users\osamakhan\competitor-intelligence\backend\venv\Scripts\python app.py
echo.
echo 2. START FRONTEND (Next.js):
echo    cd C:\Users\osamakhan\competitor-intelligence\frontend
echo    npm install (first time only)
echo    npm run dev
echo.
echo 3. TEST BACKEND:
echo    curl http://localhost:8000/api/health
echo.
echo 4. OPEN FRONTEND:
echo    http://localhost:3000
echo.
echo === FILE LOCATIONS ===
echo.
echo Backend:  C:\Users\osamakhan\competitor-intelligence\backend\
echo Frontend: C:\Users\osamakhan\competitor-intelligence\frontend\
echo Docs:     C:\Users\osamakhan\competitor-intelligence\README.md
echo Config:   C:\Users\osamakhan\competitor-intelligence\backend\.env
echo.
echo === KEY ENDPOINTS ===
echo.
echo Health Check: GET http://localhost:8000/api/health
echo Run Analysis: POST http://localhost:8000/api/agents/run
echo Get Status:   GET http://localhost:8000/api/agents/status/<id>
echo Get History:  GET http://localhost:8000/api/agents/history
echo.
echo === FEATURES ===
echo.
echo ✅ Backend Flask API on port 8000
echo ✅ Frontend Next.js on port 3000
echo ✅ Groq LLM integration (Llama3-8b)
echo ✅ Real-time analysis polling
echo ✅ Optimistic UI updates
echo ✅ Filter by tier and keyword
echo ✅ PostgreSQL-ready models
echo ✅ Celery async tasks (ready)
echo ✅ Docker support
echo.
echo === GROQ API KEY ===
echo.
echo ✅ Active:  your_groq_api_key_here
echo.
echo === DOCUMENTATION ===
echo.
echo - QUICKSTART.md: 5-minute setup guide
echo - README.md: Full documentation
echo - SETUP_COMPLETE.md: Complete status report
echo - PROJECT_STATUS.md: Detailed status
echo.
echo ====================================================================
echo.
pause
