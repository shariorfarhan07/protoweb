// ── API Response Types — mirrors backend Pydantic schemas ─────────────────

export interface ImageSchema {
  id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

export interface FilamentVariantSchema {
  id: number;
  color_name: string | null;
  color_hex: string | null;
  material: string | null;
  diameter_mm: number | null;
  weight_grams: number | null;
  price_delta: number;
  variant_price: number | null; // absolute price override; null = use product.price + price_delta
  sku: string | null;
  stock_qty: number;
  image_url: string | null;
  is_active: boolean;
}

export interface CategoryRef {
  name: string;
  slug: string;
}

export interface BrandRef {
  name: string;
  slug: string;
}

export interface CategorySchema {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  gradient_css: string | null;
}

export interface BrandSchema {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
}

export interface ProductList {
  id: number;
  slug: string;
  name: string;
  short_desc: string | null;
  price: number;
  compare_price: number | null;
  product_type: string;
  stock_qty: number;
  preorder_enabled: boolean;
  preorder_price: number | null;
  is_featured: boolean;
  primary_image: string | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
}

export interface ProductDetail extends ProductList {
  long_desc: string | null;
  sku: string | null;
  reorder_level: number;
  is_active: boolean;
  specifications: Record<string, string> | null;
  meta_title: string | null;
  meta_desc: string | null;
  weight_grams: number | null;
  images: ImageSchema[];
  filament_variants: FilamentVariantSchema[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CompareRow {
  attribute: string;
  values: Record<number, string>;
}

export interface CompareProductSummary {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  brand: string | null;
}

export interface CompareResponse {
  products: CompareProductSummary[];
  rows: CompareRow[];
}

// ── Auth / User ──────────────────────────────────────────────────────────────

export interface UserPublic {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  // Role is now a free-form slug (custom roles are supported); the legacy
  // built-in slugs are still the common case.
  role: string;
  is_active: boolean;
  created_at: string;
  permissions?: string[];
  is_superuser?: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
}

// ── RBAC: roles & permissions ──────────────────────────────────────────────────

export interface Permission {
  key: string;
  label: string;
  group: string;
  description: string | null;
}

export interface RoleOut {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
  is_superuser: boolean;
  sort_order: number;
  permissions: string[];
  user_count: number;
}

export interface RoleCreatePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItemOut {
  id: number;
  product_id: number | null;
  variant_id: number | null;
  product_name: string;
  product_sku: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderOut {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_price: number;
  shipping_address: Record<string, string>;
  payment_method: string;
  payment_status: PaymentStatus;
  notes: string | null;
  items: OrderItemOut[];
  created_at: string;
  updated_at: string;
}

// ── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStatsOut {
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  total_users: number;
  low_stock_count: number;
}

export interface SalesPoint {
  period: string; // "YYYY-MM"
  label: string; // "Mar 26"
  revenue: number;
  orders: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface SalesSummaryOut {
  monthly: SalesPoint[];
  by_status: StatusCount[];
  total_revenue: number;
  total_orders: number;
}

export interface ReportSummary {
  total_revenue: number;
  total_orders: number;
  units_sold: number;
  avg_order_value: number;
}

export interface ReportDailyPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ReportStatusRow {
  status: string;
  count: number;
  revenue: number;
}

export interface ReportTopProduct {
  product_name: string;
  quantity: number;
  revenue: number;
}

export interface SalesReportOut {
  start: string;
  end: string;
  summary: ReportSummary;
  daily: ReportDailyPoint[];
  by_status: ReportStatusRow[];
  top_products: ReportTopProduct[];
}

// ── Dashboard metrics / low-stock / pending orders ───────────────────────────

export interface MetricPoint {
  period: string; // "YYYY-MM"
  label: string; // "Mar 26"
  revenue: number;
  orders: number;
  units: number; // inventory movement — units sold
  customers: number; // new sign-ups that month
  profit: number; // estimated gross profit
  avg_order_value: number;
}

export interface DashboardMetricsOut {
  months: number;
  profit_margin: number; // gross-margin assumption used to estimate profit
  points: MetricPoint[];
}

export type LowStockStatus = "critical" | "low" | "normal";

export interface LowStockItem {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  stock_qty: number;
  reorder_level: number;
  status: LowStockStatus;
}

export interface PendingOrderItem {
  id: number;
  order_number: string;
  customer_name: string;
  order_date: string; // ISO date
  pending_days: number;
  order_value: number;
  status: string;
  is_overdue: boolean;
}

// ── Catalog (super_admin) ─────────────────────────────────────────────────────

export interface ProductTypeSchema {
  id: number;
  value: string;
  label: string;
  is_active: boolean;
}

// ── Color Variants ───────────────────────────────────────────────────────────

export interface VariantCreate {
  color_name: string;
  color_hex: string;
  material?: string | null;
  diameter_mm?: number | null;
  weight_grams?: number | null;
  price_delta?: number;
  variant_price?: number | null;
  sku?: string | null;
  stock_qty?: number;
  image_url?: string | null;
  is_active?: boolean;
}

export interface VariantUpdate {
  color_name?: string;
  color_hex?: string;
  material?: string | null;
  diameter_mm?: number | null;
  weight_grams?: number | null;
  price_delta?: number;
  variant_price?: number | null;
  sku?: string | null;
  stock_qty?: number;
  image_url?: string | null;
  is_active?: boolean;
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export interface ReviewOut {
  id: number;
  reviewer_name: string;
  reviewer_title: string | null;
  avatar_url: string | null;
  rating: number;
  content: string;
  is_active: boolean;
  is_approved: boolean;
  source: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ── One-time review request links ───────────────────────────────────────────

export interface ReviewRequest {
  id: number;
  token: string;
  customer_name: string | null;
  customer_email: string | null;
  note: string | null;
  is_used: boolean;
  review_id: number | null;
  created_at: string;
}

export interface ReviewRequestPublic {
  valid: boolean;
  used: boolean;
  customer_name: string | null;
}

export interface ReviewSubmitPayload {
  reviewer_name: string;
  reviewer_title?: string;
  rating: number;
  content: string;
}

export interface ReviewCreate {
  reviewer_name: string;
  reviewer_title?: string | null;
  avatar_url?: string | null;
  rating: number;
  content: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface ReviewUpdate {
  reviewer_name?: string;
  reviewer_title?: string | null;
  avatar_url?: string | null;
  rating?: number;
  content?: string;
  is_active?: boolean;
  sort_order?: number;
}

// ── Blog ───────────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sort_order: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogComment {
  id: number;
  post_id: number;
  parent_id: number | null;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface BlogCommentAdmin extends BlogComment {
  author_email: string | null;
  post_title: string;
  post_slug: string;
}

export interface BlogPostList {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  author_name: string;
  source: string;
  source_url: string | null;
  published_at: string;
  updated_at: string;
  reading_minutes: number;
  view_count: number;
  category: BlogCategory | null;
  tags: BlogTag[];
  comment_count: number;
}

export interface BlogPostDetail extends BlogPostList {
  content: string;
}

export interface VideoTutorial {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  category: string | null;
  sort_order: number;
  created_at: string;
}

export interface CommunityProject {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  author_name: string;
  project_url: string | null;
  is_featured: boolean;
  is_approved: boolean;
  sort_order: number;
  created_at: string;
}

export interface CommunityProjectPayload {
  title: string;
  description?: string | null;
  image_url?: string | null;
  author_name?: string;
  project_url?: string | null;
  is_featured?: boolean;
  is_approved?: boolean;
  sort_order?: number;
}

// ── Contact messages & newsletter ─────────────────────────────────────────────

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NewsletterSubscribeResult {
  ok: boolean;
  message: string;
  already_subscribed: boolean;
}

export interface NewsletterSubscriber {
  id: number;
  email: string;
  is_active: boolean;
  source: string | null;
  created_at: string;
}

// ── Product comments ─────────────────────────────────────────────────────────

export interface ProductComment {
  id: number;
  product_id: number;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export interface ProductCommentAdmin extends ProductComment {
  author_email: string | null;
  product_name: string;
  product_slug: string;
}

export interface SyncResult {
  ok: boolean;
  synced: number;
  skipped: number;
  message: string;
}

// Cart types (client-side only)
export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  variantId?: number;
  variantLabel?: string;
  isPreorder?: boolean;
}
