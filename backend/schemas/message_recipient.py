from pydantic import BaseModel, Field
from typing import Optional


class MessageRecipientBase(BaseModel):
    """
    Base schema for MessageRecipient containing delivery attributes.
    """

    message_id: int = Field(
        ..., description="Reference to the specific message broadcasted."
    )
    recipient_id: int = Field(
        ..., description="Reference to the targeted user receiving the message."
    )
    is_read: bool = Field(
        default=False,
        description="Indicates whether the recipient has opened and read the message.",
    )


class MessageRecipientCreate(MessageRecipientBase):
    """
    Schema used for assigning a message to a recipient.
    """

    pass


class MessageRecipientUpdate(BaseModel):
    """
    Schema used for updating the read status of a receiving message.
    Typically used to mark a message as read.
    """

    is_read: Optional[bool] = Field(None, description="Updated read status.")


class MessageRecipientResponse(MessageRecipientBase):
    """
    Schema used for returning message recipient data in API responses.
    """

    model_config = {"from_attributes": True}
