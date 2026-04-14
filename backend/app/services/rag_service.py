"""
RAG Service: Simple chunking for providing context to Gemini chat.
Splits contract text into chunks and retrieves relevant ones by keyword matching.
"""
from typing import List


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """Split text into overlapping word chunks."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def retrieve_relevant(text: str, query: str, top_k: int = 3) -> List[str]:
    """Retrieve relevant chunks from text using keyword matching."""
    chunks = chunk_text(text)
    if not chunks:
        return []

    query_words = set(query.lower().split())

    scored = []
    for chunk in chunks:
        score = sum(1 for w in chunk.lower().split() if w in query_words)
        scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = [c for s, c in scored[:top_k] if s > 0]
    return results if results else chunks[:top_k]
