from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .api.endpoints import auth, profile, settings, events, event_types, public
from .db.database import engine
from .models import user, profile as profile_model, settings as settings_model, sms, event, event_type

# Create tables in correct order
models = [user, profile_model, settings_model, sms, event, event_type]
for model in models:
    model.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend development server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# Mount routes
app.include_router(public.router, tags=["public"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(settings.router, prefix="/api", tags=["settings"])
app.include_router(events.router, prefix="/api", tags=["events"])
app.include_router(event_types.router, prefix="/api", tags=["event_types"])