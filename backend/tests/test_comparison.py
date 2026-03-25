import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.brand import Brand
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage


async def _seed_printers(db: AsyncSession) -> tuple[int, int]:
    cat = Category(name="3D Printers", slug="3d-printers")
    brand = Brand(name="Bambu Lab", slug="bambu-lab")
    db.add_all([cat, brand])
    await db.flush()

    p1 = Product(
        slug="printer-a",
        name="Printer A",
        price=50000,
        product_type="printer",
        stock_qty=5,
        is_active=True,
        category_id=cat.id,
        brand_id=brand.id,
        specifications={"Speed": "300mm/s", "Build Volume": "220x220x250mm"},
    )
    p2 = Product(
        slug="printer-b",
        name="Printer B",
        price=95000,
        product_type="printer",
        stock_qty=5,
        is_active=True,
        category_id=cat.id,
        brand_id=brand.id,
        specifications={"Speed": "600mm/s", "Build Volume": "256x256x256mm", "Enclosure": "Yes"},
    )
    db.add_all([p1, p2])
    await db.flush()

    db.add(ProductImage(product_id=p1.id, url="/img/a.png", is_primary=True))
    db.add(ProductImage(product_id=p2.id, url="/img/b.png", is_primary=True))
    await db.commit()
    return p1.id, p2.id


@pytest.mark.asyncio
async def test_compare_two_printers(client: AsyncClient, db: AsyncSession):
    id1, id2 = await _seed_printers(db)
    resp = await client.post("/api/v1/compare", json={"product_ids": [id1, id2]})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["products"]) == 2
    # Should have merged keys: Speed, Build Volume, Enclosure
    keys = {r["attribute"] for r in data["rows"]}
    assert "Speed" in keys
    assert "Enclosure" in keys
    # Printer A does not have Enclosure — should show "—"
    enc_row = next(r for r in data["rows"] if r["attribute"] == "Enclosure")
    assert enc_row["values"][str(id1)] == "—"
    assert enc_row["values"][str(id2)] == "Yes"


@pytest.mark.asyncio
async def test_compare_requires_min_two(client: AsyncClient, db: AsyncSession):
    id1, _ = await _seed_printers(db)
    resp = await client.post("/api/v1/compare", json={"product_ids": [id1]})
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_compare_max_four(client: AsyncClient):
    resp = await client.post(
        "/api/v1/compare", json={"product_ids": [1, 2, 3, 4, 5]}
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_compare_no_duplicates(client: AsyncClient):
    resp = await client.post("/api/v1/compare", json={"product_ids": [1, 1]})
    assert resp.status_code == 422
