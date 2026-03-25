from app.repositories.product import ProductRepository
from app.schemas.product import ProductList


class SearchService:
    def __init__(self, repo: ProductRepository) -> None:
        self.repo = repo

    async def search(self, query: str, limit: int = 20) -> list[ProductList]:
        if not query or len(query.strip()) < 2:
            return []
        products = await self.repo.full_text_search(query.strip(), limit=limit)
        return [ProductList.model_validate(p) for p in products]
