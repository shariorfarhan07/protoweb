"""
Facebook → Blog auto-sync.

Pulls posts from a configured Facebook Page (or Group) via the Graph API and
turns them into blog posts (source="facebook"). Idempotent: a post already
imported (matched on `fb_post_id`) is skipped.

Configuration (env / settings):
    FACEBOOK_PAGE_ID         e.g. "123456789012345"
    FACEBOOK_ACCESS_TOKEN    a Page access token
    FACEBOOK_GRAPH_VERSION   default "v19.0"
    FACEBOOK_SYNC_CATEGORY   blog category slug to file posts under (default "news")

Uses the stdlib (urllib) so it adds no dependency; network call runs in a thread.
"""
import asyncio
import json
import urllib.parse
import urllib.request
from datetime import datetime

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.models.blog import BlogCategory, BlogPost
from app.schemas.blog import SyncResult
from app.services.blog import reading_minutes

logger = get_logger("app.services.facebook_sync")

_FIELDS = "id,message,story,created_time,permalink_url,full_picture"


def _fetch_posts(page_id: str, token: str, version: str, limit: int) -> list[dict]:
    params = urllib.parse.urlencode(
        {"fields": _FIELDS, "limit": limit, "access_token": token}
    )
    url = f"https://graph.facebook.com/{version}/{page_id}/posts?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "PrototypeBD/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    if "error" in payload:
        raise RuntimeError(payload["error"].get("message", "Graph API error"))
    return payload.get("data", [])


def _derive_title(message: str) -> str:
    first_line = (message or "").strip().splitlines()[0] if message else ""
    title = first_line.strip() or "Facebook update"
    return title[:120]


def _parse_time(value: str | None) -> datetime:
    if not value:
        return datetime.utcnow()
    try:
        # Graph returns e.g. "2026-03-25T09:54:24+0000"
        return datetime.fromisoformat(value.replace("+0000", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return datetime.utcnow()


async def sync_facebook_posts(db: AsyncSession, limit: int = 25) -> SyncResult:
    page_id = settings.FACEBOOK_PAGE_ID.strip()
    token = settings.FACEBOOK_ACCESS_TOKEN.strip()
    if not page_id or not token:
        return SyncResult(
            ok=False,
            message=(
                "Facebook sync is not configured. Set FACEBOOK_PAGE_ID and "
                "FACEBOOK_ACCESS_TOKEN in the backend environment to enable it."
            ),
        )

    try:
        raw = await asyncio.to_thread(
            _fetch_posts, page_id, token, settings.FACEBOOK_GRAPH_VERSION, limit
        )
    except Exception as exc:  # network / auth / API errors
        logger.warning("Facebook sync failed: %s", exc, extra={"event": "fb_sync_error"})
        return SyncResult(ok=False, message=f"Facebook API error: {exc}")

    # Resolve the target category (optional).
    category = (
        await db.execute(
            select(BlogCategory).where(BlogCategory.slug == settings.FACEBOOK_SYNC_CATEGORY)
        )
    ).scalars().first()

    synced = 0
    skipped = 0
    for item in raw:
        fb_id = item.get("id")
        message = item.get("message") or item.get("story") or ""
        if not fb_id or not message.strip():
            skipped += 1
            continue

        exists = (
            await db.execute(select(BlogPost).where(BlogPost.fb_post_id == fb_id))
        ).scalars().first()
        if exists:
            skipped += 1
            continue

        title = _derive_title(message)
        base_slug = slugify(title)[:200] or f"fb-{fb_id}"
        slug = base_slug
        i = 1
        while (await db.execute(select(BlogPost).where(BlogPost.slug == slug))).scalars().first():
            slug = f"{base_slug}-{i}"
            i += 1

        # Convert plain-text message to simple paragraphs.
        content = "".join(f"<p>{ln.strip()}</p>" for ln in message.split("\n") if ln.strip())

        post = BlogPost(
            slug=slug,
            title=title,
            excerpt=message.strip()[:280],
            content=content,
            cover_image=item.get("full_picture"),
            author_name="PrototypeBD",
            category_id=category.id if category else None,
            source="facebook",
            fb_post_id=fb_id,
            source_url=item.get("permalink_url"),
            is_published=True,
            published_at=_parse_time(item.get("created_time")),
            reading_minutes=reading_minutes(content),
        )
        db.add(post)
        synced += 1

    await db.commit()
    logger.info(
        "Facebook sync complete: synced=%d skipped=%d", synced, skipped,
        extra={"event": "fb_sync_done", "synced": synced, "skipped": skipped},
    )
    return SyncResult(
        ok=True,
        synced=synced,
        skipped=skipped,
        message=f"Synced {synced} new post(s), skipped {skipped}.",
    )
