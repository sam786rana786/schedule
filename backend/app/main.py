from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api.endpoints import auth, profile
from .db.database import engine
from .models.user import Base as UserBase
from .models.profile import Base as ProfileBase

# Create tables in correct order
UserBase.metadata.create_all(bind=engine)
ProfileBase.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",    # Vite dev server
    "http://localhost:4173",    # Vite preview
    "http://localhost:3000",    # Alternative port
    "http://127.0.0.1:5173",   # Vite dev server alternative URL
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=["*"],
    max_age=3600,
)

# Mount static files directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])