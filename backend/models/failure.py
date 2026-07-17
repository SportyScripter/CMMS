from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from models.mixins import TimestampMixin


class Failure(Base, TimestampMixin):
    """
    Represents a reported machine breakdown or maintenance incident.

    This is a central entity in the CMMS, tracking the entire lifecycle of a failure
    from its initial report (submitter) to its resolution (recipient, end_date, repair_description).
    It links to the affected machine, the responsible d epartment, consumed parts, and attached files.
    """

    __tablename__ = "failures"
    __table_args__ = {
        "comment": "Core table tracking machine breakdowns and repair lifecycle"
    }

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    submitter_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        comment="Reference to the user who initially reported the issue",
    )

    machine_id = Column(
        Integer,
        ForeignKey("machines.id"),
        nullable=False,
        comment="Reference to the broken or malfunctioning machine",
    )

    department_id = Column(
        Integer,
        ForeignKey("departments.id"),
        nullable=False,
        comment="Reference to the department responsible for the repair",
    )

    status = Column(
        String,
        nullable=False,
        default="Pending",
        comment="Current lifecycle state (e.g., 'open', 'in_progress', 'closed')",
    )

    recipient_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        comment="Reference to the mechanic or technician assigned to fix the issue",
    )

    failure_description = Column(
        String,
        nullable=False,
        comment="Detailed description of the problem reported by the submitter",
    )

    end_date = Column(
        DateTime,
        nullable=True,
        comment="Timestamp when the repair was completed and the issue was closed",
    )

    repair_description = Column(
        String,
        nullable=True,
        comment="Technical details of the actions taken to resolve the failure",
    )

    comment = Column(
        String,
        nullable=True,
        comment="Additional notes or remarks from the maintenance team",
    )

    # Relationships
    submitter = relationship(
        "User", back_populates="submitted_failures", foreign_keys=[submitter_id]
    )
    recipient = relationship(
        "User", back_populates="received_failures", foreign_keys=[recipient_id]
    )
    department = relationship("Department", back_populates="failures")
    attachments = relationship("Attachment", back_populates="failure")
    machine = relationship("Machine", back_populates="failures")
    used_parts = relationship("FailurePart", back_populates="failure")
