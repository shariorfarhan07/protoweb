from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_DEFAULT_ORIGINS = ["http://localhost:3000", "http://localhost:5555", "http://localhost:8888"]


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./prototypebd.db"
    ALLOWED_ORIGINS: list[str] = _DEFAULT_ORIGINS
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "changeme-use-a-real-secret-key-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

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
