from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from ..db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False)
    settings = relationship("Settings", back_populates="user", uselist=False)
    sms_subscription = relationship("SMSSubscription", back_populates="user", uselist=False)
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")
    event_types = relationship("EventType", back_populates="user", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="user", cascade="all, delete-orphan")