from sqlalchemy.orm import Session
from models.part_history import PartHistory
from schemas.part_history import PartHistoryCreate


def create_part_history(db: Session, history_in: PartHistoryCreate):
    """Create a new part history entry."""
    db_obj = PartHistory(**history_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_part_history_by_part(
    db: Session, part_id: int, skip: int = 0, limit: int = 100
):
    """Retrieve part history entries for a specific part."""
    return (
        db.query(PartHistory)
        .filter(PartHistory.part_id == part_id)
        .order_by(PartHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_part_history(db: Session, skip: int = 0, limit: int = 100):
    """Retrieve all part history entries."""
    return (
        db.query(PartHistory)
        .order_by(PartHistory.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
