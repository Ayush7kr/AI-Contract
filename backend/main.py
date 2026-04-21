"""
LexiSure AI - Backend Entry Point
FastAPI application with all routers mounted
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
# Import models to ensure they are registered with Base for create_all()
from app.models import User, Contract
from app.routers import auth, contracts, analysis, ai, compliance, vendor

# ─── Create all DB tables on startup ────────────────────────────────────────
# This will only create tables that do not exist. Since SQLite doesn't handle migrations
# automatically, we delete the DB file to trigger a clean reset.
Base.metadata.create_all(bind=engine)

# ─── Ensure upload directory exists ─────────────────────────────────────────
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="LexiSure AI API",
    description="Contract Risk Intelligence Platform for MSMEs and Startups",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Mount Static Files (uploads) ───────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── Include Routers ────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(contracts.router, prefix="/contracts", tags=["Contracts"])
app.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
app.include_router(ai.router, prefix="/ai", tags=["AI Services"])
app.include_router(compliance.router, prefix="/compliance", tags=["Compliance"])
app.include_router(vendor.router, prefix="/vendor", tags=["Vendor Intelligence"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "LexiSure AI", "version": "1.0.0"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
