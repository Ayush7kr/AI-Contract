"""
RAG Service: Vector-based retrieval for contract Q&A.
Lightweight version — uses keyword-based retrieval to save resources.
"""
from typing import List, Dict, Any

# Mock state
_contract_stores = {}
FAISS_AVAILABLE = False


def index_contract(contract_id: int, text: str) -> bool:
    """Index a contract's text for retrieval (keyword-based)."""
    words = text.split()
    chunks = []
    chunk_size = 500
    overlap = 50
    
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
        
    _contract_stores[contract_id] = {"chunks": chunks}
    return True


def retrieve_relevant(contract_id: int, query: str, top_k: int = 3) -> List[str]:
    """Retrieve relevant chunks using keyword matching."""
    store = _contract_stores.get(contract_id)
    if not store:
        return []

    chunks = store["chunks"]
    query_words = set(query.lower().split())
    
    scored = []
    for chunk in chunks:
        score = sum(1 for w in chunk.lower().split() if w in query_words)
        scored.append((score, chunk))
        
    scored.sort(key=lambda x: x[0], reverse=True)
    # Return top K chunks that have at least one keyword match, or just top K if none
    results = [c for s, c in scored[:top_k] if s > 0]
    return results if results else chunks[:top_k]
