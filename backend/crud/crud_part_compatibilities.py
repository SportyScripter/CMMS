from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from models.part_compatibility import PartCompatibility
from schemas.part_compatibility import PartCompatibilityCreate


def create_part_compatibility(
    db: Session, part_compatibility_in: PartCompatibilityCreate
) -> PartCompatibility:
    """Create a new part compatibility in the database."""
    db_comp = PartCompatibility(**part_compatibility_in.model_dump())
    db.add(db_comp)
    db.commit()
    db.refresh(db_comp)
    return get_compatibility(db, part_id=db_comp.part_id, machine_id=db_comp.machine_id)


def get_compatibility(
    db: Session, part_id: int, machine_id: int
) -> Optional[PartCompatibility]:
    """Check if a specific part is compatible with a specific machine."""
    return (
        db.query(PartCompatibility)
        .options(
            joinedload(PartCompatibility.part), joinedload(PartCompatibility.machine)
        )
        .filter(
            PartCompatibility.part_id == part_id,
            PartCompatibility.machine_id == machine_id,
        )
        .first()
    )


def get_compatibilities_by_machine(
    db: Session, machine_id: int
) -> List[PartCompatibility]:
    """Get all part compatibilities for a specific machine."""
    return (
        db.query(PartCompatibility)
        .options(
            joinedload(PartCompatibility.part), joinedload(PartCompatibility.machine)
        )
        .filter(PartCompatibility.machine_id == machine_id)
        .all()
    )


def get_compatibilities_by_part(db: Session, part_id: int) -> List[PartCompatibility]:
    """Get all machine compatibilities for a specific part."""
    return (
        db.query(PartCompatibility)
        .options(
            joinedload(PartCompatibility.part), joinedload(PartCompatibility.machine)
        )
        .filter(PartCompatibility.part_id == part_id)
        .all()
    )


def delete_compatibility(
    db: Session, part_id: int, machine_id: int
) -> Optional[PartCompatibility]:
    """Delete a specific part compatibility from the database."""
    db_comp = get_compatibility(db, part_id, machine_id)
    if db_comp:
        db.delete(db_comp)
        db.commit()
    return db_comp
