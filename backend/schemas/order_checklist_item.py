from pydantic import BaseModel, Field
from typing import Optional


class OrderChecklistItemBase(BaseModel):
    """
    Base schema for OrderChecklistItem containing task specifics.
    """

    order_calendar_id: int = Field(
        ..., description="Reference to the parent maintenance order."
    )
    task_description: str = Field(
        ..., description="Detailed instructions for this specific checklist step."
    )
    status: str = Field(
        ...,
        max_length=50,
        description="Completion status (e.g., 'pending', 'completed', 'not_applicable').",
    )
    comments: Optional[str] = Field(
        None,
        description="Technician's notes or findings specific to this checklist item.",
    )


class OrderChecklistItemCreate(OrderChecklistItemBase):
    """
    Schema used for adding a new checklist item.
    Inherits all required fields directly from OrderChecklistItemBase.
    """

    pass


class OrderChecklistItemUpdate(BaseModel):
    """
    Schema used for updating an existing checklist item.
    Fields are optional to allow for partial updates (PATCH requests).
    """

    order_calendar_id: Optional[int] = Field(
        None, description="Updated parent order reference."
    )
    task_description: Optional[str] = Field(
        None, description="Updated instructions for this checklist step."
    )
    status: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated completion status.",
    )
    comments: Optional[str] = Field(
        None, description="Updated technician's notes or findings."
    )


class OrderChecklistItemResponse(OrderChecklistItemBase):
    """
    Schema used for returning checklist item data in API responses.
    Includes the database-generated ID.
    """

    id: int = Field(
        ..., description="The unique internal identifier of the checklist item."
    )

    class Config:
        """
        Enable compatibility with SQLAlchemy ORM models.
        """

        from_attributes = True
