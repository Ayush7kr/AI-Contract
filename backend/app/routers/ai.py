"""
AI Router: Gemini-powered endpoints for clause rewriting, negotiation, contract chat, and legal news.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract
from app.schemas.contract import SuggestRequest, NegotiateRequest, ChatRequest, CompareRequest, CompareResponse, SimulateRequest
from app.services.gemini_service import rewrite_clause, chat_with_document, generate_legal_news, generate_contract_news, compare_contracts, generate_clause_suggestion, analyze_contract
from app.services.rag_service import retrieve_relevant

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
def compare(
    request: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Compare two contracts and return differences and AI explanation."""
    c1 = db.query(Contract).filter(Contract.id == request.contract_id_1, Contract.user_id == current_user.id).first()
    c2 = db.query(Contract).filter(Contract.id == request.contract_id_2, Contract.user_id == current_user.id).first()
    
    if not c1 or not c2:
        raise HTTPException(status_code=404, detail="One or both contracts not found")
    
    comparison = compare_contracts(c1.raw_text or "", c2.raw_text or "")
    
    return {
        "difference_analysis": comparison,
        "contract1_name": c1.filename,
        "contract2_name": c2.filename
    }


@router.get("/template/{clause_type}")
def get_clause_template(
    clause_type: str,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate a standard legal clause template."""
    return generate_clause_suggestion(clause_type)


@router.post("/simulate")
def simulate_risk(
    request: SimulateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Re-analyze a modified version of a contract to see risk score impact."""
    contract = db.query(Contract).filter(Contract.id == request.contract_id, Contract.user_id == current_user.id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Run analysis on the modified text
    analysis = analyze_contract(request.modified_text)
    
    return {
        "original_score": contract.risk_score,
        "new_score": analysis.get("risk_score", 0),
        "new_level": analysis.get("risk_level", "low"),
        "explanation": analysis.get("risk_explanation", ""),
        "changes": analysis.get("key_risks", [])
    }


@router.post("/suggest")
def suggest(
    request: SuggestRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate a safer rewrite suggestion for a risky clause."""
    if not request.clause_text or len(request.clause_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Clause text is too short")

    result = rewrite_clause(
        clause_text=request.clause_text,
        tone=request.clause_type or "collaborative",
    )
    return {"original": request.clause_text, **result}


@router.post("/negotiate")
def negotiate(
    request: NegotiateRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Rewrite a clause in the specified tone while preserving legal meaning."""
    if not request.clause_text or len(request.clause_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Clause text is too short")

    result = rewrite_clause(
        clause_text=request.clause_text,
        tone=request.tone,
    )
    return {"original": request.clause_text, **result}


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Answer legal questions using the contract document as context.
    If contract_id is provided, retrieves relevant context from that contract.
    """
    if not request.question or len(request.question.strip()) < 3:
        raise HTTPException(status_code=400, detail="Question is too short")

    context = ""
    source_contract = None

    if request.contract_id:
        contract = db.query(Contract).filter(
            Contract.id == request.contract_id,
            Contract.user_id == current_user.id,
        ).first()

        if contract and contract.raw_text:
            source_contract = contract.filename
            # Get relevant chunks for context
            chunks = retrieve_relevant(contract.raw_text, request.question, top_k=3)
            context = "\n\n---\n\n".join(chunks) if chunks else contract.raw_text[:8000]

    answer = chat_with_document(request.question, context)

    return {
        "question": request.question,
        "answer": answer,
        "source_contract": source_contract,
        "context_used": bool(context),
    }


# ─── Legal News & Regulatory Intelligence ────────────────────────────────────

@router.get("/legal-news")
def get_legal_news(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate AI-curated legal and regulatory news updates."""
    result = generate_legal_news()
    return result


@router.get("/legal-news/{contract_id}")
def get_contract_news(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate regulatory impact analysis specific to a contract."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not contract.raw_text:
        raise HTTPException(status_code=400, detail="No text available for analysis")

    # Get both general news and contract-specific insights
    general = generate_legal_news()
    specific = generate_contract_news(contract.raw_text)

    return {
        "contract_id": contract_id,
        "filename": contract.filename,
        "news": general.get("news", []),
        "contract_insights": specific.get("contract_insights", []),
    }

