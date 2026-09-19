from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.issue import BookIssue
from models.book import Book
from models.member import Member
from schemas.issue import IssueCreate, IssueResponse
from dependencies import get_current_user


router = APIRouter(
    prefix="/issues",
    tags=["Issues"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=IssueResponse)
def issue_book(
    issue_data: IssueCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    book = db.query(Book).filter(
        Book.id == issue_data.book_id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    member = db.query(Member).filter(
        Member.id == issue_data.member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    if not member.is_active:
        raise HTTPException(
            status_code=400,
            detail="Member account is inactive"
        )

    if book.available_copies <= 0:
        raise HTTPException(
            status_code=400,
            detail="Book is not available"
        )

    active_issue = db.query(BookIssue).filter(
        BookIssue.book_id == issue_data.book_id,
        BookIssue.member_id == issue_data.member_id,
        BookIssue.status == "issued"
    ).first()

    if active_issue:
        raise HTTPException(
            status_code=400,
            detail="This member already has this book issued"
        )

    new_issue = BookIssue(
        book_id=issue_data.book_id,
        member_id=issue_data.member_id,
        due_date=issue_data.due_date,
        status="issued"
    )

    book.available_copies -= 1

    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return new_issue


@router.get("/", response_model=list[IssueResponse])
def get_issues(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(BookIssue).all()


@router.get("/{issue_id}", response_model=IssueResponse)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    issue = db.query(BookIssue).filter(
        BookIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue record not found"
        )

    return issue


@router.put("/{issue_id}", response_model=IssueResponse)
def update_issue(
    issue_id: int,
    issue_data: IssueCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    issue = db.query(BookIssue).filter(
        BookIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue record not found"
        )

    if issue_data.book_id != issue.book_id:
        raise HTTPException(
            status_code=400,
            detail="Book cannot be changed after issue"
        )

    if issue_data.member_id != issue.member_id:
        raise HTTPException(
            status_code=400,
            detail="Member cannot be changed after issue"
        )

    issue.due_date = issue_data.due_date

    db.commit()
    db.refresh(issue)

    return issue


@router.put("/{issue_id}/return", response_model=IssueResponse)
def return_book(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    issue = db.query(BookIssue).filter(
        BookIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue record not found"
        )

    if issue.status == "returned":
        raise HTTPException(
            status_code=400,
            detail="Book has already been returned"
        )

    book = db.query(Book).filter(
        Book.id == issue.book_id
    ).first()

    if book:
        book.available_copies += 1

    issue.return_date = datetime.now(timezone.utc)
    issue.status = "returned"

    db.commit()
    db.refresh(issue)

    return issue


@router.delete("/{issue_id}")
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    issue = db.query(BookIssue).filter(
        BookIssue.id == issue_id
    ).first()

    if not issue:
        raise HTTPException(
            status_code=404,
            detail="Issue record not found"
        )

    if issue.status == "issued":
        book = db.query(Book).filter(
            Book.id == issue.book_id
        ).first()

        if book:
            book.available_copies += 1

    db.delete(issue)
    db.commit()

    return {
        "message": "Issue record deleted successfully"
    }