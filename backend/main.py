from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base

from models.user import User
from models.book import Book
from models.member import Member
from models.issue import BookIssue
from models.fine import Fine
from models.reservation import Reservation

from routers.auth import router as auth_router
from routers.books import router as books_router
from routers.members import router as members_router
from routers.issues import router as issues_router
from routers.fines import router as fines_router
from routers.dashboard import router as dashboard_router
from routers.reservations import router as reservations_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Library Management System",
    description="Professional Library Management System API",
    version="1.0.0"
)


# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(auth_router)
app.include_router(books_router)
app.include_router(members_router)
app.include_router(issues_router)
app.include_router(fines_router)
app.include_router(dashboard_router)
app.include_router(reservations_router)


# Home route
@app.get("/")
def home():
    return {
        "message": "Library Management System API is running"
    }


# Database connection test
@app.get("/test-db")
def test_database():
    try:
        with engine.connect():
            return {
                "status": "success",
                "message": "MySQL database connected successfully"
            }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }