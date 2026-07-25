from datetime import datetime

from pydantic import BaseModel, Field


class AttachmentBase(BaseModel):
    """
    Base schema for Attachment containing core file metadata.
    """

    failure_id: int | None = Field(
        None, description="Link the file to a specific failure report."
    )
    order_id: int | None = Field(
        None, description="Link the file to a scheduled maintenance order."
    )
    file_path: str = Field(..., description="Storage path or URI of the physical file.")


class AttachmentCreate(AttachmentBase):
    """
    Schema used for creating a new attachment record.
    """

    pass


class AttachmentUpdate(BaseModel):
    """
    Schema used for updating an existing attachment record.
    Fields are optional to allow partial updates.
    """

    failure_id: int | None = Field(
        None, description="Updated link to a failure report."
    )
    order_id: int | None = Field(
        None, description="Updated link to a maintenance order."
    )
    file_path: str | None = Field(None, description="Updated storage path or URI.")


class AttachmentResponse(AttachmentBase):
    """
    Schema used for returning attachment data in API responses.
    Includes the unique identifier and upload timestamp.
    """

    id: int = Field(
        ..., description="The unique internal identifier of the attachment."
    )
    uploaded_at: datetime = Field(..., description="UTC timestamp of the file upload.")

    model_config = {"from_attributes": True}
