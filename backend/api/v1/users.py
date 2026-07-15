from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from api.dependencies import get_db, get_current_user
from schemas.user import UserCreate, UserUpdate, UserResponse
from crud import crud_users
from models.user import User
from core.permissions import ALLOW_MANAGE_USERS

router = APIRouter()


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_USERS),
) -> Any:
    """Create a new user."""
    user = crud_users.get_user_by_sap_number(db, sap_number=user_in.sap_number)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this SAP number already exists",
        )
    return crud_users.create_user(db=db, user_in=user_in)


@router.get("/me", response_model=UserResponse)
def read_user_me(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Any:
    """Read information about the current user."""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Read information about a specific user ID only if the current user is logged in."""
    user = crud_users.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@router.get("/", response_model=list[UserResponse])
def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    allow_manage_users: bool = Depends(ALLOW_MANAGE_USERS),
) -> Any:
    """Read a list of all users only if the current user has the required role."""
    users = crud_users.get_users(db)
    if users is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No users found"
        )
    return users


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_USERS),
) -> Any:
    """Update information about a specific user ID (only if the current user has the required role)."""
    user = crud_users.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return crud_users.update_user(db=db, db_user=user, user_id=user_id)


@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_USERS),
) -> Any:
    """
    Delete a specific user ID (only if the current user has the required role
    """
    user = crud_users.get_user(db, user_id=user_id)
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    db.delete(user)
    db.commit()
    return user
