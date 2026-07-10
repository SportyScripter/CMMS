from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MachineBase(BaseModel):
    """
    Base schema for Machine containing core attributes.
    This schema is inherited by other machine-related schemas.
    """

    name: str = Field(
        ...,
        max_length=255,
        description="Official designation or asset tag of the machine.",
    )
    location: str = Field(
        ...,
        max_length=255,
        description="Physical location on the production floor (e.g., Hall A, Sector 3).",
    )
    qr_code: str = Field(
        ...,
        max_length=255,
        description="Unique OR identifier used for mobile scanning and quick asset retrieval.",
    )
    status: str = Field(
        ...,
        max_length=50,
        description="Current operational state (e.g., 'operational', 'under_maintenance', 'out_of_service').",
    )


class MachineCreate(MachineBase):
    """
    Schema used for registering a new Machine in the CMMS.
    Inherit all required fields directly from MachineBase.
    """

    pass


class MachineUpdate(BaseModel):
    """Schema used for updating an existing Machine.
    All fields are optional to allow for partical updates (PATCH requests).
    """

    name: Optional[str] = Field(
        None,
        max_length=255,
        description="Updated official designation or asset tag of the machine.",
    )
    location: Optional[str] = Field(
        None,
        max_length=255,
        description="Updated physical location on the production floor.",
    )
    qr_code: Optional[str] = Field(
        None,
        max_length=255,
        description="Updated unique QR identifier for the machine.",
    )
    status: Optional[str] = Field(
        None, max_length=50, description="Updated operational state of the machine."
    )


class MachineResponse(MachineBase):
    """
    Schema used for returning Machine data in API responses.
    Includes database-generated fields like 'id' and timestamps.
    """

    id: int = Field(
        ..., description="The unique identifier of the machine in the database."
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the machine record was created."
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the machine record was last updated."
    )

    class config:
        """
        Pydantic V2 config mapping.
        from_attributes=True allows Pydantic to read data directly from SQLAlchemy models.
        """

        from_attributes = True
