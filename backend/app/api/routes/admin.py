from __future__ import annotations

from datetime import datetime, timedelta
import uuid
from typing import List

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, select, func

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    KycStatus,
    Transaction,
    TransactionStatus,
    TransactionType,
    User,
    UserRole,
)


class AdminTotals(SQLModel):
    total_users: int
    total_deposits: float
    total_withdrawals: float


class AdminOnlineUser(SQLModel):
    id: uuid.UUID
    email: str
    full_name: str | None = None
    role: str
    account_tier: str | None = None
    last_login_at: datetime | None = None


class AdminKycItem(SQLModel):
    id: uuid.UUID
    email: str
    full_name: str | None = None
    kyc_status: str
    kyc_notes: str | None = None
    last_login_at: datetime | None = None


class AdminDepositItem(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: str
    amount: float
    status: str
    transaction_type: str
    created_at: datetime


class AdminDashboardSummary(SQLModel):
    totals: AdminTotals
    online_users: List[AdminOnlineUser]
    pending_kyc: List[AdminKycItem]
    pending_deposits: List[AdminDepositItem]


router = APIRouter(prefix="/admin", tags=["admin"])

ONLINE_THRESHOLD_MINUTES = 15


@router.get("/dashboard", response_model=AdminDashboardSummary)
def get_admin_dashboard_summary(
    session: SessionDep, current_user: CurrentUser
) -> AdminDashboardSummary:
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    total_users = session.exec(select(func.count()).select_from(User)).one()

    deposit_sum = session.exec(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.transaction_type == TransactionType.DEPOSIT,
            Transaction.status == TransactionStatus.COMPLETED,
        )
    ).one()
    withdrawal_sum = session.exec(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.transaction_type == TransactionType.WITHDRAWAL,
            Transaction.status == TransactionStatus.COMPLETED,
        )
    ).one()

    totals = AdminTotals(
        total_users=int(total_users or 0),
        total_deposits=float(deposit_sum or 0.0),
        total_withdrawals=float(withdrawal_sum or 0.0),
    )

    threshold = datetime.utcnow() - timedelta(minutes=ONLINE_THRESHOLD_MINUTES)
    online_users = session.exec(
        select(User)
        .where(User.last_login_at.is_not(None))
        .where(User.last_login_at >= threshold)
        .order_by(User.last_login_at.desc())
    ).all()

    online_payload = [
        AdminOnlineUser(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.value.lower(),
            account_tier=user.account_tier.value.lower() if user.account_tier else None,
            last_login_at=user.last_login_at,
        )
        for user in online_users
    ]

    pending_kyc_users = session.exec(
        select(User)
        .where(User.kyc_status == KycStatus.PENDING)
        .order_by(User.email)
    ).all()

    pending_kyc_payload = [
        AdminKycItem(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            kyc_status=user.kyc_status.value.lower(),
            kyc_notes=user.kyc_notes,
            last_login_at=user.last_login_at,
        )
        for user in pending_kyc_users
    ]

    pending_deposit_rows = session.exec(
        select(Transaction, User)
        .join(User, User.id == Transaction.user_id)
        .where(Transaction.transaction_type == TransactionType.DEPOSIT)
        .where(Transaction.status == TransactionStatus.PENDING)
        .order_by(Transaction.created_at)
    ).all()

    pending_deposits_payload = [
        AdminDepositItem(
            id=tx.id,
            user_id=user.id,
            email=user.email,
            amount=tx.amount,
            status=tx.status.value.lower(),
            transaction_type=tx.transaction_type.value.lower(),
            created_at=tx.created_at,
        )
        for tx, user in pending_deposit_rows
    ]

    return AdminDashboardSummary(
        totals=totals,
        online_users=online_payload,
        pending_kyc=pending_kyc_payload,
        pending_deposits=pending_deposits_payload,
    )
