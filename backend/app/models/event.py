from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from ..db.database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_type_id = Column(Integer, ForeignKey("event_types.id"), nullable=True)
    title = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    description = Column(String, nullable=True)
    attendee_name = Column(String, nullable=True)
    attendee_email = Column(String, nullable=True)
    attendee_phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    answers = Column(JSON, nullable=True)
    is_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Define relationships
    user = relationship("User", back_populates="events")
    event_type = relationship("EventType", back_populates="events")
