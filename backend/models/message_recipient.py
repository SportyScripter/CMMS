from db.database import Base
from sqlalchemy import Column, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship


class MessageRecipient(Base):
    """
    Association object linking messages to their intended recipients.

    This Many-to-Many table allows a single message to be broadcast to multiple
    users simultaneously. Crucially, it tracks the individual 'read' status for
    each recipient independently.
    """

    __tablename__ = "message_recipients"
    __table_args__ = {
        "comment": "Association table tracking message delivery and read status per user"
    }

    message_id = Column(
        Integer,
        ForeignKey("messages.id"),
        primary_key=True,
        comment="Reference to the specific message broadcasted",
    )

    recipient_id = Column(
        Integer,
        ForeignKey("users.id"),
        primary_key=True,
        comment="Reference to the targeted user receiving the message",
    )

    is_read = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Indicates whether the recipient has opened and read the message",
    )

    # Relationships
    message = relationship("Message", back_populates="recipients")
    recipient = relationship("User", back_populates="received_messages")
