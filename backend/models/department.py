from db.database import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Department(Base):
    """
    Represents an organizational unit or team within the facility.

    Departments (e.g., Electrical, Mechanical, IT) are responsible for
    handling and resolving specific machine failures based on their domain of expertise.
    """

    __tablename__ = "departments"
    __table_args__ = {
        "comment": "Organizational units responsible for handling machine failures"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    name = Column(
        String,
        unique=True,
        nullable=False,
        comment="Official name of the department (e.g., Electrical, Mechanical)",
    )

    # Relationships
    failures = relationship("Failure", back_populates="department")
