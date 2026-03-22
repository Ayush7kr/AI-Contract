"""
NLP Service: Clause segmentation, classification, and risk keyword detection.
Uses regex + heuristics (spaCy optional for sentence splitting).
"""
import re
from typing import List, Dict, Any

# ─── Clause Type Keywords ────────────────────────────────────────────────────
CLAUSE_PATTERNS = {
    "liability": [
        r"\bliabilit(y|ies)\b", r"\bindemnif(y|ication)\b", r"\bdamages\b",
        r"\bloss\b", r"\bcompensation\b",
    ],
    "indemnity": [
        r"\bindemnif(y|ication)\b", r"\bhold harmless\b", r"\bdefend\b",
        r"\bindemnitor\b", r"\bindemnitee\b",
    ],
    "termination": [
        r"\bterminat(e|ion)\b", r"\bcancel(l?ation)?\b", r"\bexpir(e|ation|y)\b",
        r"\bend of (the )?agreement\b", r"\bnotice period\b",
    ],
    "payment": [
        r"\bpayment\b", r"\binvoice\b", r"\bfee(s)?\b", r"\bcost(s)?\b",
        r"\bprice\b", r"\bremuneration\b", r"\bsalar(y|ies)\b", r"\bpenalt(y|ies)\b",
    ],
    "renewal": [
        r"\brenewal\b", r"\bauto-?renew\b", r"\brolling (contract|agreement)\b",
        r"\bextension\b", r"\bevergreen\b",
    ],
    "confidentiality": [
        r"\bconfidential\b", r"\bnon-disclosure\b", r"\bNDA\b", r"\bproprietary\b",
        r"\btrade secret\b", r"\bsecrecy\b",
    ],
    "intellectual_property": [
        r"\bintellectual property\b", r"\bcopyright\b", r"\btrademark\b",
        r"\bpatent\b", r"\blicense\b", r"\bIP\b",
    ],
    "dispute": [
        r"\bdispute\b", r"\barbitration\b", r"\blitigation\b", r"\bmediation\b",
        r"\bgoverning law\b", r"\bjurisdiction\b",
    ],
    "force_majeure": [
        r"\bforce majeure\b", r"\bact of god\b", r"\bunforeseeable\b",
    ],
    "warranty": [
        r"\bwarrant(y|ies)\b", r"\brepresentation\b", r"\bguarantee\b",
    ],
}

# ─── Risk Detection Patterns ─────────────────────────────────────────────────
RISK_PATTERNS = [
    {
        "pattern": r"\bunlimited\s+liabilit(y|ies)\b",
        "label": "Unlimited Liability",
        "severity": "critical",
        "explanation": "This clause exposes you to unlimited financial liability with no cap, which is extremely risky.",
        "score": 35,
    },
    {
        "pattern": r"\bauto[-\s]?renew(al|s)?\b",
        "label": "Auto-Renewal Clause",
        "severity": "high",
        "explanation": "The contract auto-renews without explicit consent, potentially locking you in indefinitely.",
        "score": 20,
    },
    {
        "pattern": r"\bpenalt(y|ies)\b.{0,100}\b(\d+[\%x]|\$[\d,]+)",
        "label": "High Penalty Clause",
        "severity": "high",
        "explanation": "Specific financial penalties are defined that could significantly impact your business.",
        "score": 20,
    },
    {
        "pattern": r"\bsole\s+discretion\b",
        "label": "Unilateral Decision Making",
        "severity": "medium",
        "explanation": "Decisions can be made unilaterally by the other party without your input or consent.",
        "score": 15,
    },
    {
        "pattern": r"\bany\s+and\s+all\s+claims\b",
        "label": "Broad Claims Waiver",
        "severity": "high",
        "explanation": "You are waiving all claims, which could prevent you from seeking recourse later.",
        "score": 18,
    },
    {
        "pattern": r"\bperpetual\s+(license|right)\b",
        "label": "Perpetual License Grant",
        "severity": "medium",
        "explanation": "You are granting perpetual rights which cannot be revoked even after contract termination.",
        "score": 12,
    },
    {
        "pattern": r"\bnon[-\s]?compet(e|ition)\b",
        "label": "Non-Compete Clause",
        "severity": "medium",
        "explanation": "Non-compete restrictions may limit your ability to work in similar industries.",
        "score": 15,
    },
    {
        "pattern": r"\bindemnif(y|ication)\b.{0,200}\bthird\s+part(y|ies)\b",
        "label": "Third-Party Indemnification",
        "severity": "high",
        "explanation": "You may be required to indemnify against third-party claims, creating broad exposure.",
        "score": 22,
    },
    {
        "pattern": r"\bwaive(r|s)?\b.{0,100}\bright(s)?\b",
        "label": "Rights Waiver",
        "severity": "medium",
        "explanation": "This clause waives important rights that may be difficult to recover contractually.",
        "score": 12,
    },
    {
        "pattern": r"\bas[-\s]?is\b",
        "label": "As-Is / No Warranty",
        "severity": "medium",
        "explanation": "Services/products are provided without warranties, limiting your recourse if issues arise.",
        "score": 10,
    },
    {
        "pattern": r"\bvague\b|\bsubject\s+to\s+change\b|\bat\s+our\s+discretion\b",
        "label": "Vague Terms",
        "severity": "low",
        "explanation": "Vague or discretionary language creates uncertainty and potential for disputes.",
        "score": 8,
    },
    {
        "pattern": r"\bconfidential.{0,100}perpetual\b|\bperpetual.{0,100}confidential\b",
        "label": "Perpetual Confidentiality",
        "severity": "medium",
        "explanation": "Confidentiality obligations extend indefinitely, which is unusual and burdensome.",
        "score": 10,
    },
]


def segment_clauses(text: str) -> List[str]:
    """
    Split contract text into clause-level segments.
    Uses numbered sections, headings, and paragraph breaks.
    """
    # Try numbered sections first (1. 2. A. B. etc.)
    section_pattern = r"\n(?=\s*(?:\d+\.|\([a-z]\)|[A-Z]\.|\bARTICLE\b|\bSECTION\b|\bCLAUSE\b))"
    clauses = re.split(section_pattern, text, flags=re.IGNORECASE)

    # Fall back to double-newline paragraphs if we got too few sections
    if len(clauses) < 3:
        clauses = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 50]

    # Remove very short fragments
    clauses = [c.strip() for c in clauses if len(c.strip()) > 40]
    return clauses


def classify_clause(text: str) -> str:
    """
    Classify a clause into one of the known types.
    Returns the type with the most keyword matches.
    """
    scores = {}
    text_lower = text.lower()
    for clause_type, patterns in CLAUSE_PATTERNS.items():
        count = sum(1 for p in patterns if re.search(p, text_lower, re.IGNORECASE))
        if count > 0:
            scores[clause_type] = count

    return max(scores, key=scores.get) if scores else "general"


def detect_risks(clause_text: str) -> List[Dict[str, Any]]:
    """
    Detect risk patterns in a clause.
    Returns list of risk findings with label, severity, explanation, and score.
    """
    findings = []
    for risk in RISK_PATTERNS:
        if re.search(risk["pattern"], clause_text, re.IGNORECASE | re.DOTALL):
            findings.append({
                "label": risk["label"],
                "severity": risk["severity"],
                "explanation": risk["explanation"],
                "score_contribution": risk["score"],
            })
    return findings


def analyze_clauses(text: str) -> List[Dict[str, Any]]:
    """
    Full NLP analysis pipeline:
    1. Segment clauses
    2. Classify each clause
    3. Detect risks per clause
    Returns a list of clause analysis objects.
    """
    segments = segment_clauses(text)
    results = []

    for i, clause_text in enumerate(segments):
        clause_type = classify_clause(clause_text)
        risks = detect_risks(clause_text)
        risk_score_contribution = sum(r["score_contribution"] for r in risks)
        is_risky = len(risks) > 0

        # Extract a short title from first line
        first_line = clause_text.split("\n")[0].strip()[:80]

        results.append({
            "id": i + 1,
            "title": first_line or f"Clause {i + 1}",
            "text": clause_text,
            "type": clause_type,
            "is_risky": is_risky,
            "risks": risks,
            "risk_score_contribution": risk_score_contribution,
            "word_count": len(clause_text.split()),
        })

    return results
