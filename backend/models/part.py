from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Double
from sqlalchemy.orm import relationship


class Part(Base):
    """
    Represents a spare part stored in the warehouse.

    This model tracks stock levels, locations, and pricing for each component.
    It links to PartCategory for classification, PartCompatibility for machine mapping,
    and FailurePart to track consumption during repairs.
    """

    __tablename__ = "parts"
    __table_args__ = {
        "comment": "Comprehensive inventory of spare parts and warehouse stock metadata"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    category_id = Column(
        Integer,
        ForeignKey("part_categories.id"),
        nullable=False,
        comment="Links to the category (e.g., Bearings, Electrical) for organizational grouping",
    )

    name = Column(
        String,
        unique=False,
        nullable=False,
        comment="Descriptive name or part number identifier",
    )

    type = Column(
        String,
        nullable=False,
        comment="Classification of part type (e.g., consumables, strategic spare)",
    )

    quantity = Column(
        Integer, nullable=False, comment="Current physical stock level in the warehouse"
    )

    min_quantity = Column(
        Integer,
        nullable=False,
        comment="Threshold level for triggering automatic restocking notifications",
    )

    location = Column(
        String, nullable=False, comment="Specific warehouse aisle/shelf identifier"
    )

    price = Column(Double, nullable=False, comment="Unit cost of the part")

    url_address = Column(
        String,
        nullable=True,
        comment="External URL for reordering or supplier reference",
    )

    docs = Column(
        String,
        nullable=True,
        comment="Path or link to technical documentation/datasheets",
    )

    qr_code = Column(
        String,
        unique=True,
        nullable=False,
        comment="Unique identifier for mobile warehouse management",
    )

    # Relationships
    part_category = relationship("PartCategory", back_populates="parts")
    compatibilities = relationship("PartCompatibility", back_populates="part")
    used_in_failures = relationship("FailurePart", back_populates="part")
