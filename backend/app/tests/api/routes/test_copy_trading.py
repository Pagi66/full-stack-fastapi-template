from __future__ import annotations

import uuid
from typing import Any

from fastapi.testclient import TestClient
from sqlmodel import Session, delete, select

from app import crud
from app.core.config import settings
from app.core.db import engine
from app.models import (
    CopyStatus,
    TraderProfile,
    User,
    UserCreate,
    UserTraderCopy,
)
from app.tests.utils.utils import random_email, random_lower_string


def _create_user(session: Session, *, email: str, password: str, full_name: str) -> User:
    user_in = UserCreate(email=email, password=password, full_name=full_name)
    return crud.create_user(session=session, user_create=user_in)


def _login_headers(client: TestClient, *, email: str, password: str) -> dict[str, str]:
    response = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data={"username": email, "password": password},
    )
    tokens: dict[str, Any] = response.json()
    access_token = tokens["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


def test_copy_trading_pause_and_stop_flow(
    client: TestClient,
    db: Session,
    superuser_token_headers: dict[str, str],
) -> None:
    trader_email = random_email()
    trader_password = random_lower_string()
    follower_email = random_email()
    follower_password = random_lower_string()

    trader_user = _create_user(
        db,
        email=trader_email,
        password=trader_password,
        full_name="Alpha Trader",
    )
    follower_user = _create_user(
        db,
        email=follower_email,
        password=follower_password,
        full_name="Follower User",
    )

    copy_id: str | None = None
    trader_profile_id: str | None = None
    try:
        create_payload = {
            "user_id": str(trader_user.id),
            "display_name": "Alpha FX",
            "specialty": "forex",
            "risk_level": "MEDIUM",
            "is_public": True,
            "copy_fee_percentage": 1.5,
            "minimum_copy_amount": 200.0,
        }

        create_response = client.post(
            f"{settings.API_V1_STR}/traders/",
            headers=superuser_token_headers,
            json=create_payload,
        )
        assert create_response.status_code == 200
        trader_data = create_response.json()
        trader_profile_id = trader_data["trader_profile"]["id"]
        trader_code = trader_data["trader_code"]

        follower_headers = _login_headers(
            client, email=follower_email, password=follower_password
        )

        verify_response = client.post(
            f"{settings.API_V1_STR}/copy-trading/verify",
            headers=follower_headers,
            json={"trader_code": trader_code},
        )
        assert verify_response.status_code == 200
        verify_payload = verify_response.json()
        assert verify_payload["valid"] is True
        assert verify_payload["trader"]["display_name"] == "Alpha FX"
        assert verify_payload["trader"]["trader_code"] == trader_code

        start_response = client.post(
            f"{settings.API_V1_STR}/copy-trading/start",
            headers=follower_headers,
            json={
                "trader_id": trader_profile_id,
                "allocation_amount": 500.0,
            },
        )
        assert start_response.status_code == 200
        start_payload = start_response.json()
        copy_id = start_payload["copied_trader"]["copy_id"]
        assert start_payload["copied_trader"]["status"] == "ACTIVE"

        copy_query = select(UserTraderCopy).where(
            UserTraderCopy.id == copy_id
        )
        copy_entry = db.exec(copy_query).first()
        assert copy_entry is not None
        assert copy_entry.copy_status == CopyStatus.ACTIVE

        profile = db.get(TraderProfile, trader_profile_id)
        assert profile is not None
        assert profile.total_copiers == 1
        assert profile.total_assets_under_copy == 500.0

        summary_response = client.get(
            f"{settings.API_V1_STR}/copy-trading/summary",
            headers=superuser_token_headers,
        )
        assert summary_response.status_code == 200
        assert summary_response.json() == {"active": 1, "paused": 0, "stopped": 0}

        pause_response = client.post(
            f"{settings.API_V1_STR}/copy-trading/copied/{copy_id}/pause",
            headers=follower_headers,
        )
        assert pause_response.status_code == 200
        db.refresh(copy_entry)
        db.refresh(profile)
        assert copy_entry.copy_status == CopyStatus.PAUSED
        assert profile.total_copiers == 0
        assert profile.total_assets_under_copy == 0.0

        summary_response = client.get(
            f"{settings.API_V1_STR}/copy-trading/summary",
            headers=superuser_token_headers,
        )
        assert summary_response.status_code == 200
        assert summary_response.json() == {"active": 0, "paused": 1, "stopped": 0}

        resume_response = client.post(
            f"{settings.API_V1_STR}/copy-trading/copied/{copy_id}/resume",
            headers=follower_headers,
        )
        assert resume_response.status_code == 200
        db.refresh(copy_entry)
        db.refresh(profile)
        assert copy_entry.copy_status == CopyStatus.ACTIVE
        assert profile.total_copiers == 1
        assert profile.total_assets_under_copy == 500.0

        summary_response = client.get(
            f"{settings.API_V1_STR}/copy-trading/summary",
            headers=superuser_token_headers,
        )
        assert summary_response.status_code == 200
        assert summary_response.json() == {"active": 1, "paused": 0, "stopped": 0}

        stop_response = client.post(
            f"{settings.API_V1_STR}/copy-trading/copied/{copy_id}/stop",
            headers=follower_headers,
        )
        assert stop_response.status_code == 200
        db.refresh(copy_entry)
        db.refresh(profile)
        assert copy_entry.copy_status == CopyStatus.STOPPED
        assert profile.total_copiers == 0
        assert profile.total_assets_under_copy == 0.0

        summary_response = client.get(
            f"{settings.API_V1_STR}/copy-trading/summary",
            headers=superuser_token_headers,
        )
        assert summary_response.status_code == 200
        assert summary_response.json() == {"active": 0, "paused": 0, "stopped": 1}


    finally:
        with Session(engine) as cleanup_session:
            if copy_id is not None:
                cleanup_session.exec(
                    delete(UserTraderCopy).where(
                        UserTraderCopy.id == uuid.UUID(copy_id)
                    )
                )

            cleanup_session.exec(
                delete(UserTraderCopy).where(UserTraderCopy.user_id == follower_user.id)
            )

            if trader_profile_id is not None:
                profile_uuid = uuid.UUID(trader_profile_id)
                cleanup_session.exec(
                    delete(UserTraderCopy).where(
                        UserTraderCopy.trader_profile_id == profile_uuid
                    )
                )
                cleanup_session.exec(
                    delete(TraderProfile).where(TraderProfile.id == profile_uuid)
                )

            cleanup_session.exec(
                delete(TraderProfile).where(TraderProfile.user_id == trader_user.id)
            )

            cleanup_session.exec(
                delete(User).where(User.id.in_([trader_user.id, follower_user.id]))
            )

            cleanup_session.commit()



