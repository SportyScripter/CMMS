from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from models.failure import Failure
from schemas.failure import FailureCreate, FailureUpdate
from models.failure_part import FailurePart


def create_failure(db: Session, failure_in: FailureCreate) -> Failure:
    """Create a new failure in the database."""
    failure = Failure(**failure_in.dict())
    db.add(failure)
    db.commit()
    db.refresh(failure)
    return failure


def get_failure(db: Session, failure_id: int) -> Optional[Failure]:
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


def get_failures(db: Session, skip: int = 0, limit: int = 100) -> List[Failure]:
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
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_failures_by_machine(db: Session, machine_id: int) -> List[Failure]:
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
        .all()
    )


def get_failures_by_department(db: Session, department_id: int) -> List[Failure]:
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
    db: Session, failure_id: int, failure_update: FailureUpdate
) -> Optional[Failure]:
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
    return get_failure(db, failure_id=failure_id)


def delete_failure(db: Session, failure_id: int) -> Optional[Failure]:
    """Delete a failure by its ID."""
    failure = get_failure(db, failure_id)
    if not failure:
        return None
    db.delete(failure)
    db.commit()
    return failure
