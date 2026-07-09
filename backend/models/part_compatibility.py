from db.database import Base
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship


class PartCompatibility(Base):
    """
    Association object mapping spare parts to the machines they are compatible with.

    This table enables the CMMS to filter the parts inventory based on the specific
    machine being repaired, significantly reducing search time for technicians
    during breakdown diagnostics.
    """

    __tablename__ = "part_compatibilities"
    __table_args__ = {
        "comment": "Defines compatibility mapping between spare parts and machines"
    }

    part_id = Column(
        Integer,
        ForeignKey("parts.id"),
        primary_key=True,
        comment="Reference to the spare part",
    )

    machine_id = Column(
        Integer,
        ForeignKey("machines.id"),
        primary_key=True,
        comment="Reference to the machine compatible with the part",
    )

    # Relationships
    part = relationship("Part", back_populates="compatibilities")
    machine = relationship("Machine", back_populates="part_compatibilities")
