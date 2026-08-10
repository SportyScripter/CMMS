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

    active_failures = (
        db.query(Failure)
        .filter(
            Failure.machine_id == machine_id,
            Failure.status.notin_(["RESOLVED", "CLOSE"]),
        )
        .all()
    )

    statuses = [f.status for f in active_failures]

    if "CRITICAL" in statuses:
        machine.status = "CRITICAL"
    elif "WARNING" in statuses:
        machine.status = "WARNING"
    elif "IN_PROGRESS" in statuses:
        machine.status = "IN_PROGRESS"
    elif "WAITING_FOR_PARTS" in statuses:
        machine.status = "WAITING_FOR_PARTS"
    elif "WAITING_FOR_SERVICE" in statuses:
        machine.status = "WAITING_FOR_SERVICE"
    elif "ACCEPTED" in statuses:
        machine.status = "ACCEPTED"
    elif "PENDING" in statuses:
        machine.status = "PENDING"
    else:
        # Evaluate active maintenance orders
        active_orders = (
            db.query(OrderCalendar)
            .filter(
                OrderCalendar.machine_id == machine_id,
                OrderCalendar.status.in_(["in_progress", "paused"]),
            )
            .all()
        )

        if active_orders:
            is_in_progress = any(o.status == "in_progress" for o in active_orders)
            is_paused_non_operational = any(
                o.status == "paused" and not o.is_machine_operational
                for o in active_orders
            )

            if is_in_progress:
                machine.status = "MAINTENANCE"
            elif is_paused_non_operational:
                # Triggers when a task is paused and the machine is left dismantled
                machine.status = "MAINTENANCE_ON_HOLD"
            else:
                # Triggers when a task is paused, but the machine can still operate
                machine.status = "OPERATIONAL"
        else:
            machine.status = "OPERATIONAL"

    db.commit()
    db.refresh(machine)
