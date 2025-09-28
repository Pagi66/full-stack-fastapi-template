#!/usr/bin/env python3
"""Utility script to create baseline test users with zero cash balances."""

from __future__ import annotations

import logging
import sys
from dataclasses import dataclass

from sqlmodel import Session

# Ensure backend package imports resolve when executed as a script
sys.path.insert(0, ".")

from app import crud
from app.core.config import settings
from app.core.db import engine
from app.models import AccountTier, KycStatus, User, UserCreate, UserRole
from app.services.balance_reset import ensure_zero_balance

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")

BASELINE_BALANCE = 0.0


@dataclass
class SeedUser:
    email: str
    password: str
    full_name: str
    role: UserRole
    account_tier: AccountTier
    kyc_status: KycStatus
    description: str


TEST_USERS: list[SeedUser] = [
    SeedUser(
        email="testadmin@apex.com",
        password="AdminTest123!",
        full_name="Test Administrator",
        role=UserRole.ADMIN,
        account_tier=AccountTier.PREMIUM,
        kyc_status=KycStatus.APPROVED,
        description="Administrator test account",
    ),
    SeedUser(
        email="testuser@apex.com",
        password="UserTest123!",
        full_name="Test User",
        role=UserRole.USER,
        account_tier=AccountTier.STANDARD,
        kyc_status=KycStatus.APPROVED,
        description="Regular user test account",
    ),
    SeedUser(
        email="trader@apex.com",
        password="TraderTest123!",
        full_name="Test Trader",
        role=UserRole.USER,
        account_tier=AccountTier.PREMIUM,
        kyc_status=KycStatus.APPROVED,
        description="Active trader test account",
    ),
    SeedUser(
        email="forex.trader@apex.com",
        password="ForexTest123!",
        full_name="Forex Specialist",
        role=UserRole.USER,
        account_tier=AccountTier.PREMIUM,
        kyc_status=KycStatus.APPROVED,
        description="Forex trading specialist",
    ),
    SeedUser(
        email="crypto.trader@apex.com",
        password="CryptoTrade123!",
        full_name="Crypto Expert",
        role=UserRole.USER,
        account_tier=AccountTier.VIP,
        kyc_status=KycStatus.APPROVED,
        description="Cryptocurrency trading expert",
    ),
    SeedUser(
        email="stocks.trader@apex.com",
        password="StocksTrade123!",
        full_name="Stock Market Analyst",
        role=UserRole.USER,
        account_tier=AccountTier.PREMIUM,
        kyc_status=KycStatus.APPROVED,
        description="Stock market trading analyst",
    ),
    SeedUser(
        email="indices.trader@apex.com",
        password="IndicesTrade123!",
        full_name="Indices Trader",
        role=UserRole.USER,
        account_tier=AccountTier.STANDARD,
        kyc_status=KycStatus.APPROVED,
        description="Market indices trader",
    ),
    SeedUser(
        email="vip.trader@apex.com",
        password="VipTrade123!",
        full_name="VIP Trader",
        role=UserRole.USER,
        account_tier=AccountTier.VIP,
        kyc_status=KycStatus.APPROVED,
        description="VIP level trader with high capital",
    ),
]


def create_test_users() -> list[User]:
    created_or_updated: list[User] = []

    with Session(engine) as session:
        for seed in TEST_USERS:
            existing = crud.get_user_by_email(session=session, email=seed.email)
            if existing:
                logger.info("User %s exists; ensuring baseline balance.", seed.email)
                ensure_zero_balance(
                    session,
                    existing,
                    description="Baseline reset (seed script)",
                )
                created_or_updated.append(existing)
                continue

            logger.info("Creating seed user %s", seed.email)
            user_create = UserCreate(
                email=seed.email,
                password=seed.password,
                full_name=seed.full_name,
                role=seed.role,
                account_tier=seed.account_tier,
                kyc_status=seed.kyc_status,
            )
            user = crud.create_user(session=session, user_create=user_create)
            ensure_zero_balance(
                session,
                user,
                description="Baseline reset (seed script)",
            )
            created_or_updated.append(user)

        session.commit()

        return created_or_updated


def test_authentication() -> None:
    from app import crud as crud_module

    with Session(engine) as session:
        for seed in TEST_USERS:
            user = crud_module.authenticate(
                session=session,
                email=seed.email,
                password=seed.password,
            )
            if user:
                logger.info(
                    "Authenticated user %s (role=%s, balance=%.2f)",
                    seed.email,
                    user.role.value,
                    user.balance,
                )
            else:
                logger.error("Authentication failed for %s", seed.email)


if __name__ == "__main__":
    logger.info("Starting test user creation...")
    logger.info(
        "Database: %s@%s:%s",
        settings.POSTGRES_DB,
        settings.POSTGRES_SERVER,
        settings.POSTGRES_PORT,
    )

    try:
        users = create_test_users()
        logger.info("Seeded %d users", len(users))
        test_authentication()
        logger.info("Test user creation completed successfully")
    except Exception as exc:
        logger.exception("Error creating test users: %s", exc)
        sys.exit(1)
