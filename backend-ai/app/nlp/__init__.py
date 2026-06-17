from app.nlp.intent_classifier import IntentClassifier
from app.nlp.query_parser import QueryParser
from app.nlp.response_generator import ResponseGenerator
from app.nlp.rag_pipeline import RAGPipeline

intent_classifier = IntentClassifier()
query_parser = QueryParser()
response_generator = ResponseGenerator()
rag_pipeline = RAGPipeline()
