from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.member import Member
from schemas.member import MemberCreate, MemberUpdate, MemberResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/members",
    tags=["Members"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=MemberResponse)
def create_member(
    member: MemberCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_member = db.query(Member).filter(
        (Member.email == member.email) |
        (Member.membership_id == member.membership_id)
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=400,
            detail="Email or membership ID already exists"
        )

    new_member = Member(
        full_name=member.full_name,
        email=member.email,
        phone=member.phone,
        membership_id=member.membership_id,
        department=member.department
    )

    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    return new_member


@router.get("/", response_model=list[MemberResponse])
def get_members(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Member).all()


@router.get("/{member_id}", response_model=MemberResponse)
def get_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    member = db.query(Member).filter(
        Member.id == member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    return member


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: int,
    member_data: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    member = db.query(Member).filter(
        Member.id == member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    update_data = member_data.model_dump(
        exclude_unset=True
    )

    if "email" in update_data:
        existing_email = db.query(Member).filter(
            Member.email == update_data["email"],
            Member.id != member_id
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Another member already uses this email"
            )

    if "membership_id" in update_data:
        existing_membership = db.query(Member).filter(
            Member.membership_id == update_data["membership_id"],
            Member.id != member_id
        ).first()

        if existing_membership:
            raise HTTPException(
                status_code=400,
                detail="Another member already uses this membership ID"
            )

    for key, value in update_data.items():
        setattr(member, key, value)

    db.commit()
    db.refresh(member)

    return member


@router.delete("/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    member = db.query(Member).filter(
        Member.id == member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    db.delete(member)
    db.commit()

    return {
        "message": "Member deleted successfully"
    }