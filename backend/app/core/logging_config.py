"""Application logging configuration utilities."""
from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings


class JsonFormatter(logging.Formatter):
    """Format log records as structured JSON for easier ingestion."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: D401 - inherited docstring
        log_payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_payload["exc_info"] = self.formatException(record.exc_info)
        if record.stack_info:
            log_payload["stack"] = record.stack_info
        if record.__dict__:
            extra = {k: v for k, v in record.__dict__.items() if k not in log_payload}
            if extra:
                log_payload["extra"] = extra
        return json.dumps(log_payload, ensure_ascii=False)


def configure_logging() -> None:
    """Configure application-wide logging according to settings."""

    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    if settings.LOG_JSON:
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(
            logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
        )

    logging.basicConfig(level=log_level, handlers=[handler], force=True)

