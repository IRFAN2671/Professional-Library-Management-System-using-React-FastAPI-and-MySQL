from pydantic import BaseModel


class DashboardResponse(BaseModel):
    total_books: int
    total_members: int
    issued_books: int
    returned_books: int
    unpaid_fines: int
    total_fine_amount: float