from sqlalchemy.orm import Session

from models.machine import Machine
from schemas.machine import MachineCreate, MachineUpdate
from models.failure import Failure
from models.order_calendar import OrderCalendar


def get_machine(db: Session, machine_id: int) -> Machine | None:
    """Retrieve a machine by its ID from the database."""
    return db.query(Machine).filter(Machine.id == machine_id).first()


def get_machine_by_qr_code(db: Session, qr_code: str) -> Machine | None:
    """Retrieve a machine by its QR code from the database."""
    return db.query(Machine).filter(Machine.qr_code == qr_code).first()


def get_machine_by_name(db: Session, name: str) -> Machine | None:
    """Retrieve a machine by their name from the database."""
    return db.query(Machine).filter(Machine.name == name).first()


def get_machines(db: Session, skip: int = 0, limit: int = 100) -> list[Machine]:
    """Retrieve a list of machines from the databasse with optional pagination."""
    return db.query(Machine).offset(skip).limit(limit).all()


def create_machine(db: Session, machine_in: MachineCreate) -> Machine:
    """Create a new machine in the database."""
    db_machine = Machine(**machine_in.model_dump())
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine


def update_machine(
    db: Session,
    db_machine: Machine,
    machine_in: MachineUpdate,
) -> Machine:
    """Update an existing machine's information in the database."""
    update_data = machine_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_machine, field, value)
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine


def delete_machine(db: Session, db_machine: Machine) -> Machine:
    """Delete an existing machine from the database."""
    db.delete(db_machine)
    db.commit()
    return db_machine


def recalculate_machine_status(db: Session, machine_id: int):
    """
    Recalculates and updates the main status of a machine based on ongoing failures and orders.
    Priority hierarchy (from most critical to least critical).
    """
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        return

    # HIERARCHY 1: Production stopped (CRITICAL)
    critical_failure = (
        db.query(Failure)
        .filter(Failure.machine_id == machine_id, Failure.status == "CRITICAL")
        .first()
    )

    if critical_failure:
        machine.status = "Awaria"
        db.commit()
        return

    # HIERARCHY 2: Hindered production (WARNING)
    warning_failure = (
        db.query(Failure)
        .filter(Failure.machine_id == machine_id, Failure.status == "WARNING")
        .first()
    )

    if warning_failure:
        machine.status = "Utrudniona produkcja"
        db.commit()
        return

    # HIERARCHY 3: Failures in progress / blocked waiting for parts or service
    active_repair = (
        db.query(Failure)
        .filter(
            Failure.machine_id == machine_id,
            Failure.status.in_(
                ["IN_PROGRESS", "WAITING_FOR_PARTS", "WAITING_FOR_SERVICE", "ACCEPTED"]
            ),
        )
        .first()
    )

    if active_repair:
        machine.status = "W trakcie naprawy"
        db.commit()
        return

    # HIERARCHY 4: New, unassigned tickets (Pending)
    pending_failure = (
        db.query(Failure)
        .filter(Failure.machine_id == machine_id, Failure.status == "Pending")
        .first()
    )

    if pending_failure:
        machine.status = "Oczekujące (Nowe)"
        db.commit()
        return

    # HIERARCHY 5: Active maintenance orders from the calendar
    active_order = (
        db.query(OrderCalendar)
        .filter(
            OrderCalendar.machine_id == machine_id,
            OrderCalendar.status == "in_progress",
        )
        .first()
    )

    if active_order:
        machine.status = "W trakcie przeglądu"
        db.commit()
        return

    # HIERARCHY 6: Machine is fully operational (no active failures or maintenance)
    # Failures are either 'RESOLVED' or 'Close', orders are 'completed'
    machine.status = "Sprawna"
    db.commit()
