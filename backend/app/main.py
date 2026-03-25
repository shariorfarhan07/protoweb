import logging
import logging.config
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s [%(levelname)-8s] %(name)s: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout",
        },
    },
    "loggers": {
        "app": {"level": "DEBUG", "handlers": ["console"], "propagate": False},
        "sqlalchemy.engine": {"level": "WARNING", "handlers": ["console"], "propagate": False},
        "uvicorn.error": {"level": "INFO", "handlers": ["console"], "propagate": False},
        "uvicorn.access": {"level": "INFO", "handlers": ["console"], "propagate": False},
    },
    "root": {"level": "INFO", "handlers": ["console"]},
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("app.main")
from app.core.database import engine
from app.models.base import Base
from app.routers import admin, auth, brands, categories, compare, orders, product_types, products, search, upload, wishlist

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "uploads").mkdir(exist_ok=True)


async def _seed_default_product_types() -> None:
    """Insert the four built-in product types if the table is empty."""
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.product_type import ProductType

    defaults = [
        {"value": "printer", "label": "3D Printer"},
        {"value": "filament", "label": "Filament"},
        {"value": "cnc", "label": "CNC / Laser Engraver"},
        {"value": "printed", "label": "3D Printed Product"},
    ]
    async with AsyncSessionLocal() as session:
        existing = (await session.execute(select(ProductType))).scalars().all()
        existing_values = {pt.value for pt in existing}
        for row in defaults:
            if row["value"] not in existing_values:
                session.add(ProductType(**row))
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting up PrototypeBD API...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified/created.")
    await _seed_default_product_types()
    logger.info("Default product types seeded.")
    yield
    logger.info("Shutting down — disposing DB engine.")
    await engine.dispose()


app = FastAPI(
    title="PrototypeBD API",
    description="Backend API for PrototypeBD — 3D printers, laser engravers & filament shop",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files at /static/…
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

for _router in [
    auth.router,
    products.router,
    categories.router,
    brands.router,
    search.router,
    compare.router,
    orders.router,
    wishlist.router,
    admin.router,
    upload.router,
    product_types.router,
]:
    app.include_router(_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "1.0.0"}
