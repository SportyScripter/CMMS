from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.message import MessageCreate, MessageResponse
from crud import crud_messages
from core.permissions import ALLOW_READ_ONLY

router = APIRouter()


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    message_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Create a new message and assign it to its recipients."""
    message_in.sender_id = current_user.id
    return crud_messages.create_message(db=db, message_in=message_in)


@router.get("/inbox", response_model=List[MessageResponse])
def get_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Retrieve all messages received by the currently authenticated user."""
    return crud_messages.get_inbox_for_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/outbox", response_model=List[MessageResponse])
def get_outbox(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve all messages sent by the currently authenticated user."""
    return crud_messages.get_outbox_for_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a specific message. (In a real app, you'd verify if current_user is sender or recipient here)."""
    db_message = crud_messages.get_message(db=db, message_id=message_id)
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )
    return db_message


@router.patch("/{message_id}/read", status_code=status.HTTP_200_OK)
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Mark a specific message as read for the currently authenticated user."""
    result = crud_messages.mark_message_as_read(
        db=db, message_id=message_id, user_id=current_user.id
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message recipient record not found.",
        )
    return {"status": "success", "message": "Marked as read"}


@router.delete("/inbox/{message_id}", status_code=status.HTTP_200_OK)
def delete_from_inbox(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Remove a message from the currently authenticated user's inbox."""
    success = crud_messages.delete_message_for_recipient(
        db=db, message_id=message_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found in your inbox.",
        )
    return {"status": "success", "detail": "Message removed from inbox"}


@router.delete("/{message_id}", response_model=MessageResponse)
def delete_message_globally(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Delete a message completely from the system. Only the sender can do this."""
    db_message = crud_messages.get_message(db=db, message_id=message_id)
    if not db_message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Message not found"
        )

    if db_message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to globally delete this message.",
        )

    return crud_messages.delete_message(db=db, message_id=message_id)
