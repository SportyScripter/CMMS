from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.order_checklist_item import (
    OrderChecklistItemCreate,
    OrderChecklistItemUpdate,
    OrderChecklistItemResponse,
)
from crud import crud_order_checklist_items
from core.permissions import ALLOW_MANAGE_MACHINES, ALLOW_READ_ONLY

router = APIRouter()


@router.post(
    "/", response_model=OrderChecklistItemResponse, status_code=status.HTTP_201_CREATED
)
def create_checklist_item(
    item_in: OrderChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Add a new task item to an order's checklist."""
    return crud_order_checklist_items.create_checklist_item(db=db, item_in=item_in)


@router.get("/order/{order_id}", response_model=List[OrderChecklistItemResponse])
def get_checklist_items_by_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve the full checklist for a specific maintenance order."""
    return crud_order_checklist_items.get_checklist_items_by_order(
        db=db, order_id=order_id
    )


@router.patch("/{item_id}", response_model=OrderChecklistItemResponse)
def update_checklist_item(
    item_id: int,
    item_in: OrderChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Update a checklist item (e.g., mark as 'completed' or add notes)."""
    db_item = crud_order_checklist_items.update_checklist_item(
        db, item_id=item_id, item_in=item_in
    )
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Checklist item with ID '{item_id}' not found.",
        )
    return db_item


@router.delete("/{item_id}", response_model=OrderChecklistItemResponse)
def delete_checklist_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete a specific checklist item."""
    db_item = crud_order_checklist_items.delete_checklist_item(db=db, item_id=item_id)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Checklist item with ID '{item_id}' not found.",
        )
    return db_item
