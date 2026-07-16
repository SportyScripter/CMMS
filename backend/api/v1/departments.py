from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List

from api.dependencies import get_db
from models.user import User
from schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from crud import crud_departments
from core.permissions import ALLOW_MANAGE_MACHINES, ALLOW_READ_ONLY

router = APIRouter()


@router.post(
    "/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED
)
def create_department(
    department_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """
    Create a new department.
    """
    if crud_departments.get_department_by_name(db, name=department_in.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Department with name '{department_in.name}' already exists.",
        )
    return crud_departments.create_department(db=db, department_in=department_in)


@router.get("/", response_model=List[DepartmentResponse])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """
    Retrieve a list of departments.
    """
    return crud_departments.get_departments(db=db, skip=skip, limit=limit)


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_READ_ONLY),
) -> Any:
    """
    Retrieve a department by its ID.
    """
    department = crud_departments.get_department(db=db, department_id=department_id)
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID '{department_id}' not found.",
        )
    return department


@router.patch("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """
    Update a department by its ID.
    """
    if department_in.name is not None:
        existing_dept = crud_departments.get_department_by_name(
            db, name=department_in.name
        )
        if existing_dept and existing_dept.id != department_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another department with this name already exists.",
            )

    db_department = crud_departments.update_department(
        db=db, department_id=department_id, department_update=department_in
    )
    if not db_department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )
    return db_department


@router.delete("/{department_id}", response_model=DepartmentResponse)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(ALLOW_MANAGE_MACHINES),
) -> Any:
    """Delete a specific department."""
    db_department = crud_departments.delete_department(
        db=db, department_id=department_id
    )
    if not db_department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
        )
    return db_department
