from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from db.database import Base
from models.mixins import TimestampMixin


class OrderCalendar(Base, TimestampMixin):
    """Represents a scheduled maintenance task or production event.

    This model acts as the central hub for planning work. It links a specific
    OrderType to a machine and assigns responsible users (principal for the
    request, performed for the execution).
    """

    __tablename__ = "order_calendar"
    __table_args__ = {"comment": "Central schedule for maintenance orders and tasks"}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    order_type_id = Column(
        Integer,
        ForeignKey("order_types.id"),
        nullable=False,
        comment="Reference to the classification of the maintenance task",
    )

    description = Column(
        String,
        nullable=False,
        comment="Summary of the work to be performed",
    )

    principal_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        comment="User who created or requested the order",
    )

    performed_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        comment="Technician assigned to execute the task",
    )

    machine_id = Column(
        Integer,
        ForeignKey("machines.id"),
        nullable=True,
        comment="Target machine for the maintenance task",
    )

    comments = Column(
        String,
        nullable=True,
        comment="Additional notes regarding the execution or scope of work",
    )

    scheduled_date = Column(
        DateTime,
        nullable=False,
        comment="Planned date and time for task execution",
    )

    status = Column(
        String,
        nullable=False,
        comment="Current execution state (e.g., 'scheduled', 'in_progress', 'completed')",
    )
    started_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when the task execution began",
    )
    completed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when the task execution was completed",
    )
    priority = Column(
        String(50),
        default="normal",
        comment="Priority level of the order (e.g., 'low', 'normal', 'high')",
    )

    # Relationships
    order_type = relationship("OrderType", back_populates="calendar_entries")

    principal = relationship(
        "User",
        foreign_keys=[principal_id],
        back_populates="principal_calendar_entries",
    )

    performed = relationship(
        "User",
        foreign_keys=[performed_id],
        back_populates="performed_calendar_entries",
    )
    assigned_role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    order_machine = relationship("Machine", back_populates="calendar_entries")
    checklist_items = relationship(
        "OrderChecklistItem",
        back_populates="order_calendar",
    )
    attachments = relationship("Attachment", back_populates="order_calendar")
    assigned_role = relationship(
        "Role", foreign_keys=[assigned_role_id], back_populates="assigned_orders"
    )
