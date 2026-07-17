from typing import Optional

from pydantic import BaseModel, Field


class PermissionOut(BaseModel):
    key: str
    label: str
    group: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class RoleOut(BaseModel):
    id: int
    slug: str
    name: str
    description: Optional[str] = None
    is_system: bool
    is_superuser: bool
    sort_order: int
    permissions: list[str]      # permission keys
    user_count: int = 0


class RoleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: Optional[str] = None
    permissions: list[str] = []


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    description: Optional[str] = None
    permissions: Optional[list[str]] = None
