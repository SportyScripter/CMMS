from db.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Role(Base):
    """
    Lookup table for defining user roles and permissions within the CMMS.

    Roles (e.g., 'Admin', 'Technician', 'Manager') determine the access levels
    and operational permissions for users throughout the system.
    """

    __tablename__ = "roles"
    __table_args__ = {
        "comment": "Dictionary of available user roles for access control"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(
        String,
        unique=True,
        nullable=False,
        comment="Unique role identifier (e.g., 'Admin', 'Technician')",
    )

    # Relationships
    users = relationship("User", back_populates="role")
