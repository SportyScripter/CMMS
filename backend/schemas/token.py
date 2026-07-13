from pydantic import BaseModel, Field
from datetime import datetime


class Token(BaseModel):
    """Schema for the JWT token response."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Type of the token, usually 'bearer'")


class TokenPayload(BaseModel):
    """Payload data contained in the JWT token."""

    sub: str = Field(..., description="Subject of the token, usually the user ID")
    exp: datetime = Field(..., description="Expiration time of the token")
