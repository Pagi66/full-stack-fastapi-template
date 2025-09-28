from fastapi import APIRouter

from app.api.routes import (
    admin,
    copy_trading,
    execution_events,
    items,
    login,
    performance,
    private,
    trades,
    transactions,
    traders,
    users,
    utils,
)
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(admin.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(transactions.router)
api_router.include_router(trades.router)
api_router.include_router(performance.router)
api_router.include_router(traders.router)
api_router.include_router(copy_trading.router)
api_router.include_router(execution_events.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
