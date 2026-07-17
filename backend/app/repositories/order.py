from typing import Optional, Sequence

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem, OrderStatus
from app.repositories.base import BaseRepository

_ACTIVE = Order.status.not_in([OrderStatus.cancelled])


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
        search: Optional[str] = None,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Order], int]:
        q = select(Order)
        if user_id is not None:
            q = q.where(Order.user_id == user_id)
        if status:
            q = q.where(Order.status == status)
        if search and search.strip():
            term = search.strip()
            like = f"%{term.lower()}%"
            # shipping_address is JSON (stored as text in SQLite) — a LIKE over the
            # serialized text matches customer name, phone, email, etc.
            conds = [
                func.lower(Order.order_number).like(like),
                func.lower(cast(Order.shipping_address, String)).like(like),
            ]
            if term.isdigit():
                conds.append(Order.id == int(term))
            q = q.where(or_(*conds))

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

    async def revenue_by_month(self) -> list[tuple[str, float, int]]:
        """Monthly revenue + order count (excludes cancelled). Returns [(YYYY-MM, revenue, count)]."""
        month = func.strftime("%Y-%m", Order.created_at)
        q = (
            select(month.label("m"), func.sum(Order.total_price), func.count())
            .where(Order.status.not_in([OrderStatus.cancelled]))
            .group_by("m")
            .order_by("m")
        )
        rows = (await self.session.execute(q)).all()
        return [(r[0], float(r[1] or 0), int(r[2])) for r in rows]

    async def units_by_month(self) -> list[tuple[str, int]]:
        """Units sold per month (inventory movement, excludes cancelled). Returns [(YYYY-MM, units)]."""
        month = func.strftime("%Y-%m", Order.created_at)
        q = (
            select(month.label("m"), func.coalesce(func.sum(OrderItem.quantity), 0))
            .join(Order, OrderItem.order_id == Order.id)
            .where(Order.status.not_in([OrderStatus.cancelled]))
            .group_by("m")
            .order_by("m")
        )
        rows = (await self.session.execute(q)).all()
        return [(r[0], int(r[1] or 0)) for r in rows]

    async def list_unfulfilled(self) -> Sequence[Order]:
        """Open orders (pending/confirmed/processing) oldest-first — i.e. still awaiting fulfilment."""
        open_statuses = [OrderStatus.pending, OrderStatus.confirmed, OrderStatus.processing]
        q = (
            select(Order)
            .where(Order.status.in_(open_statuses))
            .options(*_order_options())
            .order_by(Order.created_at.asc())
        )
        return (await self.session.execute(q)).scalars().all()

    async def status_breakdown(self) -> list[tuple[str, int]]:
        """Order counts grouped by status. Returns [(status, count)]."""
        q = select(Order.status, func.count()).group_by(Order.status)
        rows = (await self.session.execute(q)).all()
        return [(str(r[0]), int(r[1])) for r in rows]

    # ── Date-range reporting ────────────────────────────────────────────────
    # `start`/`end` are inclusive date strings "YYYY-MM-DD" compared on the
    # order's calendar date.

    def _in_range(self, start: str, end: str):
        return func.date(Order.created_at).between(start, end)

    async def report_summary(self, start: str, end: str) -> tuple[float, int, int]:
        """Returns (revenue, order_count, units_sold) for non-cancelled orders in range."""
        rev_q = select(
            func.coalesce(func.sum(Order.total_price), 0),
            func.count(Order.id),
        ).where(self._in_range(start, end), _ACTIVE)
        revenue, orders = (await self.session.execute(rev_q)).one()

        units_q = (
            select(func.coalesce(func.sum(OrderItem.quantity), 0))
            .join(Order, OrderItem.order_id == Order.id)
            .where(self._in_range(start, end), _ACTIVE)
        )
        units = (await self.session.execute(units_q)).scalar_one()
        return float(revenue or 0), int(orders or 0), int(units or 0)

    async def report_daily(self, start: str, end: str) -> list[tuple[str, float, int]]:
        day = func.date(Order.created_at)
        q = (
            select(day.label("d"), func.sum(Order.total_price), func.count())
            .where(self._in_range(start, end), _ACTIVE)
            .group_by("d")
            .order_by("d")
        )
        rows = (await self.session.execute(q)).all()
        return [(str(r[0]), float(r[1] or 0), int(r[2])) for r in rows]

    async def report_by_status(self, start: str, end: str) -> list[tuple[str, int, float]]:
        q = (
            select(Order.status, func.count(), func.coalesce(func.sum(Order.total_price), 0))
            .where(self._in_range(start, end))
            .group_by(Order.status)
        )
        rows = (await self.session.execute(q)).all()
        return [(str(r[0]), int(r[1]), float(r[2] or 0)) for r in rows]

    async def report_top_products(
        self, start: str, end: str, limit: int = 10
    ) -> list[tuple[str, int, float]]:
        q = (
            select(
                OrderItem.product_name,
                func.sum(OrderItem.quantity),
                func.sum(OrderItem.subtotal),
            )
            .join(Order, OrderItem.order_id == Order.id)
            .where(self._in_range(start, end), _ACTIVE)
            .group_by(OrderItem.product_name)
            .order_by(func.sum(OrderItem.subtotal).desc())
            .limit(limit)
        )
        rows = (await self.session.execute(q)).all()
        return [(str(r[0]), int(r[1] or 0), float(r[2] or 0)) for r in rows]
