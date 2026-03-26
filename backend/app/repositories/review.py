from typing import Sequence

from sqlalchemy import select

from app.models.review import Review
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):

    async def list_active(self) -> Sequence[Review]:
        q = (
            select(Review)
            .where(Review.is_active == True)  # noqa: E712
            .order_by(Review.sort_order.asc(), Review.created_at.desc())
        )
        return (await self.session.execute(q)).scalars().all()

    async def list_all(self) -> Sequence[Review]:
        q = select(Review).order_by(Review.sort_order.asc(), Review.created_at.desc())
        return (await self.session.execute(q)).scalars().all()
