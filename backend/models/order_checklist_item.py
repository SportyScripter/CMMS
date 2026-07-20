from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship


class OrderChecklistItem(Base):
    """
    Represents an individual step or requirement within a maintenance checklist.

    Checklist items allow breaking down a maintenance order into granular tasks.
    Each item can be tracked for completion status independently, ensuring that
    no step in a critical maintenance protocol is overlooked.
    """

    __tablename__ = "order_checklist_items"
    __table_args__ = {
        "comment": "Granular task items belonging to a maintenance order checklist"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    order_calendar_id = Column(
        Integer,
        ForeignKey("order_calendar.id"),
        nullable=False,
        comment="Reference to the parent maintenance order",
    )

    task_description = Column(
        String,
        nullable=True,
        comment="Detailed instruction for this specific checklist step",
    )

    status = Column(
        String,
        nullable=False,
        comment="Completion status (e.g., 'pending', 'completed', 'not_applicable')",
    )

    comments = Column(
        String,
        nullable=True,
        comment="Technician's notes or findings specific to this checklist item",
    )

    # Relationships
    order_calendar = relationship("OrderCalendar", back_populates="checklist_items")
