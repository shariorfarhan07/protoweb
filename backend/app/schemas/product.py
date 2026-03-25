from typing import Any, Optional

from pydantic import BaseModel, field_validator, model_validator


PRODUCT_TYPES = {"printer", "filament", "cnc", "printed"}


class ProductCreate(BaseModel):
    name: str
    short_desc: Optional[str] = None
    long_desc: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    stock_qty: int = 0
    product_type: str
    is_featured: bool = False
    is_active: bool = True
    specifications: Optional[dict[str, Any]] = None
    meta_title: Optional[str] = None
    meta_desc: Optional[str] = None
    weight_grams: Optional[int] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    image_urls: list[str] = []

    @field_validator("product_type")
    @classmethod
    def validate_product_type(cls, v: str) -> str:
        if v not in PRODUCT_TYPES:
            raise ValueError(f"product_type must be one of: {', '.join(PRODUCT_TYPES)}")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        if v < 0:
            raise ValueError("price must be >= 0")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    short_desc: Optional[str] = None
    long_desc: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    stock_qty: Optional[int] = None
    product_type: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    specifications: Optional[dict[str, Any]] = None
    meta_title: Optional[str] = None
    meta_desc: Optional[str] = None
    weight_grams: Optional[int] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    image_urls: Optional[list[str]] = None


class ImageSchema(BaseModel):
    id: int
    url: str
    alt_text: Optional[str] = None
    sort_order: int = 0
    is_primary: bool = False

    model_config = {"from_attributes": True}


class FilamentVariantSchema(BaseModel):
    id: int
    color_name: Optional[str] = None
    color_hex: Optional[str] = None
    material: Optional[str] = None
    diameter_mm: Optional[float] = None
    weight_grams: Optional[int] = None
    price_delta: float = 0.0
    sku: Optional[str] = None
    stock_qty: int = 0
    image_url: Optional[str] = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class CategoryRef(BaseModel):
    name: str
    slug: str

    model_config = {"from_attributes": True}


class BrandRef(BaseModel):
    name: str
    slug: str

    model_config = {"from_attributes": True}


class ProductList(BaseModel):
    id: int
    slug: str
    name: str
    short_desc: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    product_type: str
    stock_qty: int
    is_featured: bool = False
    primary_image: Optional[str] = None
    category: Optional[CategoryRef] = None
    brand: Optional[BrandRef] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def _set_primary_image(cls, data: Any) -> Any:
        # If coming from ORM object, extract primary image URL
        if hasattr(data, "images"):
            images = data.images
            if images:
                primary = next((img for img in images if img.is_primary), images[0])
                # We can't directly set attributes on ORM objects, so build a dict
                return {
                    "id": data.id,
                    "slug": data.slug,
                    "name": data.name,
                    "short_desc": data.short_desc,
                    "price": float(data.price),
                    "compare_price": float(data.compare_price) if data.compare_price else None,
                    "product_type": data.product_type,
                    "stock_qty": data.stock_qty,
                    "is_featured": data.is_featured,
                    "primary_image": primary.url,
                    "category": data.category,
                    "brand": data.brand,
                }
        return data


class ProductDetail(BaseModel):
    id: int
    slug: str
    name: str
    short_desc: Optional[str] = None
    long_desc: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    product_type: str
    stock_qty: int
    is_featured: bool = False
    is_active: bool = True
    specifications: Optional[dict[str, Any]] = None
    meta_title: Optional[str] = None
    meta_desc: Optional[str] = None
    weight_grams: Optional[int] = None
    images: list[ImageSchema] = []
    filament_variants: list[FilamentVariantSchema] = []
    category: Optional[CategoryRef] = None
    brand: Optional[BrandRef] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def _coerce_numeric(cls, data: Any) -> Any:
        if hasattr(data, "price"):
            return {
                "id": data.id,
                "slug": data.slug,
                "name": data.name,
                "short_desc": data.short_desc,
                "long_desc": data.long_desc,
                "price": float(data.price),
                "compare_price": float(data.compare_price) if data.compare_price else None,
                "sku": data.sku,
                "product_type": data.product_type,
                "stock_qty": data.stock_qty,
                "is_featured": data.is_featured,
                "is_active": data.is_active,
                "specifications": data.specifications,
                "meta_title": data.meta_title,
                "meta_desc": data.meta_desc,
                "weight_grams": data.weight_grams,
                "images": data.images,
                "filament_variants": data.filament_variants,
                "category": data.category,
                "brand": data.brand,
            }
        return data
