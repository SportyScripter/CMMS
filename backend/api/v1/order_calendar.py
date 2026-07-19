from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.order_calendar import (
    OrderCalendarCreate,
    OrderCalendarUpdate,
    OrderCalendarResponse,
)
from crud import crud_orders_calendar
from core.permissions import ALLOW_READ_ONLY, ALLOW_MANAGE_MACHINES

router = APIRouter()


@router.post(
    "/", response_model=OrderCalendarResponse, status_code=status.HTTP_201_CREATED
)
def create_order(
    order_in: OrderCalendarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Schedule a new maintenance order. The principal_id is automatically set to the current user."""
    order_in.principal_id = current_user.id
    return crud_orders_calendar.create_order(db=db, order_in=order_in)


@router.get("/", response_model=List[OrderCalendarResponse])
def get_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a list of all scheduled orders."""
    return crud_orders_calendar.get_orders(db=db, skip=skip, limit=limit)


@router.get("/{order_id}", response_model=OrderCalendarResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a specific order by its ID."""
    db_order = crud_orders_calendar.get_order(db=db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return db_order


@router.patch("/{order_id}", response_model=OrderCalendarResponse)
def update_order(
    order_id: int,
    order_in: OrderCalendarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Update an order (e.g., assign technician, change status, update scheduled date)."""
    db_order = crud_orders_calendar.update_order(
        db=db, order_id=order_id, order_update=order_in
    )
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return db_order


@router.delete("/{order_id}", response_model=OrderCalendarResponse)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete a specific order."""
    db_order = crud_orders_calendar.delete_order(db=db, order_id=order_id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    return db_order
