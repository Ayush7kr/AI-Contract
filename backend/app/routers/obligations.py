"""
Obligations Router: Extract deadlines, payments, and renewal dates from contracts.
"""
import re
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract

router = APIRouter()


# ─── Date Extraction Patterns ────────────────────────────────────────────────
DATE_PATTERNS = [
    r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
    r"\b(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b",
    r"\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b",
    r"\b(\d{4}-\d{2}-\d{2})\b",
]

OBLIGATION_CONTEXTS = [
    {"patterns": [r"pay(ment|able|ment due)", r"invoice", r"fee\s+due", r"remuneral"], "type": "payment", "icon": "💰"},
    {"patterns": [r"renew(al)?", r"extend(sion)?", r"auto.?renew"], "type": "renewal", "icon": "🔄"},
    {"patterns": [r"terminat(e|ion)\s+notice", r"notice\s+period", r"cancel(l?ation)?"], "type": "termination", "icon": "📋"},
    {"patterns": [r"deliver(y|able)", r"submit", r"provid[ei]"], "type": "delivery", "icon": "📦"},
    {"patterns": [r"report(ing)?", r"audit", r"compliance\s+deadline"], "type": "reporting", "icon": "📊"},
]


def _extract_dates_near_context(text: str, context_pattern: str) -> List[str]:
    """Extract dates found near a specific keyword context (within 150 chars)."""
    dates = []
    for match in re.finditer(context_pattern, text, re.IGNORECASE):
        start = max(0, match.start() - 100)
        end = min(len(text), match.end() + 150)
        snippet = text[start:end]
        for dp in DATE_PATTERNS:
            found = re.findall(dp, snippet, re.IGNORECASE)
            dates.extend(found)
    return list(set(dates))


def _extract_obligations(text: str) -> List[Dict[str, Any]]:
    """Extract obligation items with context and dates."""
    obligations = []
    obligation_id = 1

    for obl_type in OBLIGATION_CONTEXTS:
        for pat in obl_type["patterns"]:
            for match in re.finditer(pat, text, re.IGNORECASE):
                # Get surrounding context
                start = max(0, match.start() - 50)
                end = min(len(text), match.end() + 200)
                excerpt = text[start:end].strip()

                # Find dates in this excerpt
                found_dates = []
                for dp in DATE_PATTERNS:
                    found_dates.extend(re.findall(dp, excerpt, re.IGNORECASE))

                # Extract amount if payment
                amount = None
                if obl_type["type"] == "payment":
                    amt_match = re.search(r"[\$€£]\s*([\d,]+(?:\.\d{2})?)", excerpt)
                    if amt_match:
                        amount = amt_match.group(0)

                obligations.append({
                    "id": obligation_id,
                    "type": obl_type["type"],
                    "icon": obl_type["icon"],
                    "description": excerpt[:200],
                    "dates": found_dates[:3],
                    "amount": amount,
                    "priority": "high" if obl_type["type"] in ("payment", "renewal") else "medium",
                })
                obligation_id += 1

                if obligation_id > 30:  # Cap at 30 obligations
                    break
            if obligation_id > 30:
                break

    return obligations


@router.get("/{contract_id}")
def get_obligations(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Extract and return obligation items from a contract."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for obligation extraction")

    obligations = _extract_obligations(contract.raw_text)

    # Count by type
    type_counts = {}
    for o in obligations:
        type_counts[o["type"]] = type_counts.get(o["type"], 0) + 1

    result = {
        "contract_id": contract_id,
        "filename": contract.filename,
        "total_obligations": len(obligations),
        "type_breakdown": type_counts,
        "obligations": obligations,
    }

    contract.obligations_json = result
    db.commit()

    return result
