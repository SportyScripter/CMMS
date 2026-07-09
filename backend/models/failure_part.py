from db.database import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship


class FailurePart(Base):
    """
    Association object representing the consumption of spare parts for a specific failure.

    This Many-to-Many link table not only connects a Failure to a Part but also
    tracks the exact quantity of the part removed from inventory during the repair process.
    """

    __tablename__ = "failure_parts"
    __table_args__ = {
        "comment": "Association table tracking inventory consumed during failure repairs"
    }

    failure_id = Column(
        Integer,
        ForeignKey("failures.id"),
        primary_key=True,
        comment="Reference to the repaired failure",
    )

    part_id = Column(
        Integer,
        ForeignKey("parts.id"),
        primary_key=True,
        comment="Reference to the specific spare part consumed",
    )

    quantity_used = Column(
        Integer,
        nullable=False,
        comment="Number of units removed from inventory for this repair",
    )

    # Relationships
    failure = relationship("Failure", back_populates="used_parts")
    part = relationship("Part", back_populates="used_in_failures")
