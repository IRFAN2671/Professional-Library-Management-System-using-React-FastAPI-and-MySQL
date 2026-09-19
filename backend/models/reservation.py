from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database import Base


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

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

    reservation_date = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    status = Column(
        String(30),
        default="reserved",
        nullable=False
    )