"""
AI Router: OpenAI-powered endpoints for rewrite suggestions, negotiation, and RAG chat.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.contract import Contract
from app.schemas.contract import SuggestRequest, NegotiateRequest, ChatRequest
from app.services.gemini_service import suggest_rewrite, generate_negotiation, answer_legal_question
from app.services.rag_service import index_contract, retrieve_relevant

router = APIRouter()


@router.post("/suggest")
def suggest(
    request: SuggestRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate a safer rewrite suggestion for a risky clause."""
    if not request.clause_text or len(request.clause_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Clause text is too short")

    result = suggest_rewrite(
        clause_text=request.clause_text,
        clause_type=request.clause_type or "general",
        risk_reason=request.risk_reason or "",
    )
    return result


@router.post("/negotiate")
def negotiate(
    request: NegotiateRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate a professional negotiation response for a clause."""
    if not request.clause_text or len(request.clause_text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Clause text is too short")

    result = generate_negotiation(
        clause_text=request.clause_text,
        context=request.context or "",
    )
    return result


@router.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Answer legal questions using RAG over uploaded contracts.
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
            # Index if not already done
            index_contract(contract.id, contract.raw_text)
            # Retrieve relevant chunks
            chunks = retrieve_relevant(contract.id, request.question, top_k=3)
            context = "\n\n---\n\n".join(chunks)

    answer = answer_legal_question(request.question, context)

    return {
        "question": request.question,
        "answer": answer,
        "source_contract": source_contract,
        "context_used": bool(context),
    }
