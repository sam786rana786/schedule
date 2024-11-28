from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from ...db.database import get_db
from ...core.auth import get_current_user
from ...models.user import User
from ...models.event import Event as EventModel
from ...schemas.event import Event, EventCreate, EventUpdate, EventList

router = APIRouter()

@router.get("/events", response_model=EventList)
async def get_scheduled_events(
    status: Optional[str] = None,
    page: int = 1,
    q: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all events for the current user with optional filtering"""
    # Use EventModel (SQLAlchemy) instead of Event (Pydantic)
    query = db.query(EventModel).filter(EventModel.user_id == current_user.id)
    
    # Add status filter if provided
    if status:
        if status == "upcoming":
            query = query.filter(EventModel.start_time >= datetime.now())
        elif status == "past":
            query = query.filter(EventModel.start_time < datetime.now())
            
    # Add search filter if provided
    if q:
        query = query.filter(
            EventModel.title.ilike(f"%{q}%") |
            EventModel.description.ilike(f"%{q}%")
        )
    
    # Calculate pagination
    items_per_page = 10
    total = query.count()
    total_pages = (total + items_per_page - 1) // items_per_page
    
    # Add pagination
    query = query.order_by(EventModel.start_time.desc())
    query = query.offset((page - 1) * items_per_page).limit(items_per_page)
    
    return EventList(
        items=query.all(),
        total=total,
        page=page,
        pages=total_pages
    )


@router.post("/events", response_model=Event)
async def create_event(
    event: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new event"""
    # Check for time slot availability
    existing_event = db.query(EventModel).filter(
        EventModel.user_id == current_user.id,
        EventModel.start_time < event.end_time,
        EventModel.end_time > event.start_time
    ).first()
    
    if existing_event:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time slot is already booked"
        )
    
    db_event = EventModel(
        **event.dict(),
        user_id=current_user.id
    )
    
    try:
        db.add(db_event)
        db.commit()
        db.refresh(db_event)
        return db_event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/events/{event_id}", response_model=Event)
async def get_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific event"""
    event = db.query(EventModel).filter(
        EventModel.id == event_id,
        EventModel.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    return event

@router.put("/events/{event_id}", response_model=Event)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an event"""
    event = db.query(EventModel).filter(
        EventModel.id == event_id,
        EventModel.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Check for time slot availability if time is being updated
    if event_update.start_time != event.start_time or event_update.end_time != event.end_time:
        existing_event = db.query(EventModel).filter(
            EventModel.user_id == current_user.id,
            EventModel.id != event_id,
            EventModel.start_time < event_update.end_time,
            EventModel.end_time > event_update.start_time
        ).first()
        
        if existing_event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Time slot is already booked"
            )
    
    for key, value in event_update.dict(exclude_unset=True).items():
        setattr(event, key, value)
    
    try:
        db.commit()
        db.refresh(event)
        return event
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/events/{event_id}")
async def delete_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an event"""
    event = db.query(EventModel).filter(
        EventModel.id == event_id,
        EventModel.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    try:
        db.delete(event)
        db.commit()
        return {"message": "Event deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )