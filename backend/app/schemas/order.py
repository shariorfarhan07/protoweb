from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, model_validator


class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    postal: str


class OrderItemCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int


class CreateOrderRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str = "cod"
    items: list[OrderItemCreate]
    notes: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    product_name: str
    product_sku: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal: float

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def _coerce(cls, data: Any) -> Any:
        if hasattr(data, "unit_price"):
            return {
                "id": data.id,
                "product_id": data.product_id,
                "variant_id": data.variant_id,
                "product_name": data.product_name,
                "product_sku": data.product_sku,
                "unit_price": float(data.unit_price),
                "quantity": data.quantity,
                "subtotal": float(data.subtotal),
            }
        return data


class OrderOut(BaseModel):
    id: int
    order_number: str
    status: str
    total_price: float
    shipping_address: dict
    payment_method: str
    payment_status: str
    notes: Optional[str] = None
    items: list[OrderItemOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def _coerce(cls, data: Any) -> Any:
        if hasattr(data, "total_price"):
            return {
                "id": data.id,
                "order_number": data.order_number,
                "status": data.status,
                "total_price": float(data.total_price),
                "shipping_address": data.shipping_address,
                "payment_method": data.payment_method,
                "payment_status": data.payment_status,
                "notes": data.notes,
                "items": data.items,
                "created_at": data.created_at,
                "updated_at": data.updated_at,
            }
        return data


class OrderStatusUpdate(BaseModel):
    status: str
