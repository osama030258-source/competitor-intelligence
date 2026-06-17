from datetime import datetime
from uuid import uuid4
from extensions import db

class AnalysisLog(db.Model):
    __tablename__ = 'analysis_logs'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    sector_keyword = db.Column(db.String(255), nullable=False, index=True)
    status = db.Column(
        db.String(20),
        nullable=False,
        default='pending',
        index=True
    )
    research_output = db.Column(db.Text, nullable=True)
    analysis_output = db.Column(db.Text, nullable=True)
    category_tier = db.Column(db.String(50), nullable=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'sector_keyword': self.sector_keyword,
            'status': self.status,
            'research_output': self.research_output,
            'analysis_output': self.analysis_output,
            'category_tier': self.category_tier,
            'created_at': self.created_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
