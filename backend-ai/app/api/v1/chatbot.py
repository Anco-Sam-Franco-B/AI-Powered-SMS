from fastapi import APIRouter, Depends, HTTPException
from app.core.security import verify_token
from app.nlp.rag_pipeline import RAGPipeline
from app.schemas.chatbot import ChatQuery, ChatResponse, FeedbackRequest
from app.models.feedback import FeedbackLog
from app.core.database import SessionLocal
from sqlalchemy import select

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
rag = RAGPipeline()


@router.post("/query", response_model=ChatResponse)
def chat_query(req: ChatQuery, user=Depends(verify_token)):
    try:
        result = rag.query(req.query, use_llm=True)

        return ChatResponse(
            answer=result["answer"],
            intent=result["intent"],
            confidence=result["confidence"],
            data=result.get("entities"),
            sources=result.get("sources"),
        )
    except Exception as e:
        raise HTTPException(500, f"Chatbot query failed: {str(e)}")


@router.post("/query-local", response_model=ChatResponse)
def chat_query_local(req: ChatQuery, user=Depends(verify_token)):
    try:
        result = rag.query(req.query, use_llm=False)

        return ChatResponse(
            answer=result["answer"],
            intent=result["intent"],
            confidence=result["confidence"],
            data=result.get("entities"),
            sources=result.get("sources"),
        )
    except Exception as e:
        raise HTTPException(500, f"Chatbot query failed: {str(e)}")


@router.post("/feedback")
def submit_feedback(req: FeedbackRequest, user=Depends(verify_token)):
    with SessionLocal() as session:
        feedback = FeedbackLog(
            query_text=req.query_text,
            intent=req.intent,
            predicted_answer=req.predicted_answer,
            corrected_answer=req.corrected_answer,
            rating=req.rating,
        )
        session.add(feedback)
        session.commit()
        return {"status": "success", "message": "Feedback recorded. Thank you!"}
