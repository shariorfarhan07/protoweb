FROM python:3.11-slim AS base

WORKDIR /app

# System deps for asyncpg / bcrypt native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (cache layer)
COPY pyproject.toml ./
RUN pip install --no-cache-dir ".[postgres]" && \
    pip install --no-cache-dir email-validator

# Copy source
COPY . .

# Ensure the data directory exists for the SQLite volume mount
RUN mkdir -p /app/data

# Run Alembic migrations then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
