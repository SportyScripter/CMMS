from db.database import Base
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship


class Attachment(Base):
    """
    Represents a digital file (e.g., photo, PDF manual, document) uploaded to the CMMS.

    Attachments can be linked either to a reported Failure (e.g., a photo of a broken part)
    or to a scheduled Order Calendar entry (e.g., a scanned maintenance protocol).
    """

    __tablename__ = "attachments"
    __table_args__ = {
        "comment": "Stores metadata and file paths for user-uploaded documents"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    failure_id = Column(
        Integer,
        ForeignKey("failures.id"),
        nullable=True,
        comment="Links the file to a specific failure report",
    )
    order_id = Column(
        Integer,
        ForeignKey("order_calendar.id"),
        nullable=True,
        comment="Links the file to a scheduled maintenance order",
    )
    file_path = Column(
        String, nullable=False, comment="Storage path or URI of the physical file"
    )
    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="UTC timestamp of the file upload",
    )
    # Relationships
    failure = relationship("Failure", back_populates="attachments")
    order_calendar = relationship("OrderCalendar", back_populates="attachments")
