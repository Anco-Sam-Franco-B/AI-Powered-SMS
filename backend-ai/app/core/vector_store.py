from app.config import settings

_embedder = None
_chroma_client = None


def _get_embedder():
    global _embedder
    if _embedder is None:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedder


def _get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        import chromadb
        from chromadb.config import Settings as ChromaSettings
        _chroma_client = chromadb.PersistentClient(
            path=settings.vector_db_path,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _chroma_client


def get_or_create_collection(name: str):
    client = _get_chroma_client()
    try:
        return client.get_collection(name)
    except Exception:
        return client.create_collection(name)


def embed_texts(texts: list[str]) -> list[list[float]]:
    return _get_embedder().encode(texts, show_progress_bar=False).tolist()


def search_collection(collection_name: str, query: str, n_results: int = 5):
    collection = get_or_create_collection(collection_name)
    query_embedding = embed_texts([query])[0]
    return collection.query(query_embeddings=[query_embedding], n_results=n_results)
