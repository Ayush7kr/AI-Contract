"""
Litigation Router: Predict litigation risk using rule-based pattern detection.
"""
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract

router = APIRouter()

# ─── Litigation Risk Indicators ──────────────────────────────────────────────
LITIGATION_PATTERNS = [
    {"pattern": r"\bvague\b|\bsubjective\b|\bat\s+our\s+discretion\b", "weight": 15, "label": "Vague/Subjective Terms", "description": "Ambiguous language is a leading cause of contract disputes."},
    {"pattern": r"\bunlimited\s+liabilit(y|ies)\b", "weight": 25, "label": "Unlimited Liability", "description": "Uncapped liability frequently leads to litigation."},
    {"pattern": r"\bpenalt(y|ies)\b.{0,100}\d+", "weight": 20, "label": "Penalty Clauses", "description": "Strict penalty clauses are commonly contested in court."},
    {"pattern": r"\bno\s+refund\b|\bnon-refundable\b", "weight": 15, "label": "No-Refund Policy", "description": "Blanket no-refund clauses frequently trigger disputes."},
    {"pattern": r"\bunilateral\b|\bsole\s+discretion\b", "weight": 18, "label": "Unilateral Rights", "description": "Unilateral modification rights create dispute-prone situations."},
    {"pattern": r"\bno\s+warranty\b|\bas.?is\b|\bdisclaim\b", "weight": 12, "label": "Disclaimer of Warranties", "description": "Complete disclaimer of warranties often leads to consumer disputes."},
    {"pattern": r"\bintellectual property.{0,200}(dispute|infringement|ownership)\b", "weight": 20, "label": "IP Ambiguity", "description": "Unclear IP ownership is a top driver of commercial litigation."},
    {"pattern": r"\bconfidentialit(y|ies).{0,200}(breach|violat)\b", "weight": 15, "label": "Confidentiality Breach Risk", "description": "Broad confidentiality obligations increase breach risk."},
    {"pattern": r"\bmaterial\s+breach\b|\bfundamental\s+breach\b", "weight": 12, "label": "Material Breach Provisions", "description": "Strict material breach provisions can escalate to litigation quickly."},
    {"pattern": r"\bindemnif(y|ication).{0,200}third.?part", "weight": 18, "label": "Third-Party Indemnification", "description": "Third-party indemnification obligations spawn complex litigation."},
]


@router.post("/{contract_id}")
def predict_litigation_risk(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Predict litigation risk probability for a contract."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for litigation analysis")

    text = contract.raw_text
    triggered = []
    total_score: float = 0.0

    for pattern_info in LITIGATION_PATTERNS:
        pattern: str = pattern_info["pattern"]
        if re.search(pattern, text, re.IGNORECASE | re.DOTALL):
            triggered.append({
                "label": pattern_info["label"],
                "description": pattern_info["description"],
                "weight": pattern_info["weight"],
            })
            total_score += float(pattern_info["weight"])

    # Normalize to probability (0–100)
    max_possible = sum(p["weight"] for p in LITIGATION_PATTERNS)
    probability = round(min(100.0, (total_score / max_possible) * 100), 1)

    if probability >= 60:
        risk_level = "high"
        recommendation = "This contract has multiple dispute-prone provisions. Strongly recommend legal review and renegotiation before signing."
    elif probability >= 35:
        risk_level = "medium"
        recommendation = "Moderate litigation risk detected. Consider revising key provisions with legal counsel before execution."
    else:
        risk_level = "low"
        recommendation = "Litigation risk is relatively low. Standard review recommended before signing."

    result = {
        "probability": probability,
        "risk_level": risk_level,
        "triggered_patterns": triggered,
        "pattern_count": len(triggered),
        "recommendation": recommendation,
        "industry_avg_comparison": 35.0,  # Illustrative industry average
    }

    contract.litigation_json = result
    db.commit()

    return result
