from db.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class OrderType(Base):
    """
    Lookup table for classifying maintenance tasks.

    Order types define the nature of the work performed (e.g., 'Preventive',
    'Corrective', 'Calibration', 'Inspection'). Standardizing these values
    is essential for generating accurate maintenance reports and analytics.
    """

    __tablename__ = "order_types"
    __table_args__ = {
        "comment": "Dictionary of standardized maintenance order categories"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(
        String,
        unique=True,
        nullable=False,
        comment="Unique identifier/name for the order type category",
    )

    # Relationships
    calendar_entries = relationship("OrderCalendar", back_populates="order_type")
