from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime


class PartHistory(Base):
    __tablename__ = "part_history"
    id = Column(Integer, primary_key=True, index=True)
    part_id = Column(Integer, ForeignKey("parts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=True)
    failure_id = Column(Integer, ForeignKey("failures.id"), nullable=True)
    quantity_change = Column(Integer, nullable=False)
    transaction_type = Column(String, nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Relationships
    part = relationship("Part", back_populates="history")
    user = relationship("User")
    machine = relationship("Machine")
    failure = relationship("Failure")
