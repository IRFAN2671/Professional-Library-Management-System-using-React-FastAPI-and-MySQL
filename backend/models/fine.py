from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Fine(Base):
    __tablename__ = "fines"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    issue_id = Column(
        Integer,
        ForeignKey("book_issues.id"),
        nullable=False
    )

    member_id = Column(
        Integer,
        ForeignKey("members.id"),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    reason = Column(
        String(255),
        nullable=True
    )

    status = Column(
        String(30),
        default="unpaid",
        nullable=False
    )

    paid_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )