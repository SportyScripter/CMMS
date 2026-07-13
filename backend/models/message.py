from datetime import datetime
from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from models.mixins import TimestampMixin


class Message(Base, TimestampMixin):
    """
    Represents internal communications within the CMMS.

    Messages support threading via parent_message_id, allowing users to reply
    to specific communications. This table tracks the sender, the content,
    and the recipients via the MessageRecipient association.
    """

    __tablename__ = "messages"
    __table_args__ = {"comment": "Central storage for internal messages and threads"}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    parent_message_id = Column(
        Integer,
        ForeignKey("messages.id"),
        nullable=True,
        comment="Reference to a parent message to support threading/replies",
    )

    subject = Column(String, nullable=False, comment="Topic or summary of the message")
    content = Column(String, nullable=False, comment="Main body text of the message")

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        comment="User who sent the message",
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=True,
        comment="Optional role-based broadcast target",
    )

    sent_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="Exact timestamp when the message was dispatched",
    )

    # Relationships
    sender = relationship(
        "User", back_populates="sent_messages", foreign_keys=[sender_id]
    )

    # Threading: Link to replies
    replies = relationship("Message", back_populates="parent_message", remote_side=[id])
    parent_message = relationship(
        "Message", back_populates="replies", remote_side=[parent_message_id]
    )

    recipients = relationship(
        "MessageRecipient", back_populates="message", cascade="all, delete-orphan"
    )
