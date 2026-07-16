from sqlalchemy.orm import Session
from typing import List, Optional
from models.department import Department
from schemas.department import DepartmentCreate, DepartmentUpdate


def create_department(db: Session, department_in: DepartmentCreate) -> Department:
    """Create a new department in the database."""
    db_department = Department(**department_in.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


def get_department(db: Session, department_id: int) -> Optional[Department]:
    """Retrieve a department by its ID."""
    return db.query(Department).filter(Department.id == department_id).first()


def get_department_by_name(db: Session, name: str) -> Optional[Department]:
    """Retrieve a department by its name."""
    return db.query(Department).filter(Department.name == name).first()


def get_departments(db: Session, skip: int = 0, limit: int = 100) -> List[Department]:
    """Retrieve a list of departments."""
    return db.query(Department).offset(skip).limit(limit).all()


def update_department(
    db: Session, department_id: int, department_update: DepartmentUpdate
) -> Optional[Department]:
    """Update a department by its ID."""
    db_department = get_department(db, department_id)
    if not db_department:
        return None
    for field, value in department_update.model_dump(exclude_unset=True).items():
        setattr(db_department, field, value)
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department


def delete_department(db: Session, department_id: int) -> Optional[Department]:
    """Delete a department by its ID."""
    db_department = get_department(db, department_id)
    if not db_department:
        return None
    db.delete(db_department)
    db.commit()
    return db_department
