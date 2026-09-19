from datetime import datetime

from pydantic import BaseModel


class ReservationCreate(BaseModel):
    book_id: int
    member_id: int


class ReservationUpdate(BaseModel):
    book_id: int | None = None
    member_id: int | None = None


class ReservationResponse(BaseModel):
    id: int
    book_id: int
    member_id: int
    reservation_date: datetime
    status: str

    class Config:
        from_attributes = True