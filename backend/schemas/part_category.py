from pydantic import BaseModel, Field
from typing import Optional


class PartCategoryBase(BaseModel):
    """
    Base schema for PartCategory containing common attributes.
    """

    name: str = Field(
        ..., max_length=100, description="Unique identifier/name for part category."
    )


class PartCategoryCreate(PartCategoryBase):
    """
    Schema used for creating a new PartCategory.
    Inherits all required fields directly from PartCategoryBase.
    """

    pass


class PartCategoryUpdate(BaseModel):
    """
    Schema used for updating an existing PartCategory.
    Fields are optional to allow partial updates (PATCH requests).
    """

    name: Optional[str] = Field(
        None, max_length=100, description="Updated part category name."
    )


class PartCategoryResponse(PartCategoryBase):
    """
    Schema used for returning PartCategory data in API responses.
    Includes the database-generated ID.
    """

    id: int = Field(..., description="The unique internal identifier of the category.")

    class config:
        """
        Enable compatibility with SQLAlchemy ORM models.
        """

        from_attributes = True
