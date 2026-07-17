from typing import Optional, Sequence

from sqlalchemy import select

from app.models.review import Review, ReviewRequest
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):

    async def list_active(self) -> Sequence[Review]:
        q = (
            select(Review)
            .where(Review.is_active == True, Review.is_approved == True)  # noqa: E712
            .order_by(Review.sort_order.asc(), Review.created_at.desc())
        )
        return (await self.session.execute(q)).scalars().all()

    async def list_all(self) -> Sequence[Review]:
        q = select(Review).order_by(Review.sort_order.asc(), Review.created_at.desc())
        return (await self.session.execute(q)).scalars().all()


class ReviewRequestRepository(BaseRepository[ReviewRequest]):

    async def get_by_token(self, token: str) -> Optional[ReviewRequest]:
        q = select(ReviewRequest).where(ReviewRequest.token == token)
        return (await self.session.execute(q)).scalars().first()

    async def list_all(self) -> Sequence[ReviewRequest]:
        q = select(ReviewRequest).order_by(ReviewRequest.created_at.desc())
        return (await self.session.execute(q)).scalars().all()
