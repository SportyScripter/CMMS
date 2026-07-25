from pydantic import BaseModel, Field


class DepartmentBase(BaseModel):
    """Base schema for Department containing common attributes."""

    name: str = Field(
        ...,
        max_length=100,
        description="Official name of the department (e.g., Electrical, Mechanical).",
    )


class DepartmentCreate(DepartmentBase):
    """Schema used for creating a new Department.
    Inherits all required fields directly from DepartmentBase.
    """


class DepartmentUpdate(BaseModel):
    """Schema used for updating an existing Department.
    Field are optional to allow for partial updates.
    """

    name: str | None = Field(
        None,
        max_length=100,
        description="Updated department name.",
    )


class DepartmentResponse(DepartmentBase):
    """Schema used for returning Department data in API responses.
    Includes database-generated ID.
    """

    id: int = Field(
        ...,
        description="The unique internal identifier of the department.",
    )

    model_config = {"from_attributes": True}
