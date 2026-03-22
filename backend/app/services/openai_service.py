"""
OpenAI Service: All LLM-powered features.
Handles clause rewrite suggestions, negotiation responses, risk explanations,
and general legal Q&A.
Falls back to detailed mock responses if no API key is set.
"""
import os
from typing import Optional

from app.core.config import settings


def _get_client():
    """Get OpenAI client if API key is available."""
    if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY.startswith("sk-your"):
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception:
        return None


def _call_openai(system_prompt: str, user_message: str, max_tokens: int = 800) -> str:
    """
    Generic OpenAI chat completion wrapper.
    Falls back to mock response on failure or missing key.
    """
    client = _get_client()
    if client is None:
        return None  # Signal to use mock

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"[AI Error: {str(e)}]"


# ─── Suggest Safer Clause Rewrite ───────────────────────────────────────────

def suggest_rewrite(clause_text: str, clause_type: str = "", risk_reason: str = "") -> dict:
    """
    Generate a safer rewrite of a risky clause.
    """
    system = """You are a legal contract expert specializing in helping MSMEs and startups.
    Analyze the given contract clause and provide:
    1. A plain-English explanation of the risk
    2. A improved, MSME-friendly rewrite of the clause
    Keep explanations clear and concise. Format with headers."""

    user = f"""Clause Type: {clause_type}
Risk Detected: {risk_reason}

Original Clause:
{clause_text}

Please provide:
1. **Risk Explanation**: What makes this clause risky
2. **Safer Rewrite**: A improved version protecting the smaller party
3. **Key Changes**: Bullet points of what was changed and why"""

    result = _call_openai(system, user, max_tokens=600)
    if result is None:
        result = _mock_rewrite(clause_text, clause_type)

    return {"original": clause_text, "suggestion": result, "type": clause_type}


def _mock_rewrite(clause_text: str, clause_type: str) -> str:
    """Detailed mock response when OpenAI is not available."""
    mocks = {
        "liability": """**Risk Explanation**: This liability clause places unlimited exposure on your business, meaning there's no financial ceiling to what you could owe. For MSMEs, this poses extreme financial risk.

**Safer Rewrite**: "The total aggregate liability of either party under this Agreement shall not exceed the total fees paid by the Client in the twelve (12) months preceding the claim, except in cases of gross negligence or willful misconduct."

**Key Changes**:
- Added liability cap tied to contract value
- Mutual liability (both parties protected)
- Preserved exceptions for fraud/gross negligence""",

        "renewal": """**Risk Explanation**: Auto-renewal clauses can trap you in contracts without your active consent, often with short cancellation windows that are easy to miss.

**Safer Rewrite**: "This Agreement shall expire at the end of the Initial Term unless both parties provide written consent to renew no less than 30 days before expiration. No automatic renewal shall occur without explicit written agreement."

**Key Changes**:
- Removed automatic renewal
- Required mutual written consent for renewal
- Extended notice period to 30 days""",

        "payment": """**Risk Explanation**: Vague or harsh payment terms can lead to unexpected costs, penalties, or cash flow issues for small businesses.

**Safer Rewrite**: "Payment of the agreed fees shall be due within 30 days of invoice receipt. Late payments shall incur interest at 1.5% per month, capped at 18% per annum. Any disputed invoices must be raised within 14 days."

**Key Changes**:
- Defined clear 30-day payment term
- Capped late payment interest
- Added dispute resolution window""",
    }
    return mocks.get(clause_type, f"""**Risk Explanation**: This clause contains terms that may be unfavorable for smaller parties and could create legal or financial exposure.

**Safer Rewrite**: Consider negotiating this clause to include:
- Clearer definitions of obligations and scope
- Mutual protections for both parties
- Defined caps or limits on exposure
- Reasonable notice periods and cure rights

**Key Changes**:
- Made terms more balanced and specific
- Added protective caps and limits
- Included clear dispute resolution process""")


# ─── Negotiation Response ────────────────────────────────────────────────────

def generate_negotiation(clause_text: str, context: str = "") -> dict:
    """
    Generate a professional negotiation response/email for a risky clause.
    """
    system = """You are a skilled business negotiation consultant who helps small businesses
    negotiate fairer contract terms professionally. Generate a diplomatic, professional
    negotiation response that is firm but collaborative."""

    user = f"""Contract Clause to Negotiate:
{clause_text}

Context: {context or 'Standard business contract negotiation'}

Please provide:
1. **Negotiation Strategy**: Overall approach
2. **Counter-Proposal**: Specific alternative clause language
3. **Email Template**: A professional email to send to the other party"""

    result = _call_openai(system, user, max_tokens=700)
    if result is None:
        result = """**Negotiation Strategy**: Use a collaborative approach, framing requests as seeking mutual protection.

**Counter-Proposal**: "We propose modifying this clause to include reciprocal protections for both parties. Specifically, we suggest adding a liability cap equal to the contract value and a 30-day cure period before any penalties apply."

**Email Template**:
Subject: Proposed Amendments to [Contract Name] – Clause [X]

Dear [Counterparty Name],

Thank you for the draft agreement. We've reviewed it carefully and are eager to move forward. We have a few proposed modifications to ensure the agreement works well for both parties.

Regarding Clause [X], we'd like to propose the following amendment: [insert counter-proposal]. This language provides clearer protections for both sides and reflects standard industry practice.

We're happy to discuss this on a call at your convenience. Please let me know your thoughts.

Best regards,
[Your Name]"""

    return {"clause": clause_text, "negotiation_response": result}


# ─── Contract Summary ────────────────────────────────────────────────────────

def summarize_contract(text: str, risk_score: float) -> str:
    """
    Generate an executive summary of the contract.
    """
    system = """You are a legal analyst. Summarize the key points of this contract
    for a busy executive. Be concise (3-5 sentences max). Highlight the most important
    obligations, risks, and key terms."""

    # Truncate to avoid token limits
    truncated = text[:3000]
    user = f"Risk Score: {risk_score}/100\n\nContract Excerpt:\n{truncated}"

    result = _call_openai(system, user, max_tokens=300)
    if result is None:
        return f"This contract has been analyzed with an overall risk score of {risk_score}/100. Key areas requiring attention include liability provisions, payment terms, and termination clauses. Multiple clauses have been flagged for review and potential renegotiation before signing."

    return result


# ─── AI Legal Chat ───────────────────────────────────────────────────────────

def answer_legal_question(question: str, contract_context: str = "") -> str:
    """
    Answer legal questions based on contract context (RAG-style).
    """
    system = """You are LexiSure AI, a legal assistant specializing in contract law.
    Answer questions based on the provided contract text. Be clear, practical, and
    always note when professional legal advice should be sought.
    If no contract context is provided, answer generally."""

    user = f"""Contract Context:
{contract_context[:2000] if contract_context else 'No specific contract loaded.'}

Question: {question}"""

    result = _call_openai(system, user, max_tokens=500)
    if result is None:
        return f"""Based on your question about "{question}", here is what I can advise:

Contract law varies by jurisdiction, but generally speaking, the clauses you're concerned about should be reviewed carefully. Key considerations include:

1. **Liability Exposure**: Always ensure any liability is proportionate and capped
2. **Termination Rights**: Verify you have reasonable exit options
3. **Payment Terms**: Confirm timelines and penalty structures are fair

⚠️ **Disclaimer**: This is AI-generated guidance for educational purposes only. Please consult a qualified attorney for legal advice specific to your situation.

If you'd like me to analyze a specific clause from your uploaded contract, please specify the clause number or text."""

    return result
