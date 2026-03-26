from typing import Optional

from pydantic import BaseModel, field_validator

MATERIALS = {"PLA", "ABS", "PETG", "TPU", "ASA", "SILK"}


class VariantCreate(BaseModel):
    color_name: str
    color_hex: str
    material: Optional[str] = None
    diameter_mm: Optional[float] = None
    weight_grams: Optional[int] = None
    price_delta: float = 0.0
    variant_price: Optional[float] = None
    sku: Optional[str] = None
    stock_qty: int = 0
    image_url: Optional[str] = None
    is_active: bool = True

    @field_validator("color_hex")
    @classmethod
    def validate_hex(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped.startswith("#") or len(stripped) not in (4, 7):
            raise ValueError("color_hex must be a valid hex color like #FF0000")
        return stripped

    @field_validator("material")
    @classmethod
    def validate_material(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in MATERIALS:
            raise ValueError(f"material must be one of: {', '.join(sorted(MATERIALS))}")
        return v


class VariantUpdate(BaseModel):
    color_name: Optional[str] = None
    color_hex: Optional[str] = None
    material: Optional[str] = None
    diameter_mm: Optional[float] = None
    weight_grams: Optional[float] = None
    price_delta: Optional[float] = None
    variant_price: Optional[float] = None
    sku: Optional[str] = None
    stock_qty: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

    @field_validator("color_hex")
    @classmethod
    def validate_hex(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip()
        if not stripped.startswith("#") or len(stripped) not in (4, 7):
            raise ValueError("color_hex must be a valid hex color like #FF0000")
        return stripped
