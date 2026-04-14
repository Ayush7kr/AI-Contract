"""
Pydantic schemas for Contract — request/response validation.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any, Dict


class ContractResponse(BaseModel):
    id: int
    filename: str
    file_type: Optional[str]
    page_count: int
    word_count: int
    risk_score: Optional[float]
    risk_level: Optional[str]
    is_valid_contract: bool = True
    ai_summary: Optional[str] = None
    status: str
    created_at: datetime
    analysis_json: Optional[Any]

    class Config:
        from_attributes = True


class ContractDetailResponse(ContractResponse):
    raw_text: Optional[str]
    clauses_json: Optional[Any]
    compliance_json: Optional[Any]


class SuggestRequest(BaseModel):
    clause_text: str
    clause_type: Optional[str] = None
    risk_reason: Optional[str] = None


class NegotiateRequest(BaseModel):
    clause_text: str
    tone: str = "collaborative"


class ChatRequest(BaseModel):
    question: str
    contract_id: Optional[int] = None


class VendorRequest(BaseModel):
    vendor_name: str
    industry: Optional[str] = None
