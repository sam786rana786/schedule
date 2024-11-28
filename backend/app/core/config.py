# backend/app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Base settings
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email settings
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_FROM_NAME: str = "Schedule App"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()