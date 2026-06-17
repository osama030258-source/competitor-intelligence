from celery import Celery
from datetime import datetime
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Redis configuration (optional - if REDIS_URL is not set, Redis will be required but task will fail)
# TODO: In production, consider implementing task queue fallback or synchronous processing
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

celery_app = Celery(
    'competitor_intel',
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)


@celery_app.task(bind=True)
def run_analysis_pipeline(self, log_id: str, sector_keyword: str):
    """
    Celery task that orchestrates the research and analyst agents.
    Updates the AnalysisLog model at each stage using SQLite database.
    """
    from models.analysis import AnalysisLog
    from agents.pipeline import ResearchAgent, AnalystAgent
    from extensions import db
    from flask import Flask

    # Create Flask app context for database operations
    # SQLite is now the default database
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'sqlite:///competitor_intel.db'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    try:
        with app.app_context():
            groq_api_key = os.getenv('GROQ_API_KEY')
            
            # Update status to researching
            log = AnalysisLog.query.filter_by(id=log_id).first()
            if not log:
                return {"error": "Log not found"}
            
            log.status = 'researching'
            db.session.commit()

            # Run research agent
            research_agent = ResearchAgent(groq_api_key)
            research_result = research_agent.run(sector_keyword)
            
            # Update with research output
            log.research_output = json.dumps(research_result)
            log.status = 'analyzing'
            db.session.commit()

            # Run analyst agent
            analyst_agent = AnalystAgent(groq_api_key)
            analysis_result = analyst_agent.run(research_result)
            
            # Update with analysis output and complete
            log.analysis_output = json.dumps(analysis_result)
            log.category_tier = analysis_result.get('category_tier')
            log.status = 'completed'
            log.completed_at = datetime.utcnow()
            db.session.commit()

            return {
                "status": "completed",
                "log_id": log_id,
                "research_output": research_result,
                "analysis_output": analysis_result
            }

    except Exception as e:
        with app.app_context():
            log = AnalysisLog.query.filter_by(id=log_id).first()
            if log:
                log.status = 'failed'
                log.analysis_output = json.dumps({"error": str(e)})
                log.completed_at = datetime.utcnow()
                db.session.commit()
        
        return {"error": str(e), "log_id": log_id}
