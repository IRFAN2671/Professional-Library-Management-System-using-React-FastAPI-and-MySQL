from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.reservation import Reservation
from models.book import Book
from models.member import Member
from schemas.reservation import (
    ReservationCreate,
    ReservationUpdate,
    ReservationResponse
)
from dependencies import get_current_user


router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=ReservationResponse
)
def create_reservation(
    reservation_data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    book = db.query(Book).filter(
        Book.id == reservation_data.book_id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    member = db.query(Member).filter(
        Member.id == reservation_data.member_id
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

    existing_reservation = db.query(
        Reservation
    ).filter(
        Reservation.book_id == reservation_data.book_id,
        Reservation.member_id == reservation_data.member_id,
        Reservation.status == "reserved"
    ).first()

    if existing_reservation:
        raise HTTPException(
            status_code=400,
            detail="This member already has an active reservation for this book"
        )

    new_reservation = Reservation(
        book_id=reservation_data.book_id,
        member_id=reservation_data.member_id,
        status="reserved"
    )

    db.add(new_reservation)
    db.commit()
    db.refresh(new_reservation)

    return new_reservation


@router.get(
    "/",
    response_model=list[ReservationResponse]
)
def get_reservations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Reservation).all()


@router.get(
    "/{reservation_id}",
    response_model=ReservationResponse
)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reservation = db.query(
        Reservation
    ).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    return reservation


@router.put(
    "/{reservation_id}",
    response_model=ReservationResponse
)
def update_reservation(
    reservation_id: int,
    reservation_data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reservation = db.query(
        Reservation
    ).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cancelled reservation cannot be edited"
        )

    update_data = reservation_data.model_dump(
        exclude_unset=True
    )

    new_book_id = update_data.get(
        "book_id",
        reservation.book_id
    )

    new_member_id = update_data.get(
        "member_id",
        reservation.member_id
    )

    book = db.query(Book).filter(
        Book.id == new_book_id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    member = db.query(Member).filter(
        Member.id == new_member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=404,
            detail="Member not found"
        )

    existing_reservation = db.query(
        Reservation
    ).filter(
        Reservation.book_id == new_book_id,
        Reservation.member_id == new_member_id,
        Reservation.status == "reserved",
        Reservation.id != reservation_id
    ).first()

    if existing_reservation:
        raise HTTPException(
            status_code=400,
            detail="This member already has an active reservation for this book"
        )

    for key, value in update_data.items():
        setattr(reservation, key, value)

    db.commit()
    db.refresh(reservation)

    return reservation


@router.put(
    "/{reservation_id}/cancel",
    response_model=ReservationResponse
)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reservation = db.query(
        Reservation
    ).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    if reservation.status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Reservation has already been cancelled"
        )

    reservation.status = "cancelled"

    db.commit()
    db.refresh(reservation)

    return reservation


@router.delete(
    "/{reservation_id}"
)
def delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    reservation = db.query(
        Reservation
    ).filter(
        Reservation.id == reservation_id
    ).first()

    if not reservation:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    db.delete(reservation)
    db.commit()

    return {
        "message": "Reservation deleted successfully"
    }