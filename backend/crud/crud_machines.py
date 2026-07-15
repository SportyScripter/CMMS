from sqlalchemy.orm import Session
from models.machine import Machine
from schemas.machine import MachineCreate, MachineUpdate
from typing import List, Optional


def get_machine(db: Session, machine_id: int) -> Optional[Machine]:
    """Retrieve a machine by its ID from the database."""
    return db.query(Machine).filter(Machine.id == machine_id).first()


def get_machine_by_qr_code(db: Session, qr_code: str) -> Optional[Machine]:
    """Retrieve a machine by its QR code from the database."""
    return db.query(Machine).filter(Machine.qr_code == qr_code).first()


def get_machine_by_name(db: Session, name: str) -> Optional[Machine]:
    """Retrieve a machine by their name from the database."""
    return db.query(Machine).filter(Machine.name == name).first()


def get_machines(db: Session, skip: int = 0, limit: int = 100) -> List[Machine]:
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
    db: Session, db_machine: Machine, machine_in: MachineUpdate
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
