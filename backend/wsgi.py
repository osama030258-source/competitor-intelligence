"""WSGI entry point for production deployments with Gunicorn or similar"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run()
