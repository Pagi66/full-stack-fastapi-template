"""Helpers for persisting execution feed events."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlmodel import Session

from app.models import ExecutionEvent, ExecutionEventType


def record_execution_event(
    session: Session,
    *,
    event_type: ExecutionEventType,
    description: str,
    amount: float | None = None,
    user_id: uuid.UUID | None = None,
    trader_profile_id: uuid.UUID | None = None,
    payload: dict[str, Any] | None = None,
) -> ExecutionEvent:
    event = ExecutionEvent(
        event_type=event_type,
        description=description[:255],
        amount=round(amount, 2) if isinstance(amount, (int, float)) else None,
        user_id=user_id,
        trader_profile_id=trader_profile_id,
        payload=payload or {},
        created_at=datetime.utcnow(),
    )
    session.add(event)
    return event


__all__ = ["record_execution_event"]
