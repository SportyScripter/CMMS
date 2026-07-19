from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.order_type import OrderTypeCreate, OrderTypeUpdate, OrderTypeResponse
from crud import crud_order_types
from core.permissions import ALLOW_MANAGE_MACHINES, ALLOW_READ_ONLY

router = APIRouter()


@router.post("/", response_model=OrderTypeResponse, status_code=status.HTTP_201_CREATED)
def create_order_type(
    order_type_in: OrderTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Create a new order type."""
    existing_order_type = crud_order_types.get_order_type_by_name(
        db, order_type_in.name
    )
    if existing_order_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order type with name '{order_type_in.name}' already exists.",
        )
    return crud_order_types.create_order_type(db=db, order_type_in=order_type_in)


@router.get("/", response_model=List[OrderTypeResponse])
def read_order_types(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a list of order types with pagination."""
    return crud_order_types.get_order_types(db=db, skip=skip, limit=limit)


@router.get("/{order_type_id}", response_model=OrderTypeResponse)
def read_order_type(
    order_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """Retrieve a specific order type by its ID."""
    db_order_type = crud_order_types.get_order_type(db=db, order_type_id=order_type_id)
    if not db_order_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order type with ID '{order_type_id}' not found.",
        )
    return db_order_type


@router.patch("/{order_type_id}", response_model=OrderTypeResponse)
def update_order_type(
    order_type_id: int,
    order_type_in: OrderTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Update a specific order type."""
    if order_type_in.name is not None:
        existing_type = crud_order_types.get_order_type_by_name(
            db, name=order_type_in.name
        )
        if existing_type and existing_type.id != order_type_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another order type with this name already exists.",
            )

    db_order_type = crud_order_types.update_order_type(
        db=db, order_type_id=order_type_id, order_type_in=order_type_in
    )
    if not db_order_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order type not found"
        )
    return db_order_type


@router.delete("/{order_type_id}", response_model=OrderTypeResponse)
def delete_order_type(
    order_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete a specific order type."""
    db_order_type = crud_order_types.delete_order_type(
        db=db, order_type_id=order_type_id
    )
    if not db_order_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order type not found"
        )
    return db_order_type
