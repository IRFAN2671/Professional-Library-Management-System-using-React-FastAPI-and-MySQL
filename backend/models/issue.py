from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class BookIssue(Base):
    __tablename__ = "book_issues"

    id = Column(Integer, primary_key=True, index=True)

    book_id = Column(
        Integer,
        ForeignKey("books.id"),
        nullable=False
    )

    member_id = Column(
        Integer,
        ForeignKey("members.id"),
        nullable=False
    )

    issue_date = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    due_date = Column(
        DateTime(timezone=True),
        nullable=False
    )

    return_date = Column(
        DateTime(timezone=True),
        nullable=True
    )

    status = Column(
        String(30),
        default="issued",
        nullable=False
    )