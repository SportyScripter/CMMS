from pydantic import BaseModel, Field
from typing import Optional


class OrderTypeBase(BaseModel):
    """
    Base schema for OrderType containing the common attributes.
    """

    name: str = Field(
        ...,
        max_length=100,
        description="Unique identifier/name for the order type category.",
    )


class OrderTypeCreate(OrderTypeBase):
    """
    Schema used for creating a new Order Type.
    Inherits all required fields directly from OrderTypeBase.
    """

    pass


class OrderTypeUpdate(BaseModel):
    """
    Schema used for updating an existing Order Type.
    Fields are optional to allow for partial updates (PATCH requests).
    """

    name: Optional[str] = Field(
        None, max_length=100, description="Updated order type name."
    )


class OrderTypeResponse(OrderTypeBase):
    """
    Schema used for returning Order Type data in API responses.
    Includes the database-generated ID.
    """

    id: int = Field(
        ..., description="The unique internal identifier of the order type."
    )

    model_config = {"from_attributes": True}
