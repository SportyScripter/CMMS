from db.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class PartCategory(Base):
    """
    Lookup table for classifying spare parts.

    Categorizing parts (e.g., 'Bearings', 'Sensors', 'Electrical Components', 'Fasteners')
    allows for better inventory management, efficient stock level reporting,
    and quicker parts retrieval for maintenance teams.
    """

    __tablename__ = "part_categories"
    __table_args__ = {
        "comment": "Dictionary of spare part categories for inventory organization"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(
        String,
        unique=True,
        nullable=False,
        comment="Unique identifier/name for the part category",
    )

    # Relationships
    parts = relationship("Part", back_populates="part_category")
