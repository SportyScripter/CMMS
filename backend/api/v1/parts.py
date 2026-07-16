from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.part import PartCreate, PartUpdate, PartResponse
from crud import crud_parts
from core.permissions import ALLOW_MANAGE_PARTS, ALLOW_CHECK_PARTS, ALLOW_EDIT_PARTS

router = APIRouter()


@router.post("/", response_model=PartResponse, status_code=status.HTTP_201_CREATED)
def create_part(
    part_in: PartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """Create a new part (only accessible to users with the required role)."""
    check_existing_part_in_db = crud_parts.get_parts_by_name(db, name=part_in.name)
    if crud_parts.get_part_by_qr_code(db, qr_code=part_in.qr_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A part with this QR code already exists",
        )
    for part in check_existing_part_in_db:
        if part.name == part_in.name and part.type == part_in.type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A part with this name and type already exists",
            )
    return crud_parts.create_part(db=db, part_in=part_in)


@router.get("/", response_model=List[PartResponse])
def read_parts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Retrieve a list of all parts (accessible to any logged-in user)."""
    return crud_parts.get_parts(db=db, skip=skip, limit=limit)


@router.get("/{part_id}", response_model=PartResponse)
def read_part_by_id(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Retrieve a specific part by its ID (accessible to any logged-in user)."""
    db_part = crud_parts.get_part(db=db, part_id=part_id)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part not found"
        )
    return db_part


@router.get("/name/{name}", response_model=List[PartResponse])
def read_part_by_name(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Retrieve a specific part by its name (accessible to any logged-in user)."""
    db_part = crud_parts.get_parts_by_name(db=db, name=name)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Parts not found"
        )
    return db_part


@router.get("/qr/{qr_code}", response_model=PartResponse)
def read_part_by_qr_code(
    qr_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_CHECK_PARTS),
) -> Any:
    """Retrieve a specific part by its QR code (accessible to any logged-in user)."""
    db_part = crud_parts.get_part_by_qr_code(db=db, qr_code=qr_code)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part not found"
        )
    return db_part


@router.patch("/{part_id}", response_model=PartResponse)
def update_part(
    part_id: int,
    part_in: PartUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_EDIT_PARTS),
) -> Any:
    """Update a specific part by its ID (accessible to users with the required role)."""
    db_part = crud_parts.get_part(db=db, part_id=part_id)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part not found"
        )
    return crud_parts.update_part(db=db, db_part=db_part, part_in=part_in)


@router.patch("/qr/{qr_code}", response_model=PartResponse)
def update_part_by_qr_code(
    qr_code: str,
    part_in: PartUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_EDIT_PARTS),
) -> Any:
    """Update a specific part by its QR code (accessible to users with the required role)."""
    db_part = crud_parts.get_part_by_qr_code(db=db, qr_code=qr_code)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part not found"
        )
    return crud_parts.update_part(db=db, db_part=db_part, part_in=part_in)


@router.delete("/{part_id}", response_model=PartResponse)
def delete_part(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """Delete a specific part by its ID (accessible to users with the required role)."""
    db_part = crud_parts.get_part(db=db, part_id=part_id)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part not found"
        )
    return crud_parts.delete_part(db=db, db_part=db_part)


@router.delete("/qr/{qr_code}", response_model=PartResponse)
def delete_part_by_qr_code(
    qr_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_PARTS),
) -> Any:
    """Delete a specific part by its QR code (accessible to users with the required role)."""
    db_part = crud_parts.get_part_by_qr_code(db=db, qr_code=qr_code)
    if not db_part:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Part not found"
        )
    return crud_parts.delete_part(db=db, db_part=db_part)
