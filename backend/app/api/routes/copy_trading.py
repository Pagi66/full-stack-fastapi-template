"""Copy trading API endpoints for managing trader verification and copy relationships."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import computed_field
from sqlmodel import SQLModel, func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import CopyStatus, RiskTolerance, TraderProfile, User, UserTraderCopy


router = APIRouter(prefix="/copy-trading", tags=["copy-trading"])


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


def _normalize_trader_code(trader_code: str | None) -> str | None:
    if trader_code is None:
        return None
    normalized = trader_code.strip().upper()
    return normalized or None


def _build_trader_summary(trader: TraderProfile) -> "TraderSummary":
    performance, win_rate = _format_performance(trader)

    stored_code = _normalize_trader_code(trader.trader_code)
    trader_code = stored_code or str(trader.id).replace("-", "").upper()[:8]

    display_name = (
        trader.display_name
        or (
            trader.user.full_name
            if isinstance(trader.user, User) and trader.user.full_name
            else f"Trader {trader_code}"
        )
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
    normalized = _normalize_trader_code(trader_code)
    if not normalized:
        return None

    statement = select(TraderProfile).where(TraderProfile.trader_code == normalized)
    trader = session.exec(statement).first()
    if trader:
        session.refresh(trader, attribute_names=["user"])
    return trader


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

    @computed_field(return_type=str, alias="traderCode")
    def trader_code_camel(self) -> str:
        return self.trader_code

    @computed_field(return_type=str, alias="displayName")
    def display_name_camel(self) -> str:
        return self.display_name

    @computed_field(return_type=str, alias="riskLevel")
    def risk_level_camel(self) -> str:
        value = getattr(self.risk_level, 'value', None)
        return value if value is not None else str(self.risk_level)

    @computed_field(return_type=str, alias="winRate")
    def win_rate_camel(self) -> str:
        return self.win_rate


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


class CopyTradingUpdateResponse(SQLModel):
    success: bool
    message: str
    copied_trader: CopiedTraderSummary


class CopyTradingAggregateResponse(SQLModel):
    active: int
    paused: int
    stopped: int


def _load_copy_relationship(
    session: SessionDep,
    current_user: CurrentUser,
    copy_id: uuid.UUID,
) -> UserTraderCopy:
    copy = session.get(UserTraderCopy, copy_id)
    if copy is None or copy.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Copy relationship not found")

    session.refresh(copy, attribute_names=["trader_profile"])
    session.refresh(copy, attribute_names=["user"])
    if copy.trader_profile:
        session.refresh(copy.trader_profile, attribute_names=["user"])
    return copy


def _apply_status_transition(
    copy: UserTraderCopy,
    new_status: CopyStatus,
    *,
    previous_status: CopyStatus,
) -> None:
    trader = copy.trader_profile
    if trader is None:
        return

    was_active = previous_status == CopyStatus.ACTIVE
    will_be_active = new_status == CopyStatus.ACTIVE

    if was_active == will_be_active:
        return

    if was_active:
        trader.total_copiers = max((trader.total_copiers or 0) - 1, 0)
        trader.total_assets_under_copy = max(
            (trader.total_assets_under_copy or 0.0) - copy.copy_amount,
            0.0,
        )
    else:
        trader.total_copiers = (trader.total_copiers or 0) + 1
        trader.total_assets_under_copy = (
            (trader.total_assets_under_copy or 0.0) + copy.copy_amount
        )


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

    session.refresh(current_user, attribute_names=["balance"])
    if current_user.balance < payload.allocation_amount:
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance to allocate funds for copy trading",
        )

    copy_entry = UserTraderCopy(
        user_id=current_user.id,
        trader_profile_id=trader.id,
        copy_amount=payload.allocation_amount,
        copy_status=CopyStatus.ACTIVE,
        copy_settings={"source": "manual", "initial_allocation": payload.allocation_amount},
    )

    session.add(copy_entry)

    current_user.balance = round(current_user.balance - payload.allocation_amount, 2)
    session.add(current_user)

    trader.total_copiers = (trader.total_copiers or 0) + 1
    trader.total_assets_under_copy = (trader.total_assets_under_copy or 0.0) + payload.allocation_amount
    session.add(trader)

    session.commit()
    session.refresh(current_user, attribute_names=["balance"])
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


@router.post("/copied/{copy_id}/pause", response_model=CopyTradingUpdateResponse)
def pause_copy_relationship(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    copy_id: uuid.UUID,
) -> Any:
    """Pause an active copy-trading relationship for the current user."""

    copy = _load_copy_relationship(session, current_user, copy_id)
    previous_status = copy.copy_status

    if previous_status == CopyStatus.STOPPED:
        raise HTTPException(status_code=400, detail="Copy relationship is already stopped")

    if previous_status == CopyStatus.PAUSED:
        copied_summary = _build_copied_trader(copy)
        return CopyTradingUpdateResponse(
            success=True,
            message="Copy relationship is already paused",
            copied_trader=copied_summary,
        )

    copy.copy_status = CopyStatus.PAUSED
    _apply_status_transition(copy, CopyStatus.PAUSED, previous_status=previous_status)

    session.add(copy)
    if copy.trader_profile:
        session.add(copy.trader_profile)
    session.commit()
    session.refresh(copy, attribute_names=["trader_profile"])
    if copy.trader_profile:
        session.refresh(copy.trader_profile, attribute_names=["user"])

    copied_summary = _build_copied_trader(copy)
    return CopyTradingUpdateResponse(
        success=True,
        message="Copy relationship paused",
        copied_trader=copied_summary,
    )


@router.post("/copied/{copy_id}/stop", response_model=CopyTradingUpdateResponse)
def stop_copy_relationship(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    copy_id: uuid.UUID,
) -> Any:
    """Stop a copy-trading relationship permanently for the current user."""

    copy = _load_copy_relationship(session, current_user, copy_id)
    previous_status = copy.copy_status

    if previous_status == CopyStatus.STOPPED:
        copied_summary = _build_copied_trader(copy)
        return CopyTradingUpdateResponse(
            success=True,
            message="Copy relationship already stopped",
            copied_trader=copied_summary,
        )

    copy.copy_status = CopyStatus.STOPPED
    _apply_status_transition(copy, CopyStatus.STOPPED, previous_status=previous_status)

    session.refresh(copy, attribute_names=["user"])
    if copy.user:
        copy.user.balance = round(copy.user.balance + copy.copy_amount, 2)
        session.add(copy.user)

    session.add(copy)
    if copy.trader_profile:
        session.add(copy.trader_profile)
    session.commit()
    session.refresh(copy, attribute_names=["trader_profile"])
    session.refresh(copy, attribute_names=["user"])
    if copy.trader_profile:
        session.refresh(copy.trader_profile, attribute_names=["user"])

    copied_summary = _build_copied_trader(copy)
    return CopyTradingUpdateResponse(
        success=True,
        message="Copy relationship stopped",
        copied_trader=copied_summary,
    )


@router.post("/copied/{copy_id}/resume", response_model=CopyTradingUpdateResponse)
def resume_copy_relationship(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    copy_id: uuid.UUID,
) -> Any:
    """Resume a previously paused copy-trading relationship."""

    copy = _load_copy_relationship(session, current_user, copy_id)
    previous_status = copy.copy_status

    if previous_status == CopyStatus.ACTIVE:
        copied_summary = _build_copied_trader(copy)
        return CopyTradingUpdateResponse(
            success=True,
            message="Copy relationship is already active",
            copied_trader=copied_summary,
        )

    if previous_status == CopyStatus.STOPPED:
        raise HTTPException(status_code=400, detail="Stopped copy relationships cannot be resumed")

    copy.copy_status = CopyStatus.ACTIVE
    _apply_status_transition(copy, CopyStatus.ACTIVE, previous_status=previous_status)

    session.add(copy)
    if copy.trader_profile:
        session.add(copy.trader_profile)
    session.commit()
    session.refresh(copy, attribute_names=["trader_profile"])
    if copy.trader_profile:
        session.refresh(copy.trader_profile, attribute_names=["user"])

    copied_summary = _build_copied_trader(copy)
    return CopyTradingUpdateResponse(
        success=True,
        message="Copy relationship resumed",
        copied_trader=copied_summary,
    )


@router.get("/summary", response_model=CopyTradingAggregateResponse)
def copy_trading_summary(
    *,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """Return aggregate copy-trading counts grouped by status (admin only)."""

    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    statement = (
        select(UserTraderCopy.copy_status, func.count())
        .group_by(UserTraderCopy.copy_status)
    )

    counts: dict[CopyStatus, int] = {status: 0 for status in CopyStatus}
    for status_value, count in session.exec(statement):
        counts[CopyStatus(status_value)] = count

    return CopyTradingAggregateResponse(
        active=counts[CopyStatus.ACTIVE],
        paused=counts[CopyStatus.PAUSED],
        stopped=counts[CopyStatus.STOPPED],
    )


__all__ = [
    "router",
    "TraderVerificationRequest",
    "TraderVerificationResponse",
    "CopyTradingStartRequest",
    "CopyTradingStartResponse",
    "CopiedTradersResponse",
    "CopiedTraderSummary",
    "CopyTradingUpdateResponse",
    "CopyTradingAggregateResponse",
]
