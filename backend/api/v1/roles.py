from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from api.dependencies import get_db
from schemas.role import RoleCreate, RoleUpdate, RoleResponse
from crud import crud_roles

router = APIRouter()


@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(role_in: RoleCreate, db: Session = Depends(get_db)):
    """Create a new role."""
    return crud_roles.create_role(db=db, role_in=role_in)


@router.get("/", response_model=List[RoleResponse])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve a list of all roles."""
    return crud_roles.get_roles(db=db, skip=skip, limit=limit)


@router.get("/{role_id}", response_model=RoleResponse)
def read_role(role_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific role by ID."""
    db_role = crud_roles.get_role(db=db, role_id=role_id)
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )
    return db_role


@router.patch("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role_in: RoleUpdate, db: Session = Depends(get_db)):
    """Update a specific role."""
    db_role = crud_roles.get_role(db=db, role_id=role_id)
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )
    return crud_roles.update_role(db=db, db_role=db_role, role_in=role_in)


@router.delete("/{role_id}", response_model=RoleResponse)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    """Delete a specific role."""
    db_role = crud_roles.get_role(db=db, role_id=role_id)
    if not db_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Role not found"
        )
    return crud_roles.delete_role(db=db, db_role=db_role)
