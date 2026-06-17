from flask import Blueprint, request, jsonify
from models.analysis import AnalysisLog
from extensions import db
from agents.pipeline import ResearchAgent, AnalystAgent
from datetime import datetime
import json
import os
import threading
from sqlalchemy import desc

agents_bp = Blueprint('agents', __name__)


def _run_pipeline_async(app, log_id: str, sector_keyword: str):
    """Run the AI pipeline in a background thread so the API responds immediately."""
    groq_api_key = os.getenv('GROQ_API_KEY')
    if not groq_api_key:
        with app.app_context():
            log = AnalysisLog.query.filter_by(id=log_id).first()
            if log:
                log.status = 'failed'
                log.analysis_output = json.dumps({"error": "GROQ_API_KEY not set in .env"})
                log.completed_at = datetime.utcnow()
                db.session.commit()
        return

    try:
        with app.app_context():
            # Phase 1: Research
            log = AnalysisLog.query.filter_by(id=log_id).first()
            if not log:
                return

            log.status = 'researching'
            db.session.commit()

            research_agent = ResearchAgent(groq_api_key)
            research_result = research_agent.run(sector_keyword)

            log.research_output = json.dumps(research_result)
            log.status = 'analyzing'
            db.session.commit()

            # Phase 2: Analysis
            analyst_agent = AnalystAgent(groq_api_key)
            analysis_result = analyst_agent.run(research_result)

            log.analysis_output = json.dumps(analysis_result)
            log.category_tier = analysis_result.get('category_tier')
            log.status = 'completed'
            log.completed_at = datetime.utcnow()
            db.session.commit()

    except Exception as e:
        with app.app_context():
            log = AnalysisLog.query.filter_by(id=log_id).first()
            if log:
                log.status = 'failed'
                log.analysis_output = json.dumps({"error": str(e)})
                log.completed_at = datetime.utcnow()
                db.session.commit()


@agents_bp.route('/agents/run', methods=['POST'])
def run_analysis():
    try:
        data = request.get_json()
        sector_keyword = data.get('sector', '').strip()

        if not sector_keyword:
            return jsonify({"error": "sector field is required"}), 400

        # Create a pending log entry
        log = AnalysisLog(
            sector_keyword=sector_keyword,
            status='pending',
        )
        db.session.add(log)
        db.session.commit()

        # Launch the AI pipeline in a background thread
        from flask import current_app
        app = current_app._get_current_object()
        thread = threading.Thread(
            target=_run_pipeline_async,
            args=(app, log.id, sector_keyword),
            daemon=True,
        )
        thread.start()

        return jsonify({
            "log_id": log.id,
            "status": "pending",
            "message": "Analysis started — polling for updates"
        }), 202

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@agents_bp.route('/agents/status/<string:log_id>', methods=['GET'])
def get_status(log_id):
    try:
        log = AnalysisLog.query.filter_by(id=log_id).first()
        if not log:
            return jsonify({"error": "Log not found"}), 404
        return jsonify(log.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@agents_bp.route('/agents/history', methods=['GET'])
def get_history():
    try:
        tier = request.args.get('tier')
        keyword = request.args.get('keyword')

        query = AnalysisLog.query.order_by(desc(AnalysisLog.created_at))

        if tier:
            query = query.filter_by(category_tier=tier)
        if keyword:
            query = query.filter(AnalysisLog.sector_keyword.ilike(f'%{keyword}%'))

        logs = query.limit(50).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500