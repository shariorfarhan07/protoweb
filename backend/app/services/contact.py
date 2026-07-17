from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.contact import ContactMessage, NewsletterSubscriber
from app.schemas.contact import ContactMessageCreate

logger = get_logger("app.services.contact")

# Public submissions are capped per IP within this rolling window.
RATE_LIMIT_WINDOW = timedelta(days=1)
MAX_SUBMISSIONS_PER_WINDOW = 2


def _too_many(retry_after_s: int, what: str) -> HTTPException:
    hours = max(1, round(retry_after_s / 3600))
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"You've reached the limit of {MAX_SUBMISSIONS_PER_WINDOW} {what} per day. Please try again in about {hours} hour(s).",
        headers={"Retry-After": str(max(1, retry_after_s))},
    )


class ContactService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _enforce_rate_limit(self, model, ip_address: Optional[str], what: str) -> None:
        """Reject if this IP has made >= MAX_SUBMISSIONS_PER_WINDOW posts in the window."""
        if not ip_address:
            return
        cutoff = datetime.utcnow() - RATE_LIMIT_WINDOW
        rows = (
            await self.db.execute(
                select(model.created_at)
                .where(model.ip_address == ip_address, model.created_at >= cutoff)
                .order_by(model.created_at.asc())
            )
        ).scalars().all()
        if len(rows) >= MAX_SUBMISSIONS_PER_WINDOW:
            # Window frees up once the oldest counted submission ages out.
            retry_after = int((rows[0] + RATE_LIMIT_WINDOW - datetime.utcnow()).total_seconds())
            logger.info("Rate-limited %s from ip=%s (%d in window)", what, ip_address, len(rows))
            raise _too_many(retry_after, what)

    # ── Contact messages ──────────────────────────────────────────────────────

    async def create_message(
        self, data: ContactMessageCreate, ip_address: Optional[str] = None
    ) -> ContactMessage:
        await self._enforce_rate_limit(ContactMessage, ip_address, "messages")
        message = data.message.strip()
        name = data.name.strip()[:120]
        if not message or not name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Name and message are required.",
            )
        msg = ContactMessage(
            name=name,
            email=str(data.email),
            phone=(data.phone or "").strip()[:40] or None,
            message=message,
            is_read=False,
            ip_address=ip_address,
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        logger.info(
            "Contact message received: id=%d from=%s", msg.id, msg.email,
            extra={"event": "contact_message", "message_id": msg.id},
        )
        return msg

    async def list_messages(self, unread_only: bool = False) -> list[ContactMessage]:
        q = select(ContactMessage)
        if unread_only:
            q = q.where(ContactMessage.is_read.is_(False))
        q = q.order_by(ContactMessage.created_at.desc())
        return list((await self.db.execute(q)).scalars().all())

    async def unread_count(self) -> int:
        q = select(func.count()).select_from(ContactMessage).where(ContactMessage.is_read.is_(False))
        return int((await self.db.execute(q)).scalar_one())

    async def set_read(self, message_id: int, is_read: bool) -> ContactMessage:
        msg = await self.db.get(ContactMessage, message_id)
        if not msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        msg.is_read = is_read
        await self.db.commit()
        await self.db.refresh(msg)
        return msg

    async def delete_message(self, message_id: int) -> None:
        msg = await self.db.get(ContactMessage, message_id)
        if not msg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        await self.db.delete(msg)
        await self.db.commit()

    # ── Newsletter ────────────────────────────────────────────────────────────

    async def subscribe(
        self, email: str, source: Optional[str] = "footer", ip_address: Optional[str] = None
    ) -> tuple[bool, str]:
        """Idempotent subscribe. Returns (already_subscribed, message)."""
        email = email.strip().lower()
        existing = (
            await self.db.execute(
                select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
            )
        ).scalars().first()
        if existing:
            if existing.is_active:
                return True, "You're already subscribed — thanks!"
            existing.is_active = True  # re-subscribe a previously removed email
            await self.db.commit()
            return False, "Welcome back! You're subscribed again."

        # Only new sign-ups count against the per-IP daily limit.
        await self._enforce_rate_limit(NewsletterSubscriber, ip_address, "sign-ups")
        self.db.add(NewsletterSubscriber(email=email, source=source, is_active=True, ip_address=ip_address))
        await self.db.commit()
        logger.info("Newsletter subscribe: %s", email, extra={"event": "newsletter_subscribe"})
        return False, "Thanks for subscribing!"

    async def list_subscribers(self, active_only: bool = False) -> list[NewsletterSubscriber]:
        q = select(NewsletterSubscriber)
        if active_only:
            q = q.where(NewsletterSubscriber.is_active.is_(True))
        q = q.order_by(NewsletterSubscriber.created_at.desc())
        return list((await self.db.execute(q)).scalars().all())

    async def delete_subscriber(self, subscriber_id: int) -> None:
        sub = await self.db.get(NewsletterSubscriber, subscriber_id)
        if not sub:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscriber not found")
        await self.db.delete(sub)
        await self.db.commit()
