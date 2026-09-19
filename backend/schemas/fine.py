from datetime import datetime

from pydantic import BaseModel


class FineCreate(BaseModel):
    issue_id: int
    member_id: int
    amount: float
    reason: str


class FineUpdate(BaseModel):
    amount: float | None = None
    reason: str | None = None
    status: str | None = None


class FineResponse(BaseModel):
    id: int
    issue_id: int
    member_id: int
    amount: float
    reason: str
    status: str
    paid_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True