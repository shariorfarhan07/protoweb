from typing import Optional

from pydantic import BaseModel

from app.schemas.auth import UserPublic


class UserAdminOut(UserPublic):
    pass


class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None


class StockUpdate(BaseModel):
    stock_qty: int


class AdminStatsOut(BaseModel):
    total_orders: int
    pending_orders: int
    total_revenue: float
    total_users: int
    low_stock_count: int
