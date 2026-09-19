from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    author = Column(String(150), nullable=False)

    isbn = Column(String(50), unique=True, nullable=False, index=True)

    category = Column(String(100), nullable=False)

    total_copies = Column(Integer, default=1, nullable=False)

    available_copies = Column(Integer, default=1, nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())