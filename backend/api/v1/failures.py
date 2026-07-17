from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.failure import FailureCreate, FailureUpdate, FailureResponse
from crud import crud_failures
from core.permissions import ALLOW_READ_ONLY, ALLOW_MANAGE_MACHINES

router = APIRouter()


@router.post("/", response_model=FailureResponse, status_code=status.HTTP_201_CREATED)
def create_failure(
    failure_in: FailureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """
    Create a new failure.
    """
    failure_in.submitter_id = (
        current_user.id
    )  # Set the submitter_id to the current user's ID
    return crud_failures.create_failure(db=db, failure_in=failure_in)


@router.get("/", response_model=List[FailureResponse])
def get_failures(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a list of failures."""
    return crud_failures.get_failures(db=db, skip=skip, limit=limit)


@router.get("/{failure_id}", response_model=FailureResponse)
def get_failure(
    failure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a failure by its ID."""
    db_failure = crud_failures.get_failure(db=db, failure_id=failure_id)
    if not db_failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failure with ID '{failure_id}' not found.",
        )
    return db_failure


@router.patch("/{failure_id}", response_model=FailureResponse)
def update_failure(
    failure_id: int,
    failure_in: FailureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Update a failure by its ID."""
    db_failure = crud_failures.update_failure(
        db=db, failure_id=failure_id, failure_update=failure_in
    )
    if not db_failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failure with ID '{failure_id}' not found.",
        )
    return db_failure


@router.delete("/{failure_id}", response_model=FailureResponse)
def delete_failure(
    failure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete a failure by its ID."""
    db_failure = crud_failures.delete_failure(db=db, failure_id=failure_id)
    if not db_failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failure with ID '{failure_id}' not found.",
        )
    return db_failure
