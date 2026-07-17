import type {
  AdminStatsOut,
  SalesSummaryOut,
  SalesReportOut,
  DashboardMetricsOut,
  LowStockItem,
  PendingOrderItem,
  BlogCategory,
  BlogComment,
  BlogCommentAdmin,
  ProductComment,
  ProductCommentAdmin,
  ContactMessage,
  NewsletterSubscribeResult,
  NewsletterSubscriber,
  BlogPostDetail,
  BlogPostList,
  BlogTag,
  CommunityProject,
  CommunityProjectPayload,
  SyncResult,
  VideoTutorial,
  BrandSchema,
  CategorySchema,
  CompareResponse,
  FilamentVariantSchema,
  OrderOut,
  PaginatedResponse,
  ProductDetail,
  ProductList,
  ProductTypeSchema,
  Permission,
  RoleOut,
  RoleCreatePayload,
  RoleUpdatePayload,
  ReviewCreate,
  ReviewOut,
  ReviewRequest,
  ReviewRequestPublic,
  ReviewSubmitPayload,
  ReviewUpdate,
  TokenResponse,
  UserPublic,
  VariantCreate,
  VariantUpdate,
} from "./api-types";

// Server-side (Node.js in container) uses INTERNAL_API_URL so it reaches
// the backend service by Docker DNS name instead of localhost.
// Browser-side always uses the public NEXT_PUBLIC_API_URL.
const API_BASE =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");

// ISR revalidation period (seconds)
const REVALIDATE_PRODUCTS = 60;
const REVALIDATE_STATIC = 300; // categories, brands

/** Read the JWT stored by Zustand (persisted to localStorage). */
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("prototypebd-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

/** Build an Authorization header if a token is available. */
function authHeader(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Reactive logout fallback: when an authenticated request comes back 401 the
 * token is expired or was invalidated server-side. Clear the session at once
 * and bounce to /login from any gated page. (Proactive expiry is handled by
 * SessionGuard; this catches tokens killed before their `exp`.)
 */
function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("prototypebd-auth");
  } catch {
    /* ignore */
  }
  // Clear the in-memory store so the UI updates without a reload.
  import("@/store/auth")
    .then(({ useAuthStore }) => useAuthStore.getState().clearAuth())
    .catch(() => {});
  const path = window.location.pathname;
  const onGatedPage = path.startsWith("/admin") || path.startsWith("/account");
  if (onGatedPage && !path.startsWith("/login")) {
    window.location.href = "/login?expired=1";
  }
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    // Only treat 401 as a session expiry when we actually sent a token —
    // otherwise a failed login (also 401) would trigger a bogus logout.
    if (res.status === 401 && typeof window !== "undefined" && getStoredToken()) {
      handleUnauthorized();
    }
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `HTTP ${res.status}`);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

// ── Products ─────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  brand?: string;
  product_type?: string;
  min_price?: number;
  max_price?: number;
  material?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<ProductList>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      params.set(k, String(v));
    }
  });
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/products${qs}`, {
    next: { revalidate: REVALIDATE_PRODUCTS },
  });
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await apiFetch<ProductDetail>(`/products/${slug}`, {
      next: { revalidate: REVALIDATE_PRODUCTS, tags: [`product:${slug}`] },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getFeaturedProducts(
  limit = 8
): Promise<ProductList[]> {
  return apiFetch(`/products/featured?limit=${limit}`, {
    next: { revalidate: REVALIDATE_PRODUCTS },
  });
}

// ── Categories ────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategorySchema[]> {
  return apiFetch("/categories", { next: { revalidate: REVALIDATE_STATIC } });
}

export async function getCategory(
  slug: string
): Promise<CategorySchema | null> {
  try {
    return await apiFetch<CategorySchema>(`/categories/${slug}`, {
      next: { revalidate: REVALIDATE_STATIC },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ── Product Types (public) ────────────────────────────────────────────────

export async function getProductTypes(): Promise<ProductTypeSchema[]> {
  return apiFetch("/product-types", { next: { revalidate: REVALIDATE_STATIC } });
}

// ── Brands ────────────────────────────────────────────────────────────────

export async function getBrands(): Promise<BrandSchema[]> {
  return apiFetch("/brands", { next: { revalidate: REVALIDATE_STATIC } });
}

export async function getBrand(slug: string): Promise<BrandSchema | null> {
  try {
    return await apiFetch<BrandSchema>(`/brands/${slug}`, {
      next: { revalidate: REVALIDATE_STATIC },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// ── Search ────────────────────────────────────────────────────────────────

export async function searchProducts(
  q: string,
  limit = 20
): Promise<ProductList[]> {
  if (!q || q.trim().length < 2) return [];
  return apiFetch(
    `/search?q=${encodeURIComponent(q.trim())}&limit=${limit}`,
    { cache: "no-store" } // search results should not be cached
  );
}

// ── Comparison ────────────────────────────────────────────────────────────

export async function compareProducts(
  productIds: number[]
): Promise<CompareResponse> {
  return apiFetch("/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_ids: productIds }),
    cache: "no-store",
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<TokenResponse> {
  return apiFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
    cache: "no-store",
  });
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export async function register(data: RegisterPayload): Promise<UserPublic> {
  return apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", {
    method: "POST",
    headers: { ...authHeader() },
    credentials: "include",
    cache: "no-store",
  });
}

export async function getMe(): Promise<UserPublic> {
  return apiFetch("/auth/me", {
    headers: { ...authHeader() },
    credentials: "include",
    cache: "no-store",
  });
}

// ── Orders ────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postal: string;
  };
  payment_method?: string;
  items: Array<{
    product_id: number;
    variant_id?: number;
    quantity: number;
  }>;
  notes?: string;
}

export async function createOrder(data: CreateOrderPayload): Promise<OrderOut> {
  return apiFetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function getMyOrders(
  page = 1,
  page_size = 10
): Promise<PaginatedResponse<OrderOut>> {
  return apiFetch(`/orders/my?page=${page}&page_size=${page_size}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStatsOut> {
  return apiFetch("/admin/stats", {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getSalesSummary(months = 12): Promise<SalesSummaryOut> {
  return apiFetch(`/admin/sales-summary?months=${months}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getDashboardMetrics(months = 12): Promise<DashboardMetricsOut> {
  return apiFetch(`/admin/metrics?months=${months}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getLowStockProducts(limit = 50): Promise<LowStockItem[]> {
  return apiFetch(`/admin/low-stock?limit=${limit}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getPendingOrders(): Promise<PendingOrderItem[]> {
  return apiFetch("/admin/pending-orders", {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getSalesReport(
  start?: string,
  end?: string
): Promise<SalesReportOut> {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/admin/reports/sales${suffix}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getAdminOrders(
  params: { status?: string; search?: string; page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<OrderOut>> {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  return apiFetch(`/admin/orders${qs.toString() ? `?${qs}` : ""}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<OrderOut> {
  return apiFetch(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status }),
    cache: "no-store",
  });
}

export async function getAdminUsers(
  params: { role?: string; is_active?: boolean; page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<UserPublic>> {
  const qs = new URLSearchParams();
  if (params.role) qs.set("role", params.role);
  if (params.is_active !== undefined) qs.set("is_active", String(params.is_active));
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  return apiFetch(`/admin/users${qs.toString() ? `?${qs}` : ""}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function updateUser(
  userId: number,
  data: { is_active?: boolean; role?: string }
): Promise<UserPublic> {
  return apiFetch(`/admin/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

// ── RBAC: roles & permissions ──────────────────────────────────────────────

export async function getPermissions(): Promise<Permission[]> {
  return apiFetch("/admin/permissions", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function getRoles(): Promise<RoleOut[]> {
  return apiFetch("/admin/roles", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function createRole(data: RoleCreatePayload): Promise<RoleOut> {
  return apiFetch("/admin/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function updateRole(roleId: number, data: RoleUpdatePayload): Promise<RoleOut> {
  return apiFetch(`/admin/roles/${roleId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function deleteRole(roleId: number): Promise<void> {
  return apiFetch(`/admin/roles/${roleId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export interface AdminProductFilters {
  search?: string;
  product_type?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  low_stock?: boolean;
  page?: number;
  page_size?: number;
}

export async function adminListProducts(
  params: AdminProductFilters = {}
): Promise<PaginatedResponse<ProductList>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.product_type) qs.set("product_type", params.product_type);
  if (params.category) qs.set("category", params.category);
  if (params.is_active !== undefined) qs.set("is_active", String(params.is_active));
  if (params.is_featured !== undefined) qs.set("is_featured", String(params.is_featured));
  if (params.low_stock !== undefined) qs.set("low_stock", String(params.low_stock));
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  return apiFetch(`/admin/products${qs.toString() ? `?${qs}` : ""}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getAdminInventory(
  params: { low_stock_only?: boolean; search?: string; page?: number; page_size?: number } = {}
): Promise<PaginatedResponse<ProductList>> {
  const qs = new URLSearchParams();
  if (params.low_stock_only) qs.set("low_stock_only", "true");
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.page_size) qs.set("page_size", String(params.page_size));
  return apiFetch(`/admin/inventory${qs.toString() ? `?${qs}` : ""}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export interface ProductCreatePayload {
  name: string;
  short_desc?: string;
  long_desc?: string;
  price: number;
  compare_price?: number;
  sku?: string;
  stock_qty: number;
  reorder_level?: number;
  preorder_enabled?: boolean;
  preorder_price?: number | null;
  product_type: string;
  is_featured?: boolean;
  is_active?: boolean;
  specifications?: Record<string, string>;
  meta_title?: string;
  meta_desc?: string;
  weight_grams?: number;
  category_id?: number;
  brand_id?: number;
  image_urls?: string[];
}

export async function createProduct(data: ProductCreatePayload): Promise<ProductDetail> {
  return apiFetch("/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function deleteProduct(productId: number): Promise<{ message: string }> {
  return apiFetch(`/admin/products/${productId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getAdminProduct(productId: number): Promise<ProductDetail> {
  return apiFetch(`/admin/products/${productId}`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function updateProduct(
  productId: number,
  data: Partial<ProductCreatePayload> & { is_active?: boolean }
): Promise<ProductDetail> {
  return apiFetch(`/admin/products/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function updateStock(
  productId: number,
  stockQty: number
): Promise<{ id: number; stock_qty: number }> {
  return apiFetch(`/admin/products/${productId}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ stock_qty: stockQty }),
    cache: "no-store",
  });
}

// ── Admin Catalog: Categories ─────────────────────────────────────────────────

export async function adminListCategories(): Promise<CategorySchema[]> {
  return apiFetch("/admin/categories", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function adminCreateCategory(
  data: Omit<CategorySchema, "id">
): Promise<CategorySchema> {
  return apiFetch("/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminUpdateCategory(
  id: number,
  data: Partial<Omit<CategorySchema, "id">>
): Promise<CategorySchema> {
  return apiFetch(`/admin/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await apiFetch(`/admin/categories/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Admin Catalog: Brands ─────────────────────────────────────────────────────

export async function adminListBrands(): Promise<BrandSchema[]> {
  return apiFetch("/admin/brands", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function adminCreateBrand(
  data: Omit<BrandSchema, "id">
): Promise<BrandSchema> {
  return apiFetch("/admin/brands", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminUpdateBrand(
  id: number,
  data: Partial<Omit<BrandSchema, "id">>
): Promise<BrandSchema> {
  return apiFetch(`/admin/brands/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminDeleteBrand(id: number): Promise<void> {
  await apiFetch(`/admin/brands/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Admin Catalog: Product Types ──────────────────────────────────────────────

export async function adminListProductTypes(): Promise<ProductTypeSchema[]> {
  return apiFetch("/admin/product-types", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function adminCreateProductType(
  data: Omit<ProductTypeSchema, "id">
): Promise<ProductTypeSchema> {
  return apiFetch("/admin/product-types", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminUpdateProductType(
  id: number,
  data: Partial<Omit<ProductTypeSchema, "id">>
): Promise<ProductTypeSchema> {
  return apiFetch(`/admin/product-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminDeleteProductType(id: number): Promise<void> {
  await apiFetch(`/admin/product-types/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Color Variants ────────────────────────────────────────────────────────────

export async function adminListVariants(productId: number): Promise<FilamentVariantSchema[]> {
  return apiFetch(`/admin/products/${productId}/variants`, {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function adminCreateVariant(
  productId: number,
  data: VariantCreate
): Promise<FilamentVariantSchema> {
  return apiFetch(`/admin/products/${productId}/variants`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminUpdateVariant(
  variantId: number,
  data: VariantUpdate
): Promise<FilamentVariantSchema> {
  return apiFetch(`/admin/variants/${variantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminDeleteVariant(variantId: number): Promise<void> {
  await apiFetch(`/admin/variants/${variantId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export async function getReviews(): Promise<ReviewOut[]> {
  return apiFetch("/reviews", { next: { revalidate: REVALIDATE_STATIC } });
}

export async function adminListReviews(): Promise<ReviewOut[]> {
  return apiFetch("/reviews/admin", {
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function adminCreateReview(data: ReviewCreate): Promise<ReviewOut> {
  return apiFetch("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminUpdateReview(id: number, data: ReviewUpdate): Promise<ReviewOut> {
  return apiFetch(`/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminDeleteReview(id: number): Promise<void> {
  await apiFetch(`/reviews/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function adminApproveReview(id: number): Promise<ReviewOut> {
  return apiFetch(`/reviews/${id}/approve`, {
    method: "PATCH",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── One-time review request links ────────────────────────────────────────────

export async function adminCreateReviewRequest(
  data: { customer_name?: string; customer_email?: string; note?: string }
): Promise<ReviewRequest> {
  return apiFetch("/reviews/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function adminListReviewRequests(): Promise<ReviewRequest[]> {
  return apiFetch("/reviews/requests", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function getReviewRequest(token: string): Promise<ReviewRequestPublic> {
  return apiFetch(`/reviews/request/${token}`, { cache: "no-store" });
}

export async function submitReviewViaToken(
  token: string,
  data: ReviewSubmitPayload
): Promise<ReviewOut> {
  return apiFetch(`/reviews/request/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

// ── Blog ───────────────────────────────────────────────────────────────────

export interface BlogFilters {
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

const REVALIDATE_BLOG = 60;

export async function getBlogPosts(
  filters: BlogFilters = {}
): Promise<PaginatedResponse<BlogPostList>> {
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/blog/posts${suffix}`, { next: { revalidate: REVALIDATE_BLOG } });
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  try {
    return await apiFetch<BlogPostDetail>(`/blog/posts/${slug}`, { cache: "no-store" });
  } catch {
    return null;
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  return apiFetch("/blog/categories", { next: { revalidate: REVALIDATE_BLOG } });
}

export async function getBlogTags(): Promise<BlogTag[]> {
  return apiFetch("/blog/tags", { next: { revalidate: REVALIDATE_BLOG } });
}

export async function getBlogComments(slug: string): Promise<BlogComment[]> {
  return apiFetch(`/blog/posts/${slug}/comments`, { cache: "no-store" });
}

export async function addBlogComment(
  slug: string,
  data: { author_name: string; author_email?: string; content: string; parent_id?: number }
): Promise<BlogComment> {
  return apiFetch(`/blog/posts/${slug}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

// ── Blog comment moderation (admin) ─────────────────────────────────────────

export async function getAdminBlogComments(approved?: boolean): Promise<BlogCommentAdmin[]> {
  const qs = approved === undefined ? "" : `?approved=${approved}`;
  return apiFetch(`/blog/admin/comments${qs}`, { headers: { ...authHeader() }, cache: "no-store" });
}

export async function approveBlogComment(commentId: number): Promise<BlogComment> {
  return apiFetch(`/blog/comments/${commentId}/approve`, {
    method: "PATCH",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function deleteBlogComment(commentId: number): Promise<void> {
  await apiFetch(`/blog/comments/${commentId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Product comments (public) ───────────────────────────────────────────────

export async function getProductComments(slug: string): Promise<ProductComment[]> {
  return apiFetch(`/products/${slug}/comments`, { cache: "no-store" });
}

export async function addProductComment(
  slug: string,
  data: { author_name: string; author_email?: string; content: string }
): Promise<ProductComment> {
  return apiFetch(`/products/${slug}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

// ── Product comment moderation (admin) ──────────────────────────────────────

export async function getAdminProductComments(approved?: boolean): Promise<ProductCommentAdmin[]> {
  const qs = approved === undefined ? "" : `?approved=${approved}`;
  return apiFetch(`/admin/product-comments${qs}`, { headers: { ...authHeader() }, cache: "no-store" });
}

export async function approveProductComment(commentId: number): Promise<ProductComment> {
  return apiFetch(`/admin/product-comments/${commentId}/approve`, {
    method: "PATCH",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function deleteProductComment(commentId: number): Promise<void> {
  await apiFetch(`/admin/product-comments/${commentId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Contact form (public) ────────────────────────────────────────────────────

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<ContactMessage> {
  return apiFetch("/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

// ── Newsletter (public) ──────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string): Promise<NewsletterSubscribeResult> {
  return apiFetch("/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
}

// ── Contact messages & newsletter (admin) ─────────────────────────────────────

export async function getContactMessages(unreadOnly = false): Promise<ContactMessage[]> {
  const qs = unreadOnly ? "?unread_only=true" : "";
  return apiFetch(`/admin/contact-messages${qs}`, { headers: { ...authHeader() }, cache: "no-store" });
}

export async function setContactMessageRead(id: number, isRead: boolean): Promise<ContactMessage> {
  return apiFetch(`/admin/contact-messages/${id}/read?is_read=${isRead}`, {
    method: "PATCH",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function deleteContactMessage(id: number): Promise<void> {
  await apiFetch(`/admin/contact-messages/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  return apiFetch("/admin/newsletter/subscribers", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function deleteNewsletterSubscriber(id: number): Promise<void> {
  await apiFetch(`/admin/newsletter/subscribers/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export async function getVideoTutorials(): Promise<VideoTutorial[]> {
  return apiFetch("/blog/videos", { next: { revalidate: REVALIDATE_BLOG } });
}

export async function getCommunityProjects(): Promise<CommunityProject[]> {
  return apiFetch("/blog/projects", { next: { revalidate: REVALIDATE_BLOG } });
}

// ── Community projects (admin) ───────────────────────────────────────────────

export async function getAdminProjects(): Promise<CommunityProject[]> {
  return apiFetch("/blog/admin/projects", { headers: { ...authHeader() }, cache: "no-store" });
}

export async function createProject(data: CommunityProjectPayload): Promise<CommunityProject> {
  return apiFetch("/blog/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function updateProject(
  id: number,
  data: Partial<CommunityProjectPayload>
): Promise<CommunityProject> {
  return apiFetch(`/blog/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function deleteProject(id: number): Promise<void> {
  await apiFetch(`/blog/projects/${id}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

// ── Product CSV export / import ───────────────────────────────────────────────

export async function exportProductsCsv(): Promise<Blob> {
  const res = await fetch(`${API_BASE}/admin/products/export`, {
    headers: { ...authHeader() },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, (await res.text().catch(() => "")) || `HTTP ${res.status}`);
  return res.blob();
}

export interface ProductImportResult {
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export async function importProductsCsv(file: File): Promise<ProductImportResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/admin/products/import`, {
    method: "POST",
    body: form,
    headers: { ...authHeader() },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new ApiError(res.status, (await res.text().catch(() => "")) || `HTTP ${res.status}`);
  return res.json();
}

export async function syncFacebookPosts(): Promise<SyncResult> {
  return apiFetch("/blog/sync-facebook", {
    method: "POST",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}

export interface BlogPostPayload {
  title: string;
  excerpt?: string;
  content?: string;
  cover_image?: string;
  author_name?: string;
  category_id?: number;
  tags?: string[];
  is_published?: boolean;
}

export async function createBlogPost(data: BlogPostPayload): Promise<BlogPostDetail> {
  return apiFetch("/blog/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

export async function deleteBlogPost(postId: number): Promise<void> {
  await apiFetch(`/blog/posts/${postId}`, {
    method: "DELETE",
    headers: { ...authHeader() },
    cache: "no-store",
  });
}
