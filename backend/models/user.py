from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from mixins import TimestampMixin


class User(Base, TimestampMixin):
    """
    Represents a registered employee within the CMMS.

    Users are identified by a unique SAP number and assigned a role that dictates
    their system permissions. This model tracks authentication data, personal info,
    and maintains relationships with all failures reported, received, or maintenance
    tasks planned/performed by the user.
    """

    __tablename__ = "users"
    __table_args__ = {
        "comment": "Registry of system users and their authentication data"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    password = Column(
        String, nullable=False, comment="Securely hashed password for authentication"
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Determines if the user can currently access the system",
    )

    name = Column(String, nullable=False, comment="Given name of the employee")
    lastname = Column(String, nullable=False, comment="Surname of the employee")

    sap_number = Column(
        String, unique=True, nullable=False, comment="Unique identifier from SAP system"
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.id"),
        nullable=False,
        comment="Determines the access level and permissions for the user",
    )

    # Relationships
    role = relationship("Role", back_populates="users")

    submitted_failures = relationship(
        "Failure", back_populates="submitter", foreign_keys="[Failure.submitter_id]"
    )

    received_failures = relationship(
        "Failure", back_populates="recipient", foreign_keys="[Failure.recipient_id]"
    )

    principal_calendar_entries = relationship(
        "OrderCalendar",
        back_populates="principal",
        foreign_keys="[OrderCalendar.principal_id]",
    )

    performed_calendar_entries = relationship(
        "OrderCalendar",
        back_populates="performed",
        foreign_keys="[OrderCalendar.performed_id]",
    )

    sent_messages = relationship("Message", back_populates="sender")
    received_messages = relationship("MessageRecipient", back_populates="recipient")
