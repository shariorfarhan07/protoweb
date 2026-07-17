import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_permission
from app.core.logging import get_logger
from app.models.review import Review, ReviewRequest
from app.repositories.review import ReviewRepository, ReviewRequestRepository
from app.schemas.review import (
    ReviewCreate,
    ReviewOut,
    ReviewRequestCreate,
    ReviewRequestOut,
    ReviewRequestPublic,
    ReviewSubmit,
    ReviewUpdate,
)

logger = get_logger("app.routers.reviews")

router = APIRouter(prefix="/reviews", tags=["reviews"])


def _repo(db: AsyncSession = Depends(get_db)) -> ReviewRepository:
    return ReviewRepository(Review, db)


def _req_repo(db: AsyncSession = Depends(get_db)) -> ReviewRequestRepository:
    return ReviewRequestRepository(ReviewRequest, db)


# ── Public ─────────────────────────────────────────────────────────────────

@router.get("", response_model=list[ReviewOut])
async def list_active_reviews(repo: ReviewRepository = Depends(_repo)) -> list[ReviewOut]:
    """Return all active reviews ordered by sort_order for the home page carousel."""
    reviews = await repo.list_active()
    return [ReviewOut.model_validate(r) for r in reviews]


# ── Admin CRUD ──────────────────────────────────────────────────────────────

@router.get("/admin", response_model=list[ReviewOut], dependencies=[require_permission("reviews.moderate")])
async def list_all_reviews(repo: ReviewRepository = Depends(_repo)) -> list[ReviewOut]:
    reviews = await repo.list_all()
    return [ReviewOut.model_validate(r) for r in reviews]


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED,
             dependencies=[require_permission("reviews.moderate")])
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


@router.patch("/{review_id}", response_model=ReviewOut, dependencies=[require_permission("reviews.moderate")])
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
               dependencies=[require_permission("reviews.moderate")])
async def delete_review(
    review_id: int,
    repo: ReviewRepository = Depends(_repo),
) -> None:
    review = await repo.get_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    await repo.delete(review)
    logger.info("Review deleted: id=%d", review_id, extra={"event": "review_deleted", "review_id": review_id})


# ── Admin: approval ──────────────────────────────────────────────────────────

@router.patch("/{review_id}/approve", response_model=ReviewOut,
              dependencies=[require_permission("reviews.moderate")])
async def approve_review(review_id: int, repo: ReviewRepository = Depends(_repo)) -> ReviewOut:
    review = await repo.get_by_id(review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    review.is_approved = True
    review.is_active = True
    review = await repo.update(review)
    logger.info("Review approved: id=%d", review_id, extra={"event": "review_approved", "review_id": review_id})
    return ReviewOut.model_validate(review)


# ── Admin: one-time review request links ─────────────────────────────────────

@router.post("/requests", response_model=ReviewRequestOut, status_code=status.HTTP_201_CREATED,
             dependencies=[require_permission("reviews.moderate")])
async def create_review_request(
    data: ReviewRequestCreate, repo: ReviewRequestRepository = Depends(_req_repo)
) -> ReviewRequestOut:
    req = ReviewRequest(
        token=secrets.token_urlsafe(24),
        customer_name=(data.customer_name or None),
        customer_email=(data.customer_email or None),
        note=(data.note or None),
    )
    req = await repo.create(req)
    logger.info("Review request created: id=%d token=%s…", req.id, req.token[:8],
                extra={"event": "review_request_created", "request_id": req.id})
    return ReviewRequestOut.model_validate(req)


@router.get("/requests", response_model=list[ReviewRequestOut],
            dependencies=[require_permission("reviews.moderate")])
async def list_review_requests(repo: ReviewRequestRepository = Depends(_req_repo)) -> list[ReviewRequestOut]:
    return [ReviewRequestOut.model_validate(r) for r in await repo.list_all()]


# ── Public: a customer opening their one-time link ───────────────────────────

@router.get("/request/{token}", response_model=ReviewRequestPublic)
async def check_review_request(token: str, repo: ReviewRequestRepository = Depends(_req_repo)) -> ReviewRequestPublic:
    req = await repo.get_by_token(token)
    if not req:
        return ReviewRequestPublic(valid=False, used=False)
    return ReviewRequestPublic(valid=True, used=req.is_used, customer_name=req.customer_name)


@router.post("/request/{token}", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def submit_review_via_token(
    token: str, data: ReviewSubmit, db: AsyncSession = Depends(get_db)
) -> ReviewOut:
    req_repo = ReviewRequestRepository(ReviewRequest, db)
    review_repo = ReviewRepository(Review, db)
    req = await req_repo.get_by_token(token)
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid review link")
    if req.is_used:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="This review link has already been used")
    review = Review(
        reviewer_name=data.reviewer_name.strip(),
        reviewer_title=(data.reviewer_title or None),
        rating=data.rating,
        content=data.content.strip(),
        is_active=True,
        is_approved=False,   # awaits admin approval
        source="customer",
    )
    review = await review_repo.create(review)
    req.is_used = True
    req.review_id = review.id
    await req_repo.update(req)
    logger.info("Customer review submitted via token (pending approval): review_id=%d", review.id,
                extra={"event": "review_submitted", "review_id": review.id})
    return ReviewOut.model_validate(review)
