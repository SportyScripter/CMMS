from datetime import datetime, timezone
from sqlalchemy import Column, DateTime


class TimestampMixin:
    """
    Provides common timestamp columns (created_at, updated_at) for models.
    Automatically handles setting the creation time and updating the modification time.
    """

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when the record was initially created",
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
        comment="UTC timestamp when the record was last modified",
    )
