from db.database import Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime


class Machine(Base):
    """
    Represents a physical machine or piece of equipment on the production floor.

    This is a core entity in the CMMS. Machines are identified by a unique QR code
    and can have multiple reported failures, compatible spare parts, and scheduled
    maintenance tasks (calendar entries) associated with them.
    """

    __tablename__ = "machines"
    __table_args__ = {
        "comment": "Core inventory of physical machines and production equipment"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(
        String,
        unique=True,
        nullable=False,
        comment="Official designation or asset tag of the machine",
    )

    location = Column(
        String,
        nullable=False,
        comment="Physical location on the production floor (e.g., Hall A, Sector 3)",
    )

    qr_code = Column(
        String,
        unique=True,
        nullable=False,
        comment="Unique QR identifier used for mobile scanning and quick asset retrieval",
    )

    status = Column(
        String,
        nullable=False,
        comment="Current operational state (e.g., 'operational', 'under_maintenance', 'out_of_service')",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="UTC timestamp when the machine record was created",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        comment="UTC timestamp when the machine record was last updated",
    )

    # Relationships
    failures = relationship("Failure", back_populates="machine")
    part_compatibilities = relationship("PartCompatibility", back_populates="machine")
    calendar_entries = relationship("OrderCalendar", back_populates="order_machine")
