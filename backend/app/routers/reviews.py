from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_admin
from app.core.logging import get_logger
from app.models.review import Review
from app.repositories.review import ReviewRepository
from app.schemas.review import ReviewCreate, ReviewOut, ReviewUpdate

logger = get_logger("app.routers.reviews")

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _repo(db: AsyncSession = Depends(get_db)) -> ReviewRepository:
    return ReviewRepository(Review, db)


# ── Public ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ReviewOut])
async def list_active_reviews(repo: ReviewRepository = Depends(_repo)) -> list[ReviewOut]:
    """Return all active reviews ordered by sort_order for the home page carousel."""
    reviews = await repo.list_active()
    return [ReviewOut.model_validate(r) for r in reviews]


# ── Admin CRUD ──────────────────────────────────────────────────────────────

@router.get("/admin", response_model=list[ReviewOut], dependencies=[require_admin])
async def list_all_reviews(repo: ReviewRepository = Depends(_repo)) -> list[ReviewOut]:
    reviews = await repo.list_all()
    return [ReviewOut.model_validate(r) for r in reviews]


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED,
             dependencies=[require_admin])
async def create_review(
    data: ReviewCreate,
    repo: ReviewRepository = Depends(_repo),
) -> ReviewOut:
    review = Review(**data.model_dump())
    review = await repo.create(review)
    logger.info(
        "Review created: id=%d reviewer=%s rating=%d",
        review.id, review.reviewer_name, review.rating,
        extra={"event": "review_created", "review_id": review.id},
    )
    return ReviewOut.model_validate(review)


@router.patch("/{review_id}", response_model=ReviewOut, dependencies=[require_admin])
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    repo: ReviewRepository = Depends(_repo),
) -> ReviewOut:
    review = await repo.get_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(review, field, value)
    review = await repo.update(review)
    logger.info("Review updated: id=%d", review_id, extra={"event": "review_updated", "review_id": review_id})
    return ReviewOut.model_validate(review)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[require_admin])
async def delete_review(
    review_id: int,
    repo: ReviewRepository = Depends(_repo),
) -> None:
    review = await repo.get_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    await repo.delete(review)
    logger.info("Review deleted: id=%d", review_id, extra={"event": "review_deleted", "review_id": review_id})
