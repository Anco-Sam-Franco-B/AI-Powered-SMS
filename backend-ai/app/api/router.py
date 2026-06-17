from fastapi import APIRouter
from app.api.v1 import predictions, analytics, chatbot, training, promotions, messages_api, monitoring

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(predictions.router)
api_router.include_router(analytics.router)
api_router.include_router(chatbot.router)
api_router.include_router(training.router)
api_router.include_router(promotions.router)
api_router.include_router(messages_api.router)
api_router.include_router(monitoring.router)
