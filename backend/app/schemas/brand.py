from typing import Optional

from pydantic import BaseModel


class BrandSchema(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

    model_config = {"from_attributes": True}


class BrandCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None


class BrandUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
