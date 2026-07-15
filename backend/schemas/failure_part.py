from pydantic import BaseModel, Field
from typing import Optional


class FailurePartBase(BaseModel):
    """
    Base schema for FailurePart tracking the consumption of spare parts.
    """

    failure_id: int = Field(..., description="Reference to the repaired failure.")
    part_id: int = Field(
        ..., description="Reference to the specific spare part consumed."
    )
    quantity_used: int = Field(
        ..., description="Number of units removed form inventory for this report."
    )


class FailurePartCreate(FailurePartBase):
    """
    Schema used for logging consumed parts against a specific failure.
    """

    pass


class FailurePartUpdate(BaseModel):
    """
    Schema used for updating an existing part consumption record.
    Usually used to correct the quantity used.
    """

    quantity_used: Optional[int] = Field(
        None, description="Updated number of units consumed."
    )


class FailurePartResponse(FailurePartBase):
    """
    Schema used for returning part consumption data in API responses.
    """

    model_config = {"from_attributes": True}
