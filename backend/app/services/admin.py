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
from app.schemas.admin import (
    AdminStatsOut,
    DashboardMetricsOut,
    LowStockItem,
    MetricPoint,
    PendingOrderItem,
    ReportDailyPoint,
    ReportStatusRow,
    ReportSummary,
    ReportTopProduct,
    SalesPoint,
    SalesReportOut,
    SalesSummaryOut,
    StatusCount,
    StockUpdate,
    UserAdminOut,
    UserUpdate,
)
from app.schemas.auth import UserPublic
from app.schemas.common import PaginatedResponse
from app.schemas.order import OrderOut, OrderStatusUpdate
from app.schemas.product import ProductCreate, ProductDetail, ProductList, ProductUpdate

logger = get_logger("app.services.admin")

LOW_STOCK_THRESHOLD = 5

# An order still open after this many days is flagged overdue on the dashboard.
OVERDUE_DAYS = 7

# No per-product cost is tracked, so dashboard "profit" is an estimate derived
# from revenue using this assumed gross margin. Surfaced to the UI for labelling.
GROSS_MARGIN = 0.35

_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


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

    async def get_sales_summary(self, months: int = 12) -> SalesSummaryOut:
        """Monthly revenue trend (zero-filled) + order status breakdown."""
        from datetime import datetime, timezone

        rows = await self.order_repo.revenue_by_month()
        by_month = {period: (revenue, orders) for period, revenue, orders in rows}

        # Build the last `months` periods up to the current month, zero-filled.
        now = datetime.now(timezone.utc)
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        monthly: list[SalesPoint] = []
        y, m = now.year, now.month
        periods: list[tuple[int, int]] = []
        for _ in range(months):
            periods.append((y, m))
            m -= 1
            if m == 0:
                m = 12
                y -= 1
        for yy, mm in reversed(periods):
            period = f"{yy:04d}-{mm:02d}"
            revenue, orders = by_month.get(period, (0.0, 0))
            monthly.append(
                SalesPoint(
                    period=period,
                    label=f"{month_names[mm - 1]} {yy % 100:02d}",
                    revenue=revenue,
                    orders=orders,
                )
            )

        status_rows = await self.order_repo.status_breakdown()
        by_status = [StatusCount(status=s, count=c) for s, c in status_rows]

        total_orders = await self.order_repo.count_total()
        total_revenue = await self.order_repo.sum_revenue()

        return SalesSummaryOut(
            monthly=monthly,
            by_status=by_status,
            total_revenue=total_revenue,
            total_orders=total_orders,
        )

    async def get_sales_report(
        self, start: Optional[str] = None, end: Optional[str] = None
    ) -> SalesReportOut:
        """Date-range sales report. Defaults to the last 30 days."""
        from datetime import datetime, timedelta, timezone

        today = datetime.now(timezone.utc).date()
        end_d = datetime.strptime(end, "%Y-%m-%d").date() if end else today
        start_d = (
            datetime.strptime(start, "%Y-%m-%d").date()
            if start
            else end_d - timedelta(days=30)
        )
        if start_d > end_d:
            start_d, end_d = end_d, start_d
        start_s, end_s = start_d.isoformat(), end_d.isoformat()

        revenue, orders, units = await self.order_repo.report_summary(start_s, end_s)
        daily = await self.order_repo.report_daily(start_s, end_s)
        by_status = await self.order_repo.report_by_status(start_s, end_s)
        top = await self.order_repo.report_top_products(start_s, end_s, limit=10)

        aov = revenue / orders if orders else 0.0

        return SalesReportOut(
            start=start_s,
            end=end_s,
            summary=ReportSummary(
                total_revenue=revenue,
                total_orders=orders,
                units_sold=units,
                avg_order_value=round(aov, 2),
            ),
            daily=[ReportDailyPoint(date=d, revenue=r, orders=o) for d, r, o in daily],
            by_status=[
                ReportStatusRow(status=s, count=c, revenue=r) for s, c, r in by_status
            ],
            top_products=[
                ReportTopProduct(product_name=n, quantity=q, revenue=r)
                for n, q, r in top
            ],
        )

    async def get_dashboard_metrics(self, months: int = 12) -> DashboardMetricsOut:
        """Monthly series for every selectable dashboard metric, zero-filled over
        the last `months` periods so the chart always renders a full window."""
        from datetime import datetime, timezone

        revenue_rows = await self.order_repo.revenue_by_month()      # (period, revenue, orders)
        units_rows = await self.order_repo.units_by_month()          # (period, units)
        customer_rows = await self.user_repo.new_by_month()          # (period, customers)

        rev_by = {p: (r, o) for p, r, o in revenue_rows}
        units_by = {p: u for p, u in units_rows}
        cust_by = {p: c for p, c in customer_rows}

        now = datetime.now(timezone.utc)
        y, m = now.year, now.month
        periods: list[tuple[int, int]] = []
        for _ in range(months):
            periods.append((y, m))
            m -= 1
            if m == 0:
                m = 12
                y -= 1

        points: list[MetricPoint] = []
        for yy, mm in reversed(periods):
            period = f"{yy:04d}-{mm:02d}"
            revenue, orders = rev_by.get(period, (0.0, 0))
            units = units_by.get(period, 0)
            customers = cust_by.get(period, 0)
            aov = revenue / orders if orders else 0.0
            points.append(
                MetricPoint(
                    period=period,
                    label=f"{_MONTH_NAMES[mm - 1]} {yy % 100:02d}",
                    revenue=round(revenue, 2),
                    orders=orders,
                    units=units,
                    customers=customers,
                    profit=round(revenue * GROSS_MARGIN, 2),
                    avg_order_value=round(aov, 2),
                )
            )

        return DashboardMetricsOut(months=months, profit_margin=GROSS_MARGIN, points=points)

    async def get_low_stock(self, limit: int = 50) -> list[LowStockItem]:
        """Products at or below their reorder level, classified Critical/Low."""
        products = await self.product_repo.list_low_stock(limit=limit)
        items: list[LowStockItem] = []
        for p in products:
            reorder = p.reorder_level or LOW_STOCK_THRESHOLD
            if p.stock_qty <= 0 or p.stock_qty <= reorder / 2:
                status_label = "critical"
            elif p.stock_qty <= reorder:
                status_label = "low"
            else:
                status_label = "normal"
            items.append(
                LowStockItem(
                    id=p.id,
                    name=p.name,
                    slug=p.slug,
                    sku=p.sku,
                    stock_qty=p.stock_qty,
                    reorder_level=reorder,
                    status=status_label,
                )
            )
        return items

    async def get_pending_orders(self) -> list[PendingOrderItem]:
        """Open (unfulfilled) orders with aging — oldest first, overdue flagged."""
        from datetime import datetime, timezone

        orders = await self.order_repo.list_unfulfilled()
        now = datetime.now(timezone.utc)
        items: list[PendingOrderItem] = []
        for o in orders:
            created = o.created_at
            if created.tzinfo is None:
                created = created.replace(tzinfo=timezone.utc)
            pending_days = max(0, (now - created).days)
            addr = o.shipping_address or {}
            name = " ".join(
                part for part in [addr.get("first_name"), addr.get("last_name")] if part
            ).strip() or "—"
            items.append(
                PendingOrderItem(
                    id=o.id,
                    order_number=o.order_number,
                    customer_name=name,
                    order_date=created.date().isoformat(),
                    pending_days=pending_days,
                    order_value=float(o.total_price),
                    status=str(o.status),
                    is_overdue=pending_days >= OVERDUE_DAYS,
                )
            )
        return items

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
            from app.models.role import Role
            valid_roles = {
                r.slug
                for r in (await self.user_repo.session.execute(select(Role))).scalars().all()
            }
            if data.role not in valid_roles:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid role. Must be one of: {', '.join(sorted(valid_roles))}",
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
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse[OrderOut]:
        offset = (page - 1) * page_size
        orders, total = await self.order_repo.list_orders(
            status=status, search=search, offset=offset, limit=page_size
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
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedResponse:
        from sqlalchemy import or_, select
        from app.models.product import Product
        from app.schemas.product import ProductList

        q = select(Product).where(Product.is_active == True)
        if low_stock_only:
            q = q.where(Product.stock_qty <= LOW_STOCK_THRESHOLD)
        if search and search.strip():
            term = f"%{search.strip()}%"
            q = q.where(or_(Product.name.ilike(term), Product.sku.ilike(term)))

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
            reorder_level=data.reorder_level,
            preorder_enabled=data.preorder_enabled,
            preorder_price=data.preorder_price,
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

    # ── CSV export / import ─────────────────────────────────────────────────

    CSV_COLUMNS = [
        "id", "sku", "name", "slug", "product_type",
        "price", "compare_price", "stock_qty", "reorder_level",
        "preorder_enabled", "preorder_price",
        "is_active", "is_featured", "category_slug", "brand_slug", "short_desc",
    ]

    async def export_products_csv(self) -> str:
        """Serialize every product to CSV. The `id`/`sku` columns are the keys
        the importer uses, so a downloaded file round-trips idempotently."""
        import csv
        import io
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.product import Product

        q = (
            select(Product)
            .options(selectinload(Product.category), selectinload(Product.brand))
            .order_by(Product.id)
        )
        products = (await self.product_repo.session.execute(q)).scalars().unique().all()

        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=self.CSV_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        for p in products:
            writer.writerow({
                "id": p.id,
                "sku": p.sku or "",
                "name": p.name,
                "slug": p.slug,
                "product_type": p.product_type,
                "price": f"{float(p.price):.2f}",
                "compare_price": "" if p.compare_price is None else f"{float(p.compare_price):.2f}",
                "stock_qty": p.stock_qty,
                "reorder_level": p.reorder_level,
                "preorder_enabled": "true" if p.preorder_enabled else "false",
                "preorder_price": "" if p.preorder_price is None else f"{float(p.preorder_price):.2f}",
                "is_active": "true" if p.is_active else "false",
                "is_featured": "true" if p.is_featured else "false",
                "category_slug": p.category.slug if p.category else "",
                "brand_slug": p.brand.slug if p.brand else "",
                "short_desc": (p.short_desc or "").replace("\n", " "),
            })
        return buf.getvalue()

    @staticmethod
    def _parse_bool(value: str) -> Optional[bool]:
        v = (value or "").strip().lower()
        if v in {"true", "1", "yes", "y"}:
            return True
        if v in {"false", "0", "no", "n"}:
            return False
        return None

    async def import_products_csv(self, content: str) -> dict:
        """Update existing products from CSV. Idempotent: each row is matched by
        `id` (preferred) or `sku`, then updated in place — re-running the same
        file yields the same result. Rows that match nothing are skipped."""
        import csv
        import io
        from sqlalchemy import select
        from app.models.product import Product
        from app.repositories.brand import BrandRepository
        from app.repositories.category import CategoryRepository

        session = self.product_repo.session
        cat_repo = CategoryRepository(session)
        brand_repo = BrandRepository(session)

        reader = csv.DictReader(io.StringIO(content))

        # ── Validate the header before touching any data ────────────────────
        # A wrong/garbage file (e.g. the user uploaded the wrong CSV) must fail
        # loudly rather than silently skipping every row.
        header = [(f or "").strip().lower() for f in (reader.fieldnames or [])]
        known = set(self.CSV_COLUMNS)
        if not header or not (set(header) & known):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Unrecognized CSV format. The header doesn't match any product "
                    "columns. Export a CSV first and edit that file. "
                    f"Expected columns include: {', '.join(self.CSV_COLUMNS[:6])}…"
                ),
            )
        if "id" not in header and "sku" not in header:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV must include an 'id' or 'sku' column so products can be matched.",
            )

        updated = 0
        skipped = 0
        errors: list[dict] = []
        # cache slug → id lookups within this import
        cat_cache: dict[str, Optional[int]] = {}
        brand_cache: dict[str, Optional[int]] = {}

        async def resolve(slug: str, repo, cache) -> tuple[bool, Optional[int]]:
            slug = (slug or "").strip()
            if slug == "":
                return True, None
            if slug in cache:
                return cache[slug] is not None, cache[slug]
            obj = await repo.get_by_slug(slug)
            cache[slug] = obj.id if obj else None
            return (obj is not None), cache[slug]

        for line_no, row in enumerate(reader, start=2):  # header is line 1
            row = {(k or "").strip().lower(): (v or "") for k, v in row.items()}
            try:
                product: Optional[Product] = None
                rid = row.get("id", "").strip()
                if rid.isdigit():
                    product = await session.get(Product, int(rid))
                if product is None:
                    sku = row.get("sku", "").strip()
                    if sku:
                        product = (
                            await session.execute(select(Product).where(Product.sku == sku))
                        ).scalars().first()
                if product is None:
                    skipped += 1
                    continue

                # Parse & validate EVERYTHING first so a bad cell never leaves a
                # half-updated product (keeps each row atomic / the import idempotent).
                changes: dict = {}
                if row.get("name", "").strip():
                    changes["name"] = row["name"].strip()
                if row.get("product_type", "").strip():
                    changes["product_type"] = row["product_type"].strip()
                if "short_desc" in row:
                    changes["short_desc"] = row["short_desc"].strip() or None
                if row.get("price", "").strip() != "":
                    changes["price"] = float(row["price"])
                if "compare_price" in row:
                    cp = row["compare_price"].strip()
                    changes["compare_price"] = float(cp) if cp != "" else None
                if row.get("stock_qty", "").strip() != "":
                    changes["stock_qty"] = int(float(row["stock_qty"]))
                if row.get("reorder_level", "").strip() != "":
                    changes["reorder_level"] = int(float(row["reorder_level"]))
                if "preorder_enabled" in row:
                    b = self._parse_bool(row["preorder_enabled"])
                    if b is not None:
                        changes["preorder_enabled"] = b
                if "preorder_price" in row:
                    pp = row["preorder_price"].strip()
                    changes["preorder_price"] = float(pp) if pp != "" else None
                if "is_active" in row:
                    b = self._parse_bool(row["is_active"])
                    if b is not None:
                        changes["is_active"] = b
                if "is_featured" in row:
                    b = self._parse_bool(row["is_featured"])
                    if b is not None:
                        changes["is_featured"] = b
                if "category_slug" in row:
                    ok, cid = await resolve(row["category_slug"], cat_repo, cat_cache)
                    if not ok:
                        raise ValueError(f"Unknown category slug '{row['category_slug'].strip()}'")
                    changes["category_id"] = cid
                if "brand_slug" in row:
                    ok, bid = await resolve(row["brand_slug"], brand_repo, brand_cache)
                    if not ok:
                        raise ValueError(f"Unknown brand slug '{row['brand_slug'].strip()}'")
                    changes["brand_id"] = bid

                for field, value in changes.items():
                    setattr(product, field, value)
                updated += 1
            except (ValueError, TypeError) as exc:
                errors.append({"row": line_no, "message": str(exc)})

        await session.commit()
        logger.info(
            "Product CSV import: updated=%d skipped=%d errors=%d",
            updated, skipped, len(errors),
            extra={"event": "product_import", "updated": updated, "skipped": skipped, "errors": len(errors)},
        )
        return {"updated": updated, "skipped": skipped, "errors": errors}

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
