"""
Analysis Router: Re-analyze a contract, compare two contracts.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract
from app.services.nlp import analyze_clauses
from app.services.risk_engine import get_risk_summary
from app.services.comparison import compare_contracts
from app.services.gemini_service import summarize_contract
from app.schemas.contract import CompareRequest

router = APIRouter()


@router.post("/{contract_id}/analyze")
def run_analysis(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Re-run the full AI analysis pipeline on a contract."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for analysis")

    # Re-run NLP + risk scoring
    clauses = analyze_clauses(contract.raw_text)
    summary = get_risk_summary(clauses)
    ai_summary = summarize_contract(contract.raw_text, summary["risk_score"])

    # Persist updated analysis
    contract.clauses_json = clauses
    contract.analysis_json = summary
    contract.risk_score = summary["risk_score"]
    contract.risk_level = summary["risk_level"]
    db.commit()

    return {
        "contract_id": contract_id,
        "filename": contract.filename,
        "ai_summary": ai_summary,
        **summary,
        "clauses": clauses,
    }


@router.post("/compare")
def compare(
    request: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Compare two contracts and highlight differences."""
    def get_contract(cid):
        c = db.query(Contract).filter(
            Contract.id == cid,
            Contract.user_id == current_user.id,
        ).first()
        if not c:
            raise HTTPException(status_code=404, detail=f"Contract {cid} not found")
        if not c.raw_text:
            raise HTTPException(status_code=400, detail=f"Contract {cid} has no text")
        return c

    c1 = get_contract(request.contract_id_1)
    c2 = get_contract(request.contract_id_2)

    result = compare_contracts(c1.raw_text, c2.raw_text)

    return {
        "contract_1": {"id": c1.id, "filename": c1.filename},
        "contract_2": {"id": c2.id, "filename": c2.filename},
        **result,
    }
