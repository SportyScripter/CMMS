from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from models.order_calendar import OrderCalendar
from schemas.order_calendar import OrderCalendarCreate, OrderCalendarUpdate


def create_order(db: Session, order_in: OrderCalendarCreate) -> OrderCalendar:
    """Create a new order entry in the database."""
    order_calendar = OrderCalendar(**order_in.dict())
    db.add(order_calendar)
    db.commit()
    db.refresh(order_calendar)
    return order_calendar


def get_order(db: Session, order_id: int) -> Optional[OrderCalendar]:
    """Retrieve an order entry by its ID."""
    return (
        db.query(OrderCalendar)
        .options(
            joinedload(OrderCalendar.order_type),
            joinedload(OrderCalendar.principal),
            joinedload(OrderCalendar.performed),
            joinedload(OrderCalendar.order_machine),
            joinedload(OrderCalendar.attachments),
            joinedload(OrderCalendar.checklist_items),
        )
        .filter(OrderCalendar.id == order_id)
        .first()
    )


def get_orders(db: Session, skip: int = 0, limit: int = 100) -> List[OrderCalendar]:
    """Retrieve a list of order entries."""
    return (
        db.query(OrderCalendar)
        .options(
            joinedload(OrderCalendar.order_type),
            joinedload(OrderCalendar.principal),
            joinedload(OrderCalendar.performed),
            joinedload(OrderCalendar.order_machine),
            joinedload(OrderCalendar.attachments),
            joinedload(OrderCalendar.checklist_items),
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_orders_by_machine(db: Session, machine_id: int) -> List[OrderCalendar]:
    """Retrieve a list of order entries for a specific machine."""
    return (
        db.query(OrderCalendar)
        .options(
            joinedload(OrderCalendar.order_type),
            joinedload(OrderCalendar.principal),
            joinedload(OrderCalendar.performed),
            joinedload(OrderCalendar.order_machine),
            joinedload(OrderCalendar.attachments),
            joinedload(OrderCalendar.checklist_items),
        )
        .filter(OrderCalendar.order_machine_id == machine_id)
        .all()
    )


def get_orders_by_technician(db: Session, technician_id: int) -> List[OrderCalendar]:
    """Retrieve a list of order entries assigned to a specific technician."""
    return (
        db.query(OrderCalendar)
        .options(
            joinedload(OrderCalendar.order_type),
            joinedload(OrderCalendar.principal),
            joinedload(OrderCalendar.performed),
            joinedload(OrderCalendar.order_machine),
            joinedload(OrderCalendar.attachments),
            joinedload(OrderCalendar.checklist_items),
        )
        .filter(OrderCalendar.performed_id == technician_id)
        .all()
    )


def update_order(
    db: Session, order_id: int, order_update: OrderCalendarUpdate
) -> Optional[OrderCalendar]:
    """Update an existing order entry in the database."""
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    update_data = order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_order, field, value)
    db.commit()
    db.refresh(db_order)
    return db_order


def delete_order(db: Session, order_id: int) -> Optional[OrderCalendar]:
    """Delete an order record from the database."""
    db_order = get_order(db, order_id)
    if not db_order:
        return None

    db.delete(db_order)
    db.commit()
    return db_order
