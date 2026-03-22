"""
Compliance Router: Scan contracts for GDPR, data privacy, and regulatory compliance.
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

# ─── Compliance Check Rules ──────────────────────────────────────────────────
COMPLIANCE_CHECKS = [
    {
        "id": "gdpr_data_processing",
        "name": "GDPR Data Processing Basis",
        "category": "GDPR",
        "patterns": [r"\bdata processing\b", r"\blawful basis\b", r"\bconsent\b", r"\blegitimate interest\b"],
        "description": "Contract should specify the lawful basis for processing personal data.",
    },
    {
        "id": "gdpr_data_subject_rights",
        "name": "Data Subject Rights",
        "category": "GDPR",
        "patterns": [r"\bright to access\b", r"\bright to erasure\b", r"\bright to rectification\b", r"\bdata portability\b"],
        "description": "Data subject rights (access, erasure, portability) should be mentioned.",
    },
    {
        "id": "gdpr_dpa",
        "name": "Data Protection Agreement",
        "category": "GDPR",
        "patterns": [r"\bdata protection\b", r"\bDPA\b", r"\bdata processor\b", r"\bdata controller\b"],
        "description": "A Data Protection Agreement or reference to data controller/processor roles is recommended.",
    },
    {
        "id": "privacy_confidentiality",
        "name": "Confidentiality & Privacy",
        "category": "Data Privacy",
        "patterns": [r"\bconfidential\b", r"\bprivacy\b", r"\bnon-disclosure\b"],
        "description": "Confidentiality or privacy obligations should be present.",
    },
    {
        "id": "data_retention",
        "name": "Data Retention Policy",
        "category": "Data Privacy",
        "patterns": [r"\bdata retention\b", r"\bretention period\b", r"\bdelete\b.{0,50}\bdata\b", r"\bpurge\b"],
        "description": "Data retention and deletion timelines should be specified.",
    },
    {
        "id": "security_measures",
        "name": "Security Measures",
        "category": "Data Privacy",
        "patterns": [r"\bsecurity measure\b", r"\bencrypt\b", r"\bsecure\b.{0,50}\bdata\b", r"\baccess control\b"],
        "description": "Technical and organizational security measures should be referenced.",
    },
    {
        "id": "breach_notification",
        "name": "Data Breach Notification",
        "category": "GDPR",
        "patterns": [r"\bbreach notification\b", r"\bdata breach\b", r"\bincident response\b", r"\bnotif(y|ication).{0,50}breach\b"],
        "description": "Data breach notification obligations should be defined (GDPR requires 72-hour notification).",
    },
    {
        "id": "third_party_sharing",
        "name": "Third-Party Data Sharing",
        "category": "Data Privacy",
        "patterns": [r"\bthird.?part(y|ies).{0,100}\bdata\b", r"\bshare\b.{0,100}\bpersonal\b", r"\btransfer\b.{0,100}\bdata\b"],
        "description": "Terms for sharing personal data with third parties should be explicit.",
    },
    {
        "id": "governing_law",
        "name": "Governing Law & Jurisdiction",
        "category": "Legal",
        "patterns": [r"\bgoverning law\b", r"\bjurisdiction\b", r"\bapplicable law\b"],
        "description": "The governing law and jurisdiction for dispute resolution should be specified.",
    },
    {
        "id": "dispute_resolution",
        "name": "Dispute Resolution Mechanism",
        "category": "Legal",
        "patterns": [r"\barbitration\b", r"\bmediation\b", r"\bdispute resolution\b", r"\bconciliation\b"],
        "description": "Clear dispute resolution mechanism protects both parties.",
    },
]


def _status(matched: bool, required: bool) -> str:
    if matched:
        return "pass"
    elif required:
        return "violation"
    else:
        return "warning"


@router.post("/{contract_id}")
def scan_compliance(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Scan contract for GDPR and data privacy compliance."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for compliance scan")

    text = contract.raw_text.lower()
    results = []
    pass_count: int = 0
    warning_count: int = 0
    violation_count: int = 0

    for check in COMPLIANCE_CHECKS:
        matched = any(re.search(p, text, re.IGNORECASE) for p in check["patterns"])
        is_required = check["category"] == "GDPR"
        status_val = _status(matched, is_required)

        if status_val == "pass":
            pass_count += 1
        elif status_val == "warning":
            warning_count += 1
        else:
            violation_count += 1

        results.append({
            "id": check["id"],
            "name": check["name"],
            "category": check["category"],
            "status": status_val,
            "present": matched,
            "description": check["description"],
        })

    overall_score = round(float(pass_count / len(COMPLIANCE_CHECKS)) * 100, 1)
    overall_status = "compliant" if violation_count == 0 else "non-compliant" if violation_count > 2 else "partial"

    # Persist to contract
    compliance_result = {
        "overall_score": overall_score,
        "overall_status": overall_status,
        "pass_count": pass_count,
        "warning_count": warning_count,
        "violation_count": violation_count,
        "checks": results,
    }
    contract.compliance_json = compliance_result
    db.commit()

    return compliance_result
