import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, col, delete, func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.models import (
    AccountSummary,
    AccountSummaryBase,
    AccountSummaryPublic,
    AccountTier,
    Item,
    KycStatus,
    Message,
    TransactionCreate,
    TransactionStatus,
    TransactionType,
    UpdatePassword,
    User,
    UserCreate,
    UserPublic,
    UserRegister,
    UserRole,
    UsersPublic,
    UserUpdate,
    UserUpdateMe,
)
from app.utils import generate_new_account_email, send_email

router = APIRouter(prefix="/users", tags=["users"])


class BalanceResponse(SQLModel):
    balance: float


class BalanceUpdate(SQLModel):
    amount: float
    description: str | None = None


class KycDecision(SQLModel):
    status: KycStatus
    notes: str | None = None


class RoleTierUpdate(SQLModel):
    role: UserRole | None = None
    account_tier: AccountTier | None = None
    is_active: bool | None = None


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()
    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()
    return UsersPublic(data=[UserPublic.model_validate(user) for user in users], count=count)


@router.post(
    "/", dependencies=[Depends(get_current_active_superuser)], response_model=UserPublic
)
async def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.create_user(session=session, user_create=user_in)
    if settings.emails_enabled and user_in.email:
        email_data = generate_new_account_email(
            email_to=user_in.email, username=user_in.email, password=user_in.password
        )
        await send_email(
            email_to=user_in.email,
            subject=email_data.subject,
            html_content=email_data.html_content,
        )
    return user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.patch("/me/password", response_model=Message)
def update_password_me(
    *, session: SessionDep, body: UpdatePassword, current_user: CurrentUser
) -> Any:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")
    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )
    hashed_password = get_password_hash(body.new_password)
    current_user.hashed_password = hashed_password
    session.add(current_user)
    session.commit()
    return Message(message="Password updated successfully")


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> Any:
    return current_user


@router.post("/signup", response_model=UserPublic)
def register_user(session: SessionDep, user_in: UserRegister) -> Any:
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud.create_user(session=session, user_create=user_create)
    return user


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user or current_user.is_superuser or current_user.role == UserRole.ADMIN:
        return user
    raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")


@router.get("/{user_id}/balance", response_model=BalanceResponse)
def read_user_balance(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user != current_user and current_user.role != UserRole.ADMIN and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return BalanceResponse(balance=user.balance)


@router.patch(
    "/{user_id}/balance",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=BalanceResponse,
)
def update_user_balance(
    user_id: uuid.UUID,
    balance_update: BalanceUpdate,
    session: SessionDep,
) -> Any:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    previous_balance = user.balance
    user.balance = balance_update.amount
    session.add(user)
    session.commit()
    session.refresh(user)

    adjustment = balance_update.amount - previous_balance
    if adjustment != 0:
        tx = TransactionCreate(
            amount=adjustment,
            transaction_type=TransactionType.ADJUSTMENT,
            status=TransactionStatus.COMPLETED,
            description=balance_update.description or "Manual balance adjustment",
        )
        crud.create_transaction(session=session, tx_in=tx, owner_id=user.id)
    return BalanceResponse(balance=user.balance)


@router.post(
    "/{user_id}/kyc/decision",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_kyc_status(
    user_id: uuid.UUID, decision: KycDecision, session: SessionDep
) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.kyc_status = decision.status
    user.kyc_notes = decision.notes
    user.kyc_verified_at = (
        datetime.utcnow() if decision.status == KycStatus.APPROVED else None
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.patch(
    "/{user_id}/role",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_role_or_tier(
    user_id: uuid.UUID, payload: RoleTierUpdate, session: SessionDep
) -> User:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.role:
        user.role = payload.role
        user.is_superuser = payload.role == UserRole.ADMIN
    if payload.account_tier:
        user.account_tier = payload.account_tier
    if payload.is_active is not None:
        user.is_active = payload.is_active
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get(
    "/{user_id}/account-summary",
    response_model=AccountSummaryPublic,
)
def get_account_summary(
    user_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> AccountSummary:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user != current_user and current_user.role != UserRole.ADMIN and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    summary = session.exec(
        select(AccountSummary).where(AccountSummary.user_id == user_id)
    ).first()
    if not summary:
        raise HTTPException(status_code=404, detail="Account summary not available")
    return summary


@router.post(
    "/{user_id}/account-summary",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=AccountSummaryPublic,
)
def upsert_account_summary(
    user_id: uuid.UUID, payload: AccountSummaryBase, session: SessionDep
) -> AccountSummary:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    summary = crud.upsert_account_summary(session=session, user_id=user_id, summary_in=payload)
    return summary


@router.patch(
    "/{user_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UserPublic,
)
def update_user(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    user_in: UserUpdate,
) -> Any:
    db_user = session.get(User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    db_user = crud.update_user(session=session, db_user=db_user, user_in=user_in)
    return db_user


@router.delete(
    "/{user_id}", dependencies=[Depends(get_current_active_superuser)]
)
def delete_user(
    session: SessionDep, current_user: CurrentUser, user_id: uuid.UUID
) -> Message:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user == current_user:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    statement = delete(Item).where(col(Item.owner_id) == user_id)
    session.exec(statement)
    session.delete(user)
    session.commit()
    return Message(message="User deleted successfully")
