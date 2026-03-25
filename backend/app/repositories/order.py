from typing import Optional, Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatus
from app.repositories.base import BaseRepository


def _order_options():
    return [selectinload(Order.items), selectinload(Order.user)]


class OrderRepository(BaseRepository[Order]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Order, session)

    async def get_by_id_with_items(self, order_id: int) -> Optional[Order]:
        q = (
            select(Order)
            .where(Order.id == order_id)
            .options(*_order_options())
        )
        return (await self.session.execute(q)).scalars().first()

    async def get_by_order_number(self, order_number: str) -> Optional[Order]:
        q = (
            select(Order)
            .where(Order.order_number == order_number)
            .options(*_order_options())
        )
        return (await self.session.execute(q)).scalars().first()

    async def list_orders(
        self,
        *,
        user_id: Optional[int] = None,
        status: Optional[str] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Order], int]:
        q = select(Order)
        if user_id is not None:
            q = q.where(Order.user_id == user_id)
        if status:
            q = q.where(Order.status == status)

        count_q = select(func.count()).select_from(q.subquery())
        total: int = (await self.session.execute(count_q)).scalar_one()

        q = q.options(*_order_options()).order_by(Order.created_at.desc()).offset(offset).limit(limit)
        result = (await self.session.execute(q)).scalars().all()
        return result, total

    async def count_by_status(self, status: str) -> int:
        q = select(func.count()).select_from(Order).where(Order.status == status)
        return (await self.session.execute(q)).scalar_one()

    async def sum_revenue(self) -> float:
        from sqlalchemy import cast, Float
        q = select(func.sum(Order.total_price)).where(
            Order.status.not_in([OrderStatus.cancelled])
        )
        result = (await self.session.execute(q)).scalar_one()
        return float(result or 0)

    async def count_total(self) -> int:
        result = await self.session.execute(select(func.count()).select_from(Order))
        return result.scalar_one()
