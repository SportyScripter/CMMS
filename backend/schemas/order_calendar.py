from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OrderCalendarBase(BaseModel):
    """
    Base schema for OrderCalendar containing core scheduling attributes.
    """

    order_type_id: int = Field(
        ..., description="Reference to the classification of the maintenance task."
    )
    description: str = Field(..., description="Summary of the work to be performed.")
    principal_id: int = Field(
        ..., description="User who created or requested the order."
    )
    performed_id: Optional[int] = Field(
        None, description="Technician assigned to execute the task."
    )
    machine_id: Optional[int] = Field(
        None, description="Target machine for the maintenance task."
    )
    comments: Optional[str] = Field(
        None, description="Additional notes regarding the execution or scope of work."
    )
    scheduled_date: datetime = Field(
        ..., description="Planned date and time for task execution."
    )
    status: str = Field(
        ...,
        max_length=50,
        description="Current execution state (e.g., 'scheduled', 'in_progress', 'completed').",
    )


class OrderCalendarCreate(OrderCalendarBase):
    """
    Schema used for creating a new OrderCalendar entry.
    Inherits all required fields directly from OrderCalendarBase.
    """

    pass


class OrderCalendarUpdate(BaseModel):
    """
    Schema used for updating an existing OrderCalendar entry.
    All fields are optional to allow for partial updates (PATCH requests).
    """

    order_type_id: Optional[int] = Field(
        None, description="Updated order type reference."
    )
    description: Optional[str] = Field(
        None, description="Updated summary of the work to be performed."
    )
    principal_id: Optional[int] = Field(
        None, description="Updated user who requested the order."
    )
    performed_id: Optional[int] = Field(
        None, description="Updated technician assigned."
    )
    machine_id: Optional[int] = Field(None, description="Updated target machine.")
    comments: Optional[str] = Field(None, description="Updated additional notes.")
    scheduled_date: Optional[datetime] = Field(
        None, description="Updated planned date and time."
    )
    status: Optional[str] = Field(
        None, max_length=50, description="Updated current execution state."
    )


class OrderCalendarResponse(OrderCalendarBase):
    """
    Schema used for returning OrderCalendar data in API responses.
    Includes the database-generated ID.
    """

    id: int = Field(
        ..., description="The unique internal identifier of the calendar entry."
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the order was created."
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the order was last updated."
    )

    model_config = {"from_attributes": True}
