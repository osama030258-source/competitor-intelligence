from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def init_extensions(app):
    """Initialize Flask extensions with SQLite support"""
    # Initialize database with SQLite (or custom DATABASE_URL)
    db.init_app(app)

    # Log database configuration
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///competitor_intel.db')
    if 'sqlite' in db_url:
        app.logger.info(f"Using SQLite database: {db_url}")
    else:
        app.logger.info(f"Using database: {db_url}")
