"""
Centralised logging configuration for PrototypeBD API.

  • Console  – coloured, human-readable (always on)
  • File     – daily rotating JSON-lines in logs/YYYY-MM-DD.log (kept 30 days)

Usage anywhere in the app:
    from app.core.logging import get_logger
    logger = get_logger(__name__)
"""

import json
import logging
import logging.handlers
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Constants ──────────────────────────────────────────────────────────────────
LOG_DIR = Path(__file__).resolve().parents[3] / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_LEVEL = logging.DEBUG


# ── JSON formatter (for file) ──────────────────────────────────────────────────
class JsonFormatter(logging.Formatter):
    """Emit one JSON object per log record — easy to parse / ship to log aggregators."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        if record.stack_info:
            payload["stack"] = self.formatStack(record.stack_info)
        # Attach any extra fields passed via logger.info("…", extra={…})
        for key, val in record.__dict__.items():
            if key not in {
                "name", "msg", "args", "levelname", "levelno", "pathname",
                "filename", "module", "exc_info", "exc_text", "stack_info",
                "lineno", "funcName", "created", "msecs", "relativeCreated",
                "thread", "threadName", "processName", "process", "message",
                "taskName",
            }:
                payload[key] = val
        return json.dumps(payload, default=str)


# ── Pretty formatter (for console) ────────────────────────────────────────────
class ColorFormatter(logging.Formatter):
    COLORS = {
        "DEBUG":    "\033[36m",   # cyan
        "INFO":     "\033[32m",   # green
        "WARNING":  "\033[33m",   # yellow
        "ERROR":    "\033[31m",   # red
        "CRITICAL": "\033[35m",   # magenta
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        # Work on a shallow copy so we don't corrupt the shared LogRecord
        # (other handlers, e.g. the JSON file handler, see the same object).
        record = logging.makeLogRecord(record.__dict__)
        color = self.COLORS.get(record.levelname, "")
        record.levelname = f"{color}{record.levelname:<8}{self.RESET}"
        return super().format(record)


# ── Build handlers ─────────────────────────────────────────────────────────────
def _build_handlers() -> list[logging.Handler]:
    handlers: list[logging.Handler] = []

    # Console
    console = logging.StreamHandler(sys.stdout)
    console.setLevel(LOG_LEVEL)
    console.setFormatter(
        ColorFormatter(
            fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    handlers.append(console)

    # Daily rotating file  →  logs/2026-03-26.log
    file_handler = logging.handlers.TimedRotatingFileHandler(
        filename=LOG_DIR / "backend.log",
        when="midnight",
        interval=1,
        backupCount=30,          # keep 30 days
        encoding="utf-8",
        utc=True,
    )
    file_handler.suffix = "%Y-%m-%d"
    file_handler.setLevel(LOG_LEVEL)
    file_handler.setFormatter(JsonFormatter())
    handlers.append(file_handler)

    return handlers


# ── Configure root + named loggers ────────────────────────────────────────────
def configure_logging() -> None:
    handlers = _build_handlers()

    # Root logger
    root = logging.getLogger()
    root.setLevel(LOG_LEVEL)
    for h in handlers:
        root.addHandler(h)

    # Silence noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)   # handled by middleware
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("watchfiles").setLevel(logging.WARNING)
    logging.getLogger("multipart").setLevel(logging.WARNING)
    logging.getLogger("aiosqlite").setLevel(logging.WARNING)        # internal cursor chatter


def get_logger(name: str) -> logging.Logger:
    """Return a module-level logger. Call configure_logging() once at startup."""
    return logging.getLogger(name)
