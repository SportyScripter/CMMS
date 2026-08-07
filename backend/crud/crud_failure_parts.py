from sqlalchemy.orm import Session, joinedload

from models.failure_part import FailurePart
from models.part import Part
from schemas.failure_part import FailurePartCreate, FailurePartUpdate
from models.failure import Failure
from models.part_history import PartHistory


def create_failure_part(
    db: Session, failure_part_in: FailurePartCreate, user_id: int
) -> FailurePart:
    """Log consumption of a spare part and deduct it from the warehouse stock."""
    db_part = db.query(Part).filter(Part.id == failure_part_in.part_id).first()
    if not db_part:
        raise ValueError("Part not found in inventory.")
    if db_part.quantity < failure_part_in.quantity_used:
        raise ValueError(
            f"Not enough stock. Available: {db_part.quantity}, Requested: {failure_part_in.quantity_used}",
        )
    db_failure = (
        db.query(Failure).filter(Failure.id == failure_part_in.failure_id).first()
    )
    machine_id = db_failure.machine_id if db_failure else None
    failure_title = db_failure.repair_description if db_failure else "Notification"
    db_part.quantity -= failure_part_in.quantity_used
    db_failure_part = FailurePart(**failure_part_in.model_dump())
    db.add(db_failure_part)
    history_record = PartHistory(
        part_id=db_part.id,
        user_id=user_id,
        machine_id=machine_id,
        failure_id=failure_part_in.failure_id,
        quantity_change=-failure_part_in.quantity_used,
        transaction_type="FAILURE",
        reason=f"Zużycie części do awarii #{failure_part_in.failure_id} ({failure_title})",
    )
    db.add(history_record)
    db.commit()
    return get_failure_part(
        db,
        failure_id=db_failure_part.failure_id,
        part_id=db_failure_part.part_id,
    )


def get_failure_part(db: Session, failure_id: int, part_id: int) -> FailurePart | None:
    """Retrieve a specific part consumption record for a failure."""
    return (
        db.query(FailurePart)
        .options(joinedload(FailurePart.part))
        .filter(FailurePart.failure_id == failure_id, FailurePart.part_id == part_id)
        .first()
    )


def get_failure_parts_by_failure(db: Session, failure_id: int) -> list[FailurePart]:
    """Retrieve all part consumption records for a specific failure."""
    return (
        db.query(FailurePart)
        .joinedload(FailurePart.part)
        .filter(FailurePart.failure_id == failure_id)
        .all()
    )


def update_failure_part(
    db: Session,
    failure_id: int,
    part_id: int,
    failure_part_in: FailurePartUpdate,
) -> FailurePart | None:
    """Update part consumption quantity and adjust warehouse stock accordingly."""
    db_failure_part = get_failure_part(db, failure_id, part_id)
    if not db_failure_part:
        return None
    if (
        failure_part_in.quantity_used is not None
        and failure_part_in.quantity_used != db_failure_part.quantity_used
    ):
        db_part = db.query(Part).filter(Part.id == part_id).first()
        difference = failure_part_in.quantity_used - db_failure_part.quantity_used
        if db_part.quantity < difference:
            raise ValueError(
                f"Not enough stock to increase quantity. Available: {db_part.quantity}",
            )
        db_part.quantity -= difference
        db_failure_part.quantity_used = failure_part_in.quantity_used
    db.add(db_failure_part)
    db.commit()
    return get_failure_part(db, failure_id, part_id)


def update_failure_part_quantity(
    db: Session, failure_id: int, part_id: int, new_quantity: int, user_id: int
) -> FailurePart | None:
    """Update the quantity of a part consumed for a failure and adjust inventory accordingly."""
    db_failure_part = get_failure_part(db, failure_id=failure_id, part_id=part_id)
    if not db_failure_part:
        raise ValueError("Ta część nie jest przypisana do tej awarii.")
    difference = new_quantity - db_failure_part.quantity_used
    if difference == 0:
        return db_failure_part
    db_part = db.query(Part).filter(Part.id == part_id).first()
    if difference > 0 and db_part.quantity < difference:
        raise ValueError(
            f"Brak wystarczającej ilości w magazynie. Brakuje: {difference - db_part.quantity} szt."
        )
    db_part.quantity -= difference
    db_failure_part.quantity_used = new_quantity
    db_failure = db.query(Failure).filter(Failure.id == failure_id).first()
    machine_id = db_failure.machine_id if db_failure else None
    history_record = PartHistory(
        part_id=part_id,
        user_id=user_id,
        machine_id=machine_id,
        failure_id=failure_id,
        quantity_change=-difference,
        transaction_type="ADJUSTMENT",
        reason=f"Korekta zużycia dla awarii #{failure_id} (zmiana o {-difference} szt.)",
    )
    db.add(history_record)
    db.commit()
    db.refresh(db_failure_part)
    return db_failure_part


def delete_failure_part(
    db: Session,
    failure_id: int,
    part_id: int,
) -> FailurePart | None:
    """Remove a part consumption record and return the parts to the warehouse."""
    db_failure_part = get_failure_part(db, failure_id, part_id)
    if not db_failure_part:
        return None

    db_part = db.query(Part).filter(Part.id == part_id).first()
    if db_part:
        db_part.quantity += db_failure_part.quantity_used

    db.delete(db_failure_part)
    db.commit()
    return db_failure_part
