from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_permission
from app.schemas.contact import (
    ContactMessageCreate,
    ContactMessageOut,
    NewsletterSubscribeRequest,
    NewsletterSubscribeResult,
    NewsletterSubscriberOut,
)
from app.services.contact import ContactService

router = APIRouter(tags=["contact"])


def _svc(db: AsyncSession = Depends(get_db)) -> ContactService:
    return ContactService(db)


def _client_ip(request: Request) -> Optional[str]:
    """Best-effort client IP — honor X-Forwarded-For (first hop) behind a proxy."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return request.client.host if request.client else None


# ── Public ──────────────────────────────────────────────────────────────────

@router.post("/contact", response_model=ContactMessageOut, status_code=status.HTTP_201_CREATED)
async def submit_contact_message(
    data: ContactMessageCreate, request: Request, svc: ContactService = Depends(_svc)
) -> ContactMessageOut:
    return ContactMessageOut.model_validate(
        await svc.create_message(data, ip_address=_client_ip(request))
    )


@router.post("/newsletter/subscribe", response_model=NewsletterSubscribeResult)
async def subscribe_newsletter(
    data: NewsletterSubscribeRequest, request: Request, svc: ContactService = Depends(_svc)
) -> NewsletterSubscribeResult:
    already, msg = await svc.subscribe(str(data.email), ip_address=_client_ip(request))
    return NewsletterSubscribeResult(ok=True, message=msg, already_subscribed=already)


# ── Admin: contact messages ───────────────────────────────────────────────────

@router.get(
    "/admin/contact-messages",
    response_model=list[ContactMessageOut],
    dependencies=[require_permission("messages.view")],
)
async def list_contact_messages(
    unread_only: bool = Query(False),
    svc: ContactService = Depends(_svc),
) -> list[ContactMessageOut]:
    return [ContactMessageOut.model_validate(m) for m in await svc.list_messages(unread_only)]


@router.patch(
    "/admin/contact-messages/{message_id}/read",
    response_model=ContactMessageOut,
    dependencies=[require_permission("messages.manage")],
)
async def mark_contact_message_read(
    message_id: int,
    is_read: bool = Query(True),
    svc: ContactService = Depends(_svc),
) -> ContactMessageOut:
    return ContactMessageOut.model_validate(await svc.set_read(message_id, is_read))


@router.delete(
    "/admin/contact-messages/{message_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[require_permission("messages.manage")],
)
async def delete_contact_message(
    message_id: int, svc: ContactService = Depends(_svc)
) -> None:
    await svc.delete_message(message_id)


# ── Admin: newsletter subscribers ──────────────────────────────────────────────

@router.get(
    "/admin/newsletter/subscribers",
    response_model=list[NewsletterSubscriberOut],
    dependencies=[require_permission("messages.view")],
)
async def list_newsletter_subscribers(
    svc: ContactService = Depends(_svc),
) -> list[NewsletterSubscriberOut]:
    return [NewsletterSubscriberOut.model_validate(s) for s in await svc.list_subscribers()]


@router.delete(
    "/admin/newsletter/subscribers/{subscriber_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[require_permission("messages.manage")],
)
async def delete_newsletter_subscriber(
    subscriber_id: int, svc: ContactService = Depends(_svc)
) -> None:
    await svc.delete_subscriber(subscriber_id)
