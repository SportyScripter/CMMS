from sqlalchemy.orm import Session
from typing import List, Optional
from models.attachment import Attachment
from schemas.attachment import AttachmentCreate, AttachmentUpdate


def create_attachment(db: Session, attachment_in: AttachmentCreate) -> Attachment:
    """Create a new attachment in the database."""
    db_attachment = Attachment(**attachment_in.model_dump())
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment


def get_attachment(db: Session, attachment_id: int) -> Optional[Attachment]:
    """Retrieve an attachment by its ID."""
    return db.query(Attachment).filter(Attachment.id == attachment_id).first()


def get_attachments(db: Session, skip: int = 0, limit: int = 100) -> List[Attachment]:
    """Retrieve a list of attachments."""
    return db.query(Attachment).offset(skip).limit(limit).all()


def get_attachment_by_failure(db: Session, failure_id: int) -> List[Attachment]:
    """Retrieve all attachments associated with a specific failure."""
    return db.query(Attachment).filter(Attachment.failure_id == failure_id).all()


def get_attachment_by_order(db: Session, order_id: int) -> List[Attachment]:
    """Retrieve all attachments associated with a specific order."""
    return db.query(Attachment).filter(Attachment.order_id == order_id).all()


def update_attachment(
    db: Session, attachment_id: int, attachment_in: AttachmentUpdate
) -> Optional[Attachment]:
    """Update an existing attachment record."""
    db_attachment = get_attachment(db, attachment_id)
    if not db_attachment:
        return None

    update_data = attachment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_attachment, field, value)

    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment


def delete_attachment(db: Session, attachment_id: int) -> Optional[Attachment]:
    """Delete an attachment record."""
    db_attachment = get_attachment(db, attachment_id)
    if not db_attachment:
        return None

    db.delete(db_attachment)
    db.commit()
    return db_attachment
