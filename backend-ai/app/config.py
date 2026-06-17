from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Student Management AI"
    app_version: str = "1.0.0"
    debug: bool = False

    database_url: str = "postgresql+asyncpg://neondb_owner:npg_LqTNzuvpP8n4@ep-super-field-a8iizzha-pooler.eastus2.azure.neon.tech/ai-sms?sslmode=require"
    database_url_sync: str = "postgresql://neondb_owner:npg_LqTNzuvpP8n4@ep-super-field-a8iizzha-pooler.eastus2.azure.neon.tech/ai-sms?sslmode=require"

    redis_url: str = "redis://localhost:6379/0"

    jwt_key: str = "secret"
    jwt_algorithm: str = "HS256"

    model_storage_path: str = "storage/models"
    vector_db_path: str = "storage/chromadb"

    ollama_base_url: str = "http://localhost:11434"
    llm_model: str = "llama3.2"

    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    allowed_origins: list[str] = ["http://localhost:5173", "http://localhost:5000"]

    auto_retrain_enabled: bool = True
    retrain_cron_schedule: str = "0 3 * * 0"
    drift_check_interval_hours: int = 24

    class Config:
        env_file = ".env"


settings = Settings()
