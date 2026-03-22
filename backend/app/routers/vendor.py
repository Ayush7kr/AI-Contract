"""
Vendor Intelligence Router: Generate risk profile for a vendor.
Uses rule-based heuristics and optional name analysis.
"""
import re
import hashlib
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.contract import VendorRequest

router = APIRouter()

# Risk indicator rules (simulated intelligence)
RISK_INDICATORS = {
    "offshore": {"pattern": r"\b(offshore|cayman|panama|belize|mauritius)\b", "risk": "Offshore jurisdiction raises regulatory compliance concerns", "severity": "high", "score_impact": -20},
    "startup": {"pattern": r"\b(startup|early.stage|pre.?revenue|seed stage)\b", "risk": "Early-stage company with limited track record", "severity": "medium", "score_impact": -10},
    "generic_name": {"pattern": r"\b(solutions|services|group|holdings|enterprise)\b", "risk": "Generic company name may indicate shell company", "severity": "low", "score_impact": -5},
    "established": {"pattern": r"\b(inc|corp|ltd|llc|plc|gmbh)\b", "risk": None, "severity": None, "score_impact": 10},
    "tech": {"pattern": r"\b(tech|technology|software|digital|data|ai|cloud)\b", "risk": None, "severity": None, "score_impact": 5},
}


def _calculate_vendor_score(vendor_name: str) -> Dict[str, Any]:
    """
    Generate a deterministic but realistic-looking vendor risk score.
    Uses hash of vendor name for consistency.
    """
    # Deterministic base score from name hash
    name_hash = int(hashlib.md5(vendor_name.lower().encode()).hexdigest(), 16)
    base_score = 40 + (name_hash % 40)  # Base: 40–80

    detected_risks = []
    detected_positives = []

    for key, indicator in RISK_INDICATORS.items():
        pattern: str = indicator["pattern"]
        if re.search(pattern, vendor_name, re.IGNORECASE):
            base_score += indicator["score_impact"]
            if indicator.get("risk"):
                detected_risks.append({
                    "label": key.replace("_", " ").title(),
                    "description": indicator["risk"],
                    "severity": indicator["severity"],
                })
            else:
                detected_positives.append(key.replace("_", " ").title())

    # Clamp score
    trust_score = max(10, min(95, base_score))

    if trust_score >= 70:
        risk_level = "low"
        recommendation = "Vendor appears relatively low-risk. Standard due diligence recommended."
    elif trust_score >= 50:
        risk_level = "medium"
        recommendation = "Moderate risk level. Request financial statements and references before proceeding."
    else:
        risk_level = "high"
        recommendation = "High risk profile. Enhanced due diligence strongly recommended. Consider alternatives."

    return {
        "vendor_name": vendor_name,
        "trust_score": trust_score,
        "risk_level": risk_level,
        "risk_indicators": detected_risks,
        "positive_signals": detected_positives,
        "recommendation": recommendation,
        "risk_categories": {
            "financial_stability": max(20, min(95, trust_score + (name_hash % 20) - 10)),
            "compliance": max(20, min(95, trust_score + (name_hash % 15) - 7)),
            "reputation": max(20, min(95, trust_score + (name_hash % 25) - 12)),
            "operational": max(20, min(95, trust_score + (name_hash % 18) - 9)),
        },
        "mock_data_note": "Risk profile is generated using rule-based heuristics. For real vendor intelligence, integrate with a business data API.",
    }


@router.post("/analyze")
def analyze_vendor(
    request: VendorRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate a vendor risk intelligence profile."""
    if not request.vendor_name or len(request.vendor_name.strip()) < 2:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Vendor name is required")

    result = _calculate_vendor_score(request.vendor_name)
    if request.industry:
        result["industry"] = request.industry

    return result
