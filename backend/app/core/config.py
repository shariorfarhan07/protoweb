from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./prototypebd.db"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    API_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "changeme-use-a-real-secret-key-min-32-chars"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
