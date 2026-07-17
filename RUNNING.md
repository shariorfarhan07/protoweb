# Running PrototypeBD Locally

This project has two parts that must **both** be running:

| Part | Stack | Port | URL |
|------|-------|------|-----|
| Backend | FastAPI + async SQLAlchemy + aiosqlite | `8000` | http://localhost:8000 |
| Frontend | Next.js 14 (App Router) | `3333` | http://localhost:3333 |

The frontend reads the API base from `frontend/.env.local`
(`NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`), so start the **backend first**.

---

## TL;DR — start everything

Open **two terminals**.

**Terminal 1 — backend** (must be run from the `backend/` folder):
```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 — frontend** (run from the `frontend/` folder):
```bash
cd frontend
npm run dev
```

Then open **http://localhost:3333**.

> The backend has **no `--reload`**. After changing backend Python code, stop it
> (Ctrl+C) and start it again to pick up the changes.

---

## First-time setup

Only needed once (or after deleting the database / `node_modules`).

**Backend** — dependencies are managed by [`uv`](https://docs.astral.sh/uv/):
```bash
cd backend
uv sync          # install Python deps into the project venv
```

**Frontend**:
```bash
cd frontend
npm install
```

**Seed sample data** (categories, brands, 6 demo products). Idempotent — it
skips if the DB already has categories:
```bash
cd backend
uv run python seed.py
```

---

## Verifying it works

```bash
# Backend health
curl http://localhost:8000/health
# -> {"status":"ok","version":"1.0.0"}

# Products are being served (should NOT be empty)
curl "http://localhost:8000/api/v1/products?page_size=1"
# -> {"items":[{...}],"total":6,...}
```

If the frontend Shop page shows **"No products found"** but the curl above
returns `"total":6`, the frontend just can't reach the API — confirm the
backend is on port 8000 and `frontend/.env.local` points to
`http://localhost:8000/api/v1`.

---

## Admin login

- URL: http://localhost:3333/login
- Email: `admin@prototypebd.com`
- Password: `Admin@12345`  (super admin — all permissions)

Access tokens expire after 15 minutes; you'll be logged out automatically.

---

## Important gotchas

### 1. The database is `backend/prototypebd.db`
`backend/app/core/config.py` now resolves the SQLite file to an **absolute path**
anchored at the backend folder, so it works no matter which directory you launch
`uvicorn` from:

```python
_BACKEND_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_DB_URL = f"sqlite+aiosqlite:///{(_BACKEND_ROOT / 'prototypebd.db').as_posix()}"
```

Before this fix, launching uvicorn from the repo root created a **separate empty**
`prototypebd.db` at the root and the Shop showed "No products found". If you ever
see an empty shop, check there isn't a stray `prototypebd.db` at the repo root —
the real one lives in `backend/`.

You can override the location with the `DATABASE_URL` env var (or `backend/.env`).

### 2. Schema changes need a manual migration
`Base.metadata.create_all` creates **new** tables but does **not** ALTER existing
ones. New columns on existing tables are added via `_ensure_*_columns()` helpers in
`backend/app/main.py` (run automatically on startup). Add an `ALTER TABLE ... ADD
COLUMN` there when you add a column to an existing model.

### 3. Ports already in use
If `8000` or `3333` is taken (or a previous run is stuck), kill stragglers:

PowerShell:
```powershell
Get-Process python,node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Quick reference

| Task | Command (from the listed folder) |
|------|----------------------------------|
| Run backend | `backend/` → `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000` |
| Run frontend (dev) | `frontend/` → `npm run dev` |
| Seed demo data | `backend/` → `uv run python seed.py` |
| Type-check frontend | `frontend/` → `npm run type-check` |
| Build frontend (prod) | `frontend/` → `npm run build && npm start` |
| Backend import sanity check | `backend/` → `uv run python -c "import app.main"` |
