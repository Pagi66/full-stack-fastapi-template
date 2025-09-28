"""Utilities for seeding zero cash balances across users."""

from __future__ import annotations

from datetime import datetime

from sqlmodel import Session, select

from app.models import (
    Transaction,
    TransactionStatus,
    TransactionType,
    User,
)


def ensure_zero_balance(
    session: Session,
    user: User,
    *,
    description: str = "Baseline balance reset",
) -> bool:
    """Ensure a user's balance is zero, logging an adjustment transaction if needed."""

    if round(user.balance or 0.0, 2) == 0.0:
        return False

    delta = round(-user.balance, 2)
    user.balance = 0.0
    session.add(user)

    transaction = Transaction(
        user_id=user.id,
        amount=delta,
        transaction_type=TransactionType.ADJUSTMENT,
        status=TransactionStatus.COMPLETED,
        description=description,
        executed_at=datetime.utcnow(),
    )
    session.add(transaction)
    return True


def reset_all_user_balances(
    session: Session,
    *,
    description: str = "Baseline balance reset",
) -> int:
    """Set every user's balance to zero and record adjustment transactions.

    Returns the number of users whose balances were adjusted.
    """

    updated = 0
    users = session.exec(select(User)).all()
    for user in users:
        if ensure_zero_balance(session, user, description=description):
            updated += 1

    if updated:
        session.commit()
    return updated


__all__ = ["ensure_zero_balance", "reset_all_user_balances"]
