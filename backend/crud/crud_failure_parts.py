from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from models.part import Part
from models.failure_part import FailurePart
from schemas.failure_part import FailurePartCreate, FailurePartUpdate


def create_failure_part(db: Session, failure_part_in: FailurePartCreate) -> FailurePart:
    """Log consumption of a spare part and deduct it from the warehouse stock."""
    db_part = db.query(Part).filter(Part.id == failure_part_in.part_id).first()
    if not db_part:
        raise ValueError("Part not found in inventory.")
    if db_part.quantity < failure_part_in.quantity_used:
        raise ValueError(
            f"Not enough stock. Available: {db_part.quantity}, Requested: {failure_part_in.quantity_used}"
        )
    db_part.quantity -= failure_part_in.quantity_used
    db_failure_part = FailurePart(**failure_part_in.model_dump())
    db.add(db_failure_part)
    db.commit()
    return get_failure_part(
        db, failure_id=db_failure_part.failure_id, part_id=db_failure_part.part_id
    )


def get_failure_part(
    db: Session, failure_id: int, part_id: int
) -> Optional[FailurePart]:
    """Retrieve a specific part consumption record for a failure."""
    return (
        db.query(FailurePart)
        .options(joinedload(FailurePart.part))
        .filter(FailurePart.failure_id == failure_id, FailurePart.part_id == part_id)
        .first()
    )


def get_failure_parts_by_failure(db: Session, failure_id: int) -> List[FailurePart]:
    """Retrieve all part consumption records for a specific failure."""
    return (
        db.query(FailurePart)
        .joinedload(FailurePart.part)
        .filter(FailurePart.failure_id == failure_id)
        .all()
    )


def update_failure_part(
    db: Session, failure_id: int, part_id: int, failure_part_in: FailurePartUpdate
) -> Optional[FailurePart]:
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
                f"Not enough stock to increase quantity. Available: {db_part.quantity}"
            )
        db_part.quantity -= difference
        db_failure_part.quantity_used = failure_part_in.quantity_used
    db.add(db_failure_part)
    db.commit()
    return get_failure_part(db, failure_id, part_id)


def delete_failure_part(
    db: Session, failure_id: int, part_id: int
) -> Optional[FailurePart]:
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
