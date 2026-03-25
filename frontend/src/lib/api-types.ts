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
  is_featured: boolean;
  primary_image: string | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
}

export interface ProductDetail extends ProductList {
  long_desc: string | null;
  sku: string | null;
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
  role: "customer" | "support" | "inventory_manager" | "admin" | "super_admin";
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
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

// ── Catalog (super_admin) ─────────────────────────────────────────────────────

export interface ProductTypeSchema {
  id: number;
  value: string;
  label: string;
  is_active: boolean;
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
}
