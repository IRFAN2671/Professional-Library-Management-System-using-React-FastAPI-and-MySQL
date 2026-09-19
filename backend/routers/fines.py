from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.fine import Fine
from models.issue import BookIssue
from models.member import Member
from schemas.fine import FineCreate, FineUpdate, FineResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/fines",
    tags=["Fines"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=FineResponse)
def create_fine(
    fine_data: FineCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    issue = db.query(BookIssue).filter(
        BookIssue.id == fine_data.issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue record not found"
        )

    member = db.query(Member).filter(
        Member.id == fine_data.member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    if fine_data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Fine amount must be greater than zero"
        )

    new_fine = Fine(
        issue_id=fine_data.issue_id,
        member_id=fine_data.member_id,
        amount=fine_data.amount,
        reason=fine_data.reason,
        status="unpaid"
    )

    db.add(new_fine)
    db.commit()
    db.refresh(new_fine)

    return new_fine


@router.get("/", response_model=list[FineResponse])
def get_fines(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Fine).all()


@router.get("/{fine_id}", response_model=FineResponse)
def get_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    fine = db.query(Fine).filter(
        Fine.id == fine_id
    ).first()

    if not fine:
        raise HTTPException(
            status_code=404,
            detail="Fine record not found"
        )

    return fine


@router.put("/{fine_id}", response_model=FineResponse)
def update_fine(
    fine_id: int,
    fine_data: FineUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    fine = db.query(Fine).filter(
        Fine.id == fine_id
    ).first()

    if not fine:
        raise HTTPException(
            status_code=404,
            detail="Fine record not found"
        )

    update_data = fine_data.model_dump(
        exclude_unset=True
    )

    if "amount" in update_data:
        if update_data["amount"] <= 0:
            raise HTTPException(
                status_code=400,
                detail="Fine amount must be greater than zero"
            )

    for key, value in update_data.items():
        setattr(fine, key, value)

    db.commit()
    db.refresh(fine)

    return fine


@router.put("/{fine_id}/pay", response_model=FineResponse)
def pay_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    fine = db.query(Fine).filter(
        Fine.id == fine_id
    ).first()

    if not fine:
        raise HTTPException(
            status_code=404,
            detail="Fine record not found"
        )

    if fine.status == "paid":
        raise HTTPException(
            status_code=400,
            detail="Fine has already been paid"
        )

    fine.status = "paid"
    fine.paid_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(fine)

    return fine


@router.delete("/{fine_id}")
def delete_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    fine = db.query(Fine).filter(
        Fine.id == fine_id
    ).first()

    if not fine:
        raise HTTPException(
            status_code=404,
            detail="Fine record not found"
        )

    db.delete(fine)
    db.commit()

    return {
        "message": "Fine record deleted successfully"
    }