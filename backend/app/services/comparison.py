from fastapi import HTTPException, status

from app.repositories.product import ProductRepository
from app.schemas.comparison import CompareRequest, CompareResponse, CompareRow


class ComparisonService:
    def __init__(self, repo: ProductRepository) -> None:
        self.repo = repo

    async def compare(self, request: CompareRequest) -> CompareResponse:
        products = await self.repo.get_by_ids(request.product_ids)

        if not products:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No products found for the given IDs",
            )

        # Enforce printer-only comparison
        non_printers = [p for p in products if p.product_type not in ("printer", "cnc")]
        if non_printers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Comparison is only supported for 3D printers and CNC machines",
            )

        # Collect all unique specification keys across all products
        all_keys: set[str] = set()
        for p in products:
            if p.specifications:
                all_keys.update(p.specifications.keys())

        rows: list[CompareRow] = []
        for key in sorted(all_keys):
            values: dict[int, str] = {}
            for p in products:
                val = (p.specifications or {}).get(key)
                values[p.id] = str(val) if val is not None else "—"
            rows.append(CompareRow(attribute=key, values=values))

        product_summaries = [
            {
                "id": p.id,
                "name": p.name,
                "slug": p.slug,
                "price": float(p.price),
                "image": p.images[0].url if p.images else None,
                "brand": p.brand.name if p.brand else None,
            }
            for p in products
        ]

        return CompareResponse(products=product_summaries, rows=rows)
