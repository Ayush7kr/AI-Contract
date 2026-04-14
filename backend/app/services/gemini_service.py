"""
Gemini Service: Google LLM-powered features.
Single AI engine for ALL contract analysis, chat, compliance, and vendor intelligence.
Uses the new google-genai SDK.
"""
import json
import re
import traceback
from google import genai
from google.genai import types
from app.core.config import settings
from typing import Optional, Dict, Any


def _get_client():
    """Initialize and return Gemini client."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "your-gemini-api-key-here":
        return None
    try:
        client = genai.Client(api_key=api_key)
        return client
    except Exception:
        return None


def _call_gemini_text(prompt: str) -> Optional[str]:
    """Generic Gemini call — returns raw text response."""
    client = _get_client()
    if client is None:
        return None
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"[Gemini Error] {str(e)}")
        traceback.print_exc()
        return f"[Gemini Error: {str(e)}]"


def _parse_json_from_response(text: str) -> Optional[Dict]:
    """Parse JSON from Gemini response, handling markdown code fences."""
    if not text:
        return None
    # Strip markdown code fences
    cleaned = re.sub(r'^```(?:json)?\s*', '', text.strip())
    cleaned = re.sub(r'\s*```$', '', cleaned.strip())
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def _call_gemini_json(prompt: str) -> Optional[Dict]:
    """Call Gemini and parse response as JSON."""
    text = _call_gemini_text(prompt)
    if not text or text.startswith("[Gemini Error"):
        return None
    return _parse_json_from_response(text)


# ─── Feature: Contract Analysis ─────────────────────────────────────────────

def analyze_contract(text: str) -> Dict[str, Any]:
    """
    Analyze a contract and return structured analysis.
    Returns risk score, risk level, key risks, summary, missing/weak clauses, risk explanation.
    """
    # Truncate to fit Gemini context
    truncated = text[:12000]

    prompt = f"""You are a legal contract analysis AI. Analyze this contract text thoroughly and return a JSON object with EXACTLY these fields:

{{
  "is_legal_contract": <true or false — whether this text is actually a legal contract>,
  "risk_score": <integer 0-100, where 0=no risk and 100=extreme risk. Base this on: presence/absence of protective clauses, ambiguous language, one-sided terms, missing standard clauses>,
  "risk_level": "<one of: low, medium, high, critical>",
  "risk_explanation": "<2-3 sentence explanation of WHY this risk score was assigned. Reference specific clauses or missing elements>",
  "summary": "<3-5 sentence summary of the contract's purpose, parties involved, and key terms>",
  "key_risks": [
    {{
      "title": "<risk title>",
      "severity": "<low, medium, high, or critical>",
      "description": "<1-2 sentence description of the risk>"
    }}
  ],
  "missing_clauses": [
    {{
      "clause_name": "<name of the missing clause, e.g. Force Majeure, Data Protection, Dispute Resolution>",
      "importance": "<critical, recommended, or optional>",
      "description": "<why this clause should be present>"
    }}
  ],
  "weak_clauses": [
    {{
      "clause_name": "<name of the weak clause>",
      "issue": "<what makes this clause weak or ambiguous>",
      "suggestion": "<how it could be strengthened>"
    }}
  ],
  "key_clauses": [
    {{
      "type": "<clause type like: scope_of_services, payment_terms, confidentiality, liability, termination, indemnification, intellectual_property, governing_law, dispute_resolution, warranties, data_protection, non_compete, force_majeure, amendment, notices, assignment>",
      "title": "<human-readable clause title, e.g. Scope of Services, Payment Terms>",
      "text": "<relevant excerpt from the contract for this clause, max 300 chars>",
      "is_risky": <true or false>,
      "risk_reason": "<why this clause is risky, or empty string if not risky>"
    }}
  ]
}}

IMPORTANT RULES:
- Extract as many distinct clauses as you can find in the document (aim for 5-15 clauses)
- For missing_clauses, identify standard contract clauses that SHOULD be present but are NOT
- For weak_clauses, identify clauses that exist but have vague, ambiguous, or one-sided language
- Base risk_score entirely on the document content — never use random numbers
- Return ONLY valid JSON, no markdown, no explanation

CONTRACT TEXT:
{truncated}"""

    result = _call_gemini_json(prompt)
    if result:
        # Ensure required fields exist with defaults
        result.setdefault("is_legal_contract", True)
        result.setdefault("risk_score", 0)
        result.setdefault("risk_level", "low")
        result.setdefault("risk_explanation", "")
        result.setdefault("summary", "Analysis completed.")
        result.setdefault("key_risks", [])
        result.setdefault("missing_clauses", [])
        result.setdefault("weak_clauses", [])
        result.setdefault("key_clauses", [])
        # Clamp risk score
        result["risk_score"] = max(0, min(100, int(result["risk_score"])))
        return result

    # Fallback if Gemini fails
    return {
        "is_legal_contract": False,
        "risk_score": 0,
        "risk_level": "low",
        "risk_explanation": "Unable to determine risk — AI service unavailable.",
        "summary": "Unable to analyze contract — AI service unavailable. Please check your API key and quota.",
        "key_risks": [],
        "missing_clauses": [],
        "weak_clauses": [],
        "key_clauses": [],
    }


# ─── Feature: AI Chat ───────────────────────────────────────────────────────

def chat_with_document(question: str, document_text: str = "") -> str:
    """Answer a user question based only on the contract document text."""
    context_text = document_text[:10000] if document_text else ""

    if context_text:
        prompt = f"""You are LexiSure AI, a legal contract analysis assistant. Answer the user's question based ONLY on the contract text provided below. If the answer cannot be found in the contract, say so clearly.

CONTRACT TEXT:
{context_text}

USER QUESTION:
{question}

Provide a clear, helpful answer:"""
    else:
        prompt = f"""You are LexiSure AI, a legal contract analysis assistant. The user hasn't selected a specific contract for context. Answer their general legal question helpfully, but remind them to upload and select a contract for document-specific analysis.

USER QUESTION:
{question}

Provide a clear, helpful answer:"""

    result = _call_gemini_text(prompt)
    return result or "LexiSure AI is currently unavailable. Please try again later."


# ─── Feature: Clause Negotiation / Rewrite ───────────────────────────────────

def rewrite_clause(clause_text: str, tone: str = "collaborative") -> Dict[str, Any]:
    """Rewrite a clause in the specified tone while preserving legal meaning."""
    prompt = f"""You are a legal contract negotiation expert. Rewrite the following clause in a **{tone}** tone while preserving its legal meaning and intent.

Return a JSON object with EXACTLY these fields:
{{
  "rewritten_clause": "<the rewritten clause text>",
  "tone_used": "{tone}",
  "changes_made": ["<list of key changes you made>"],
  "legal_notes": "<brief note about legal implications of the changes>"
}}

Return ONLY valid JSON, no markdown.

ORIGINAL CLAUSE:
{clause_text}"""

    result = _call_gemini_json(prompt)
    if result:
        result.setdefault("rewritten_clause", clause_text)
        result.setdefault("tone_used", tone)
        result.setdefault("changes_made", [])
        result.setdefault("legal_notes", "")
        return result

    return {
        "rewritten_clause": clause_text,
        "tone_used": tone,
        "changes_made": ["AI service unavailable — original clause returned"],
        "legal_notes": "Unable to process. Please try again.",
    }


# ─── Feature: Compliance Scan ────────────────────────────────────────────────

def scan_compliance(text: str) -> Dict[str, Any]:
    """Analyze contract for compliance issues (GDPR, HIPAA, general legal risks)."""
    truncated = text[:10000]

    prompt = f"""You are a legal compliance analyst. Analyze this contract for compliance issues across GDPR, HIPAA, and general legal best practices.

Return a JSON object with EXACTLY these fields:
{{
  "overall_score": <integer 0-100, where 100=fully compliant>,
  "overall_status": "<compliant, partial, or non-compliant>",
  "frameworks": [
    {{
      "name": "<framework name like GDPR, HIPAA, Data Privacy, Legal Best Practices>",
      "score": <integer 0-100>,
      "status": "<compliant, partial, or non-compliant>",
      "issues": [
        {{
          "title": "<issue title>",
          "severity": "<critical, warning, or info>",
          "description": "<what's missing or problematic>",
          "recommendation": "<what should be added or changed>"
        }}
      ]
    }}
  ],
  "summary": "<2-3 sentence summary of compliance posture>"
}}

Return ONLY valid JSON, no markdown.

CONTRACT TEXT:
{truncated}"""

    result = _call_gemini_json(prompt)
    if result:
        result.setdefault("overall_score", 0)
        result.setdefault("overall_status", "non-compliant")
        result.setdefault("frameworks", [])
        result.setdefault("summary", "Compliance analysis completed.")
        return result

    return {
        "overall_score": 0,
        "overall_status": "non-compliant",
        "frameworks": [],
        "summary": "Unable to perform compliance scan — AI service unavailable. Please check your API key and quota.",
    }


# ─── Feature: Vendor Intelligence ────────────────────────────────────────────

def analyze_vendor(company_name: str) -> Dict[str, Any]:
    """Provide a risk profile of a company including financial, legal, and reputation risk."""
    prompt = f"""You are a business intelligence analyst. Provide a comprehensive risk profile for the company "{company_name}".

Return a JSON object with EXACTLY these fields:
{{
  "company_name": "{company_name}",
  "overall_risk_level": "<low, medium, or high>",
  "trust_score": <integer 0-100>,
  "financial_risk": {{
    "level": "<low, medium, or high>",
    "score": <integer 0-100>,
    "factors": ["<list of financial risk factors>"]
  }},
  "legal_risk": {{
    "level": "<low, medium, or high>",
    "score": <integer 0-100>,
    "factors": ["<list of legal risk factors>"]
  }},
  "reputation_risk": {{
    "level": "<low, medium, or high>",
    "score": <integer 0-100>,
    "factors": ["<list of reputation risk factors>"]
  }},
  "recommendation": "<2-3 sentence recommendation for doing business with this company>",
  "key_considerations": ["<list of 3-5 key things to consider>"]
}}

If you don't have specific information about this company, provide a general assessment based on the company name and any context it provides. Return ONLY valid JSON, no markdown.
"""

    result = _call_gemini_json(prompt)
    if result:
        result.setdefault("company_name", company_name)
        result.setdefault("overall_risk_level", "medium")
        result.setdefault("trust_score", 50)
        result.setdefault("recommendation", "")
        result.setdefault("key_considerations", [])
        return result

    return {
        "company_name": company_name,
        "overall_risk_level": "medium",
        "trust_score": 50,
        "financial_risk": {"level": "medium", "score": 50, "factors": ["AI service unavailable — check API key and quota"]},
        "legal_risk": {"level": "medium", "score": 50, "factors": ["AI service unavailable — check API key and quota"]},
        "reputation_risk": {"level": "medium", "score": 50, "factors": ["AI service unavailable — check API key and quota"]},
        "recommendation": "Unable to analyze vendor — AI service unavailable. Please verify your Gemini API key and quota.",
        "key_considerations": [],
    }


# ─── Legacy compat (used by contracts router) ────────────────────────────────

def summarize_contract(text: str, risk_score: float = 0) -> str:
    """Generate a plain-text summary of the contract (legacy wrapper)."""
    prompt = f"""Summarize this contract concisely in 3-5 sentences. Highlight the key obligations, parties involved, and any notable risks.

CONTRACT TEXT:
{text[:6000]}"""
    result = _call_gemini_text(prompt)
    return result or f"Contract analyzed with risk score {risk_score}."


# ─── Feature: Legal News & Regulatory Intelligence ──────────────────────────

def generate_legal_news() -> Dict[str, Any]:
    """Generate general legal/regulatory news updates for the dashboard."""
    prompt = """You are an AI legal analyst and news curator for a contract intelligence platform.

Generate 5 engaging, concise legal/regulatory news updates related to contracts, data protection, AI laws, and business agreements.

Return a JSON array with EXACTLY this format:
[
  {
    "title": "<short catchy headline, max 12 words>",
    "summary": "<2-3 line simple explanation of the update>",
    "impact_level": "<Low or Medium or High>",
    "category": "<one of: GDPR, AI Law, Data Privacy, Contracts, Compliance>",
    "why_it_matters": "<1-2 lines explaining why businesses should care>",
    "call_to_action": "<short engaging line like 'Check your contracts now'>"
  }
]

IMPORTANT RULES:
- Headlines MUST be attractive and clickable
- Use simple language — non-legal users should understand
- Focus on real-world impact for businesses and startups
- Avoid overly technical legal jargon
- Make content feel like 2025/2026 era legal developments
- DO NOT generate fake statistics or cite specific court case numbers
- Keep everything realistic, practical, and actionable
- Return ONLY valid JSON array, no markdown, no explanation"""

    result = _call_gemini_json(prompt)
    if result and isinstance(result, list):
        return {"news": result}

    # If Gemini returned a dict with a "news" key
    if result and isinstance(result, dict) and "news" in result:
        return result

    return {"news": []}


def generate_contract_news(document_text: str) -> Dict[str, Any]:
    """Generate contract-specific regulatory impact analysis."""
    truncated = document_text[:8000]

    prompt = f"""You are an AI legal analyst. Analyze this contract and generate regulatory impact insights.

Based on this contract text, generate 4 news-style insights about how current regulations might affect it.

Return a JSON array with EXACTLY this format:
[
  {{
    "title": "<relevant regulatory update headline, max 12 words>",
    "impact_on_contract": "<2-3 sentences explaining how this affects THIS specific contract>",
    "risk_level": "<Low or Medium or High>",
    "suggestion": "<actionable advice: modify clause, review terms, add protections, etc.>",
    "category": "<one of: GDPR, AI Law, Data Privacy, Contracts, Compliance>"
  }}
]

IMPORTANT RULES:
- Each insight must directly reference clauses or terms from the actual contract
- Do NOT generate vague or generic statements
- Focus on real regulatory frameworks (GDPR, AI Act, CCPA, etc.)
- Suggestions must be specific and actionable
- Return ONLY valid JSON array, no markdown, no explanation

CONTRACT TEXT:
{truncated}"""

    result = _call_gemini_json(prompt)
    if result and isinstance(result, list):
        return {"contract_insights": result}

    if result and isinstance(result, dict) and "contract_insights" in result:
        return result

    return {"contract_insights": []}

