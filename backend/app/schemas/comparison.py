from typing import Optional

from pydantic import BaseModel, field_validator


class CompareRequest(BaseModel):
    product_ids: list[int]

    @field_validator("product_ids")
    @classmethod
    def validate_ids(cls, v: list[int]) -> list[int]:
        if len(v) < 2:
            raise ValueError("At least 2 product IDs are required for comparison")
        if len(v) > 4:
            raise ValueError("Cannot compare more than 4 products at once")
        if len(v) != len(set(v)):
            raise ValueError("Duplicate product IDs are not allowed")
        return v


class CompareProductSummary(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    image: Optional[str] = None


class CompareRow(BaseModel):
    attribute: str
    values: dict[int, str]  # product_id → value string


class CompareResponse(BaseModel):
    products: list[dict]
    rows: list[CompareRow]
