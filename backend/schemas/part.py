from pydantic import BaseModel, Field
from typing import Optional


class PartBase(BaseModel):
    """
    Base schema for Part containing common attributes.
    """

    category_id: int = Field(
        ...,
        description="Links to the category (e.g., 'Bearings', 'Electrical Components').",
    )
    name: str = Field(
        ..., max_length=100, description="Descriptive name or part number indentifier."
    )
    type: str = Field(
        ...,
        max_length=100,
        description="Classification of part type (e.g., consumables, strategic spare).",
    )
    quantity: int = Field(
        ..., description="Current physical stock level in the warehouse."
    )
    min_quantity: int = Field(
        ...,
        description="Threshold level for triggering automatic restocking notifications.",
    )
    location: str = Field(
        ..., max_length=100, description="Specific warehouse aisle/shelf identifier."
    )
    price: float = Field(..., description="Unit cost of the part.")
    url_address: Optional[str] = Field(
        None,
        max_length=255,
        description="External URL for reordering or supplier reference.",
    )
    docs: Optional[str] = Field(
        None,
        max_length=255,
        description="Path or link to technical documentation/datasheets.",
    )
    qr_code: str = Field(
        ...,
        max_length=100,
        description="Unique identifier for mobile warehouse management.",
    )


class PartCreate(PartBase):
    """
    Schema used for creating a new Part.
    Inherits all required fields directly from PartBase.
    """

    pass


class PartUpdate(BaseModel):
    """
    Schema used for updating an existing Part.
    All fields are optional to allow partial updates (PATCH requests).
    """

    category_id: Optional[int] = Field(None, description="Updated category ID.")
    name: Optional[str] = Field(
        None,
        max_length=100,
        description="Updated descriptive name or part number identifier.",
    )
    type: Optional[str] = Field(
        None, max_length=100, description="Updated classification of part type."
    )
    quantity: Optional[int] = Field(
        None, description="Updated current physical stock level in the warehouse."
    )
    min_quantity: Optional[int] = Field(
        None,
        description="Updated threshold level for triggering automatic restocking notifications.",
    )
    location: Optional[str] = Field(
        None,
        max_length=100,
        description="Updated specific warehouse aisle/shelf identifier.",
    )
    price: Optional[float] = Field(None, description="Updated unit cost of the part.")
    url_address: Optional[str] = Field(
        None,
        max_length=255,
        description="Updated external URL for reordering or supplier reference.",
    )
    docs: Optional[str] = Field(
        None,
        max_length=255,
        description="Updated path or link to technical documentation/datasheets.",
    )
    qr_code: Optional[str] = Field(
        None,
        max_length=100,
        description="Updated unique identifier for mobile warehouse management.",
    )


class PartResponse(PartBase):
    """
    Schema used for returning Part data in API responses.
    Includes the database-generated ID.
    """

    id: int = Field(..., description="The unique internal identifier of the part.")

    model_config = {"from_attributes": True}
