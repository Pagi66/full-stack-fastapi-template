"""Copy trading API endpoints for managing trader verification and copy relationships."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import CopyStatus, RiskTolerance, TraderProfile, User, UserTraderCopy


router = APIRouter(prefix="/copy-trading", tags=["copy-trading"])


def _generate_trader_code(trader_id: uuid.UUID) -> str:
    """Generate the canonical trader code from a trader profile id."""

    return str(trader_id).replace("-", "").upper()[:8]


def _extract_specialty(trading_strategy: str | None) -> str:
    if not trading_strategy:
        return "General"

    parts = trading_strategy.strip().split()
    if not parts:
        return "General"

    return parts[0].capitalize()


def _format_performance(trader: TraderProfile) -> tuple[str, str]:
    metrics = trader.performance_metrics or {}
    win_rate = metrics.get("win_rate")
    avg_return = trader.average_monthly_return or metrics.get("average_return_per_trade")

    win_rate_str = f"{float(win_rate):.0f}%" if win_rate is not None else "N/A"

    if avg_return is None:
        total_profit = metrics.get("total_profit_loss")
        if total_profit is not None:
            performance_str = f"{float(total_profit):+.2f}"
        else:
            performance_str = "N/A"
    else:
        performance_str = f"{float(avg_return):+.2f}%"

    return performance_str, win_rate_str


def _build_trader_summary(trader: TraderProfile) -> "TraderSummary":
    performance, win_rate = _format_performance(trader)
    trader_code = _generate_trader_code(trader.id)

    display_name = (
        trader.user.full_name
        if isinstance(trader.user, User) and trader.user.full_name
        else f"Trader {trader_code}"
    )
    specialty = _extract_specialty(trader.trading_strategy)

    return TraderSummary(
        id=trader.id,
        trader_code=trader_code,
        display_name=display_name,
        specialty=specialty,
        risk_level=trader.risk_tolerance,
        performance=performance,
        win_rate=win_rate,
    )


def _find_trader_by_code(session: SessionDep, trader_code: str) -> TraderProfile | None:
    normalized = trader_code.strip().upper()
    if not normalized:
        return None

    statement = select(TraderProfile)
    for trader in session.exec(statement):
        if _generate_trader_code(trader.id) == normalized:
            session.refresh(trader, attribute_names=["user"])
            return trader
    return None


def _build_copied_trader(copy: UserTraderCopy) -> "CopiedTraderSummary":
    if copy.trader_profile is None:
        raise HTTPException(status_code=500, detail="Associated trader profile not loaded")

    summary = _build_trader_summary(copy.trader_profile)
    return CopiedTraderSummary(
        **summary.dict(),
        copy_id=copy.id,
        allocation=copy.copy_amount,
        status=copy.copy_status,
    )


class TraderSummary(SQLModel):
    id: uuid.UUID
    trader_code: str
    display_name: str
    specialty: str
    risk_level: RiskTolerance
    performance: str
    win_rate: str


class TraderVerificationRequest(SQLModel):
    trader_code: str


class TraderVerificationResponse(SQLModel):
    valid: bool
    trader: TraderSummary | None = None
    message: str | None = None


class CopyTradingStartRequest(SQLModel):
    trader_id: uuid.UUID | None = None
    trader_code: str | None = None
    allocation_amount: float


class CopyTradingStartResponse(SQLModel):
    success: bool
    message: str
    copied_trader: CopiedTraderSummary | None = None


class CopiedTraderSummary(TraderSummary):
    copy_id: uuid.UUID
    allocation: float
    status: CopyStatus


class CopiedTradersResponse(SQLModel):
    data: list[CopiedTraderSummary]
    count: int


@router.post("/verify", response_model=TraderVerificationResponse)
def verify_trader_code(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: TraderVerificationRequest,
) -> Any:
    """Validate a trader code and return a summary if the trader exists and is public."""

    trader = _find_trader_by_code(session, payload.trader_code)
    if trader is None or not trader.is_public:
        return TraderVerificationResponse(
            valid=False,
            trader=None,
            message="Trader code not found or trader is not available for copying.",
        )

    summary = _build_trader_summary(trader)
    return TraderVerificationResponse(valid=True, trader=summary)


@router.get("/copied", response_model=CopiedTradersResponse)
def list_copied_traders(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """Return traders that the current user is actively copying."""

    count_stmt = (
        select(func.count())
        .select_from(UserTraderCopy)
        .where(UserTraderCopy.user_id == current_user.id)
    )
    total = session.exec(count_stmt).one()

    statement = (
        select(UserTraderCopy)
        .where(UserTraderCopy.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )
    copies = session.exec(statement).all()

    for copy in copies:
        session.refresh(copy, attribute_names=["trader_profile"])
        if copy.trader_profile:
            session.refresh(copy.trader_profile, attribute_names=["user"])

    data = [_build_copied_trader(copy) for copy in copies]
    return CopiedTradersResponse(data=data, count=total)


@router.post("/start", response_model=CopyTradingStartResponse)
def start_copy_trading(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    payload: CopyTradingStartRequest,
) -> Any:
    """Create a copy-trading relationship between the current user and a trader."""

    if payload.trader_id is None and not payload.trader_code:
        raise HTTPException(status_code=400, detail="Trader identifier is required")

    trader: TraderProfile | None = None
    if payload.trader_id is not None:
        trader = session.get(TraderProfile, payload.trader_id)
    elif payload.trader_code:
        trader = _find_trader_by_code(session, payload.trader_code)

    if trader is None:
        raise HTTPException(status_code=404, detail="Trader not found")

    if not trader.is_public:
        raise HTTPException(status_code=400, detail="Trader is not available for copying")

    if trader.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot copy your own trader profile")

    if payload.allocation_amount <= 0:
        raise HTTPException(status_code=400, detail="Allocation amount must be greater than zero")

    if payload.allocation_amount < trader.minimum_copy_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum allocation for this trader is {trader.minimum_copy_amount}",
        )

    existing_copy = session.exec(
        select(UserTraderCopy).where(
            UserTraderCopy.user_id == current_user.id,
            UserTraderCopy.trader_profile_id == trader.id,
        )
    ).first()

    if existing_copy:
        raise HTTPException(status_code=400, detail="You are already copying this trader")

    copy_entry = UserTraderCopy(
        user_id=current_user.id,
        trader_profile_id=trader.id,
        copy_amount=payload.allocation_amount,
        copy_status=CopyStatus.ACTIVE,
        copy_settings={"source": "manual"},
    )

    session.add(copy_entry)

    trader.total_copiers = (trader.total_copiers or 0) + 1
    trader.total_assets_under_copy = (trader.total_assets_under_copy or 0.0) + payload.allocation_amount
    session.add(trader)

    session.commit()
    session.refresh(copy_entry, attribute_names=["trader_profile"])
    session.refresh(trader, attribute_names=["user"])

    if copy_entry.trader_profile:
        session.refresh(copy_entry.trader_profile, attribute_names=["user"])

    copied_summary = _build_copied_trader(copy_entry)
    message = (
        f"Copy trading started for {copied_summary.display_name} with allocation "
        f"${payload.allocation_amount:,.2f}"
    )
    return CopyTradingStartResponse(success=True, message=message, copied_trader=copied_summary)


__all__ = [
    "router",
    "TraderVerificationRequest",
    "TraderVerificationResponse",
    "CopyTradingStartRequest",
    "CopyTradingStartResponse",
    "CopiedTradersResponse",
    "CopiedTraderSummary",
]
