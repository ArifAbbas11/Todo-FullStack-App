"""
Database connection and session management.
Provides SQLModel engine and session dependency for FastAPI.
"""
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
from .config import settings

# Create database engine
# echo=True enables SQL query logging (disable in production)
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,  # Maximum number of connections
    max_overflow=20  # Maximum overflow connections
)


def create_db_and_tables():
    """
    Create all database tables.
    Called during application startup.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.

    Usage in FastAPI endpoints:
        @app.get("/items")
        def get_items(session: Session = Depends(get_session)):
            items = session.exec(select(Item)).all()
            return items

    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        yield session
