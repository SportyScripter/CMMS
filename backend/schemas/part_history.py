from enum import Enum
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransactionType(str, Enum):
    """Enumeration for different types of part history transactions."""

    FAILURE = "FAILURE"
    DELIVERY = "DELIVERY"
    MANUAL_DISPATCH = "MANUAL_DISPATCH"
    RETURN = "RETURN"
    ADJUSTMENT = "ADJUSTMENT"


class PartHistoryBase(BaseModel):
    """Base schema for PartHistory containing common attributes."""

    quantity_change: int
    transaction_type: TransactionType
    reason: Optional[str] = None
    machine_id: Optional[int] = None
    failure_id: Optional[int] = None


class PartHistoryCreate(PartHistoryBase):
    """Schema used for creating a new PartHistory entry."""

    part_id: int
    user_id: int


class PartHistoryResponse(PartHistoryBase):
    """Schema used for returning PartHistory data in API responses."""

    id: int
    part_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
