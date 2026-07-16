from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.part_category import PartCategoryCreate, PartCategoryUpdate
from models.part_category import PartCategory


def create_part_category(
    db: Session, part_category_in: PartCategoryCreate
) -> PartCategory:
    """Create a new part category in the database."""
    db_part_category = PartCategory(**part_category_in.model_dump())
    db.add(db_part_category)
    db.commit()
    db.refresh(db_part_category)
    return db_part_category


def get_part_category(db: Session, part_category_id: int) -> Optional[PartCategory]:
    """Retrieve a part category by its ID from the database."""
    return db.query(PartCategory).filter(PartCategory.id == part_category_id).first()


def get_part_category_by_name(db: Session, name: str) -> Optional[PartCategory]:
    """Retrieve a part category by its name from the database."""
    return db.query(PartCategory).filter(PartCategory.name == name).first()


def get_part_categories(
    db: Session, skip: int = 0, limit: int = 100
) -> List[PartCategory]:
    """Retrieve a list of part categories from the database with optional pagination."""
    return db.query(PartCategory).offset(skip).limit(limit).all()


def update_part_category(
    db: Session, part_category_id: int, part_category_update: PartCategoryUpdate
) -> Optional[PartCategory]:
    """Update an existing part category's information in the database."""
    db_part_category = get_part_category(db, part_category_id)
    if not db_part_category:
        return None
    for field, value in part_category_update.model_dump(exclude_unset=True).items():
        setattr(db_part_category, field, value)
    db.commit()
    db.refresh(db_part_category)
    return db_part_category


def delete_part_category(db: Session, part_category_id: int) -> Optional[PartCategory]:
    """Delete an existing part category from the database."""
    db_part_category = get_part_category(db, part_category_id)
    if not db_part_category:
        return None
    db.delete(db_part_category)
    db.commit()
    return db_part_category
