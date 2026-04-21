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
    
    # New Fields
    contract_type: Optional[str] = None
    confidence_score: Optional[float] = None
    risk_breakdown_json: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True


class ContractDetailResponse(ContractResponse):
    raw_text: Optional[str]
    clauses_json: Optional[Any]
    compliance_json: Optional[Any]


class CompareRequest(BaseModel):
    contract_id_1: int
    contract_id_2: int


class CompareResponse(BaseModel):
    difference_analysis: Dict[str, Any]
    contract1_name: str
    contract2_name: str


class SimulateRequest(BaseModel):
    contract_id: int
    modified_text: str


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
