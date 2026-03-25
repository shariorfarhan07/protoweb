"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminProduct, updateProduct, getBrands, getCategories, getProductTypes } from "@/lib/api";
import type { BrandSchema, CategorySchema, ProductDetail, ProductTypeSchema } from "@/lib/api-types";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import SpecificationsEditor from "@/components/admin/SpecificationsEditor";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-lg border border-gray-300 bg-gray-50 animate-pulse" />
  ),
});

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategorySchema[]>([]);
  const [brands, setBrands] = useState<BrandSchema[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeSchema[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [productType, setProductType] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [longDesc, setLongDesc] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId || isNaN(productId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Fetch product types independently so a failure doesn't block the form
    getProductTypes()
      .then((pts) => setProductTypes(pts.filter((pt) => pt.is_active)))
      .catch(() => {
        // Fall back to built-in defaults if the endpoint isn't available yet
        setProductTypes([
          { id: 0, value: "printer", label: "3D Printer", is_active: true },
          { id: 0, value: "filament", label: "Filament", is_active: true },
          { id: 0, value: "cnc", label: "CNC / Laser Engraver", is_active: true },
          { id: 0, value: "printed", label: "3D Printed Product", is_active: true },
        ]);
      });

    Promise.all([getAdminProduct(productId), getCategories(), getBrands()])
      .then(([product, cats, brs]) => {
        setCategories(cats);
        setBrands(brs);
        populateForm(product, cats, brs);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("404") || msg.includes("not found")) {
          setNotFound(true);
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  function populateForm(p: ProductDetail, cats: CategorySchema[], brs: BrandSchema[]) {
    setName(p.name);
    setProductType(p.product_type);
    setPrice(String(p.price));
    setComparePrice(p.compare_price != null ? String(p.compare_price) : "");
    setSku(p.sku ?? "");
    setStockQty(String(p.stock_qty));
    // Match category/brand by slug since ProductDetail only has slug+name refs
    const matchedCat = p.category ? cats.find((c) => c.slug === p.category!.slug) : null;
    const matchedBrand = p.brand ? brs.find((b) => b.slug === p.brand!.slug) : null;
    setCategoryId(matchedCat ? String(matchedCat.id) : "");
    setBrandId(matchedBrand ? String(matchedBrand.id) : "");
    setShortDesc(p.short_desc ?? "");
    setLongDesc(p.long_desc ?? "");
    // Populate all images sorted by sort_order
    const imgs = p.images ?? [];
    const sorted = [...imgs].sort((a, b) => a.sort_order - b.sort_order);
    setImageUrls(sorted.map((img) => img.url));
    setIsFeatured(p.is_featured ?? false);
    setIsActive(p.is_active ?? true);
    setMetaTitle(p.meta_title ?? "");
    setMetaDesc(p.meta_desc ?? "");
    setSpecs(
      p.specifications
        ? Object.fromEntries(Object.entries(p.specifications).map(([k, v]) => [k, String(v)]))
        : {}
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Product name is required");
    if (!price || isNaN(Number(price))) return setError("Valid price is required");

    setSaving(true);
    try {
      await updateProduct(productId, {
        name: name.trim(),
        product_type: productType,
        price: Number(price),
        compare_price: comparePrice ? Number(comparePrice) : undefined,
        sku: sku.trim() || undefined,
        stock_qty: Number(stockQty) || 0,
        category_id: categoryId ? Number(categoryId) : undefined,
        brand_id: brandId ? Number(brandId) : undefined,
        short_desc: shortDesc.trim() || undefined,
        long_desc: longDesc || undefined,
        image_urls: imageUrls,
        is_featured: isFeatured,
        is_active: isActive,
        meta_title: metaTitle.trim() || undefined,
        meta_desc: metaDesc.trim() || undefined,
        specifications: Object.keys(specs).length ? specs : undefined,
      });
      router.push("/admin/products");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8 max-w-3xl">
        <p className="text-red-600">Product not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-900 transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Basic Info ──────────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type <span className="text-red-500">*</span>
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {productTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— None —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Pricing & Stock ─────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            Pricing & Stock
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare Price (৳)
              </label>
              <input
                type="number"
                min={0}
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Qty</label>
              <input
                type="number"
                min={0}
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded"
              />
              Mark as featured
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded"
              />
              Active (visible in store)
            </label>
          </div>
        </section>

        {/* ── Product Images ───────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <MultiImageUpload
            value={imageUrls}
            onChange={setImageUrls}
          />
        </section>

        {/* ── Description ─────────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
            Description
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              placeholder="One-line summary shown on product cards"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Long Description
              <span className="ml-1 font-normal text-gray-400 text-xs">— rich text, supports images</span>
            </label>
            <RichTextEditor
              value={longDesc}
              onChange={setLongDesc}
              placeholder="Write a detailed product description…"
              minHeight={320}
            />
          </div>
        </section>

        {/* ── Specifications ───────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <SpecificationsEditor value={specs} onChange={setSpecs} />
        </section>

        {/* ── SEO ─────────────────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div className="flex gap-3 pb-10">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 text-white font-semibold text-sm px-6 py-2.5 hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-200 text-gray-700 text-sm px-4 py-2.5 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
