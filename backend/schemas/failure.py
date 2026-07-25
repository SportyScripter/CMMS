from datetime import datetime

from pydantic import BaseModel, Field

from schemas.attachment import AttachmentResponse
from schemas.department import DepartmentResponse
from schemas.failure_part import FailurePartResponse
from schemas.machine import MachineResponse
from schemas.user import UserResponse


class FailureBase(BaseModel):
    """Base schema for Failure containing core attributes needed to identify the issue."""

    machine_id: int = Field(
        ...,
        description="Reference ID of the broken or malfunctioning machine.",
    )
    department_id: int = Field(
        ...,
        description="Reference ID of the department responsible for the repair.",
    )
    failure_description: str = Field(
        ...,
        description="Detailed description of the problem reported by the user.",
    )
    status: str = Field(
        default="Pending",
        max_length=50,
        description="Current lifecycle state (e.g., 'open', 'in_progress','closed').",
    )


class FailureCreate(FailureBase):
    """Schema used for submitting a new failure into the CMMS."""

    submitter_id: int = Field(
        ...,
        description="Reference ID of the user who initially reported the issue.",
    )


class FailureUpdate(BaseModel):
    """Schema used for updating an existing Failure (e.g., assigning mechanic, closing the ticket).
    All fields are optional to allow partial updates (PATCH requests).
    """

    machine_id: int | None = Field(None, description="Updated machine reference.")
    department_id: int | None = Field(
        None,
        description="Updated responsible department reference.",
    )
    status: str | None = Field(
        None,
        max_length=50,
        description="Updated lifecycle state.",
    )
    recipient_id: int | None = Field(
        None,
        description="Reference to the mechanic assigned to fix the issue.",
    )
    failure_description: str | None = Field(
        None,
        description="Updated problem description.",
    )
    repair_description: str | None = Field(
        None,
        description="Technical details of the actions taken to resolve the failure.",
    )
    comment: str | None = Field(
        None,
        description="Additional notes or feedback from the maintenance team.",
    )
    end_date: datetime | None = Field(
        None,
        description="Timestamp when the repair was completed.",
    )


class FailureResponse(FailureBase):
    """Schema used for returning Failure data in API responses.
    Includes timestamps (from TimeStampMixin), resolutions, and assigned personnel.
    """

    id: int = Field(..., description="The unique internal identifier of the failure.")
    submitter_id: int = Field(..., description="User ID who reported the issue.")
    recipient_id: int | None = Field(
        None,
        description="Machanic ID assigned to the issue.",
    )
    repair_description: str | None = Field(
        None,
        description="Technical details of the repair.",
    )
    comment: str | None = Field(None, description="Additional notes.")
    end_date: datetime | None = Field(
        None,
        description="Timestamp when the repair was completed and closed.",
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when the failure was initially reported.",
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp of the last update to the failure record.",
    )
    submitter: UserResponse
    recipient: UserResponse | None = None
    machine: MachineResponse
    department: DepartmentResponse
    used_parts: list[FailurePartResponse] = []
    attachments: list[AttachmentResponse] = []
    model_config = {"from_attributes": True}
