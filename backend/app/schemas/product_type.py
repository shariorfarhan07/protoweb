from typing import Optional

from pydantic import BaseModel


class ProductTypeSchema(BaseModel):
    id: int
    value: str
    label: str
    is_active: bool

    model_config = {"from_attributes": True}


class ProductTypeCreate(BaseModel):
    value: str
    label: str
    is_active: bool = True


class ProductTypeUpdate(BaseModel):
    value: Optional[str] = None
    label: Optional[str] = None
    is_active: Optional[bool] = None
