from pydantic import BaseModel


class BookCreate(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    total_copies: int = 1


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    isbn: str | None = None
    category: str | None = None
    total_copies: int | None = None
    available_copies: int | None = None
    is_active: bool | None = None


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    isbn: str
    category: str
    total_copies: int
    available_copies: int
    is_active: bool

    class Config:
        from_attributes = True