from sqlalchemy.orm import Session
from models.part import Part
from schemas.part import PartCreate, PartUpdate
from typing import List, Optional


def get_part(db: Session, part_id: int) -> Optional[Part]:
    """Retrieve a part by its ID from the database."""
    return db.query(Part).filter(Part.id == part_id).first()


def get_part_by_qr_code(db: Session, qr_code: str) -> Optional[Part]:
    """Retrieve a part by its QR code from the database."""
    return db.query(Part).filter(Part.qr_code == qr_code).first()


def get_parts_by_name(db: Session, name: str) -> List[Part]:
    """Retrieve a part by its name from the database."""
    return db.query(Part).filter(Part.name == name).all()


def get_parts(db: Session, skip: int = 0, limit: int = 100) -> List[Part]:
    """Retrieve a list of parts from the database with optional pagination."""
    return db.query(Part).offset(skip).limit(limit).all()


def create_part(db: Session, part_in: PartCreate) -> Part:
    """Create a new part in the database."""
    db_part = Part(**part_in.model_dump())
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part


def update_part(db: Session, db_part: Part, part_in: PartUpdate) -> Part:
    """Upadate an existing part's information in the database."""
    update_part = part_in.model_dump(exclude_unset=True)
    for field, value in update_part.items():
        setattr(db_part, field, value)
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part


def delete_part(db: Session, db_part: Part) -> None:
    """Delete an existing part from the database."""
    db.delete(db_part)
    db.commit()
    return db_part
