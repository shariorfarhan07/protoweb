from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.models.order import OrderStatus
from app.models.product import Product
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.repositories.user import UserRepository
from app.schemas.admin import AdminStatsOut, StockUpdate, UserAdminOut, UserUpdate
from app.schemas.auth import UserPublic
from app.schemas.common import PaginatedResponse
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductDetail, ProductList, ProductUpdate

logger = get_logger("app.services.admin")

LOW_STOCK_THRESHOLD = 5


class AdminService:
    def __init__(
        self,
        user_repo: UserRepository,
        order_repo: OrderRepository,
        product_repo: ProductRepository,
    ) -> None:
        self.user_repo = user_repo
        self.order_repo = order_repo
        self.product_repo = product_repo

    # ── Dashboard stats ──────────────────────────────────────────────────────

    async def get_stats(self) -> AdminStatsOut:
        total_orders = await self.order_repo.count_total()
        pending_orders = await self.order_repo.count_by_status(OrderStatus.pending)
        total_revenue = await self.order_repo.sum_revenue()
        total_users = await self.user_repo.count_total()

        # Count products with low stock
        q = select(func.count()).select_from(Product).where(
            Product.is_active == True,
            Product.stock_qty <= LOW_STOCK_THRESHOLD,
        )
        low_stock_count: int = (
            await self.product_repo.session.execute(q)
        ).scalar_one()

        return AdminStatsOut(
            total_orders=total_orders,
            pending_orders=pending_orders,
            total_revenue=total_revenue,
            total_users=total_users,
            low_stock_count=low_stock_count,
        )

    # ── User management ───────────────────────────────────────────────────────

    async def list_users(
        self,
        *,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[UserAdminOut]:
        offset = (page - 1) * page_size
        users, total = await self.user_repo.list_users(
            role=role, is_active=is_active, offset=offset, limit=page_size
        )
        return PaginatedResponse[UserAdminOut](
            items=[UserAdminOut.model_validate(u) for u in users],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_user(self, user_id: int, data: UserUpdate) -> UserAdminOut:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            logger.warning("update_user: user_id=%d not found", user_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        changes: dict = {}
        if data.is_active is not None:
            changes["is_active"] = {"from": user.is_active, "to": data.is_active}
            user.is_active = data.is_active
        if data.role is not None:
            from app.models.user import UserRole
            valid_roles = {r.value for r in UserRole}
            if data.role not in valid_roles:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}",
                )
            changes["role"] = {"from": user.role, "to": data.role}
            user.role = data.role
        user = await self.user_repo.update(user)
        logger.info(
            "Admin updated user id=%d email=%s changes=%s",
            user.id, user.email, changes,
            extra={"event": "admin_user_update", "user_id": user.id, "changes": changes},
        )
        return UserAdminOut.model_validate(user)

    # ── Order management ──────────────────────────────────────────────────────

    async def list_orders(
        self,
        *,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[OrderOut]:
        offset = (page - 1) * page_size
        orders, total = await self.order_repo.list_orders(
            status=status, offset=offset, limit=page_size
        )
        return PaginatedResponse[OrderOut](
            items=[OrderOut.model_validate(o) for o in orders],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_order_status(self, order_id: int, data: OrderStatusUpdate) -> OrderOut:
        valid_statuses = {s.value for s in OrderStatus}
        if data.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            )
        order = await self.order_repo.get_by_id_with_items(order_id)
        if not order:
            logger.warning("update_order_status: order_id=%d not found", order_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        prev_status = order.status
        order.status = data.status
        await self.order_repo.update(order)
        order = await self.order_repo.get_by_id_with_items(order.id)
        logger.info(
            "Admin updated order id=%d number=%s status: %s → %s",
            order_id, order.order_number, prev_status, data.status,
            extra={"event": "admin_order_status_update", "order_id": order_id,
                   "from_status": str(prev_status), "to_status": data.status},
        )
        return OrderOut.model_validate(order)

    # ── Inventory management ──────────────────────────────────────────────────

    async def list_inventory(
        self,
        *,
        low_stock_only: bool = False,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse:
        from sqlalchemy import select
        from app.models.product import Product
        from app.schemas.product import ProductList

        q = select(Product).where(Product.is_active == True)
        if low_stock_only:
            q = q.where(Product.stock_qty <= LOW_STOCK_THRESHOLD)

        count_q = select(func.count()).select_from(q.subquery())
        total: int = (
            await self.product_repo.session.execute(count_q)
        ).scalar_one()

        offset = (page - 1) * page_size
        from sqlalchemy.orm import selectinload
        q = (
            q.options(
                selectinload(Product.images),
                selectinload(Product.filament_variants),
                selectinload(Product.category),
                selectinload(Product.brand),
            )
            .order_by(Product.stock_qty.asc())
            .offset(offset)
            .limit(page_size)
        )
        result = (
            await self.product_repo.session.execute(q)
        ).scalars().unique().all()

        return PaginatedResponse[ProductList](
            items=[ProductList.model_validate(p) for p in result],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def create_product(self, data: ProductCreate) -> ProductDetail:
        from slugify import slugify
        from app.models.product import Product
        from app.models.product_image import ProductImage
        from app.repositories.product import _product_options
        from sqlalchemy import select

        slug = slugify(data.name)
        # Ensure unique slug
        base_slug = slug
        counter = 1
        while True:
            existing = (
                await self.product_repo.session.execute(
                    select(Product).where(Product.slug == slug)
                )
            ).scalars().first()
            if not existing:
                break
            slug = f"{base_slug}-{counter}"
            counter += 1

        product = Product(
            slug=slug,
            name=data.name,
            short_desc=data.short_desc,
            long_desc=data.long_desc,
            price=data.price,
            compare_price=data.compare_price,
            sku=data.sku,
            stock_qty=data.stock_qty,
            product_type=data.product_type,
            is_featured=data.is_featured,
            is_active=data.is_active,
            specifications=data.specifications,
            meta_title=data.meta_title,
            meta_desc=data.meta_desc,
            weight_grams=data.weight_grams,
            category_id=data.category_id,
            brand_id=data.brand_id,
        )
        self.product_repo.session.add(product)
        await self.product_repo.session.flush()

        for idx, url in enumerate(data.image_urls):
            self.product_repo.session.add(
                ProductImage(
                    product_id=product.id,
                    url=url,
                    is_primary=(idx == 0),
                    sort_order=idx,
                )
            )

        await self.product_repo.session.commit()

        # Reload with relationships
        q = (
            select(Product)
            .where(Product.id == product.id)
            .options(*_product_options())
        )
        product = (await self.product_repo.session.execute(q)).scalars().first()
        logger.info(
            "Product created: id=%d slug=%s sku=%s price=%.2f stock=%d",
            product.id, product.slug, product.sku, float(product.price), product.stock_qty,
            extra={"event": "product_created", "product_id": product.id, "slug": product.slug, "sku": product.sku},
        )
        return ProductDetail.model_validate(product)

    async def get_product_by_id(self, product_id: int) -> ProductDetail:
        from app.repositories.product import _product_options
        from sqlalchemy import select
        from app.models.product import Product

        q = (
            select(Product)
            .where(Product.id == product_id)
            .options(*_product_options())
        )
        product = (await self.product_repo.session.execute(q)).scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return ProductDetail.model_validate(product)

    async def update_product(self, product_id: int, data: ProductUpdate) -> ProductDetail:
        from app.repositories.product import _product_options
        from sqlalchemy import select
        from app.models.product import Product
        from app.models.product_image import ProductImage

        # Must eager-load images here; session.get() does NOT load relationships,
        # and accessing product.images lazily in an async session raises MissingGreenlet.
        q = (
            select(Product)
            .where(Product.id == product_id)
            .options(*_product_options())
        )
        product = (await self.product_repo.session.execute(q)).scalars().first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

        update_data = data.model_dump(exclude_unset=True)
        image_urls = update_data.pop("image_urls", None)

        for field, value in update_data.items():
            setattr(product, field, value)

        # Replace all images if a new list is provided
        if image_urls is not None:
            for img in list(product.images):
                await self.product_repo.session.delete(img)
            for idx, url in enumerate(image_urls):
                self.product_repo.session.add(
                    ProductImage(
                        product_id=product.id,
                        url=url,
                        is_primary=(idx == 0),
                        sort_order=idx,
                    )
                )

        await self.product_repo.update(product)

        q = (
            select(Product)
            .where(Product.id == product_id)
            .options(*_product_options())
        )
        product = (await self.product_repo.session.execute(q)).scalars().first()
        logger.info(
            "Product updated: id=%d slug=%s fields_changed=%s",
            product_id, product.slug, list(update_data.keys()),
            extra={"event": "product_updated", "product_id": product_id, "fields": list(update_data.keys())},
        )
        return ProductDetail.model_validate(product)

    async def delete_product(self, product_id: int) -> dict:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            logger.warning("delete_product: product_id=%d not found", product_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        # Soft delete
        product.is_active = False
        await self.product_repo.update(product)
        logger.info(
            "Product soft-deleted: id=%d slug=%s", product_id, product.slug,
            extra={"event": "product_deleted", "product_id": product_id, "slug": product.slug},
        )
        return {"message": f"Product {product_id} deactivated"}

    async def update_stock(self, product_id: int, data: StockUpdate) -> dict:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            logger.warning("update_stock: product_id=%d not found", product_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        prev_qty = product.stock_qty
        product.stock_qty = data.stock_qty
        await self.product_repo.update(product)
        logger.info(
            "Stock updated: product_id=%d sku=%s qty: %d → %d",
            product.id, product.sku, prev_qty, data.stock_qty,
            extra={"event": "stock_updated", "product_id": product.id, "sku": product.sku,
                   "prev_qty": prev_qty, "new_qty": data.stock_qty},
        )
        return {"id": product.id, "stock_qty": product.stock_qty}
