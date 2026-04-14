"""
Analysis Router: Re-analyze a contract using Gemini.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract
from app.services.gemini_service import analyze_contract

router = APIRouter()


@router.post("/{contract_id}/analyze")
def run_analysis(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Re-run the full Gemini AI analysis pipeline on a contract."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for analysis")

    # Re-run Gemini analysis
    analysis = analyze_contract(contract.raw_text)

    # Persist updated analysis
    contract.risk_score = analysis["risk_score"]
    contract.risk_level = analysis["risk_level"]
    contract.ai_summary = analysis["summary"]
    contract.clauses_json = analysis.get("key_clauses", [])
    contract.analysis_json = analysis
    contract.status = "done"
    db.commit()

    return {
        "contract_id": contract_id,
        "filename": contract.filename,
        **analysis,
    }
