import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import SQLModel, func, select

from app.api.deps import SessionDep, get_current_active_superuser
from app.models import (
    Message,
    TraderProfile,
    TraderProfileCreate,
    TraderProfilePublic,
    TraderProfilesPublic,
    TraderProfileUpdate,
    User,
    RiskTolerance,
)

router = APIRouter(prefix="/traders", tags=["traders"])


class TraderCreateRequest(SQLModel):
    """Request model for creating a trader profile."""
    user_id: uuid.UUID
    display_name: str
    specialty: str
    risk_level: RiskTolerance
    trading_strategy: str | None = None
    is_public: bool = False
    copy_fee_percentage: float = 0.0
    minimum_copy_amount: float = 100.0


class TraderCreateResponse(SQLModel):
    """Response model for creating a trader profile."""
    trader_profile: TraderProfilePublic
    trader_code: str


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=TraderProfilesPublic,
)
def read_traders(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """Retrieve all trader profiles."""
    count_statement = select(func.count()).select_from(TraderProfile)
    count = session.exec(count_statement).one()
    
    statement = select(TraderProfile).offset(skip).limit(limit)
    traders = session.exec(statement).all()
    
    return TraderProfilesPublic(
        data=[TraderProfilePublic.model_validate(trader) for trader in traders], 
        count=count
    )


@router.post(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=TraderCreateResponse,
)
def create_trader(*, session: SessionDep, trader_in: TraderCreateRequest) -> Any:
    """Create a new trader profile."""
    print(f"Received trader creation request: {trader_in}")
    
    try:
        # Check if user exists
        user = session.get(User, trader_in.user_id)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )
        
        # Check if user already has a trader profile
        existing_trader = session.exec(
            select(TraderProfile).where(TraderProfile.user_id == trader_in.user_id)
        ).first()
        
        if existing_trader:
            raise HTTPException(
                status_code=400,
                detail="User already has a trader profile.",
            )
        
        # Generate a trader code (6-8 characters)
        import random
        import string
        
        def generate_trader_code():
            length = random.randint(6, 8)
            chars = string.ascii_uppercase + string.digits
            return ''.join(random.choice(chars) for _ in range(length))
        
        trader_code = generate_trader_code()
        
        # Create trader profile
        trader_profile_data = TraderProfileCreate(
            user_id=trader_in.user_id,
            trading_strategy=trader_in.trading_strategy or f"{trader_in.specialty} trading specialist",
            risk_tolerance=trader_in.risk_level,
            is_public=trader_in.is_public,
            copy_fee_percentage=trader_in.copy_fee_percentage,
            minimum_copy_amount=trader_in.minimum_copy_amount,
        )
        
        print(f"Creating trader profile with data: {trader_profile_data}")
        
        trader_profile = TraderProfile.model_validate(trader_profile_data)
        session.add(trader_profile)
        session.commit()
        session.refresh(trader_profile)
        
        return TraderCreateResponse(
            trader_profile=TraderProfilePublic.model_validate(trader_profile),
            trader_code=trader_code
        )
    
    except Exception as e:
        print(f"Error creating trader: {e}")
        print(f"Error type: {type(e)}")
        # Re-raise the exception to maintain the original error behavior
        raise


@router.get(
    "/{trader_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=TraderProfilePublic,
)
def read_trader_by_id(trader_id: uuid.UUID, session: SessionDep) -> Any:
    """Get a specific trader by id."""
    trader = session.get(TraderProfile, trader_id)
    if not trader:
        raise HTTPException(status_code=404, detail="Trader not found")
    return trader


@router.patch(
    "/{trader_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=TraderProfilePublic,
)
def update_trader(
    trader_id: uuid.UUID, trader_in: TraderProfileUpdate, session: SessionDep
) -> Any:
    """Update a trader profile."""
    trader = session.get(TraderProfile, trader_id)
    if not trader:
        raise HTTPException(status_code=404, detail="Trader not found")
    
    trader_data = trader_in.model_dump(exclude_unset=True)
    trader.sqlmodel_update(trader_data)
    session.add(trader)
    session.commit()
    session.refresh(trader)
    return trader


@router.delete(
    "/{trader_id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=Message,
)
def delete_trader(trader_id: uuid.UUID, session: SessionDep) -> Message:
    """Delete a trader profile."""
    trader = session.get(TraderProfile, trader_id)
    if not trader:
        raise HTTPException(status_code=404, detail="Trader not found")
    
    session.delete(trader)
    session.commit()
    return Message(message="Trader deleted successfully")
