from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.part_history import PartHistory
from models.part import Part
from schemas.part_history import PartHistoryResponse, PartHistoryBase
from crud.crud_part_history import (
    get_part_history_by_part,
    get_all_part_history,
)
from models.user import User
from api.dependencies import get_db
from core.permissions import ALLOW_EDIT_PARTS

router = APIRouter()


@router.get("/", response_model=List[PartHistoryResponse])
def read_all_part_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_EDIT_PARTS),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    """Retrieves all part history entries, with optional pagination."""
    return get_all_part_history(db=db, skip=skip, limit=limit)


@router.get("/part/{part_id}", response_model=List[PartHistoryResponse])
def get_history_for_part(
    part_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_EDIT_PARTS),
):
    """Retrieves part history entries for a specific part."""
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if not db_part:
        raise HTTPException(status_code=404, detail="Part not found")
    return get_part_history_by_part(db=db, part_id=part_id)


@router.post("/part/{part_id}", response_model=PartHistoryResponse)
def create_manual_transaction(
    part_id: int,
    transaction_in: PartHistoryBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_EDIT_PARTS),
):
    """Creates a manual transaction and updates the inventory."""
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if not db_part:
        raise HTTPException(status_code=404, detail="Part not found")
    if db_part.quantity + transaction_in.quantity_change < 0:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient quantity. Available: {db_part.quantity} units.",
        )
    db_part.quantity += transaction_in.quantity_change
    history_record = PartHistory(
        part_id=part_id,
        user_id=current_user.id,
        machine_id=transaction_in.machine_id,
        quantity_change=transaction_in.quantity_change,
        transaction_type=transaction_in.transaction_type,
        reason=transaction_in.reason or "No description provided",
    )
    db.add(history_record)
    db.commit()
    db.refresh(history_record)
    return history_record
