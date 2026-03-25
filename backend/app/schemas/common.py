import math
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel, computed_field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: Sequence[T]
    total: int
    page: int
    page_size: int

    @computed_field
    @property
    def total_pages(self) -> int:
        return math.ceil(self.total / self.page_size) if self.page_size else 0


class ErrorResponse(BaseModel):
    detail: str
