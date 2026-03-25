import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger("app.routers.orders")

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.common import PaginatedResponse
from app.schemas.order import CreateOrderRequest, OrderOut
from app.services.order import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])


def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(OrderRepository(db), ProductRepository(db))


@router.post("", response_model=OrderOut, status_code=201)
async def create_order(
    data: CreateOrderRequest,
    service: OrderService = Depends(get_order_service),
    current_user=Depends(get_current_user_optional),
) -> OrderOut:
    """Create an order. Works for both authenticated users and guests."""
    logger.debug("POST /orders — %d item(s), user=%s",
                 len(data.items), current_user.id if current_user else "guest")
    return await service.create_order(data, user=current_user)


@router.get("/my", response_model=PaginatedResponse[OrderOut])
async def my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    service: OrderService = Depends(get_order_service),
    current_user=Depends(get_current_user),
) -> PaginatedResponse[OrderOut]:
    return await service.list_user_orders(current_user.id, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: int,
    service: OrderService = Depends(get_order_service),
    current_user=Depends(get_current_user_optional),
) -> OrderOut:
    return await service.get_order(order_id, user=current_user)
