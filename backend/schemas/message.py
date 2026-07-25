from datetime import datetime

from pydantic import BaseModel, Field

from schemas.message_recipient import MessageRecipientResponse
from schemas.user import UserResponse


class MessageBase(BaseModel):
    """
    Base schema for Message containing core communication attributes.
    """

    parent_message_id: int | None = Field(
        None, description="Reference to a parent message to support threading/replies."
    )
    recipient_ids: list[int] = Field(
        default=[], description="List of user IDs who should receive this message."
    )
    subject: str = Field(..., description="Topic or summary of the message.")
    content: str = Field(..., description="Main body text of the message.")
    sender_id: int = Field(..., description="User who sent the message.")
    role_id: int | None = Field(
        None, description="Optional role-based broadcast target."
    )


class MessageCreate(MessageBase):
    """
    Schema used for creating and sending a new internal message.
    """

    pass


class MessageUpdate(BaseModel):
    """
    Schema used for updating an existing message.
    Fields are optional to allow for partial updates (PATCH requests).
    """

    subject: str | None = Field(None, description="Updated topic or summary.")
    content: str | None = Field(None, description="Updated main body text.")
    role_id: int | None = Field(
        None, description="Updated role-based broadcast target."
    )


class MessageResponse(MessageBase):
    """
    Schema used for returning message data in API responses.
    Includes the database-generated IDs, dispatch time, and timestamps.
    """

    id: int = Field(..., description="The unique internal identifier of the message.")
    sent_at: datetime = Field(
        ..., description="Exact timestamp when the message was dispatched."
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the message record was created."
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the message record was last updated."
    )
    sender: UserResponse
    recipients: list[MessageRecipientResponse] = []

    model_config = {"from_attributes": True}
