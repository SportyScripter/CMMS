from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from models.failure import Failure
from models.failure_part import FailurePart
from schemas.failure import FailureCreate, FailureUpdate
from crud.crud_machines import recalculate_machine_status
from models.part import Part
from models.part_history import PartHistory
from models.attachment import Attachment


def create_failure(db: Session, failure_in: FailureCreate) -> Failure:
    """Create a new failure in the database."""
    failure = Failure(**failure_in.dict())
    db.add(failure)
    db.commit()
    db.refresh(failure)
    if failure.machine_id:
        recalculate_machine_status(db, failure.machine_id)
    return failure


def get_failure(db: Session, failure_id: int) -> Failure | None:
    """Retrieve a failure by its ID."""
    return (
        db.query(Failure)
        .options(
            joinedload(Failure.machine),
            joinedload(Failure.department),
            joinedload(Failure.submitter),
            joinedload(Failure.recipient),
            joinedload(Failure.used_parts).joinedload(FailurePart.part),
            joinedload(Failure.attachments),
        )
        .filter(Failure.id == failure_id)
        .first()
    )


def get_failures(db: Session, skip: int = 0, limit: int = 100) -> list[Failure]:
    """Retrieve a list of failures."""
    return (
        db.query(Failure)
        .options(
            joinedload(Failure.machine),
            joinedload(Failure.department),
            joinedload(Failure.submitter),
            joinedload(Failure.recipient),
            joinedload(Failure.used_parts).joinedload(FailurePart.part),
            joinedload(Failure.attachments),
        )
        .order_by(desc(Failure.updated_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_failures_by_machine(
    db: Session, machine_id: int, skip: int = 0, limit: int = 100
) -> list[Failure]:
    """Retrieve a list of failures for a specific machine."""
    return (
        db.query(Failure)
        .options(
            joinedload(Failure.machine),
            joinedload(Failure.department),
            joinedload(Failure.submitter),
            joinedload(Failure.recipient),
            joinedload(Failure.used_parts).joinedload(FailurePart.part),
            joinedload(Failure.attachments),
        )
        .filter(Failure.machine_id == machine_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_failures_by_department(db: Session, department_id: int) -> list[Failure]:
    """Retrieve a list of failures for a specific department."""
    return (
        db.query(Failure)
        .options(
            joinedload(Failure.machine),
            joinedload(Failure.department),
            joinedload(Failure.submitter),
            joinedload(Failure.recipient),
            joinedload(Failure.attachments),
        )
        .filter(Failure.department_id == department_id)
        .all()
    )


def update_failure(
    db: Session,
    failure_id: int,
    failure_update: FailureUpdate,
) -> Failure | None:
    """Update a failure by its ID."""
    failure = get_failure(db, failure_id)
    if not failure:
        return None
    update_data = failure_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(failure, field, value)
    db.add(failure)
    db.commit()
    db.refresh(failure)
    if failure.machine_id:
        recalculate_machine_status(db, failure.machine_id)
    return get_failure(db, failure_id=failure_id)


def delete_failure(db: Session, failure_id: int) -> Failure | None:
    """Delete a failure by its ID, restore used parts, delete attachments, and remove failure."""
    failure = get_failure(db, failure_id)
    if not failure:
        return None
    machine_id = failure.machine_id
    failure_parts = (
        db.query(FailurePart).filter(FailurePart.failure_id == failure_id).all()
    )
    if failure_parts:
        for failure_part in failure_parts:
            part = db.query(Part).filter(Part.id == failure_part.part_id).first()
            if part:
                returned_qty = failure_part.quantity_used
                part.quantity += returned_qty

                history_entry = PartHistory(
                    part_id=part.id,
                    user_id=failure.recipient_id or failure.submitter_id,
                    quantity_change=returned_qty,
                    transaction_type="RETURN",
                    reason=f"Zwrot części z usuniętej awarii #{failure.id}",
                    machine_id=failure.machine_id,
                )
                db.add(history_entry)
        db.query(FailurePart).filter(FailurePart.failure_id == failure_id).delete()
    db.query(Attachment).filter(Attachment.failure_id == failure_id).delete()
    db.flush()
    db.query(Failure).filter(Failure.id == failure_id).delete()
    db.commit()
    if machine_id:
        recalculate_machine_status(db, machine_id)
    return failure
