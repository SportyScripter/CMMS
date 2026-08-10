from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from models.order_calendar import OrderCalendar
from schemas.order_calendar import OrderCalendarCreate, OrderCalendarUpdate
from crud.crud_machines import recalculate_machine_status


def create_order(db: Session, order_in: OrderCalendarCreate) -> OrderCalendar:
    """Create a new order entry in the database."""
    order_calendar = OrderCalendar(**order_in.dict())
    db.add(order_calendar)
    db.commit()
    db.refresh(order_calendar)
    return order_calendar


def get_order(db: Session, order_id: int) -> OrderCalendar | None:
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


def get_orders(db: Session, skip: int = 0, limit: int = 100) -> list[OrderCalendar]:
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


def get_orders_by_machine(
    db: Session, machine_id: int, skip: int = 0, limit: int = 100
) -> list[OrderCalendar]:
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
        .filter(OrderCalendar.machine_id == machine_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_orders_by_technician(db: Session, technician_id: int) -> list[OrderCalendar]:
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
    db: Session,
    order_id: int,
    order_update: OrderCalendarUpdate,
) -> OrderCalendar | None:
    """
    Updates an existing order entry in the database.

    Handles state transitions to accurately accumulate work time,
    manage paused states, and support task handovers between technicians.
    """
    db_order = get_order(db, order_id)
    if not db_order:
        return None

    update_data = order_update.dict(exclude_unset=True)

    current_time = datetime.now(timezone.utc)

    old_status = db_order.status
    new_status = update_data.get("status", old_status)

    old_performed_id = db_order.performed_id
    new_performed_id = update_data.get("performed_id", old_performed_id)

    # 1. Accumulate execution time for ongoing tasks before applying new states
    is_status_changing = new_status in ["paused", "completed"]
    is_handover = new_status == "in_progress" and old_performed_id != new_performed_id

    if (
        db_order.last_resumed_at
        and old_status == "in_progress"
        and (is_status_changing or is_handover)
    ):

        # Protect against naive datetime objects by ensuring last_resumed_at is timezone-aware
        last_resumed = db_order.last_resumed_at
        if last_resumed.tzinfo is None:
            last_resumed = last_resumed.replace(tzinfo=timezone.utc)

        # Calculate elapsed time in minutes
        elapsed = current_time - last_resumed
        elapsed_minutes = int(elapsed.total_seconds() // 60)

        # Ensure work_time_minutes is initialized
        current_minutes = db_order.work_time_minutes or 0
        db_order.work_time_minutes = current_minutes + elapsed_minutes

        # Reset the resumption tracker
        db_order.last_resumed_at = None

    # 2. Apply standard field updates from the payload
    for field, value in update_data.items():
        setattr(db_order, field, value)

    # 3. Handle specific lifecycle events and timestamps based on the target status
    if new_status == "in_progress":
        if not db_order.started_at:
            db_order.started_at = current_time

        # Start the clock if resuming from scheduled/paused, or if taking over
        if old_status in ["scheduled", "paused", "un_completed"] or is_handover:
            db_order.last_resumed_at = current_time
            db_order.pause_reason = None

    elif new_status == "completed":
        if not db_order.completed_at:
            db_order.completed_at = current_time
        db_order.last_resumed_at = None

    elif new_status in ["scheduled", "un_completed"]:
        # Clear completion timestamp if the task is
        db_order.completed_at = None
        db_order.last_resumed_at = None

    db.commit()
    db.refresh(db_order)

    # Trigger potential machine status recalibration based on the operational flag
    if db_order.machine_id:
        recalculate_machine_status(db, db_order.machine_id)

    return db_order


def delete_order(db: Session, order_id: int) -> OrderCalendar | None:
    """Delete an order record from the database."""
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    db.delete(db_order)
    db.commit()
    if db_order.machine_id:
        recalculate_machine_status(db, db_order.machine_id)
    return db_order
