"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminProduct, updateProduct, getBrands, getCategories, getProductTypes } from "@/lib/api";
import type { BrandSchema, CategorySchema, ProductDetail, ProductTypeSchema } from "@/lib/api-types";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import SpecificationsEditor from "@/components/admin/SpecificationsEditor";
import VariantManager from "@/components/admin/VariantManager";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-xl animate-pulse" style={{ background: "#f5f5f5" }} />
  ),
});

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm transition focus:outline-none";
const inputStyle = { border: "1px solid #e0e0e0", color: "#111", background: "#fff" };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "#777", marginBottom: 6, letterSpacing: "0.03em" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: "#e5484d" }}> *</span>}</label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-6 space-y-5" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#aaa" }}>{title}</h2>
      {children}
    </section>
  );
}

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
    if (!productId || isNaN(productId)) { setNotFound(true); setLoading(false); return; }

    getProductTypes()
      .then((pts) => setProductTypes(pts.filter((pt) => pt.is_active)))
      .catch(() => setProductTypes([
        { id: 0, value: "printer", label: "3D Printer", is_active: true },
        { id: 0, value: "filament", label: "Filament", is_active: true },
        { id: 0, value: "cnc", label: "CNC / Laser Engraver", is_active: true },
        { id: 0, value: "printed", label: "3D Printed Product", is_active: true },
      ]));

    Promise.all([getAdminProduct(productId), getCategories(), getBrands()])
      .then(([product, cats, brs]) => {
        setCategories(cats); setBrands(brs);
        populateForm(product, cats, brs);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("404") || msg.includes("not found")) setNotFound(true);
        else setError(msg);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  function populateForm(p: ProductDetail, cats: CategorySchema[], brs: BrandSchema[]) {
    setName(p.name); setProductType(p.product_type); setPrice(String(p.price));
    setComparePrice(p.compare_price != null ? String(p.compare_price) : "");
    setSku(p.sku ?? ""); setStockQty(String(p.stock_qty));
    const matchedCat = p.category ? cats.find((c) => c.slug === p.category!.slug) : null;
    const matchedBrand = p.brand ? brs.find((b) => b.slug === p.brand!.slug) : null;
    setCategoryId(matchedCat ? String(matchedCat.id) : "");
    setBrandId(matchedBrand ? String(matchedBrand.id) : "");
    setShortDesc(p.short_desc ?? ""); setLongDesc(p.long_desc ?? "");
    const sorted = [...(p.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    setImageUrls(sorted.map((img) => img.url));
    setIsFeatured(p.is_featured ?? false); setIsActive(p.is_active ?? true);
    setMetaTitle(p.meta_title ?? ""); setMetaDesc(p.meta_desc ?? "");
    setSpecs(p.specifications
      ? Object.fromEntries(Object.entries(p.specifications).map(([k, v]) => [k, String(v)]))
      : {});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!name.trim()) return setError("Product name is required");
    if (!price || isNaN(Number(price))) return setError("Valid price is required");

    setSaving(true);
    try {
      await updateProduct(productId, {
        name: name.trim(), product_type: productType, price: Number(price),
        compare_price: comparePrice ? Number(comparePrice) : undefined,
        sku: sku.trim() || undefined, stock_qty: Number(stockQty) || 0,
        category_id: categoryId ? Number(categoryId) : undefined,
        brand_id: brandId ? Number(brandId) : undefined,
        short_desc: shortDesc.trim() || undefined, long_desc: longDesc || undefined,
        image_urls: imageUrls, is_featured: isFeatured, is_active: isActive,
        meta_title: metaTitle.trim() || undefined, meta_desc: metaDesc.trim() || undefined,
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
      <div className="p-10 max-w-3xl">
        <div className="h-7 w-40 rounded-full animate-pulse mb-8" style={{ background: "#ebebeb" }} />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#f5f5f5" }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-10 max-w-3xl">
        <p style={{ color: "#e5484d" }}>Product not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-sm" style={{ color: "#111", textDecoration: "underline" }}>
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-xs font-medium transition mb-4 flex items-center gap-1"
          style={{ color: "#aaa" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111")}
          onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}>
          ← Back
        </button>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Edit Product</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center justify-between"
          style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
          <button onClick={() => setError(null)} className="font-bold ml-3">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <Section title="Basic Info">
          <Field label="Product Name" required>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
              className={inputCls} style={inputStyle} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Type" required>
              <select value={productType} onChange={(e) => setProductType(e.target.value)}
                className={inputCls} style={inputStyle}>
                {productTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="SKU">
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className={inputCls} style={inputStyle}>
                <option value="">— None —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Brand">
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)}
                className={inputCls} style={inputStyle}>
                <option value="">— None —</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Pricing & Stock */}
        <Section title="Pricing & Stock">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price (৳)" required>
              <input type="number" required min={0} value={price} onChange={(e) => setPrice(e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Compare Price (৳)">
              <input type="number" min={0} value={comparePrice} onChange={(e) => setComparePrice(e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Stock Qty">
              <input type="number" min={0} value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>
          </div>

          <div className="flex items-center gap-6">
            {[
              { checked: isFeatured, onChange: setIsFeatured, label: "Mark as featured" },
              { checked: isActive, onChange: setIsActive, label: "Active (visible in store)" },
            ].map(({ checked, onChange, label }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer select-none" style={{ fontSize: 13, color: "#555" }}>
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </Section>

        {/* Images */}
        <section className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#aaa" }}>Images</h2>
          <MultiImageUpload value={imageUrls} onChange={setImageUrls} />
        </section>

        {/* Description */}
        <Section title="Description">
          <Field label="Short Description">
            <input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
              placeholder="One-line summary shown on product cards"
              className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Long Description">
            <RichTextEditor value={longDesc} onChange={setLongDesc}
              placeholder="Write a detailed product description…" minHeight={320} />
          </Field>
        </Section>

        {/* Color Variants */}
        <section className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#aaa" }}>Color Variants</h2>
          <p className="text-xs mb-5" style={{ color: "#bbb" }}>
            Add per-color stock, image, and pricing. Each color swatch lets customers switch the displayed product image.
          </p>
          <VariantManager productId={productId} />
        </section>

        {/* Specifications */}
        <section className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#aaa" }}>Specifications</h2>
          <SpecificationsEditor value={specs} onChange={setSpecs} />
        </section>

        {/* SEO */}
        <Section title="SEO">
          <Field label="Meta Title">
            <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Meta Description">
            <textarea rows={2} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)}
              className={inputCls} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </Section>

        {/* Submit */}
        <div className="flex gap-3 pb-10 pt-2">
          <button type="submit" disabled={saving}
            className="rounded-xl text-sm font-semibold px-6 py-2.5 transition disabled:opacity-50"
            style={{ background: "#111", color: "#fff" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="rounded-xl text-sm px-4 py-2.5 transition font-medium"
            style={{ border: "1px solid #e0e0e0", color: "#555", background: "#fff" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
