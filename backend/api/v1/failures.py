from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies import get_db
from core.permissions import (
    ALLOW_READ_ONLY,
    ALLOW_MANAGE_FAILURES,
    ALLOW_MANAGE_DELETE_FAILURES,
)
from crud import crud_failures
from models.user import User
from schemas.failure import FailureCreate, FailureResponse, FailureUpdate

router = APIRouter()


@router.post("/", response_model=FailureResponse, status_code=status.HTTP_201_CREATED)
def create_failure(
    failure_in: FailureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Create a new failure."""
    failure_in.submitter_id = (
        current_user.id
    )  # Set the submitter_id to the current user's ID
    return crud_failures.create_failure(db=db, failure_in=failure_in)


@router.get("/", response_model=list[FailureResponse])
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


@router.get("/machine/{machine_id}", response_model=list[FailureResponse])
def get_failures_by_machine(
    machine_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a list of failures for a specific machine."""
    return crud_failures.get_failures_by_machine(
        db=db, machine_id=machine_id, skip=skip, limit=limit
    )


@router.patch("/{failure_id}", response_model=FailureResponse)
def update_failure(
    failure_id: int,
    failure_in: FailureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_FAILURES),
) -> Any:
    """Update a failure by its ID with Role-Based Access Control."""
    db_failure = crud_failures.get_failure(db=db, failure_id=failure_id)
    if not db_failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failure with ID '{failure_id}' not found.",
        )
    user_role = current_user.role.name
    service_roles = ["Super Admin", "Admin", "Kierownik", "Mechanik", "Elektryk"]
    if user_role not in service_roles:
        if db_failure.submitter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak dostępu: Możesz edytować tylko własne zgłoszenia.",
            )
        if db_failure.status not in ["Pending", "CRITICAL", "WARNING"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak dostępu: Nie możesz edytować zgłoszenia, które jest już w trakcie naprawy lub zamknięte.",
            )
        if failure_in.status and failure_in.status not in [
            "Pending",
            "CRITICAL",
            "WARNING",
        ]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Brak uprawnień: Operatorzy nie mogą zamykać awarii ani zmieniać statusu na serwisowy.",
            )
    updated_failure = crud_failures.update_failure(
        db=db,
        failure_id=failure_id,
        failure_update=failure_in,
    )
    return updated_failure


@router.delete("/{failure_id}", response_model=FailureResponse)
def delete_failure(
    failure_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_DELETE_FAILURES),
) -> Any:
    """Delete a failure by its ID."""
    db_failure = crud_failures.delete_failure(db=db, failure_id=failure_id)
    if not db_failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failure with ID '{failure_id}' not found.",
        )
    return db_failure
