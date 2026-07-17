from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from schemas.user import UserResponse
from schemas.machine import MachineResponse
from schemas.department import DepartmentResponse


class FailureBase(BaseModel):
    """
    Base schema for Failure containing core attributes needed to identify the issue.
    """

    machine_id: int = Field(
        ..., description="Reference ID of the broken or malfunctioning machine."
    )
    department_id: int = Field(
        ..., description="Reference ID of the department responsible for the repair."
    )
    failure_description: str = Field(
        ..., description="Detailed description of the problem reported by the user."
    )
    status: str = Field(
        default="Pending",
        max_length=50,
        description="Current lifecycle state (e.g., 'open', 'in_progress','closed').",
    )


class FailureCreate(FailureBase):
    """
    Schema used for submitting a new failure into the CMMS.
    """

    submitter_id: int = Field(
        ..., description="Reference ID of the user who initially reported the issue."
    )


class FailureUpdate(BaseModel):
    """
    Schema used for updating an existing Failure (e.g., assigning mechanic, closing the ticket).
    All fields are optional to allow partial updates (PATCH requests).
    """

    machine_id: Optional[int] = Field(None, description="Updated machine reference.")
    department_id: Optional[int] = Field(
        None, description="Updated responsible department reference."
    )
    status: Optional[str] = Field(
        None, max_length=50, description="Updated lifecycle state."
    )
    recipient_id: Optional[int] = Field(
        None, description="Reference to the mechanic assigned to fix the issue."
    )
    failure_description: Optional[str] = Field(
        None, description="Updated problem description."
    )
    repair_description: Optional[str] = Field(
        None,
        description="Technical details of the actions taken to resolve the failure.",
    )
    comment: Optional[str] = Field(
        None, description="Additional notes or feedback from the maintenance team."
    )
    end_date: Optional[datetime] = Field(
        None, description="Timestamp when the repair was completed."
    )


class FailureResponse(FailureBase):
    """
    Schema used for returning Failure data in API responses.
    Includes timestamps (from TimeStampMixin), resolutions, and assigned personnel.
    """

    id: int = Field(..., description="The unique internal identifier of the failure.")
    submitter_id: int = Field(..., description="User ID who reported the issue.")
    recipient_id: Optional[int] = Field(
        None, description="Machanic ID assigned to the issue."
    )
    repair_description: Optional[str] = Field(
        None, description="Technical details of the repair."
    )
    comment: Optional[str] = Field(None, description="Additional notes.")
    end_date: Optional[datetime] = Field(
        None, description="Timestamp when the repair was completed and closed."
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the failure was initially reported."
    )
    updated_at: datetime = Field(
        ..., description="Timestamp of the last update to the failure record."
    )
    submitter: UserResponse
    recipient: Optional[UserResponse] = None
    machine: MachineResponse
    department: DepartmentResponse

    model_config = {"from_attributes": True}
