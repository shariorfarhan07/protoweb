"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, getBrands, getCategories, getProductTypes } from "@/lib/api";
import type { BrandSchema, CategorySchema, ProductTypeSchema } from "@/lib/api-types";
import MultiImageUpload from "@/components/admin/MultiImageUpload";
import SpecificationsEditor from "@/components/admin/SpecificationsEditor";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-48 rounded-xl animate-pulse" style={{ background: "#f5f5f5" }} />
  ),
});

// ── Shared form styles ────────────────────────────────────────────────────────
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

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategorySchema[]>([]);
  const [brands, setBrands] = useState<BrandSchema[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeSchema[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [specs, setSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    getProductTypes()
      .then((pts) => {
        const active = pts.filter((pt) => pt.is_active);
        setProductTypes(active);
        if (active.length > 0) setProductType(active[0].value);
      })
      .catch(() => {
        const defaults = [
          { id: 0, value: "printer", label: "3D Printer", is_active: true },
          { id: 0, value: "filament", label: "Filament", is_active: true },
          { id: 0, value: "cnc", label: "CNC / Laser Engraver", is_active: true },
          { id: 0, value: "printed", label: "3D Printed Product", is_active: true },
        ];
        setProductTypes(defaults);
        setProductType(defaults[0].value);
      });

    Promise.all([getCategories(), getBrands()]).then(([cats, brs]) => {
      setCategories(cats);
      setBrands(brs);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Product name is required");
    if (!price || isNaN(Number(price))) return setError("Valid price is required");

    setSaving(true);
    try {
      await createProduct({
        name: name.trim(), product_type: productType, price: Number(price),
        compare_price: comparePrice ? Number(comparePrice) : undefined,
        sku: sku.trim() || undefined, stock_qty: Number(stockQty) || 0,
        category_id: categoryId ? Number(categoryId) : undefined,
        brand_id: brandId ? Number(brandId) : undefined,
        short_desc: shortDesc.trim() || undefined, long_desc: longDesc || undefined,
        image_urls: imageUrls, is_featured: isFeatured,
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
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>Add Product</h1>
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
              placeholder="e.g. Bambu Lab P1S" className={inputCls} style={inputStyle} />
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
                placeholder="BL-P1S-001" className={inputCls} style={inputStyle} />
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
                placeholder="95000" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Compare Price (৳)">
              <input type="number" min={0} value={comparePrice} onChange={(e) => setComparePrice(e.target.value)}
                placeholder="105000" className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Stock Qty">
              <input type="number" min={0} value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                className={inputCls} style={inputStyle} />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none" style={{ fontSize: 13, color: "#555" }}>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
            Mark as featured (shows on homepage)
          </label>
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

        {/* Specifications */}
        <section className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#aaa" }}>Specifications</h2>
          <SpecificationsEditor value={specs} onChange={setSpecs} />
        </section>

        {/* SEO */}
        <Section title="SEO">
          <Field label="Meta Title">
            <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Bambu Lab P1S 3D Printer | PrototypeBD"
              className={inputCls} style={inputStyle} />
          </Field>
          <Field label="Meta Description">
            <textarea rows={2} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Buy the Bambu Lab P1S in Bangladesh…"
              className={inputCls} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </Section>

        {/* Submit */}
        <div className="flex gap-3 pb-10 pt-2">
          <button type="submit" disabled={saving}
            className="rounded-xl text-sm font-semibold px-6 py-2.5 transition disabled:opacity-50"
            style={{ background: "#111", color: "#fff" }}>
            {saving ? "Saving…" : "Save Product"}
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
