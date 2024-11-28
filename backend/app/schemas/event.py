from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, Any


class EventBase(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    attendee_name: Optional[str] = None
    attendee_email: Optional[EmailStr] = None


class EventCreate(EventBase):
    pass


class EventUpdate(EventBase):
    is_confirmed: Optional[bool] = None


class Event(EventBase):
    id: int
    user_id: int
    is_confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EventResponse(BaseModel):
    id: int
    title: str
    start_time: datetime
    end_time: datetime
    attendee_name: str
    attendee_email: EmailStr
    location: str
    description: Optional[str] = None
    notes: Optional[str] = None
    answers: Optional[Dict[str, Any]] = None
    is_confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EventList(BaseModel):
    items: list[EventResponse]
    total: int
    page: int
    pages: int

    class Config:
        from_attributes = True
