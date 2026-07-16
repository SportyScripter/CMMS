from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.part_compatibility import (
    PartCompatibilityCreate,
    PartCompatibilityResponse,
)
from crud import crud_part_compatibilities
from core.permissions import ALLOW_MANAGE_PARTS, ALLOW_CHECK_PARTS

router = APIRouter()


@router.post(
    "/", response_model=PartCompatibilityResponse, status_code=status.HTTP_201_CREATED
)
def create_part_compatibility(
    compatibility_in: PartCompatibilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """Link to spare part to a machine (only accessible to user with required permissions)."""
    existing_link = crud_part_compatibilities.get_compatibility(
        db=db, part_id=compatibility_in.part_id, machine_id=compatibility_in.machine_id
    )
    if existing_link:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This part is already assigned as compatible with this machine.",
        )
    return crud_part_compatibilities.create_part_compatibility(
        db=db, part_compatibility_in=compatibility_in
    )


@router.get("/machine/{machine_id}", response_model=List[PartCompatibilityResponse])
def get_part_compatibilities_by_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Get all part compatibilities for a specific machine (accessible to users with required permissions)."""
    return crud_part_compatibilities.get_compatibilities_by_machine(
        db=db, machine_id=machine_id
    )


@router.get("/part/{part_id}", response_model=List[PartCompatibilityResponse])
def get_part_compatibilities_by_part(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Get all machine compatibilities for a specific part (accessible to users with required permissions)."""
    return crud_part_compatibilities.get_compatibilities_by_part(db=db, part_id=part_id)


@router.delete(
    "/{part_id}/{machine_id}",
    response_model=PartCompatibilityResponse,
)
def delete_part_compatibility(
    part_id: int,
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """
    Remove a part compatibility link between a part and a machine (only accessible to users with required permissions).
    """
    db_comp = crud_part_compatibilities.delete_compatibility(
        db=db, part_id=part_id, machine_id=machine_id
    )
    if not db_comp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compatibility link not found.",
        )
    return db_comp
