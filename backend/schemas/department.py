from pydantic import BaseModel, Field
from typing import Optional


class DepartmentBase(BaseModel):
    """
    Base schema for Department containing common attributes.
    """

    name: str = Field(
        ...,
        max_length=100,
        description="Official name of the department (e.g., Electrical, Mechanical).",
    )


class DepartmentCreate(DepartmentBase):
    """
    Schema used for creating a new Department.
    Inherits all required fields directly from DepartmentBase.
    """

    pass


class DepartmentUpdate(BaseModel):
    """
    Schema used for updating an existing Department.
    Field are optional to allow for partial updates.
    """

    name: Optional[str] = Field(
        None, max_length=100, description="Updated department name."
    )


class DepartmentResponse(DepartmentBase):
    """
    Schema used for returning Department data in API responses.
    Includes database-generated ID.
    """

    id: int = Field(
        ..., description="The unique internal identifier of the department."
    )

    class Config:
        """
        Enable compatibility with SQLAlchemy ORM models.
        """

        from_attributes = True
