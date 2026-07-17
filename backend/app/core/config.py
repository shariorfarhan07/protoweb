from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_ORIGINS = ["http://localhost:3000", "http://localhost:5555", "http://localhost:8888"]

# Anchor the SQLite file to the backend project root (this file lives at
# backend/app/core/config.py) so the DB resolves the same regardless of the
# directory uvicorn is launched from. Override with the DATABASE_URL env var.
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_DB_URL = f"sqlite+aiosqlite:///{(_BACKEND_ROOT / 'prototypebd.db').as_posix()}"


class Settings(BaseSettings):
    DATABASE_URL: str = _DEFAULT_DB_URL
    ALLOWED_ORIGINS: list[str] = _DEFAULT_ORIGINS
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "changeme-use-a-real-secret-key-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Facebook blog auto-sync (optional) ────────────────────────────────
    # Set FACEBOOK_PAGE_ID + FACEBOOK_ACCESS_TOKEN (a Page access token with
    # pages_read_engagement) to pull Page/Group posts into the blog.
    FACEBOOK_PAGE_ID: str = ""
    FACEBOOK_ACCESS_TOKEN: str = ""
    FACEBOOK_GRAPH_VERSION: str = "v19.0"
    FACEBOOK_SYNC_CATEGORY: str = "news"  # category slug to file synced posts under

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def _coerce_origins(cls, v: object) -> object:
        # If the env var is blank/empty fall back to the hardcoded dev defaults
        # so a stray ALLOWED_ORIGINS="" in the shell never locks out the frontend.
        if isinstance(v, str) and not v.strip():
            return _DEFAULT_ORIGINS
        if isinstance(v, list) and len(v) == 0:
            return _DEFAULT_ORIGINS
        return v


settings = Settings()
