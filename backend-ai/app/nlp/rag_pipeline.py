from typing import Optional
from app.core.vector_store import get_or_create_collection, embed_texts, search_collection
from app.nlp.intent_classifier import IntentClassifier
from app.nlp.query_parser import QueryParser
from app.nlp.response_generator import ResponseGenerator


class RAGPipeline:
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.query_parser = QueryParser()
        self.response_generator = ResponseGenerator()

    def index_knowledge(self, documents: list[str], collection_name: str = "knowledge_base"):
        collection = get_or_create_collection(collection_name)
        embeddings = embed_texts(documents)
        ids = [str(i) for i in range(len(documents))]
        collection.add(embeddings=embeddings, documents=documents, ids=ids)

    def query(self, query: str, use_llm: bool = False) -> dict:
        intent, confidence = self.intent_classifier.classify(query)
        entities = self.query_parser.extract_entities(query)

        context_docs = search_collection("knowledge_base", query, n_results=3)
        context = "\n".join(context_docs["documents"][0]) if context_docs and context_docs.get("documents") else ""

        if use_llm and self.response_generator.llm_available:
            answer = self.response_generator.generate_with_llm(query, context)
        else:
            tentative_sql = self.query_parser.to_natural_sql(intent, entities)
            answer = self.response_generator.generate(intent, data=None, query=query)
            if tentative_sql:
                answer += f"\n\nSuggested query: {tentative_sql}"

        sources = context_docs["documents"][0][:3] if context_docs and context_docs.get("documents") else []

        return {
            "answer": answer,
            "intent": intent,
            "confidence": confidence,
            "entities": entities,
            "sources": sources,
        }
