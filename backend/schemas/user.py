from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """
    Base schema for User containing common attributes.
    This schema is inherited by other user-related schemas.
    """

    sap_number: str = Field(
        ...,
        max_length=20,
        description="Unique identifier from the SAP system, used as the login credential. ",
    )
    name: str = Field(..., max_length=50, description="The given name of the employee.")
    lastname: str = Field(
        ..., max_length=50, description="The surname of the employee."
    )
    is_active: bool = Field(
        default=False,
        description="Indicates if the user account is currently active and can access the system.",
    )


class UserCreate(UserBase):
    """
    Schema used by Administrator or other authorized personel to register a new employee (User) in the CMMS.
    Inherit from UserBase and adds the required password and role_id fields.
    """

    password: str = Field(
        ...,
        min_length=8,
        description="The raw password for the user, which must be hashed before saving to the DB.",
    )
    role_id: int = Field(
        ..., description="The internal databese ID of the Role assigned to this user."
    )


class UserUpdate(BaseModel):
    """
    Schema used for updating an existing User's information.
    All fiields are optional to allow for partical updates (PATCH requests).
    """

    sap_number: Optional[str] = Field(
        None, max_length=20, description="Updated SAP number."
    )
    name: Optional[str] = Field(None, max_length=50, description="Updated given name.")
    lastname: Optional[str] = Field(None, max_length=50, description="Updated surname.")
    is_active: Optional[bool] = Field(None, description="Updated active status.")
    password: Optional[str] = Field(
        None, min_length=8, description="Updated raw password."
    )
    role_id: Optional[int] = Field(None, description="Updated role ID.")


class UserResponse(UserBase):
    """Schema used for returning User data in API responses.
    Includes database-generated fields, foreign keys, and timestamps, but EXCLUDES the password.
    """

    id: int = Field(..., description="The unique identifier od the user.")
    role_id: int = Field(..., description="The ID of the Role assigmed to the user.")
    created_at: datetime = Field(
        ..., description="Timestamp of when the user was created."
    )
    updated_at: datetime = Field(
        ..., description="Timestamp of the last update to the user profile."
    )

    model_config = {"from_attributes": True}
