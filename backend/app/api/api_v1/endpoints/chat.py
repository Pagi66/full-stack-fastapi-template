# app/api/api_v1/endpoints/chat.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from fastapi.responses import JSONResponse
from app.core import security
from app import crud, models
from app.services.ai.orchestrator import AIOrchestrator
from typing import Optional

router = APIRouter()

# Dependency to get current user from JWT in WebSocket
async def get_current_user_ws(websocket: WebSocket) -> models.User:
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
    try:
        payload = security.decode_token(token)
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
        from app.core.db import engine
        from sqlmodel import Session
        user = None
        with Session(engine) as session:
            user = crud.get_user_by_id(session=session, user_id=user_id)
        if user is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
        return user
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)

@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: int):
    # Accept connection only if JWT is valid
    user = await get_current_user_ws(websocket)
    if user.id != user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    orchestrator = AIOrchestrator()
    try:
        while True:
            data = await websocket.receive_text()
            response = await orchestrator.handle_message(user_id, data)
            await websocket.send_text(response)
    except WebSocketDisconnect:
        pass