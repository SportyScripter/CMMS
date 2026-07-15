from sqlalchemy.orm import Session
from typing import List, Optional
from models.user import User
from schemas.user import UserCreate, UserUpdate
from core.security import get_password_hash


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Retrieve a user by their ID from the database."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_sap_number(db: Session, sap_number: str) -> Optional[User]:
    """Retrieve a user by their SAP number from the database."""
    return db.query(User).filter(User.sap_number == sap_number).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Retrieve a list of users from the database with optional pagination."""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate) -> User:
    """Create a new user in the databese with hashed password."""
    obj_in_data = user_in.model_dump()
    password = obj_in_data.pop("password")
    hashed_password = get_password_hash(password)
    db_user = User(**obj_in_data, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: User, user_in: UserUpdate) -> User:
    """Update an existing user's information in the database."""
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        hashed_password = get_password_hash(password)
        update_data["hashed_password"] = hashed_password

    for field, value in update_data.items():
        setattr(db_user, field, value)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
