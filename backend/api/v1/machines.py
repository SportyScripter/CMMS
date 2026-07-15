from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from models.user import User
from schemas.machine import MachineCreate, MachineUpdate, MachineResponse
from crud import crud_machines
from core.permissions import ALLOW_MANAGE_MACHINES
from api.dependencies import get_current_user, get_db

router = APIRouter()


@router.post("/", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(
    machine_in: MachineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Register a new machine in the system (requires management permissions)."""
    if crud_machines.get_machine_by_qr_code(db, qr_code=machine_in.qr_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Machine with this QR code already exists",
        )
    if crud_machines.get_machine_by_name(db, name=machine_in.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Machine with this name already exists",
        )
    return crud_machines.create_machine(db=db, machine_in=machine_in)


@router.get("/", response_model=List[MachineResponse])
def read_machines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Retrieve a list of all machines in the system."""
    return crud_machines.get_machines(db, skip=skip, limit=limit)


@router.get("/{machine_id}", response_model=MachineResponse)
def read_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Retrieve a specific machine by its ID."""
    db_machine = crud_machines.get_machine(db, machine_id=machine_id)
    if not db_machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found"
        )
    return db_machine


@router.patch("/{machine_id}", response_model=MachineResponse)
def update_machine(
    machine_id: int,
    machine_in: MachineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Update an existing machine's information (requires management permissions)."""
    machine = crud_machines.get_machine(db, machine_id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found"
        )
    if machine_in.qr_code:
        existing_machine = crud_machines.get_machine_by_qr_code(
            db, qr_code=machine_in.qr_code
        )
        if existing_machine and existing_machine.id != machine_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another machine with this QR code already exists",
            )
    if machine_in.name:
        existing_machine = crud_machines.get_machine_by_name(db, name=machine_in.name)
        if existing_machine and existing_machine.id != machine_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another machine with this name already exists",
            )
    return crud_machines.update_machine(
        db=db, db_machine=machine, machine_in=machine_in
    )


@router.delete("/{machine_id}", response_model=MachineResponse)
def delete_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete an existing machine from the system (requires management permissions)."""
    machine = crud_machines.get_machine(db, machine_id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Machine not found"
        )
    return crud_machines.delete_machine(db=db, db_machine=machine)
