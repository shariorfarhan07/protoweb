import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage


async def _seed(db: AsyncSession) -> Product:
    cat = Category(name="3D Printers", slug="3d-printers")
    brand = Brand(name="Bambu Lab", slug="bambu-lab")
    db.add_all([cat, brand])
    await db.flush()

    product = Product(
        slug="bambu-p1s",
        name="Bambu P1S",
        price=95000,
        product_type="printer",
        stock_qty=10,
        is_active=True,
        category_id=cat.id,
        brand_id=brand.id,
        specifications={"Build Volume": "256x256x256mm", "Speed": "600mm/s"},
    )
    db.add(product)
    await db.flush()

    db.add(ProductImage(product_id=product.id, url="/images/p1s.png", is_primary=True))
    await db.commit()
    return product


@pytest.mark.asyncio
async def test_list_products_empty(client: AsyncClient):
    resp = await client.get("/api/v1/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_list_products_with_data(client: AsyncClient, db: AsyncSession):
    await _seed(db)
    resp = await client.get("/api/v1/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "bambu-p1s"
    assert data["items"][0]["primary_image"] == "/images/p1s.png"


@pytest.mark.asyncio
async def test_get_product_by_slug(client: AsyncClient, db: AsyncSession):
    await _seed(db)
    resp = await client.get("/api/v1/products/bambu-p1s")
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "bambu-p1s"
    assert data["specifications"]["Speed"] == "600mm/s"


@pytest.mark.asyncio
async def test_get_product_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/products/nonexistent-slug")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_filter_by_product_type(client: AsyncClient, db: AsyncSession):
    await _seed(db)
    resp = await client.get("/api/v1/products?product_type=filament")
    assert resp.status_code == 200
    assert resp.json()["total"] == 0

    resp2 = await client.get("/api/v1/products?product_type=printer")
    assert resp2.json()["total"] == 1


@pytest.mark.asyncio
async def test_search_products(client: AsyncClient, db: AsyncSession):
    await _seed(db)
    resp = await client.get("/api/v1/search?q=bambu")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert results[0]["name"] == "Bambu P1S"


@pytest.mark.asyncio
async def test_search_too_short(client: AsyncClient):
    resp = await client.get("/api/v1/search?q=a")
    assert resp.status_code == 422  # validation error — min_length=2
