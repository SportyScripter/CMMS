from sqlalchemy.orm import Session
from typing import List, Optional
from models.order_type import OrderType
from schemas.order_type import OrderTypeCreate, OrderTypeUpdate


def create_order_type(db: Session, order_type_in: OrderTypeCreate) -> OrderType:
    """Create a new order type in the database."""
    order_type = OrderType(**order_type_in.dict())
    db.add(order_type)
    db.commit()
    db.refresh(order_type)
    return order_type


def get_order_type(db: Session, order_type_id: int) -> Optional[OrderType]:
    """Retrieve an order type by its ID."""
    return db.query(OrderType).filter(OrderType.id == order_type_id).first()


def get_order_type_by_name(db: Session, name: str) -> Optional[OrderType]:
    """Retrieve an order type by its name."""
    return db.query(OrderType).filter(OrderType.name == name).first()


def get_order_types(db: Session, skip: int = 0, limit: int = 100) -> List[OrderType]:
    """Retrieve a list of order types with pagination."""
    return db.query(OrderType).offset(skip).limit(limit).all()


def update_order_type(
    db: Session, order_type_id: int, order_type_in: OrderTypeUpdate
) -> Optional[OrderType]:
    """Update an existing order type in the database."""
    db_order_type = db.query(OrderType).filter(OrderType.id == order_type_id).first()
    if not db_order_type:
        return None
    update_data = order_type_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order_type, field, value)
    db.commit()
    db.refresh(db_order_type)
    return db_order_type


def delete_order_type(db: Session, order_type_id: int) -> bool:
    """Delete an order type from the database."""
    db_order_type = db.query(OrderType).filter(OrderType.id == order_type_id).first()
    if not db_order_type:
        return False
    db.delete(db_order_type)
    db.commit()
    return True
