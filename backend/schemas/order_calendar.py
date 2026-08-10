from datetime import datetime
from typing import Optional

from schemas.role import RoleResponse
from pydantic import BaseModel, Field

from schemas.attachment import AttachmentResponse
from schemas.machine import MachineResponse
from schemas.order_checklist_item import OrderChecklistItemResponse
from schemas.order_type import OrderTypeResponse
from schemas.user import UserResponse


class OrderCalendarBase(BaseModel):
    """Base schema for OrderCalendar containing core scheduling attributes."""

    order_type_id: int = Field(
        ...,
        description="Reference to the classification of the maintenance task.",
    )
    description: str = Field(..., description="Summary of the work to be performed.")
    principal_id: int = Field(
        ...,
        description="User who created or requested the order.",
    )
    performed_id: int | None = Field(
        None,
        description="Technician assigned to execute the task.",
    )
    assigned_role_id: int | None = Field(
        None,
        description="Role assigned to the order for access control and task delegation.",
    )
    machine_id: int | None = Field(
        None,
        description="Target machine for the maintenance task.",
    )
    comments: str | None = Field(
        None,
        description="Additional notes regarding the execution or scope of work.",
    )
    scheduled_date: datetime = Field(
        ...,
        description="Planned date and time for task execution.",
    )
    status: str = Field(
        ...,
        max_length=50,
        description="Current execution state (e.g., 'scheduled', 'in_progress', 'completed').",
    )
    priority: Optional[str] = Field(
        default="normal",
        max_length=50,
        description="Priorytet zlecenia (np. low, normal, high, critical)",
    )
    execution_report: Optional[str] = Field(
        None,
        description="Detailed report of the task execution, including observations and outcomes.",
    )


class OrderCalendarCreate(OrderCalendarBase):
    """Schema used for creating a new OrderCalendar entry.
    Inherits all required fields directly from OrderCalendarBase.
    """


class OrderCalendarUpdate(BaseModel):
    """Schema used for updating an existing OrderCalendar entry.
    All fields are optional to allow for partial updates (PATCH requests).
    """

    order_type_id: int | None = Field(None, description="Updated order type reference.")
    description: str | None = Field(
        None,
        description="Updated summary of the work to be performed.",
    )
    principal_id: int | None = Field(
        None,
        description="Updated user who requested the order.",
    )
    performed_id: int | None = Field(None, description="Updated technician assigned.")
    assigned_role_id: int | None = Field(
        None, description="Updated role assigned to the order."
    )
    machine_id: int | None = Field(None, description="Updated target machine.")
    comments: str | None = Field(None, description="Updated additional notes.")
    scheduled_date: datetime | None = Field(
        None,
        description="Updated planned date and time.",
    )
    status: str | None = Field(
        None,
        max_length=50,
        description="Updated current execution state.",
    )
    priority: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated priority of the order.",
    )
    started_at: Optional[datetime] = Field(
        None,
        description="Timestamp when the task execution began.",
    )
    completed_at: Optional[datetime] = Field(
        None,
        description="Timestamp when the task execution was completed.",
    )
    execution_report: Optional[str] = Field(
        None, description="Updated detailed report of the work performed."
    )
    pause_reason: Optional[str] = Field(
        None, description="Updated reason for pausing the task, if applicable."
    )
    is_machine_operational: Optional[bool] = Field(
        None, description="Updated indication of whether the machine is operational."
    )
    work_time_minutes: Optional[int] = Field(
        None, description="Updated total time spent on the task in minutes."
    )
    last_resumed_at: Optional[datetime] = Field(
        None, description="Updated timestamp when the task was last resumed."
    )


class OrderCalendarResponse(OrderCalendarBase):
    """Schema used for returning OrderCalendar data in API responses.
    Includes the database-generated ID.
    """

    id: int = Field(
        ...,
        description="The unique internal identifier of the calendar entry.",
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the order was created.",
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when the order was last updated.",
    )
    started_at: Optional[datetime] = Field(
        None,
        description="Timestamp when the task execution began.",
    )
    completed_at: Optional[datetime] = Field(
        None,
        description="Timestamp when the task execution was completed.",
    )
    execution_report: Optional[str] = Field(
        None,
        description="Detailed report of the work performed, including observations and outcomes.",
    )
    pause_reason: Optional[str] = Field(
        None, description="Reason for pausing the task, if applicable."
    )
    is_machine_operational: Optional[bool] = Field(
        None, description="Indication of whether the machine is operational."
    )
    work_time_minutes: Optional[int] = Field(
        None, description="Total time spent on the task in minutes."
    )
    last_resumed_at: Optional[datetime] = Field(
        None, description="Timestamp when the task was last resumed."
    )

    assigned_role: RoleResponse | None = None

    order_type: OrderTypeResponse
    principal: UserResponse
    performed: UserResponse | None = None
    order_machine: MachineResponse | None = None
    attachments: list[AttachmentResponse] = []
    checklist_items: list[OrderChecklistItemResponse] = []

    model_config = {"from_attributes": True}
