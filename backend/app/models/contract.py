"""
Contract SQLAlchemy model.
Stores uploaded contracts and their AI analysis results.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
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

    # Validation
    is_valid_contract = Column(Boolean, default=True)   # Whether it's a real contract

    # Risk Analysis (from Gemini)
    risk_score = Column(Float, nullable=True)           # 0–100
    risk_level = Column(String, nullable=True)          # low / medium / high / critical
    ai_summary = Column(Text, nullable=True)            # Gemini-generated summary
    
    # New Fields
    contract_type = Column(String, nullable=True)       # NDA, Service Agreement, etc.
    confidence_score = Column(Float, nullable=True)     # AI confidence in analysis
    risk_breakdown_json = Column(JSON, nullable=True)   # Breakdown by category

    # AI Analysis JSON (stored as JSON string)
    clauses_json = Column(JSON, nullable=True)          # List of clause dicts from Gemini
    analysis_json = Column(JSON, nullable=True)         # Full analysis result from Gemini
    compliance_json = Column(JSON, nullable=True)       # Compliance scan result from Gemini

    # Status
    status = Column(String, default="uploaded")         # uploaded / processing / done / error / not_contract

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to user
    owner = relationship("User", back_populates="contracts")
