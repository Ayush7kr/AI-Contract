"""
Gemini Service: Google LLM-powered features.
Primary AI provider for contract analysis, summaries, and chat.
"""
import google.generativeai as genai
from app.core.config import settings
from typing import Optional

def _get_model():
    """Initialize and return Gemini model."""
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your-gemini-api-key-here":
        return None
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel('gemini-1.5-flash')
    except Exception:
        return None

def _call_gemini(system_prompt: str, user_message: str) -> Optional[str]:
    """Generic Gemini call wrapper."""
    model = _get_model()
    if model is None:
        return None
    
    try:
        # Gemini 1.5 format - combined prompt
        full_prompt = f"{system_prompt}\n\nUSER MESSAGE:\n{user_message}"
        response = model.generate_content(full_prompt)
        return response.text.strip()
    except Exception as e:
        return f"[Gemini Error: {str(e)}]"

# ─── Feature Implementations ────────────────────────────────────────────────

def suggest_rewrite(clause_text: str, clause_type: str = "", risk_reason: str = "") -> dict:
    system = "You are a legal contract expert. Analyze the clause and provide: 1. Risk Explanation 2. Safer Rewrite 3. Key Changes."
    user = f"Clause Type: {clause_type}\nRisk: {risk_reason}\nText: {clause_text}"
    
    result = _call_gemini(system, user)
    if result is None:
        from app.services.openai_service import _mock_rewrite
        result = _mock_rewrite(clause_text, clause_type)
        
    return {"original": clause_text, "suggestion": result, "type": clause_type}

def generate_negotiation(clause_text: str, context: str = "") -> dict:
    system = "You are a business negotiator. Provide: 1. Strategy 2. Counter-Proposal 3. Email Template."
    user = f"Clause: {clause_text}\nContext: {context}"
    
    result = _call_gemini(system, user)
    if result is None:
        # Fallback to mock logic if needed, or static string
        result = "**Strategy**: Collaborative. **Counter-Proposal**: Cap liability. **Email**: Dear [Name]..."
        
    return {"clause": clause_text, "negotiation_response": result}

def summarize_contract(text: str, risk_score: float) -> str:
    system = "Summarize this contract concisely (3-5 sentences). Highlight obligations and risks."
    user = f"Risk Score: {risk_score}/100\nText: {text[:4000]}"
    
    result = _call_gemini(system, user)
    return result or f"Contract analyzed with risk score {risk_score}. High focus on liability and terms recommended."

def answer_legal_question(question: str, contract_context: str = "") -> str:
    system = "You are LexiSure AI. Answer the legal question based on the contract context."
    user = f"Context: {contract_context[:3000]}\nQuestion: {question}"
    
    result = _call_gemini(system, user)
    return result or "LexiSure AI is currently in offline mode. Please consult an attorney for specific advice."
