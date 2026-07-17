from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ── Contact messages ──────────────────────────────────────────────────────────

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    is_read: bool
    created_at: datetime


# ── Newsletter ────────────────────────────────────────────────────────────────

class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr


class NewsletterSubscribeResult(BaseModel):
    ok: bool
    message: str
    already_subscribed: bool = False


class NewsletterSubscriberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    is_active: bool
    source: Optional[str] = None
    created_at: datetime
