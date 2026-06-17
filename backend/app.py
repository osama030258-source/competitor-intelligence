import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, init_extensions
from routes.agents import agents_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///competitor_intel.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # === IMPORTANT: CORS Configuration ===
    CORS(app, 
         resources={r"/api/*": {"origins": ["http://localhost:3000"]}},
         supports_credentials=True)
    
    # Initialize extensions
    init_extensions(app)
    
    # Register blueprint
    app.register_blueprint(agents_bp, url_prefix='/api')
    
    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({"message": "Backend API is running", "status": "healthy"})
    
    # Auto create tables
    with app.app_context():
        db.create_all()
    
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=True)