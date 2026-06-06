# ============================================================
# ZYVV — Python Intelligence Layer
# File: python/main.py
# ============================================================
# Phase 1: Stub — validates the Python runtime is wired up
#           and ready for Phase 3 work.
#
# Phase 3 (Month 2+): This service will handle:
#   - Semantic embedding of situations via OpenAI / Cohere
#   - Vector similarity search against Supabase pgvector
#   - Pattern detection: "You've asked about the same thing 6 times"
#   - Outcome analysis: which doors work for which situation types
#   - RAG over collective outcomes database
#
# Deployed as:
#   Option A — Vercel Serverless Function (Python runtime)
#   Option B — Railway microservice (if complexity demands separation)
#
# The boundary is clear:
#   Next.js: UI, routing, Groq API calls, user-facing logic
#   Python:  Intelligence layer, vector ops, pattern analysis
#
# Called from Next.js API routes via internal HTTP.
# ============================================================

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

# ── App ───────────────────────────────────────────────────────

app = FastAPI(
    title="ZYVV Intelligence Layer",
    description="Phase 3: collective pattern analysis and vector similarity",
    version="0.1.0",
)

# ── CORS ──────────────────────────────────────────────────────
# Allow requests from the Next.js frontend and Vercel preview URLs.

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zyvv.app",
        "http://localhost:3000",
        os.getenv("NEXT_PUBLIC_APP_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────


class SituationRequest(BaseModel):
    """Sent by Next.js when a new situation is submitted."""
    situation_id: int
    content: str
    session_id: Optional[str] = None


class SimilarityResponse(BaseModel):
    """Returned after vector similarity search (Phase 3)."""
    similar_situation_ids: list[int]
    match_scores: list[float]
    top_door_types: list[str]  # e.g. ["contrarian", "alien"]
    message: str


class PatternResponse(BaseModel):
    """Returned after session pattern analysis (Phase 2)."""
    pattern_detected: bool
    pattern_summary: Optional[str] = None
    message: str


class HealthResponse(BaseModel):
    status: str
    version: str
    phase: str


# ── Routes ────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse)
async def health():
    """
    Health check — confirms the Python service is running.
    Called by Next.js on startup to verify the service is live.
    """
    return HealthResponse(
        status="ok",
        version="0.1.0",
        phase="Phase 1 stub — intelligence layer not yet active",
    )


@app.post("/embed", response_model=dict)
async def embed_situation(req: SituationRequest):
    """
    Phase 3: Generate a vector embedding for a situation and
    store it in Supabase situations.embedding column.

    Phase 1 stub: returns 204-equivalent with a clear message.
    Implementation: call OpenAI embeddings API (text-embedding-3-small),
    then upsert into Supabase via supabase-py.
    """
    # TODO (Phase 3):
    # 1. Call openai.embeddings.create(input=req.content, model="text-embedding-3-small")
    # 2. Upsert embedding into supabase situations table
    # 3. Return { embedded: True, dimension: 1536 }

    return {
        "embedded": False,
        "situation_id": req.situation_id,
        "message": "Embedding not active in Phase 1. Implement in Phase 3.",
    }


@app.post("/similar", response_model=SimilarityResponse)
async def find_similar(req: SituationRequest):
    """
    Phase 3: Find situations similar to the given one using
    pgvector cosine similarity. Returns situation IDs and the
    door types that worked best for those situations.

    Phase 1 stub: returns empty results.
    Implementation: use supabase-py RPC to call a pgvector
    similarity function on the situations table.
    """
    # TODO (Phase 3):
    # 1. Embed the current situation (or retrieve stored embedding)
    # 2. SELECT id, 1 - (embedding <=> '[...]') AS score FROM situations
    #    ORDER BY score DESC LIMIT 10
    # 3. JOIN with choices + outcomes to find which doors worked
    # 4. Return top situation IDs and the door types they chose

    return SimilarityResponse(
        similar_situation_ids=[],
        match_scores=[],
        top_door_types=[],
        message="Similarity search not active in Phase 1. Implement in Phase 3.",
    )


@app.post("/patterns", response_model=PatternResponse)
async def detect_patterns(req: SituationRequest):
    """
    Phase 2: Detect repeating patterns in a session's situations.
    "You've asked about the same relationship 6 times in different forms."

    Phase 1 stub: always returns pattern_detected=False.
    Implementation: embed all situations for this session,
    cluster by cosine similarity, flag if >3 situations are
    within 0.85 similarity of each other.
    """
    # TODO (Phase 2):
    # 1. Pull all situation embeddings for req.session_id from Supabase
    # 2. Compute pairwise cosine similarity
    # 3. If any cluster of 3+ situations has avg similarity > 0.85,
    #    flag the pattern and summarize it with a Groq call
    # 4. Return the pattern summary to Next.js for display

    return PatternResponse(
        pattern_detected=False,
        pattern_summary=None,
        message="Pattern detection not active in Phase 1. Implement in Phase 2.",
    )


# ── Entry point ───────────────────────────────────────────────
# For local development: uvicorn python.main:app --reload
# For Vercel: the ASGI handler is auto-detected.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
