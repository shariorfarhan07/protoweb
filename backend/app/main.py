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
from app.routers import admin, auth, blog, brands, categories, compare, contact, orders, product_comments, product_types, products, reviews, search, upload, wishlist

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


async def _seed_blog() -> None:
    """Seed blog categories (always) and sample content (only if empty)."""
    from sqlalchemy import select
    from app.core.database import AsyncSessionLocal
    from app.models.blog import BlogCategory, BlogPost, CommunityProject, VideoTutorial
    from app.services.blog import reading_minutes

    categories = [
        {"name": "Tutorials", "slug": "tutorials", "color": "#f2890e", "sort_order": 1,
         "description": "Step-by-step guides for printing, engraving & more."},
        {"name": "News", "slug": "news", "color": "#3b82f6", "sort_order": 2,
         "description": "Product launches and shop announcements."},
        {"name": "Projects", "slug": "projects", "color": "#22c55e", "sort_order": 3,
         "description": "Inspiring builds from the community."},
        {"name": "Tips", "slug": "tips", "color": "#a855f7", "sort_order": 4,
         "description": "Quick wins to level up your prints."},
    ]
    async with AsyncSessionLocal() as session:
        existing = {c.slug for c in (await session.execute(select(BlogCategory))).scalars().all()}
        slug_to_id: dict[str, int] = {}
        for row in categories:
            if row["slug"] not in existing:
                cat = BlogCategory(**row)
                session.add(cat)
                await session.flush()
                slug_to_id[row["slug"]] = cat.id
        await session.commit()

        # Resolve all category ids
        for c in (await session.execute(select(BlogCategory))).scalars().all():
            slug_to_id[c.slug] = c.id

        has_posts = (await session.execute(select(BlogPost))).scalars().first()
        if not has_posts:
            samples = [
                {
                    "slug": "getting-started-with-your-first-3d-print",
                    "title": "Getting Started With Your First 3D Print",
                    "cat": "tutorials",
                    "cover_image": "/home/hero-printer.png",
                    "excerpt": "Everything a beginner needs — from leveling the bed to pulling off a clean first layer.",
                    "content": "<p>Your printer just arrived — congratulations! Before you hit print, a little prep goes a long way.</p><h2>1. Level the bed</h2><p>A level bed is the single biggest factor in first-layer success. Use the paper-drag method at each corner until you feel light resistance.</p><h2>2. Set your nozzle & bed temps</h2><p>For PLA, start at 200°C nozzle and 60°C bed. Dial in from there based on your filament's spool label.</p><h2>3. Slice and print</h2><p>Import your STL, choose a 0.2mm layer height, and add a brim for extra adhesion on your first attempt.</p>",
                },
                {
                    "slug": "5-ways-to-improve-print-bed-adhesion",
                    "title": "5 Ways to Improve Print Bed Adhesion",
                    "cat": "tips",
                    "cover_image": None,
                    "excerpt": "Tired of prints popping off mid-job? These five fixes solve 90% of adhesion problems.",
                    "content": "<p>Bed adhesion issues are the most common beginner frustration. Here's the short list that fixes most of them.</p><h2>1. Clean the bed</h2><p>Wipe with isopropyl alcohol — oils from fingers ruin adhesion.</p><h2>2. Tune the Z-offset</h2><p>Too high and the line won't stick; too low and it'll be squished.</p><h2>3. Slow the first layer</h2><p>Print the first layer at ~20mm/s.</p><h2>4. Use a brim</h2><p>Adds surface area for tall or small-footprint parts.</p><h2>5. Match temperature to material</h2><p>PETG and ABS need a hotter bed than PLA.</p>",
                },
                {
                    "slug": "bambu-lab-p1s-now-in-stock",
                    "title": "New: Bambu Lab P1S Now in Stock at PrototypeBD",
                    "cat": "news",
                    "cover_image": None,
                    "excerpt": "The CoreXY workhorse everyone's been asking for has landed — with nationwide delivery.",
                    "content": "<p>We're thrilled to announce the <strong>Bambu Lab P1S</strong> is now available at PrototypeBD with full local warranty and support.</p><p>Enclosed, fast, and multi-color capable with the AMS — it's the perfect upgrade for makers ready to move beyond their first printer.</p>",
                },
                {
                    "slug": "community-build-custom-filament-dry-box",
                    "title": "Community Build: A Custom Filament Dry Box",
                    "cat": "projects",
                    "cover_image": None,
                    "excerpt": "One of our customers shares their printed-and-assembled dry box that keeps filament crisp.",
                    "content": "<p>Humidity is the enemy of good prints. Community member Rakib designed a sealed dry box using printed brackets, an airtight container, and rechargeable desiccant.</p><p>The result: PETG and TPU that print clean even in Dhaka's monsoon season.</p>",
                },
                {
                    "slug": "laser-engraving-settings-for-wood-and-acrylic",
                    "title": "Laser Engraving Settings for Wood & Acrylic",
                    "cat": "tutorials",
                    "cover_image": None,
                    "excerpt": "A starting-point cheat sheet for power and speed across common materials.",
                    "content": "<p>Dialing in laser settings is all about balancing power and speed. Here are safe starting points for a typical diode laser.</p><h2>Plywood (3mm)</h2><p>Engrave: 30% power, 3000mm/min. Cut: 100% power, 200mm/min, 2 passes.</p><h2>Acrylic (cast, 3mm)</h2><p>Engrave: 25% power, 2500mm/min. Always ventilate.</p>",
                },
            ]
            for s in samples:
                content = s["content"]
                session.add(BlogPost(
                    slug=s["slug"], title=s["title"], excerpt=s["excerpt"], content=content,
                    cover_image=s["cover_image"], author_name="PrototypeBD",
                    category_id=slug_to_id.get(s["cat"]),
                    source="manual", is_published=True,
                    reading_minutes=reading_minutes(content),
                ))
            await session.commit()

        if not (await session.execute(select(VideoTutorial))).scalars().first():
            videos = [
                {"title": "FDM 3D Printer — Unboxing & First Setup", "slug": "fdm-unboxing-setup",
                 "video_url": "https://www.youtube.com/watch?v=dKkfOFC9P6U", "duration": "12:04",
                 "category": "Getting Started", "sort_order": 1,
                 "description": "Open the box and get your printer running in under 15 minutes."},
                {"title": "Bed Leveling Masterclass", "slug": "bed-leveling-masterclass",
                 "video_url": "https://www.youtube.com/watch?v=_Ab8Wfa4n_8", "duration": "08:21",
                 "category": "Tutorials", "sort_order": 2,
                 "description": "Manual and auto bed leveling, explained clearly."},
                {"title": "Slicer Settings Explained", "slug": "slicer-settings-explained",
                 "video_url": "https://www.youtube.com/watch?v=mwzMjqUM-Yo", "duration": "15:47",
                 "category": "Tutorials", "sort_order": 3,
                 "description": "Layer height, infill, supports and walls — what actually matters."},
            ]
            for v in videos:
                session.add(VideoTutorial(**v))
            await session.commit()

        if not (await session.execute(select(CommunityProject))).scalars().first():
            projects = [
                {"title": "Articulated Dragon", "slug": "articulated-dragon",
                 "author_name": "Tasnia I.", "is_featured": True, "sort_order": 1,
                 "description": "Print-in-place flexi dragon — no supports, no assembly."},
                {"title": "Custom Mechanical Keyboard Case", "slug": "mechanical-keyboard-case",
                 "author_name": "Rakib H.", "sort_order": 2,
                 "description": "A 65% keyboard case printed in PETG with brass inserts."},
                {"title": "RC Plane Frame", "slug": "rc-plane-frame",
                 "author_name": "Farhan A.", "sort_order": 3,
                 "description": "Lightweight LW-PLA airframe that actually flies."},
            ]
            for p in projects:
                session.add(CommunityProject(**p))
            await session.commit()


async def _seed_rbac() -> None:
    """Seed the permission catalog and built-in roles."""
    from app.core.database import AsyncSessionLocal
    from app.services.rbac import RbacService

    async with AsyncSessionLocal() as session:
        await RbacService(session).seed()


async def _ensure_review_columns() -> None:
    """SQLite create_all won't ALTER existing tables — add new review columns if missing."""
    async with engine.begin() as conn:
        res = await conn.exec_driver_sql("PRAGMA table_info(reviews)")
        cols = {row[1] for row in res.fetchall()}
        if "is_approved" not in cols:
            await conn.exec_driver_sql(
                "ALTER TABLE reviews ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT 1"
            )
        if "source" not in cols:
            await conn.exec_driver_sql(
                "ALTER TABLE reviews ADD COLUMN source VARCHAR(20) NOT NULL DEFAULT 'admin'"
            )


async def _ensure_product_columns() -> None:
    """SQLite create_all won't ALTER existing tables — add new product columns if missing."""
    async with engine.begin() as conn:
        res = await conn.exec_driver_sql("PRAGMA table_info(products)")
        cols = {row[1] for row in res.fetchall()}
        if "reorder_level" not in cols:
            await conn.exec_driver_sql(
                "ALTER TABLE products ADD COLUMN reorder_level INTEGER NOT NULL DEFAULT 5"
            )
        if "preorder_enabled" not in cols:
            await conn.exec_driver_sql(
                "ALTER TABLE products ADD COLUMN preorder_enabled BOOLEAN NOT NULL DEFAULT 0"
            )
        if "preorder_price" not in cols:
            await conn.exec_driver_sql(
                "ALTER TABLE products ADD COLUMN preorder_price NUMERIC(10, 2)"
            )


async def _ensure_contact_columns() -> None:
    """SQLite create_all won't ALTER existing tables — add ip_address tracking columns if missing."""
    async with engine.begin() as conn:
        for table in ("contact_messages", "newsletter_subscribers"):
            res = await conn.exec_driver_sql(f"PRAGMA table_info({table})")
            cols = {row[1] for row in res.fetchall()}
            if "ip_address" not in cols:
                await conn.exec_driver_sql(
                    f"ALTER TABLE {table} ADD COLUMN ip_address VARCHAR(64)"
                )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Starting up PrototypeBD API...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await _ensure_review_columns()
    await _ensure_product_columns()
    await _ensure_contact_columns()
    logger.info("Database tables verified/created.")
    await _seed_default_product_types()
    logger.info("Default product types seeded.")
    await _seed_rbac()
    logger.info("RBAC roles & permissions seeded.")
    await _seed_blog()
    logger.info("Blog content seeded.")
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
    product_comments.router,
    contact.router,
    reviews.router,
    blog.router,
]:
    app.include_router(_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["health"])
async def health_check() -> dict:
    return {"status": "ok", "version": "1.0.0"}
