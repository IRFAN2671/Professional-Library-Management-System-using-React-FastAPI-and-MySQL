from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.book import Book
from models.member import Member
from models.issue import BookIssue
from models.fine import Fine
from models.reservation import Reservation
from schemas.dashboard import DashboardResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    total_books = db.query(Book).count()

    total_members = db.query(Member).count()

    issued_books = db.query(BookIssue).filter(
        BookIssue.status == "issued"
    ).count()

    returned_books = db.query(BookIssue).filter(
        BookIssue.status == "returned"
    ).count()

    unpaid_fines = db.query(Fine).filter(
        Fine.status == "unpaid"
    ).count()

    total_fine_amount = db.query(Fine).filter(
        Fine.status == "unpaid"
    ).with_entities(
        Fine.amount
    ).all()

    total_amount = sum(
        fine.amount for fine in total_fine_amount
    )

    return {
        "total_books": total_books,
        "total_members": total_members,
        "issued_books": issued_books,
        "returned_books": returned_books,
        "unpaid_fines": unpaid_fines,
        "total_fine_amount": total_amount
    }


@router.post("/reset")
def reset_system(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Delete fines first
        db.query(Fine).delete()

        # Delete issue/return records
        db.query(BookIssue).delete()

        # Delete reservations
        db.query(Reservation).delete()

        # Delete books
        db.query(Book).delete()

        # Delete members
        db.query(Member).delete()

        db.commit()

        return {
            "status": "success",
            "message": "Library system has been reset successfully"
        }

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"System reset failed: {str(e)}"
        )