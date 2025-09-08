import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Transaction,
    TransactionCreate,
    TransactionPublic,
    TransactionUpdate,
    TransactionsPublic,
)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=TransactionsPublic)
def read_transactions(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve transactions. Superusers see all transactions; regular users only their own.
    """

    if current_user.is_superuser:
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

    return TransactionsPublic(data=[TransactionPublic.model_validate(tx) for tx in transactions], count=count)


@router.get("/{id}", response_model=TransactionPublic)
def read_transaction(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get a transaction by ID.
    """
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not current_user.is_superuser and (tx.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return tx


@router.post("/", response_model=TransactionPublic)
def create_transaction(
    *, session: SessionDep, current_user: CurrentUser, tx_in: TransactionCreate
) -> Any:
    """
    Create a new transaction for the current user.
    """
    tx = Transaction.model_validate(tx_in, update={"user_id": current_user.id})
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@router.put("/{id}", response_model=TransactionPublic)
def update_transaction(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, tx_in: TransactionUpdate
) -> Any:
    """
    Update a transaction. Owners can update their transactions; superusers can update any.
    """
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not current_user.is_superuser and (tx.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    update_dict = tx_in.model_dump(exclude_unset=True)
    tx.sqlmodel_update(update_dict)
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return tx


@router.delete("/{id}")
def delete_transaction(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Message:
    """
    Delete a transaction.
    """
    tx = session.get(Transaction, id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if not current_user.is_superuser and (tx.user_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    session.delete(tx)
    session.commit()
    return Message(message="Transaction deleted successfully")
