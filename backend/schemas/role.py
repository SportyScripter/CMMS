from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class RoleBase(BaseModel):
    """
    Base schema for Role containing common atributes.
    Examlples of roles: 'Maintenance Manager', 'Elektrical Manager', 'Production Foreman', 'Director', 'Machanik', 'Electrician'.
    """

    name: str = Field(
        ..., max_length=50, description="The unique name of the system role."
    )
    description: Optional[str] = Field(
        None,
        max_length=255,
        description="Detailed description of what permissions and duties this role entails.",
    )


class RoleCreate(BaseModel):
    """
    Schema used by Administrator to create a new Role in the system.
    Inherits all required fields directly from RoleBase.
    """

    pass


class RoleUpdate(BaseModel):
    """
    Schema used for updating an existing Role.
    Fields are optional to allow partial updates.
    """

    name: Optional[str] = Field(None, max_length=50, description="Updated role name")
    description: Optional[str] = Field(
        None, max_length=255, description="Updated description"
    )


class RoleResponse(BaseModel):
    """
    Schema used for returning Role data in API responses.
    Includes database-generated fields like 'id' and timestamps.
    """

    id: int = Field(
        ..., description="The unique identifier of the role in the database."
    )
    created_at: datetime = Field(
        ..., description="Timestamp when the role was created."
    )
    updated_at: datetime = Field(
        ..., description="Timestamp when the role was last updated."
    )

    class Config:
        """
        Enables compatibility with SQLAlchemy ORM models.
        """

        from_attributes = True
