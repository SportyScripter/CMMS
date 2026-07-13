from pydantic import BaseModel, Field
from typing import Optional


class PartCompatibilityBase(BaseModel):
    """
    Base schema for PartCompatibility mapping spare parts to machines.
    """

    part_id: int = Field(..., description="Reference to the spare part.")
    machine_id: int = Field(
        ..., description="Reference to the machine that is compatible with the part."
    )


class PartCompatibilityCreate(PartCompatibilityBase):
    """
    Schema used for linking a spare part to a compatible machine.
    """

    pass


class PartCompatibilityUpdate(BaseModel):
    """
    Schema used for updating an existing compatibility mapping.
    """

    part_id: Optional[int] = Field(
        None, description="Updated reference to the spare part."
    )
    machine_id: Optional[int] = Field(
        None, description="Updated reference to the compatible machine."
    )


class PartCompatibilityResponse(PartCompatibilityBase):
    """
    Schema used for returning part compatibility data in API responses.
    """

    class Config:
        """
        Enable compatibility with SQLAlchemy ORM models.
        """

        from_attributes = True
