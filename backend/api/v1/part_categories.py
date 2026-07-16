from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from models.user import User
from schemas.part_category import (
    PartCategoryCreate,
    PartCategoryUpdate,
    PartCategoryResponse,
)
from crud import crud_part_categories
from core.permissions import ALLOW_MANAGE_PARTS, ALLOW_CHECK_PARTS, ALLOW_EDIT_PARTS
from api.dependencies import get_db

router = APIRouter()


@router.post(
    "/", response_model=PartCategoryResponse, status_code=status.HTTP_201_CREATED
)
def create_part_category(
    part_category_in: PartCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """Create a new part category (only accessible to users with the required role)."""
    if crud_part_categories.get_part_category_by_name(db, name=part_category_in.name):
        raise HTTPException(status_code=400, detail="Part category already exists.")
    return crud_part_categories.create_part_category(
        db=db, part_category_in=part_category_in
    )


@router.get("/", response_model=List[PartCategoryResponse])
def get_part_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Retrieve a list of part categories (only accessible to users with the required role)."""
    return crud_part_categories.get_part_categories(db=db, skip=skip, limit=limit)


@router.patch("/{part_category_id}", response_model=PartCategoryResponse)
def update_part_category(
    part_category_id: int,
    part_category_update: PartCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_EDIT_PARTS),
) -> Any:
    """Update an existing part category (only accessible to users with the required role)."""
    db_category = crud_part_categories.update_part_category(
        db=db,
        part_category_id=part_category_id,
        part_category_update=part_category_update,
    )
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part category not found"
        )
    return db_category


@router.delete("/{part_category_id}", response_model=PartCategoryResponse)
def delete_part_category(
    part_category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """Delete an existing part category (only accessible to users with the required role)."""
    db_category = crud_part_categories.delete_part_category(
        db=db, part_category_id=part_category_id
    )
    if not db_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part category not found"
        )
    return db_category
