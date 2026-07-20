from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from models.message import Message
from models.message_recipient import MessageRecipient
from schemas.message import MessageCreate


def create_message(db: Session, message_in: MessageCreate) -> Message:
    """Create a new message and assign it to its recipients."""
    msg_data = message_in.model_dump(exclude={"recipient_ids"})
    db_message = Message(**msg_data)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    if message_in.recipient_ids:
        for r_id in message_in.recipient_ids:
            db_recipient = MessageRecipient(message_id=db_message.id, recipient_id=r_id)
            db.add(db_recipient)
        db.commit()
    return get_message(db, message_id=db_message.id)


def get_message(db: Session, message_id: int) -> Optional[Message]:
    """Retrieve a specific message with sender and recipients fully loaded"""
    return (
        db.query(Message)
        .options(
            joinedload(Message.sender),
            joinedload(Message.recipients).joinedload(MessageRecipient.recipient),
        )
        .filter(Message.id == message_id)
        .first()
    )


def get_inbox_for_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[Message]:
    """Retrieve all messages received by a specific user (Inbox)."""
    return (
        db.query(Message)
        .join(MessageRecipient)
        .options(
            joinedload(Message.sender),
            joinedload(Message.recipients).joinedload(MessageRecipient.recipient),
        )
        .filter(MessageRecipient.recipient_id == user_id)
        .order_by(Message.sent_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_outbox_for_user(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[Message]:
    """Retrieve all messages sent by a specific user (Outbox)."""
    return (
        db.query(Message)
        .options(
            joinedload(Message.sender),
            joinedload(Message.recipients).joinedload(MessageRecipient.recipient),
        )
        .filter(Message.sender_id == user_id)
        .order_by(Message.sent_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def mark_message_as_read(
    db: Session, message_id: int, user_id: int
) -> Optional[Message]:
    """Mark a specific message as read for a specific user."""
    db_recipient = (
        db.query(MessageRecipient)
        .filter(
            MessageRecipient.message_id == message_id,
            MessageRecipient.recipient_id == user_id,
        )
        .first()
    )
    if db_recipient:
        db_recipient.is_read = True
        db.commit()
        db.refresh(db_recipient)
    return db_recipient


def delete_message_for_recipient(db: Session, message_id: int, user_id: int) -> bool:
    """Remove a message from a specific user's inbox (deletes the MessageRecipient link)."""
    db_recipient = (
        db.query(MessageRecipient)
        .filter(
            MessageRecipient.message_id == message_id,
            MessageRecipient.recipient_id == user_id,
        )
        .first()
    )

    if db_recipient:
        db.delete(db_recipient)
        db.commit()
        return True
    return False


def delete_message(db: Session, message_id: int) -> Optional[Message]:
    """Completely delete a message from the database (for sender/admin)."""
    db_message = get_message(db, message_id)
    if not db_message:
        return None

    db.delete(db_message)
    db.commit()
    return db_message
