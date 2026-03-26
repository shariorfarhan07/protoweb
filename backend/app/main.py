import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.logging import configure_logging, get_logger

# ── Logging must be configured before any other app import ─────────────────
configure_logging()
logger = get_logger("app.main")

from app.core.database import engine
from app.models.base import Base
from app.routers import admin, auth, brands, categories, compare, orders, product_types, products, reviews, search, upload, wishlist

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "uploads").mkdir(exist_ok=True)

_http_logger = get_logger("app.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every inbound request with method, path, status code, duration, and client IP."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
        try:
            response: Response = await call_next(request)
        except Exception as exc:
            duration_ms = (time.perf_counter() - start) * 1000
            _http_logger.error(
                "Unhandled exception during %s %s from %s (%.1fms)",
                request.method, request.url.path, client_ip, duration_ms,
                exc_info=exc,
            )
            raise
        duration_ms = (time.perf_counter() - start) * 1000
        level = "warning" if response.status_code >= 400 else "info"
        getattr(_http_logger, level)(
            "%s %s %d %.1fms %s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            client_ip,
            extra={
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "duration_ms": round(duration_ms, 1),
                "client_ip": client_ip,
            },
        )
        return response


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

logger.info("CORS allowed origins: %s", settings.ALLOWED_ORIGINS)

app.add_middleware(RequestLoggingMiddleware)
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
    reviews.router,
]:
    app.include_router(_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "1.0.0"}
