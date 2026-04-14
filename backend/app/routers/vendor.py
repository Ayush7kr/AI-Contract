"""
Vendor Intelligence Router: AI-powered vendor risk profiling using Gemini.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.core.security import get_current_user
from app.models.user import User
from app.schemas.contract import VendorRequest
from app.services.gemini_service import analyze_vendor

router = APIRouter()


@router.post("/analyze")
def vendor_analysis(
    request: VendorRequest,
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Generate a Gemini-powered vendor risk intelligence profile."""
    if not request.vendor_name or len(request.vendor_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Vendor name is required")

    result = analyze_vendor(request.vendor_name)

    if request.industry:
        result["industry"] = request.industry

    return result
