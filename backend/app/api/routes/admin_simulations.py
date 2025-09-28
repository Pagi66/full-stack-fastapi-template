from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, select

from app.api.deps import CurrentUser, SessionDep
from app.core.time import utc_now
from app.models import (
    ExecutionEventType,
    Transaction,
    TransactionStatus,
    TransactionType,
    TraderProfile,
    TraderTrade,
    TradeStatus,
    User,
    UserRole,
    UserTraderCopy,
    CopyStatus,
)
from app.services.execution_events import record_execution_event
from app.services.trader_simulator import TraderSimulator


class SimulationScenarioRequest(SQLModel):
    trader_category: Optional[str] = None  # forex, crypto, stocks, indices
    profit_scenario: str = "balanced"  # bullish, bearish, balanced
    session_duration_hours: int = 24
    trader_profile_ids: Optional[List[uuid.UUID]] = None


class SimulationScenarioResponse(SQLModel):
    scenario_id: uuid.UUID
    trader_trades_created: int
    follower_trades_created: int
    events_recorded: int
    total_profit_loss: float
    scenario_summary: dict


class WithdrawalRequest(SQLModel):
    amount: float
    description: str = "Withdrawal request"


class WithdrawalResponse(SQLModel):
    transaction_id: uuid.UUID
    status: str
    amount: float
    description: str
    created_at: datetime


class PendingWithdrawal(SQLModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: str
    amount: float
    description: str
    created_at: datetime
    status: str


class PendingWithdrawalsList(SQLModel):
    data: List[PendingWithdrawal]
    total: int


router = APIRouter(prefix="/admin/simulations", tags=["admin-simulations"])


@router.post("/scenario", response_model=SimulationScenarioResponse)
async def run_simulation_scenario(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: SimulationScenarioRequest,
) -> SimulationScenarioResponse:
    """
    Run a controlled simulation scenario with specific trader categories and profit scenarios.
    """
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Build trader profile query based on category
    statement = select(TraderProfile).where(TraderProfile.is_public == True)
    if payload.trader_category:
        # Filter by specialty based on category
        if payload.trader_category == "forex":
            statement = statement.where(
                TraderProfile.trading_strategy.ilike("%forex%")
            )
        elif payload.trader_category == "crypto":
            statement = statement.where(
                TraderProfile.trading_strategy.ilike("%crypto%")
            )
        elif payload.trader_category == "stocks":
            statement = statement.where(
                TraderProfile.trading_strategy.ilike("%stock%")
            )
        elif payload.trader_category == "indices":
            statement = statement.where(
                TraderProfile.trading_strategy.ilike("%indices%")
            )
    
    if payload.trader_profile_ids:
        statement = statement.where(TraderProfile.id.in_(payload.trader_profile_ids))

    trader_profiles = session.exec(statement).all()
    
    if not trader_profiles:
        raise HTTPException(status_code=404, detail="No traders found for the specified criteria")

    simulator = TraderSimulator()
    
    # Adjust simulation parameters based on profit scenario
    original_volatility = simulator.volatility_factors.copy()
    try:
        if payload.profit_scenario == "bullish":
            # Increase win rates and positive volatility
            for key in simulator.volatility_factors:
                simulator.volatility_factors[key] *= 1.5
        elif payload.profit_scenario == "bearish":
            # Decrease win rates and increase negative volatility
            for key in simulator.volatility_factors:
                simulator.volatility_factors[key] *= 0.7

        # Run simulation
        simulation = simulator.simulate_trader_trade(
            session,
            trader_profile_ids=[tp.id for tp in trader_profiles],
        )

        # Calculate total P&L
        total_profit_loss = sum(
            (trade.profit_loss or 0) for trade in simulation.trader_trades
        ) + sum(
            (record.trade.profit_loss or 0) for record in simulation.follower_trades
        )

        # Record scenario execution event
        await record_execution_event(
            session,
            event_type=ExecutionEventType.TRADER_SIMULATION,
            description=f"Admin scenario: {payload.trader_category or 'all'} traders, {payload.profit_scenario} market",
            amount=total_profit_loss,
            payload={
                "scenario_type": payload.profit_scenario,
                "trader_category": payload.trader_category,
                "session_duration_hours": payload.session_duration_hours,
                "traders_count": len(trader_profiles),
                "total_profit_loss": total_profit_loss,
            },
        )

        session.commit()

        return SimulationScenarioResponse(
            scenario_id=uuid.uuid4(),
            trader_trades_created=len(simulation.trader_trades),
            follower_trades_created=len(simulation.follower_trades),
            events_recorded=len(simulation.follower_trades),
            total_profit_loss=total_profit_loss,
            scenario_summary={
                "trader_count": len(trader_profiles),
                "category": payload.trader_category,
                "scenario": payload.profit_scenario,
                "duration_hours": payload.session_duration_hours,
            },
        )

    finally:
        # Restore original volatility factors
        simulator.volatility_factors = original_volatility


@router.post("/withdrawals/request", response_model=WithdrawalResponse)
async def request_withdrawal(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: WithdrawalRequest,
) -> WithdrawalResponse:
    """
    Request a withdrawal from copy trading balance to main balance.
    """
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Withdrawal amount must be positive")

    # Calculate available copy balance
    copy_balance = session.exec(
        select(func.sum(UserTraderCopy.copy_amount)).where(
            UserTraderCopy.user_id == current_user.id,
            UserTraderCopy.copy_status == CopyStatus.ACTIVE,
        )
    ).one() or 0.0

    if payload.amount > copy_balance:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient copy balance. Available: ${copy_balance:.2f}",
        )

    # Create withdrawal transaction
    transaction = Transaction(
        user_id=current_user.id,
        amount=payload.amount,
        transaction_type=TransactionType.WITHDRAWAL,
        status=TransactionStatus.PENDING,
        description=payload.description,
        created_at=utc_now(),
    )
    session.add(transaction)
    session.commit()
    session.refresh(transaction)

    return WithdrawalResponse(
        transaction_id=transaction.id,
        status=transaction.status.value,
        amount=transaction.amount,
        description=transaction.description or "",
        created_at=transaction.created_at,
    )


@router.get("/withdrawals/pending", response_model=PendingWithdrawalsList)
def get_pending_withdrawals(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> PendingWithdrawalsList:
    """
    Get pending withdrawal requests for admin approval.
    """
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Count total pending withdrawals
    count_query = select(func.count()).select_from(Transaction).where(
        Transaction.transaction_type == TransactionType.WITHDRAWAL,
        Transaction.status == TransactionStatus.PENDING,
    )
    total = session.exec(count_query).one()

    # Get pending withdrawals with user info
    withdrawals_query = (
        select(Transaction, User)
        .join(User, User.id == Transaction.user_id)
        .where(
            Transaction.transaction_type == TransactionType.WITHDRAWAL,
            Transaction.status == TransactionStatus.PENDING,
        )
        .order_by(Transaction.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    results = session.exec(withdrawals_query).all()

    pending_withdrawals = [
        PendingWithdrawal(
            id=tx.id,
            user_id=user.id,
            email=user.email,
            amount=tx.amount,
            description=tx.description or "Withdrawal request",
            created_at=tx.created_at,
            status=tx.status.value,
        )
        for tx, user in results
    ]

    return PendingWithdrawalsList(
        data=pending_withdrawals,
        total=total,
    )


@router.post("/withdrawals/{transaction_id}/approve")
async def approve_withdrawal(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    transaction_id: uuid.UUID,
) -> WithdrawalResponse:
    """
    Approve a pending withdrawal request.
    """
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.transaction_type != TransactionType.WITHDRAWAL:
        raise HTTPException(status_code=400, detail="Not a withdrawal transaction")

    if transaction.status != TransactionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transaction is not pending")

    # Get user's active copy relationships
    copy_relationships = session.exec(
        select(UserTraderCopy).where(
            UserTraderCopy.user_id == transaction.user_id,
            UserTraderCopy.copy_status == CopyStatus.ACTIVE,
        )
    ).all()

    total_copy_amount = sum(rel.copy_amount for rel in copy_relationships)

    if transaction.amount > total_copy_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient copy balance. Available: ${total_copy_amount:.2f}",
        )

    # Calculate how much to reduce from each copy relationship proportionally
    reduction_ratio = transaction.amount / total_copy_amount

    for copy_rel in copy_relationships:
        reduction_amount = copy_rel.copy_amount * reduction_ratio
        copy_rel.copy_amount = max(0, copy_rel.copy_amount - reduction_amount)
        
        # If copy amount becomes too small, stop the copy
        if copy_rel.copy_amount < 10.0:  # Minimum threshold
            copy_rel.copy_status = CopyStatus.STOPPED
            copy_rel.copy_amount = 0.0

        session.add(copy_rel)

    # Update transaction status
    transaction.status = TransactionStatus.COMPLETED
    transaction.executed_at = utc_now()

    # Add the amount back to user's main balance
    user = session.get(User, transaction.user_id)
    user.balance += transaction.amount

    # Record execution event
    await record_execution_event(
        session,
        event_type=ExecutionEventType.MANUAL_ADJUSTMENT,
        description=f"Withdrawal approved: {transaction.description}",
        amount=transaction.amount,
        user_id=transaction.user_id,
        payload={
            "transaction_id": str(transaction.id),
            "type": "withdrawal_approval",
            "copy_balance_reduction": transaction.amount,
        },
    )

    session.commit()
    session.refresh(transaction)

    return WithdrawalResponse(
        transaction_id=transaction.id,
        status=transaction.status.value,
        amount=transaction.amount,
        description=transaction.description or "",
        created_at=transaction.created_at,
    )


@router.post("/withdrawals/{transaction_id}/reject")
async def reject_withdrawal(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    transaction_id: uuid.UUID,
    reason: str = "Withdrawal rejected",
) -> WithdrawalResponse:
    """
    Reject a pending withdrawal request.
    """
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    transaction = session.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.transaction_type != TransactionType.WITHDRAWAL:
        raise HTTPException(status_code=400, detail="Not a withdrawal transaction")

    if transaction.status != TransactionStatus.PENDING:
        raise HTTPException(status_code=400, detail="Transaction is not pending")

    # Update transaction status
    transaction.status = TransactionStatus.FAILED
    transaction.executed_at = utc_now()
    transaction.description = f"{transaction.description or 'Withdrawal'} - {reason}"

    # Record execution event
    await record_execution_event(
        session,
        event_type=ExecutionEventType.MANUAL_ADJUSTMENT,
        description=f"Withdrawal rejected: {reason}",
        amount=-transaction.amount,  # Negative to indicate rejection
        user_id=transaction.user_id,
        payload={
            "transaction_id": str(transaction.id),
            "type": "withdrawal_rejection",
            "reason": reason,
        },
    )

    session.commit()
    session.refresh(transaction)

    return WithdrawalResponse(
        transaction_id=transaction.id,
        status=transaction.status.value,
        amount=transaction.amount,
        description=transaction.description or "",
        created_at=transaction.created_at,
    )


# Import func for SQL operations
from sqlmodel import func
