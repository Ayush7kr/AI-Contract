"""
Risk Engine: Calculate overall risk score from clause analysis results.
Rule-based scoring system (0–100 scale).
"""
from typing import List, Dict, Any


SEVERITY_MULTIPLIER = {
    "critical": 1.5,
    "high": 1.2,
    "medium": 1.0,
    "low": 0.7,
}

def calculate_risk_score(clauses: List[Dict[str, Any]]) -> float:
    """
    Calculate overall contract risk score (0–100).
    Aggregates risk contributions from all flagged clauses.
    """
    if not clauses:
        return 0.0

    total_score = 0.0
    for clause in clauses:
        for risk in clause.get("risks", []):
            severity = risk.get("severity", "medium")
            base = risk.get("score_contribution", 10)
            total_score += base * SEVERITY_MULTIPLIER.get(severity, 1.0)

    # Normalize: cap at 100
    normalized = min(100.0, total_score)
    return round(normalized, 1)


def get_risk_level(score: float) -> str:
    """Convert numeric score to human-readable risk level."""
    if score >= 75:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 25:
        return "medium"
    else:
        return "low"


def get_risk_summary(clauses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a full risk summary including:
    - Risk score
    - Risk level
    - Flagged clauses count
    - Breakdown by severity
    """
    risky_clauses = [c for c in clauses if c.get("is_risky")]
    score = calculate_risk_score(clauses)

    severity_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    all_risks = []
    for clause in risky_clauses:
        for risk in clause.get("risks", []):
            sev = risk.get("severity", "low")
            severity_counts[sev] = severity_counts.get(sev, 0) + 1
            all_risks.append({
                "clause_id": clause["id"],
                "clause_title": clause.get("title", ""),
                "risk_label": risk["label"],
                "severity": sev,
                "explanation": risk["explanation"],
            })

    return {
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "total_clauses": len(clauses),
        "risky_clauses_count": len(risky_clauses),
        "severity_breakdown": severity_counts,
        "all_risks": all_risks,
        "savings_estimate": _estimate_savings(score),
    }


def _estimate_savings(risk_score: float) -> str:
    """Estimate potential savings from risk mitigation (illustrative)."""
    if risk_score >= 75:
        return "$50,000 – $200,000+"
    elif risk_score >= 50:
        return "$20,000 – $50,000"
    elif risk_score >= 25:
        return "$5,000 – $20,000"
    else:
        return "$1,000 – $5,000"
