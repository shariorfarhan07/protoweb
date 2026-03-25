import logging
import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

logger = logging.getLogger("app.upload")
router = APIRouter(prefix="/upload", tags=["upload"])

# Store uploads inside backend/static/uploads/
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/image")
async def upload_image(file: UploadFile) -> JSONResponse:
    logger.debug("Upload request — filename=%s content_type=%s", file.filename, file.content_type)

    # Validate MIME type
    mime = file.content_type or mimetypes.guess_type(file.filename or "")[0] or ""
    if mime not in ALLOWED_MIME:
        logger.warning("Rejected upload — unsupported MIME type: %s (file: %s)", mime, file.filename)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only JPEG, PNG, WebP and GIF images are allowed",
        )

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        logger.warning("Rejected upload — file too large: %d bytes (file: %s)", len(content), file.filename)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds 5 MB limit",
        )

    ext = Path(file.filename or "image").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    dest.write_bytes(content)

    url = f"/static/uploads/{filename}"
    logger.info("Saved upload — %s (%d bytes) → %s", file.filename, len(content), url)

    # Return the public URL path (served by FastAPI StaticFiles)
    return JSONResponse({"url": url})
