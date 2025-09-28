from __future__ import annotations

from datetime import datetime, timedelta
import uuid
from typing import List

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, select, func

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    KycStatus,
    ExecutionEventType,
    Transaction,
    TransactionStatus,
    TransactionType,
    TraderProfile,
    User,
    UserRole,
)
from app.services.execution_events import record_execution_event
from app.services.trader_simulator import TraderSimulator


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
    kyc_submitted_at: datetime | None = None
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


class SimulationTriggerRequest(SQLModel):
    trader_profile_id: uuid.UUID | None = None


class SimulationTriggerResponse(SQLModel):
    trader_trades_created: int
    follower_trades_created: int
    events_recorded: int


class ManualProfitRequest(SQLModel):
    amount: float
    description: str | None = None


class ManualProfitResponse(SQLModel):
    balance: float
    event_id: uuid.UUID


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
        .where(User.kyc_status.in_([KycStatus.PENDING, KycStatus.UNDER_REVIEW]))
        .order_by(User.email)
    ).all()

    pending_kyc_payload = [
        AdminKycItem(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            kyc_status=user.kyc_status.value.lower(),
            kyc_notes=user.kyc_notes,
            kyc_submitted_at=user.kyc_submitted_at,
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


@router.post("/simulations/run", response_model=SimulationTriggerResponse)
def trigger_simulated_trades(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: SimulationTriggerRequest,
) -> SimulationTriggerResponse:
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    simulator = TraderSimulator()
    trader_ids = [payload.trader_profile_id] if payload.trader_profile_id else None
    simulation = simulator.simulate_trader_trade(
        session,
        trader_profile_ids=trader_ids,
    )

    events_logged = 0
    profile_cache: dict[uuid.UUID, tuple[str | None, str | None]] = {}
    for record in simulation.follower_trades:
        follower_trade = record.trade
        source_trade = record.source_trade
        events_logged += 1
        trader_display_name: str | None = None
        trader_code: str | None = None
        if source_trade.trader_profile_id:
            cached = profile_cache.get(source_trade.trader_profile_id)
            if cached is None:
                trader_profile = session.get(TraderProfile, source_trade.trader_profile_id)
                if trader_profile is not None:
                    cached = (trader_profile.display_name, trader_profile.trader_code)
                else:
                    cached = (None, None)
                profile_cache[source_trade.trader_profile_id] = cached
            trader_display_name, trader_code = cached

        record_execution_event(
            session,
            event_type=ExecutionEventType.FOLLOWER_PROFIT,
            description=f"Copy trade {follower_trade.symbol}",
            amount=follower_trade.profit_loss or 0.0,
            user_id=follower_trade.user_id,
            trader_profile_id=source_trade.trader_profile_id,
            payload={
                "trade_id": str(follower_trade.id),
                "source_trade_id": str(source_trade.id),
                "symbol": follower_trade.symbol,
                "side": follower_trade.side.value,
                "profit_loss": follower_trade.profit_loss,
                "volume": follower_trade.volume,
                "trader_display_name": trader_display_name,
                "trader_code": trader_code,
            },
        )

    session.commit()

    return SimulationTriggerResponse(
        trader_trades_created=len(simulation.trader_trades),
        follower_trades_created=len(simulation.follower_trades),
        events_recorded=events_logged,
    )


@router.post(
    "/simulations/users/{user_id}/profit",
    response_model=ManualProfitResponse,
)
def grant_manual_profit_event(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    user_id: uuid.UUID,
    payload: ManualProfitRequest,
) -> ManualProfitResponse:
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    adjustment = round(payload.amount, 2)
    if adjustment == 0:
        raise HTTPException(status_code=400, detail="Adjustment amount must be non-zero")

    user.balance = round((user.balance or 0.0) + adjustment, 2)
    session.add(user)

    transaction = Transaction(
        user_id=user.id,
        amount=adjustment,
        transaction_type=TransactionType.ADJUSTMENT,
        status=TransactionStatus.COMPLETED,
        description=payload.description or "Admin balance adjustment",
        created_at=datetime.utcnow(),
        executed_at=datetime.utcnow(),
    )
    session.add(transaction)

    event = record_execution_event(
        session,
        event_type=ExecutionEventType.MANUAL_ADJUSTMENT,
        description=payload.description or "Admin balance adjustment",
        amount=adjustment,
        user_id=user.id,
        payload={"origin": "admin-dashboard"},
    )

    session.commit()
    session.refresh(user, attribute_names=["balance"])
    session.refresh(event)

    return ManualProfitResponse(balance=user.balance, event_id=event.id)
