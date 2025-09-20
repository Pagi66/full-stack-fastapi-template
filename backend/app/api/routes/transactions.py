import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app import crud
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Transaction,
    TransactionCreate,
    TransactionPublic,
    TransactionStatus,
    TransactionType,
    TransactionUpdate,
    TransactionsPublic,
    UserRole,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=TransactionsPublic)
def read_transactions(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    if current_user.is_superuser or current_user.role == UserRole.ADMIN:
        count_statement = select(func.count()).select_from(Transaction)
        count = session.exec(count_statement).one()
        statement = select(Transaction).offset(skip).limit(limit)
        transactions = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Transaction)
            .where(Transaction.user_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Transaction)
            .where(Transaction.user_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        transactions = session.exec(statement).all()

    return TransactionsPublic(
        data=[TransactionPublic.model_validate(tx) for tx in transactions],
        count=count,
    )


@router.get("/{id}", response_model=TransactionPublic)
def read_transaction(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN) and tx.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return tx


@router.post("/", response_model=TransactionPublic)
def create_transaction(
    *, session: SessionDep, current_user: CurrentUser, tx_in: TransactionCreate
) -> Any:
    owner_id = None if current_user.is_superuser or current_user.role == UserRole.ADMIN else current_user.id
    if not current_user.is_superuser and current_user.role != UserRole.ADMIN:
        tx_in.user_id = current_user.id
    tx = crud.create_transaction(session=session, tx_in=tx_in, owner_id=owner_id)
    return tx


@router.put("/{id}", response_model=TransactionPublic)
def update_transaction(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, tx_in: TransactionUpdate
) -> Any:
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN) and tx.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    tx = crud.update_transaction(session=session, db_tx=tx, tx_in=tx_in)
    return tx


@router.delete("/{id}")
def delete_transaction(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN) and tx.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(tx)
    session.commit()
    return Message(message="Transaction deleted successfully")


@router.post("/{id}/status", response_model=TransactionPublic)
def update_status(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    status: TransactionStatus,
) -> Transaction:
    if not (current_user.is_superuser or current_user.role == UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    update = TransactionUpdate(status=status)
    if status == TransactionStatus.COMPLETED and tx.transaction_type in {TransactionType.DEPOSIT, TransactionType.WITHDRAWAL, TransactionType.ADJUSTMENT}:
        if tx.transaction_type == TransactionType.DEPOSIT:
            tx.user.balance += tx.amount
        elif tx.transaction_type == TransactionType.WITHDRAWAL:
            tx.user.balance -= tx.amount
    tx = crud.update_transaction(session=session, db_tx=tx, tx_in=update)
    session.add(tx.user)
    session.commit()
    session.refresh(tx)
    return tx

