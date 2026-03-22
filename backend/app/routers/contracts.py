"""
Contracts Router: Upload, list, get, delete contracts.
Handles file upload, text extraction, and basic storage.
"""
import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.contract import Contract
from app.schemas.contract import ContractResponse, ContractDetailResponse
from app.services.extraction import extract_text
from app.services.nlp import analyze_clauses
from app.services.gemini_service import summarize_contract
from app.services.risk_engine import calculate_risk_score, get_risk_level, get_risk_summary

router = APIRouter()

ALLOWED_TYPES = {"pdf", "docx", "doc", "txt"}


@router.post("/upload", response_model=ContractDetailResponse)
async def upload_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a contract file (PDF/DOCX/TXT), extract text, and run analysis."""
    # Validate file type
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_TYPES)}",
        )

    # Check file size
    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE_MB}MB",
        )

    # Save file with unique name
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(content)

    # Create DB record immediately
    contract = Contract(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_type=ext,
        status="processing",
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Extract text and analyze
    try:
        raw_text, page_count = extract_text(file_path, ext)
        word_count = len(raw_text.split()) if raw_text else 0

        # Run NLP analysis
        clauses = analyze_clauses(raw_text) if raw_text else []
        summary = get_risk_summary(clauses)
        
        # Add AI Summary using Gemini
        ai_summary = summarize_contract(raw_text, summary["risk_score"])
        summary["ai_summary"] = ai_summary

        risk_score = summary["risk_score"]
        risk_level = summary["risk_level"]

        # Update contract record
        contract.raw_text = raw_text
        contract.page_count = page_count
        contract.word_count = word_count
        contract.clauses_json = clauses
        contract.analysis_json = summary
        contract.risk_score = risk_score
        contract.risk_level = risk_level
        contract.status = "done"
        db.commit()
        db.refresh(contract)

    except Exception as e:
        contract.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

    return ContractDetailResponse.model_validate(contract)


@router.get("/", response_model=List[ContractResponse])
def list_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all contracts for the current user."""
    contracts = (
        db.query(Contract)
        .filter(Contract.user_id == current_user.id)
        .order_by(Contract.created_at.desc())
        .all()
    )
    return [ContractResponse.model_validate(c) for c in contracts]


@router.get("/{contract_id}", response_model=ContractDetailResponse)
def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed contract with full analysis."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    return ContractDetailResponse.model_validate(contract)


@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a contract and its associated file."""
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.user_id == current_user.id,
    ).first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Remove file from disk
    if contract.file_path and os.path.exists(contract.file_path):
        os.remove(contract.file_path)

    db.delete(contract)
    db.commit()
