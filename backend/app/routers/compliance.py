"""
Compliance Router: AI-powered compliance scanning using Gemini.
Analyzes contracts against GDPR, HIPAA, and general legal requirements.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract
from app.services.gemini_service import scan_compliance

router = APIRouter()


@router.post("/{contract_id}")
def run_compliance_scan(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Scan contract for GDPR, HIPAA, and general legal compliance using Gemini AI."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for compliance scan")

    # Run Gemini compliance analysis
    result = scan_compliance(contract.raw_text)

    # Persist to contract
    contract.compliance_json = result
    db.commit()

    return result
