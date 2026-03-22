"""
Monitoring Router: Simulate live alerts for contract events.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract

router = APIRouter()


def _generate_alerts(contracts: List[Contract]) -> List[Dict[str, Any]]:
    """Generate monitoring alerts based on contract analysis data."""
    alerts = []
    alert_id = 1

    for contract in contracts:
        if not contract.analysis_json:
            continue

        risk_score = contract.risk_score or 0
        risk_level = contract.risk_level or "low"

        # High risk alert
        if risk_score >= 75:
            alerts.append({
                "id": alert_id,
                "type": "critical_risk",
                "severity": "critical",
                "title": "🚨 Critical Risk Detected",
                "message": f"Contract '{contract.filename}' has a critical risk score of {risk_score}/100",
                "contract_id": contract.id,
                "contract_name": contract.filename,
                "timestamp": contract.updated_at or contract.created_at,
                "action": "Review immediately",
            })
            alert_id += 1

        elif risk_score >= 50:
            alerts.append({
                "id": alert_id,
                "type": "high_risk",
                "severity": "high",
                "title": "⚠️ High Risk Contract",
                "message": f"Contract '{contract.filename}' scored {risk_score}/100 — review flagged clauses",
                "contract_id": contract.id,
                "contract_name": contract.filename,
                "timestamp": contract.updated_at or contract.created_at,
                "action": "Review and renegotiate",
            })
            alert_id += 1

        # Risky clause count alert
        if contract.clauses_json:
            risky = [c for c in contract.clauses_json if c.get("is_risky")]
            if len(risky) >= 5:
                alerts.append({
                    "id": alert_id,
                    "type": "risky_clauses",
                    "severity": "high",
                    "title": "📋 Multiple Risky Clauses",
                    "message": f"{len(risky)} risky clauses found in '{contract.filename}'",
                    "contract_id": contract.id,
                    "contract_name": contract.filename,
                    "timestamp": contract.created_at,
                    "action": "Use Negotiation module",
                })
                alert_id += 1

        # Auto-renewal check
        if contract.clauses_json:
            for clause in contract.clauses_json:
                for risk in clause.get("risks", []):
                    if "Auto-Renewal" in risk.get("label", ""):
                        alerts.append({
                            "id": alert_id,
                            "type": "renewal_warning",
                            "severity": "medium",
                            "title": "🔄 Auto-Renewal Detected",
                            "message": f"'{contract.filename}' contains an auto-renewal clause — set a calendar reminder",
                            "contract_id": contract.id,
                            "contract_name": contract.filename,
                            "timestamp": contract.created_at,
                            "action": "Monitor renewal date",
                        })
                        alert_id += 1
                        break

    # Add a general welcome alert if no contracts
    if not alerts and not contracts:
        alerts.append({
            "id": 1,
            "type": "info",
            "severity": "info",
            "title": "👋 Welcome to LexiSure AI",
            "message": "Upload your first contract to start monitoring for risks and alerts.",
            "contract_id": None,
            "contract_name": None,
            "timestamp": datetime.utcnow(),
            "action": "Upload contract",
        })

    return alerts[:20]  # Cap at 20 alerts


@router.get("/alerts")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get live monitoring alerts for all user contracts."""
    contracts = db.query(Contract).filter(
        Contract.user_id == current_user.id,
        Contract.status == "done",
    ).order_by(Contract.created_at.desc()).all()

    alerts = _generate_alerts(contracts)

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "info": 0}
    for a in alerts:
        sev = a["severity"]
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    return {
        "total_alerts": len(alerts),
        "severity_counts": severity_counts,
        "alerts": alerts,
    }
