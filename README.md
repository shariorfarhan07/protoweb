# PrototypeBD — Full eCommerce Platform

A production-grade eCommerce platform for 3D printers, laser engravers, CNC machines, and filament.

## Architecture

```
prototypebd/
├── backend/    FastAPI + SQLAlchemy 2.x (async) + SQLite → PostgreSQL
└── frontend/   Next.js 14 (App Router) + TypeScript + Tailwind CSS
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -e ".[dev]"

# Copy env and configure
cp .env.example .env

# Run the API server
uvicorn app.main:app --reload --port 8000

# Seed sample data (optional)
python seed.py

# Run tests
pytest
```

API docs available at: **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.local.example .env.local

# Start dev server
npm run dev
```

Site available at: **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/products` | List products (filters + pagination) |
| GET | `/api/v1/products/featured` | Featured products |
| GET | `/api/v1/products/{slug}` | Product detail |
| GET | `/api/v1/categories` | All categories |
| GET | `/api/v1/categories/{slug}` | Category by slug |
| GET | `/api/v1/brands` | All brands |
| GET | `/api/v1/brands/{slug}` | Brand by slug |
| GET | `/api/v1/search?q=query` | Full-text search |
| POST | `/api/v1/compare` | Compare products by IDs |

### Filter Parameters (GET /products)

| Param | Type | Example |
|-------|------|---------|
| `category` | string | `3d-printers` |
| `brand` | string | `bambu-lab` |
| `product_type` | string | `printer`, `filament`, `cnc`, `printed` |
| `min_price` | number | `5000` |
| `max_price` | number | `100000` |
| `material` | string | `PLA`, `PETG`, `ABS` |
| `featured` | boolean | `true` |
| `page` | number | `1` |
| `page_size` | number | `20` (max 100) |

---

## Database

SQLite by default. To migrate to PostgreSQL:

1. Change `DATABASE_URL` in `backend/.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/prototypebd
   ```
2. Install PostgreSQL driver: `pip install asyncpg`
3. Run migrations: `alembic upgrade head`

Zero application code changes required.

### Schema

- **categories** — product categories with gradient CSS for UI
- **brands** — manufacturers/sellers
- **products** — core product table with JSON `specifications` field
- **product_images** — multiple images per product, `sort_order` + `is_primary`
- **filament_variants** — color/material variants with hex codes and per-color images

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero carousel + category grid + featured products |
| `/shop` | Product listing with sidebar filters |
| `/products/[slug]` | Product detail with image gallery, variants, specs |
| `/category/[slug]` | Category page |
| `/brand/[slug]` | Brand page |
| `/compare` | Comparison table (printers/CNC, up to 4) |
| `/cart` | Cart page |
| `/checkout` | Checkout form |

---

## SEO

- `generateMetadata()` per page — dynamic titles, descriptions, OG tags
- JSON-LD `Product` schema on every product detail page
- `sitemap.xml` auto-generated from live data
- `robots.txt` configured
- ISR (Incremental Static Regeneration) — 60s revalidation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand (cart + compare) |
| Backend | FastAPI, Python 3.11+ |
| ORM | SQLAlchemy 2.x (async) |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Migrations | Alembic |
| Testing | pytest + httpx (async) |
