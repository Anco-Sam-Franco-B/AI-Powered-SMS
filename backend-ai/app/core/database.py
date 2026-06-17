from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

DATABASE_URL = settings.database_url.replace("+asyncpg", "+psycopg2").replace("postgresql+asyncpg://", "postgresql://")

engine = create_engine(DATABASE_URL, echo=settings.debug, pool_size=10, max_overflow=20)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from app.models import all_models  # noqa
    Base.metadata.create_all(bind=engine)


def close_db():
    engine.dispose()
