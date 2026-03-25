import logging
import uuid
from typing import Optional

from fastapi import HTTPException, status

from app.models.order import Order, OrderItem, OrderStatus, PaymentStatus
from app.models.user import User
from app.repositories.order import OrderRepository
from app.repositories.product import ProductRepository
from app.schemas.common import PaginatedResponse
from app.schemas.order import CreateOrderRequest, OrderOut, OrderStatusUpdate

logger = logging.getLogger("app.services.order")


def _generate_order_number() -> str:
    return "ORD-" + uuid.uuid4().hex[:8].upper()


class OrderService:
    def __init__(self, order_repo: OrderRepository, product_repo: ProductRepository) -> None:
        self.order_repo = order_repo
        self.product_repo = product_repo

    async def create_order(
        self,
        data: CreateOrderRequest,
        user: Optional[User] = None,
    ) -> OrderOut:
        user_label = f"user_id={user.id}" if user else "guest"
        logger.info("Creating order for %s with %d item(s)", user_label, len(data.items))

        product_ids = [item.product_id for item in data.items]
        logger.debug("Fetching products: %s", product_ids)
        products = await self.product_repo.get_by_ids(product_ids)
        product_map = {p.id: p for p in products}

        order_items: list[OrderItem] = []
        total_price = 0.0

        for item_data in data.items:
            product = product_map.get(item_data.product_id)
            if not product:
                logger.warning("Product id=%d not found; aborting order for %s", item_data.product_id, user_label)
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item_data.product_id} not found",
                )

            unit_price = float(product.price)
            subtotal = unit_price * item_data.quantity
            total_price += subtotal
            logger.debug("  item product_id=%d qty=%d unit_price=%.2f subtotal=%.2f",
                         product.id, item_data.quantity, unit_price, subtotal)

            order_items.append(
                OrderItem(
                    product_id=product.id,
                    variant_id=item_data.variant_id,
                    product_name=product.name,
                    product_sku=product.sku,
                    unit_price=unit_price,
                    quantity=item_data.quantity,
                    subtotal=subtotal,
                )
            )

        order_number = _generate_order_number()
        logger.debug("Generated order_number=%s total=%.2f", order_number, total_price)

        order = Order(
            order_number=order_number,
            user_id=user.id if user else None,
            status=OrderStatus.pending,
            total_price=total_price,
            shipping_address=data.shipping_address.model_dump(),
            payment_method=data.payment_method,
            payment_status=PaymentStatus.unpaid,
            notes=data.notes,
            items=order_items,
        )
        order = await self.order_repo.create(order)
        # Reload with items
        order = await self.order_repo.get_by_id_with_items(order.id)
        logger.info("Order created: order_number=%s id=%d %s total=%.2f",
                    order.order_number, order.id, user_label, total_price)
        return OrderOut.model_validate(order)

    async def get_order(self, order_id: int, user: Optional[User] = None) -> OrderOut:
        order = await self.order_repo.get_by_id_with_items(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        # Non-admin users can only see their own orders
        if user and user.role not in ("admin", "super_admin", "support") and order.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return OrderOut.model_validate(order)

    async def list_user_orders(self, user_id: int, page: int = 1, page_size: int = 10) -> PaginatedResponse[OrderOut]:
        offset = (page - 1) * page_size
        orders, total = await self.order_repo.list_orders(user_id=user_id, offset=offset, limit=page_size)
        return PaginatedResponse[OrderOut](
            items=[OrderOut.model_validate(o) for o in orders],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_status(self, order_id: int, data: OrderStatusUpdate) -> OrderOut:
        valid_statuses = {s.value for s in OrderStatus}
        if data.status not in valid_statuses:
            logger.warning("Invalid status '%s' requested for order_id=%d", data.status, order_id)
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            )
        order = await self.order_repo.get_by_id_with_items(order_id)
        if not order:
            logger.warning("update_status: order_id=%d not found", order_id)
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        prev_status = order.status
        order.status = data.status
        order = await self.order_repo.update(order)
        order = await self.order_repo.get_by_id_with_items(order.id)
        logger.info("Order %d status changed: %s → %s", order_id, prev_status, data.status)
        return OrderOut.model_validate(order)
