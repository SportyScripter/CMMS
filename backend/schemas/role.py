from pydantic import BaseModel, Field
from typing import Optional


class RoleBase(BaseModel):
    """
    Base schema for Role containing common attributes.
    Examples of roles: 'Maintenance Manager', 'Electrical Manager', 'Production Foreman', 'Director', 'Mechanic', 'Electrician'.
    """

    name: str = Field(
        ..., max_length=50, description="The unique name of the system role."
    )
    description: Optional[str] = Field(
        None,
        max_length=255,
        description="Detailed description of what permissions and duties this role entails.",
    )


class RoleCreate(RoleBase):
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


class RoleMinimal(BaseModel):
    name: str

    model_config = {"from_attributes": True}


class RoleResponse(RoleBase):
    """
    Schema used for returning Role data in API responses.
    Includes database-generated fields like 'id' and timestamps.
    """

    id: int = Field(
        ..., description="The unique identifier of the role in the database."
    )

    model_config = {"from_attributes": True}
