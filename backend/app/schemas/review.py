from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

model_config_orm = {"from_attributes": True}


class ReviewCreate(BaseModel):
    reviewer_name: str = Field(..., min_length=2, max_length=120)
    reviewer_title: Optional[str] = Field(None, max_length=160)
    avatar_url: Optional[str] = Field(None, max_length=512)
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=10)
    is_active: bool = True
    sort_order: int = 0


class ReviewUpdate(BaseModel):
    reviewer_name: Optional[str] = Field(None, min_length=2, max_length=120)
    reviewer_title: Optional[str] = Field(None, max_length=160)
    avatar_url: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    content: Optional[str] = Field(None, min_length=10)
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None


class ReviewOut(BaseModel):
    model_config = model_config_orm

    id: int
    reviewer_name: str
    reviewer_title: Optional[str]
    avatar_url: Optional[str]
    rating: int
    content: str
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
