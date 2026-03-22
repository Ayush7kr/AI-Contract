"""
Contract SQLAlchemy model.
Stores uploaded contracts and their AI analysis results.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)           # Original filename
    file_path = Column(String, nullable=False)          # Server-side path
    file_type = Column(String, nullable=True)           # pdf / docx / txt
    raw_text = Column(Text, nullable=True)              # Extracted text
    page_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)

    # Risk Analysis
    risk_score = Column(Float, nullable=True)           # 0–100
    risk_level = Column(String, nullable=True)          # low / medium / high / critical

    # AI Analysis JSON (stored as JSON string)
    clauses_json = Column(JSON, nullable=True)          # List of clause dicts
    analysis_json = Column(JSON, nullable=True)         # Full analysis result
    compliance_json = Column(JSON, nullable=True)       # Compliance scan result
    litigation_json = Column(JSON, nullable=True)       # Litigation prediction
    obligations_json = Column(JSON, nullable=True)      # Extracted obligations

    # Status
    status = Column(String, default="uploaded")         # uploaded / processing / done / error

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to user
    owner = relationship("User", back_populates="contracts")
