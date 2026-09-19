from pydantic import BaseModel, EmailStr


class MemberCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None
    membership_id: str
    department: str | None = None


class MemberUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    membership_id: str | None = None
    department: str | None = None
    is_active: bool | None = None


class MemberResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str | None
    membership_id: str
    department: str | None
    is_active: bool

    class Config:
        from_attributes = True