from typing import Optional

from pydantic import BaseModel

from app.schemas.auth import UserPublic


class UserAdminOut(UserPublic):
    pass


class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None


class StockUpdate(BaseModel):
    stock_qty: int


class AdminStatsOut(BaseModel):
    total_orders: int
    pending_orders: int
    total_revenue: float
    total_users: int
    low_stock_count: int


class SalesPoint(BaseModel):
    period: str   # "YYYY-MM"
    label: str    # "Mar 26"
    revenue: float
    orders: int


class StatusCount(BaseModel):
    status: str
    count: int


class SalesSummaryOut(BaseModel):
    monthly: list[SalesPoint]
    by_status: list[StatusCount]
    total_revenue: float
    total_orders: int


# ── Sales report (date-range) ───────────────────────────────────────────────

class ReportSummary(BaseModel):
    total_revenue: float
    total_orders: int
    units_sold: int
    avg_order_value: float


class ReportDailyPoint(BaseModel):
    date: str
    revenue: float
    orders: int


class ReportStatusRow(BaseModel):
    status: str
    count: int
    revenue: float


class ReportTopProduct(BaseModel):
    product_name: str
    quantity: int
    revenue: float


class SalesReportOut(BaseModel):
    start: str
    end: str
    summary: ReportSummary
    daily: list[ReportDailyPoint]
    by_status: list[ReportStatusRow]
    top_products: list[ReportTopProduct]


# ── Dashboard metrics (selectable metric + time range) ───────────────────────

class MetricPoint(BaseModel):
    period: str   # "YYYY-MM"
    label: str    # "Mar 26"
    revenue: float
    orders: int
    units: int          # inventory movement — units sold
    customers: int      # new sign-ups that month
    profit: float       # estimated gross profit
    avg_order_value: float


class DashboardMetricsOut(BaseModel):
    months: int
    profit_margin: float  # the gross-margin assumption used to estimate profit
    points: list[MetricPoint]


# ── Low-stock widget ─────────────────────────────────────────────────────────

class LowStockItem(BaseModel):
    id: int
    name: str
    slug: str
    sku: Optional[str] = None
    stock_qty: int
    reorder_level: int
    status: str  # "critical" | "low" | "normal"


# ── Pending (unfulfilled) orders widget ──────────────────────────────────────

class PendingOrderItem(BaseModel):
    id: int
    order_number: str
    customer_name: str
    order_date: str        # ISO date
    pending_days: int      # days since the order was placed
    order_value: float
    status: str
    is_overdue: bool       # older than the overdue threshold
