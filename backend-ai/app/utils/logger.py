from loguru import logger
import sys

logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>",
    level="INFO",
)
logger.add(
    "logs/ai_service.log",
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    level="DEBUG",
)

__all__ = ["logger"]
