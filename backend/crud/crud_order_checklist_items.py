from sqlalchemy.orm import Session
from typing import List, Optional

from models.order_checklist_item import OrderChecklistItem
from schemas.order_checklist_item import (
    OrderChecklistItemCreate,
    OrderChecklistItemUpdate,
)


def create_checklist_item(
    db: Session, item_in: OrderChecklistItemCreate
) -> OrderChecklistItem:
    """Add a new task item to an order's checklist."""
    db_item = OrderChecklistItem(**item_in.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_checklist_item(db: Session, item_id: int) -> Optional[OrderChecklistItem]:
    """Retrieve a specific checklist item by its ID."""
    return db.query(OrderChecklistItem).filter(OrderChecklistItem.id == item_id).first()


def get_checklist_items_by_order(
    db: Session, order_id: int
) -> List[OrderChecklistItem]:
    """Retrieve all checklist items for a specific maintenance order."""
    return (
        db.query(OrderChecklistItem)
        .filter(OrderChecklistItem.order_calendar_id == order_id)
        .all()
    )


def update_checklist_item(
    db: Session, item_id: int, item_in: OrderChecklistItemUpdate
) -> OrderChecklistItem:
    """Update an existing checklist item's details."""
    db_item = get_checklist_item(db, item_id)
    if not db_item:
        return None
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_checklist_item(db: Session, item_id: int) -> Optional[OrderChecklistItem]:
    """Delete a checklist item by its ID."""
    db_item = get_checklist_item(db, item_id)
    if not db_item:
        return None
    db.delete(db_item)
    db.commit()
    return db_item
