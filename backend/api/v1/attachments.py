from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from api.dependencies import get_db
from models.user import User
from schemas.attachment import AttachmentCreate, AttachmentUpdate, AttachmentResponse
from crud import crud_attachments
from core.permissions import ALLOW_READ_ONLY, ALLOW_MANAGE_MACHINES

router = APIRouter()


@router.post(
    "/", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED
)
def create_attachment(
    attachment_in: AttachmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """
    Create a new attachment.
    """
    if not attachment_in.failure_id and not attachment_in.order_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An attachment must be linked to either a failure_id or an order_id.",
        )
    return crud_attachments.create_attachment(db=db, attachment_in=attachment_in)


@router.get("/{attachment_id}", response_model=AttachmentResponse)
def get_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """
    Retrieve a specific attachment by its ID.
    """
    db_attachment = crud_attachments.get_attachment(db=db, attachment_id=attachment_id)
    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found."
        )
    return db_attachment


@router.patch("/{attachment_id}", response_model=AttachmentResponse)
def update_attachment(
    attachment_id: int,
    attachment_in: AttachmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """
    Update an existing attachment.
    """
    db_attachment = crud_attachments.get_attachment(db=db, attachment_id=attachment_id)
    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found."
        )
    return crud_attachments.update_attachment(
        db=db, db_attachment=db_attachment, attachment_in=attachment_in
    )


@router.delete("/{attachment_id}", response_model=AttachmentResponse)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """
    Delete a specific attachment by its ID.
    """
    db_attachment = crud_attachments.delete_attachment(
        db=db, attachment_id=attachment_id
    )
    if not db_attachment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found."
        )
    return db_attachment
