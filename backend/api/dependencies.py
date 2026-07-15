from typing import Generator, List
from db.database import SessionLocal
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from core.security import SECRET_KEY, ALGORITHM
from crud import crud_users
from models.user import User
from schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_db() -> Generator:
    """
    Dependency to get a database session for each request.
    Yields the session and ensures it is safely closed after the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    """
    Receives the JWT from the header, validates it, and returns the assigned user.
    Use as a dependency in secured endpoints.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials or expired token is provided",
        )
    user = crud_users.get_user(db, user_id=int(token_data.sub))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        """
        Initializes a RoleChecker instance to verify if a user has the required role(s) for access control.
        RoleChecker used list of roles to check if user has any of the required roles.
        """
        self.allowed_roles = allowed_roles

    def __call__(self, current_user=Depends(get_current_user)):
        """
        Checks if the current user has any of the allowed roles.
        Raises an HTTPException if the user does not have the required role(s).
        """
        if not current_user.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned.",
            )
        if current_user.role.name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires one of: {', '.join(self.allowed_roles)}.",
            )
        return current_user
