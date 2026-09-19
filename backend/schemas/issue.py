from datetime import datetime

from pydantic import BaseModel


class IssueCreate(BaseModel):
    book_id: int
    member_id: int
    due_date: datetime


class IssueResponse(BaseModel):
    id: int
    book_id: int
    member_id: int
    issue_date: datetime
    due_date: datetime
    return_date: datetime | None
    status: str

    class Config:
        from_attributes = True