"use client";

import { useEffect, useState } from "react";
import type { FilamentVariantSchema } from "@/lib/api-types";
import {
  adminListVariants,
  adminCreateVariant,
  adminUpdateVariant,
  adminDeleteVariant,
} from "@/lib/api";
import ImageUpload from "@/components/admin/ImageUpload";

interface Props {
  productId: number;
}

const MATERIALS = ["PLA", "ABS", "PETG", "TPU", "ASA", "SILK"];

const inputCls = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none";
const inputStyle = { border: "1px solid #e0e0e0", color: "#111", background: "#fff" };

interface DraftVariant {
  color_name: string;
  color_hex: string;
  material: string;
  stock_qty: string;
  variant_price: string;  // absolute price; empty = use base product price
  image_url: string;
  sku: string;
  is_active: boolean;
}

const emptyDraft = (): DraftVariant => ({
  color_name: "",
  color_hex: "#000000",
  material: "",
  stock_qty: "0",
  variant_price: "",
  image_url: "",
  sku: "",
  is_active: true,
});

export default function VariantManager({ productId }: Props) {
  const [variants, setVariants] = useState<FilamentVariantSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftVariant>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    adminListVariants(productId)
      .then(setVariants)
      .catch(() => setVariants([]))
      .finally(() => setLoading(false));
  }, [productId]);

  function openAdd() {
    setEditingId(null);
    setDraft(emptyDraft());
    setError(null);
    setShowForm(true);
  }

  function openEdit(v: FilamentVariantSchema) {
    setEditingId(v.id);
    setDraft({
      color_name: v.color_name ?? "",
      color_hex: v.color_hex ?? "#000000",
      material: v.material ?? "",
      stock_qty: String(v.stock_qty),
      variant_price: v.variant_price != null ? String(v.variant_price) : "",
      image_url: v.image_url ?? "",
      sku: v.sku ?? "",
      is_active: v.is_active,
    });
    setError(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  }

  function set(field: keyof DraftVariant, value: string | boolean) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  async function handleSave() {
    if (!draft.color_name.trim()) return setError("Color name is required");
    if (!draft.color_hex || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(draft.color_hex)) {
      return setError("Valid hex color required (e.g. #FF0000)");
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        color_name: draft.color_name.trim(),
        color_hex: draft.color_hex,
        material: draft.material || null,
        stock_qty: Number(draft.stock_qty) || 0,
        variant_price: draft.variant_price.trim() !== "" ? Number(draft.variant_price) : null,
        price_delta: 0,
        image_url: draft.image_url.trim() || null,
        sku: draft.sku.trim() || null,
        is_active: draft.is_active,
      };

      if (editingId !== null) {
        const updated = await adminUpdateVariant(editingId, payload);
        setVariants((prev) => prev.map((v) => (v.id === editingId ? updated : v)));
      } else {
        const created = await adminCreateVariant(productId, payload);
        setVariants((prev) => [...prev, created]);
      }
      cancelForm();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save variant");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(variantId: number) {
    setDeletingId(variantId);
    try {
      await adminDeleteVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      if (editingId === variantId) cancelForm();
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(v: FilamentVariantSchema) {
    try {
      const updated = await adminUpdateVariant(v.id, { is_active: !v.is_active });
      setVariants((prev) => prev.map((x) => (x.id === v.id ? updated : x)));
    } catch {
      // silently ignore
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "#f0f0f0" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Existing variants list */}
      {variants.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #eee" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Color</th>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Material</th>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Price (৳)</th>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Stock</th>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Image</th>
                <th className="text-left px-4 py-2.5 font-medium text-xs" style={{ color: "#888" }}>Active</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, idx) => (
                <tr
                  key={v.id}
                  style={{
                    borderTop: idx > 0 ? "1px solid #f5f5f5" : undefined,
                    background: editingId === v.id ? "#fffbf0" : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <div
                      className="w-7 h-7 rounded-full border shadow-sm"
                      style={{ background: v.color_hex ?? "#ccc", borderColor: "#ddd" }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#111" }}>
                    {v.color_name ?? "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>
                    {v.material ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#111" }}>
                    {v.variant_price != null ? `৳${v.variant_price.toLocaleString()}` : <span style={{ color: "#ccc" }}>—</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>
                    {v.stock_qty}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#666" }}>
                    {v.image_url ? (
                      <img src={v.image_url} alt={v.color_name ?? ""} className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(v)}
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: v.is_active ? "#dcfce7" : "#f5f5f5",
                        color: v.is_active ? "#16a34a" : "#aaa",
                      }}
                    >
                      {v.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(v)}
                        className="text-xs font-medium transition"
                        style={{ color: "#555" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="text-xs font-medium transition disabled:opacity-40"
                        style={{ color: "#e5484d" }}
                      >
                        {deletingId === v.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {variants.length === 0 && !showForm && (
        <p className="text-sm" style={{ color: "#aaa" }}>
          No color variants yet. Add one below.
        </p>
      )}

      {/* Add / Edit form */}
      {showForm ? (
        <div className="rounded-xl p-5 space-y-4" style={{ border: "1px solid #e0e0e0", background: "#fafafa" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#aaa" }}>
            {editingId ? "Edit Variant" : "New Variant"}
          </p>

          {error && (
            <p className="text-xs rounded-lg px-3 py-2" style={{ background: "#fff1f1", color: "#c92a2a" }}>
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Color swatch + hex picker side by side */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
                Color <span style={{ color: "#e5484d" }}>*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.color_hex}
                  onChange={(e) => set("color_hex", e.target.value)}
                  className="w-10 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                  style={{ border: "1px solid #e0e0e0" }}
                />
                <input
                  type="text"
                  value={draft.color_hex}
                  onChange={(e) => set("color_hex", e.target.value)}
                  placeholder="#FF0000"
                  className={inputCls}
                  style={{ ...inputStyle, fontFamily: "monospace" }}
                  maxLength={7}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
                Color Name <span style={{ color: "#e5484d" }}>*</span>
              </label>
              <input
                type="text"
                value={draft.color_name}
                onChange={(e) => set("color_name", e.target.value)}
                placeholder="e.g. Midnight Black"
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
                Material
              </label>
              <select
                value={draft.material}
                onChange={(e) => set("material", e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="">— None —</option>
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
                Stock Qty
              </label>
              <input
                type="number"
                min={0}
                value={draft.stock_qty}
                onChange={(e) => set("stock_qty", e.target.value)}
                className={inputCls}
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
                Price (৳)
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={draft.variant_price}
                onChange={(e) => set("variant_price", e.target.value)}
                placeholder="Same as product"
                className={inputCls}
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: "#bbb" }}>Leave blank to use product price</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
              Color Image
            </label>
            <ImageUpload
              value={draft.image_url}
              onChange={(url) => set("image_url", url)}
              label=""
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#777" }}>
              SKU
            </label>
            <input
              type="text"
              value={draft.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="Optional variant SKU"
              className={inputCls}
              style={inputStyle}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: "#555" }}>
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="rounded"
            />
            Active (visible to customers)
          </label>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg text-sm font-semibold px-4 py-2 transition disabled:opacity-50"
              style={{ background: "#111", color: "#fff" }}
            >
              {saving ? "Saving…" : editingId ? "Update Variant" : "Add Variant"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg text-sm px-4 py-2 font-medium"
              style={{ border: "1px solid #e0e0e0", color: "#555", background: "#fff" }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2.5 transition"
          style={{ border: "1px solid #e0e0e0", color: "#555", background: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#111")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          Add Color Variant
        </button>
      )}
    </div>
  );
}
