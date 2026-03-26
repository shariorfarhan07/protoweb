from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_admin, require_inventory, require_super_admin
from app.repositories.brand import BrandRepository
from app.repositories.category import CategoryRepository
from app.repositories.filament_variant import FilamentVariantRepository
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.repositories.product_type import ProductTypeRepository
from app.repositories.user import UserRepository
from app.schemas.admin import AdminStatsOut, StockUpdate, UserAdminOut, UserUpdate
from app.schemas.brand import BrandCreate, BrandSchema, BrandUpdate
from app.schemas.category import CategoryCreate, CategorySchema, CategoryUpdate
from app.schemas.common import PaginatedResponse
from app.schemas.filament_variant import VariantCreate, VariantUpdate
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.product import FilamentVariantSchema, ProductCreate, ProductDetail, ProductList, ProductUpdate
from app.schemas.product_type import ProductTypeCreate, ProductTypeSchema, ProductTypeUpdate
from app.services.admin import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


def get_admin_service(db: AsyncSession = Depends(get_db)) -> AdminService:
    return AdminService(UserRepository(db), OrderRepository(db), ProductRepository(db))


# ── Dashboard ─────────────────────────────────────────────────────────────────

@router.get("/stats", response_model=AdminStatsOut, dependencies=[require_admin])
async def get_stats(service: AdminService = Depends(get_admin_service)) -> AdminStatsOut:
    return await service.get_stats()


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users", response_model=PaginatedResponse[UserAdminOut], dependencies=[require_admin])
async def list_users(
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: AdminService = Depends(get_admin_service),
) -> PaginatedResponse[UserAdminOut]:
    return await service.list_users(role=role, is_active=is_active, page=page, page_size=page_size)


@router.patch("/users/{user_id}", response_model=UserAdminOut, dependencies=[require_super_admin])
async def update_user(
    user_id: int,
    data: UserUpdate,
    service: AdminService = Depends(get_admin_service),
) -> UserAdminOut:
    return await service.update_user(user_id, data)


# ── Orders ────────────────────────────────────────────────────────────────────

@router.get("/orders", response_model=PaginatedResponse[OrderOut], dependencies=[require_admin])
async def list_orders(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: AdminService = Depends(get_admin_service),
) -> PaginatedResponse[OrderOut]:
    return await service.list_orders(status=status, page=page, page_size=page_size)


@router.patch("/orders/{order_id}/status", response_model=OrderOut, dependencies=[require_admin])
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    service: AdminService = Depends(get_admin_service),
) -> OrderOut:
    return await service.update_order_status(order_id, data)


# ── Inventory ─────────────────────────────────────────────────────────────────

@router.get("/inventory", response_model=PaginatedResponse[ProductList], dependencies=[require_inventory])
async def list_inventory(
    low_stock_only: bool = Query(False),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: AdminService = Depends(get_admin_service),
) -> PaginatedResponse[ProductList]:
    return await service.list_inventory(low_stock_only=low_stock_only, page=page, page_size=page_size)


@router.get("/products", response_model=PaginatedResponse[ProductList], dependencies=[require_inventory])
async def list_products_admin(
    search: Optional[str] = Query(None),
    product_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    low_stock: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[ProductList]:
    repo = ProductRepository(db)
    offset = (page - 1) * page_size
    items, total = await repo.list_admin(
        search=search,
        product_type=product_type,
        category_slug=category,
        is_active=is_active,
        is_featured=is_featured,
        low_stock=low_stock,
        offset=offset,
        limit=page_size,
    )
    return PaginatedResponse(
        items=[ProductList.model_validate(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, -(-total // page_size)),
    )


@router.get("/products/{product_id}", response_model=ProductDetail, dependencies=[require_inventory])
async def get_product(
    product_id: int,
    service: AdminService = Depends(get_admin_service),
) -> ProductDetail:
    return await service.get_product_by_id(product_id)


@router.post("/products", response_model=ProductDetail, status_code=201, dependencies=[require_inventory])
async def create_product(
    data: ProductCreate,
    service: AdminService = Depends(get_admin_service),
) -> ProductDetail:
    return await service.create_product(data)


@router.patch("/products/{product_id}", response_model=ProductDetail, dependencies=[require_inventory])
async def update_product(
    product_id: int,
    data: ProductUpdate,
    service: AdminService = Depends(get_admin_service),
) -> ProductDetail:
    return await service.update_product(product_id, data)


@router.delete("/products/{product_id}", dependencies=[require_admin])
async def delete_product(
    product_id: int,
    service: AdminService = Depends(get_admin_service),
) -> dict:
    return await service.delete_product(product_id)


@router.patch("/products/{product_id}/stock", dependencies=[require_inventory])
async def update_stock(
    product_id: int,
    data: StockUpdate,
    service: AdminService = Depends(get_admin_service),
) -> dict:
    return await service.update_stock(product_id, data)


# ── Color Variants ─────────────────────────────────────────────────────────────

@router.get(
    "/products/{product_id}/variants",
    response_model=List[FilamentVariantSchema],
    dependencies=[require_inventory],
)
async def list_variants(
    product_id: int,
    db: AsyncSession = Depends(get_db),
) -> List[FilamentVariantSchema]:
    repo = FilamentVariantRepository(db)
    return list(await repo.list_by_product(product_id))


@router.post(
    "/products/{product_id}/variants",
    response_model=FilamentVariantSchema,
    status_code=201,
    dependencies=[require_inventory],
)
async def create_variant(
    product_id: int,
    data: VariantCreate,
    db: AsyncSession = Depends(get_db),
) -> FilamentVariantSchema:
    repo = FilamentVariantRepository(db)
    return await repo.create(product_id, **data.model_dump())


@router.patch(
    "/variants/{variant_id}",
    response_model=FilamentVariantSchema,
    dependencies=[require_inventory],
)
async def update_variant(
    variant_id: int,
    data: VariantUpdate,
    db: AsyncSession = Depends(get_db),
) -> FilamentVariantSchema:
    repo = FilamentVariantRepository(db)
    variant = await repo.get_by_id(variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    return await repo.update(variant, **updates)


@router.delete(
    "/variants/{variant_id}",
    status_code=204,
    dependencies=[require_inventory],
)
async def delete_variant(
    variant_id: int,
    db: AsyncSession = Depends(get_db),
) -> None:
    repo = FilamentVariantRepository(db)
    variant = await repo.get_by_id(variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    await repo.delete(variant)


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategorySchema], dependencies=[require_admin])
async def list_categories(db: AsyncSession = Depends(get_db)) -> List[CategorySchema]:
    repo = CategoryRepository(db)
    cats = await repo.get_all_categories()
    return list(cats)


@router.post("/categories", response_model=CategorySchema, status_code=201, dependencies=[require_super_admin])
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)) -> CategorySchema:
    repo = CategoryRepository(db)
    existing = await repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(status_code=409, detail="A category with this slug already exists")
    return await repo.create_category(**data.model_dump())


@router.patch("/categories/{category_id}", response_model=CategorySchema, dependencies=[require_super_admin])
async def update_category(
    category_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db)
) -> CategorySchema:
    repo = CategoryRepository(db)
    cat = await repo.get_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "slug" in updates and updates["slug"] != cat.slug:
        existing = await repo.get_by_slug(updates["slug"])
        if existing:
            raise HTTPException(status_code=409, detail="A category with this slug already exists")
    return await repo.update_category(cat, **updates)


@router.delete("/categories/{category_id}", status_code=204, dependencies=[require_super_admin])
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)) -> None:
    repo = CategoryRepository(db)
    cat = await repo.get_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    await repo.delete_category(cat)


# ── Brands ────────────────────────────────────────────────────────────────────

@router.get("/brands", response_model=List[BrandSchema], dependencies=[require_admin])
async def list_brands(db: AsyncSession = Depends(get_db)) -> List[BrandSchema]:
    repo = BrandRepository(db)
    brands = await repo.get_all_brands()
    return list(brands)


@router.post("/brands", response_model=BrandSchema, status_code=201, dependencies=[require_super_admin])
async def create_brand(data: BrandCreate, db: AsyncSession = Depends(get_db)) -> BrandSchema:
    repo = BrandRepository(db)
    existing = await repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(status_code=409, detail="A brand with this slug already exists")
    return await repo.create_brand(**data.model_dump())


@router.patch("/brands/{brand_id}", response_model=BrandSchema, dependencies=[require_super_admin])
async def update_brand(
    brand_id: int, data: BrandUpdate, db: AsyncSession = Depends(get_db)
) -> BrandSchema:
    repo = BrandRepository(db)
    brand = await repo.get_by_id(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "slug" in updates and updates["slug"] != brand.slug:
        existing = await repo.get_by_slug(updates["slug"])
        if existing:
            raise HTTPException(status_code=409, detail="A brand with this slug already exists")
    return await repo.update_brand(brand, **updates)


@router.delete("/brands/{brand_id}", status_code=204, dependencies=[require_super_admin])
async def delete_brand(brand_id: int, db: AsyncSession = Depends(get_db)) -> None:
    repo = BrandRepository(db)
    brand = await repo.get_by_id(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    await repo.delete_brand(brand)


# ── Product Types ─────────────────────────────────────────────────────────────

@router.get("/product-types", response_model=List[ProductTypeSchema], dependencies=[require_admin])
async def list_product_types(db: AsyncSession = Depends(get_db)) -> List[ProductTypeSchema]:
    repo = ProductTypeRepository(db)
    return list(await repo.get_all())


@router.post("/product-types", response_model=ProductTypeSchema, status_code=201, dependencies=[require_super_admin])
async def create_product_type(data: ProductTypeCreate, db: AsyncSession = Depends(get_db)) -> ProductTypeSchema:
    repo = ProductTypeRepository(db)
    existing = await repo.get_by_value(data.value)
    if existing:
        raise HTTPException(status_code=409, detail="A product type with this value already exists")
    return await repo.create_product_type(**data.model_dump())


@router.patch("/product-types/{pt_id}", response_model=ProductTypeSchema, dependencies=[require_super_admin])
async def update_product_type(
    pt_id: int, data: ProductTypeUpdate, db: AsyncSession = Depends(get_db)
) -> ProductTypeSchema:
    repo = ProductTypeRepository(db)
    pt = await repo.get_by_id(pt_id)
    if not pt:
        raise HTTPException(status_code=404, detail="Product type not found")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if "value" in updates and updates["value"] != pt.value:
        existing = await repo.get_by_value(updates["value"])
        if existing:
            raise HTTPException(status_code=409, detail="A product type with this value already exists")
    return await repo.update_product_type(pt, **updates)


@router.delete("/product-types/{pt_id}", status_code=204, dependencies=[require_super_admin])
async def delete_product_type(pt_id: int, db: AsyncSession = Depends(get_db)) -> None:
    repo = ProductTypeRepository(db)
    pt = await repo.get_by_id(pt_id)
    if not pt:
        raise HTTPException(status_code=404, detail="Product type not found")
    await repo.delete_product_type(pt)
