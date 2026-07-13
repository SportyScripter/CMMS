from sqlalchemy.orm import Session
from typing import List, Optional
from models.role import Role
from schemas.role import RoleCreate, RoleUpdate


def get_role(db: Session, role_id: int) -> Optional[Role]:
    return db.query(Role).filter(Role.id == role_id).first()


def get_roles(db: Session, skip: int = 0, limit: int = 100) -> List[Role]:
    return db.query(Role).offset(skip).limit(limit).all()


def create_role(db: Session, role_in: RoleCreate) -> Role:
    db_role = Role(**role_in.model_dump())
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def update_role(db: Session, db_role: Role, role_in: RoleUpdate) -> Role:
    update_data = role_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_role, field, value)

    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def delete_role(db: Session, db_role: Role) -> Role:
    db.delete(db_role)
    db.commit()
    return db_role
