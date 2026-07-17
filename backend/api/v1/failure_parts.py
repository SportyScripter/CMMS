from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.failure_part import (
    FailurePartCreate,
    FailurePartUpdate,
    FailurePartResponse,
)
from crud import crud_failure_parts
from core.permissions import ALLOW_MANAGE_MACHINES, ALLOW_READ_ONLY

router = APIRouter()


@router.post(
    "/", response_model=FailurePartResponse, status_code=status.HTTP_201_CREATED
)
def create_failure_part(
    failure_part_in: FailurePartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Log consumed parts against a specific failure and automatically deduct inventory."""
    existing_record = crud_failure_parts.get_failure_part(
        db=db, failure_id=failure_part_in.failure_id, part_id=failure_part_in.part_id
    )
    if existing_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This part is already logged for this failure. Use PATCH to update the quantity.",
        )
    try:
        return crud_failure_parts.create_failure_part(
            db=db, failure_part_in=failure_part_in
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=List[FailurePartResponse])
def get_failure_parts(
    failure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve all part consumption records for a specific failure."""
    return crud_failure_parts.get_failure_parts_by_failure(db=db, failure_id=failure_id)


@router.patch("/{failure_id}/{part_id}", response_model=FailurePartResponse)
def update_failure_part(
    failure_id: int,
    part_id: int,
    failure_part_in: FailurePartUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Update the quantity of a part consumed and adjust inventory."""
    try:
        db_failure_part = crud_failure_parts.update_failure_part(
            db=db,
            failure_id=failure_id,
            part_id=part_id,
            failure_part_in=failure_part_in,
        )
        if not db_failure_part:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Failure part record not found",
            )
        return db_failure_part
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{failure_id}/{part_id}", response_model=FailurePartResponse)
def delete_failure_part(
    failure_id: int,
    part_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete a specific part consumption record for a failure."""
    db_failure_part = crud_failure_parts.delete_failure_part(
        db, failure_id=failure_id, part_id=part_id
    )
    if not db_failure_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Failure part record not found.",
        )
    return db_failure_part
