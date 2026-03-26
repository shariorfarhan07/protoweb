"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminCreateReview,
  adminDeleteReview,
  adminListReviews,
  adminUpdateReview,
} from "@/lib/api";
import type { ReviewOut, ReviewCreate } from "@/lib/api-types";

const TH = "px-5 py-3 text-left font-medium uppercase tracking-widest whitespace-nowrap";
const TD = "px-5 py-3.5 align-middle";

const EMPTY: ReviewCreate = {
  reviewer_name: "",
  reviewer_title: "",
  avatar_url: "",
  rating: 5,
  content: "",
  is_active: true,
  sort_order: 0,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 20 20"
          fill={i <= rating ? "#f59e0b" : "none"}
          stroke={i <= rating ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

interface FormModalProps {
  initial?: ReviewOut | null;
  onClose: () => void;
  onSaved: (r: ReviewOut) => void;
}

function FormModal({ initial, onClose, onSaved }: FormModalProps) {
  const [form, setForm] = useState<ReviewCreate>(
    initial
      ? {
          reviewer_name: initial.reviewer_name,
          reviewer_title: initial.reviewer_title ?? "",
          avatar_url: initial.avatar_url ?? "",
          rating: initial.rating,
          content: initial.content,
          is_active: initial.is_active,
          sort_order: initial.sort_order,
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof ReviewCreate, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: ReviewCreate = {
        ...form,
        reviewer_title: form.reviewer_title || null,
        avatar_url: form.avatar_url || null,
      };
      const saved = initial
        ? await adminUpdateReview(initial.id, payload)
        : await adminCreateReview(payload);
      onSaved(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900 focus:ring-0 transition-colors";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900" style={{ fontSize: 15 }}>
            {initial ? "Edit Review" : "Add Review"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a" }}>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Reviewer Name *</label>
              <input
                required
                className={inputCls}
                value={form.reviewer_name}
                onChange={(e) => set("reviewer_name", e.target.value)}
                placeholder="e.g. Sharior Rahman"
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Title / Role</label>
              <input
                className={inputCls}
                value={form.reviewer_title ?? ""}
                onChange={(e) => set("reviewer_title", e.target.value)}
                placeholder="e.g. 3D Printing Enthusiast"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Rating *</label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating", n)}
                  className="transition-transform hover:scale-110"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 20 20"
                    fill={n <= form.rating ? "#f59e0b" : "none"}
                    stroke={n <= form.rating ? "#f59e0b" : "#d1d5db"}
                    strokeWidth="1.5"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="text-sm text-gray-500 ml-1">{form.rating}/5</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>Review Content *</label>
            <textarea
              required
              rows={4}
              className={inputCls + " resize-none"}
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="What did the customer say about their experience?"
            />
          </div>

          <div>
            <label className={labelCls}>Avatar URL</label>
            <input
              className={inputCls}
              value={form.avatar_url ?? ""}
              onChange={(e) => set("avatar_url", e.target.value)}
              placeholder="https://... (leave blank for initials avatar)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sort Order</label>
              <input
                type="number"
                className={inputCls}
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                  checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                />
                <span className="text-sm text-gray-700">Active (show on site)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm rounded-lg font-medium text-white transition-opacity"
              style={{ background: "#111", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "Saving…" : initial ? "Save changes" : "Add review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"new" | ReviewOut | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReviews(await adminListReviews());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function handleSaved(r: ReviewOut) {
    setReviews((prev) => {
      const idx = prev.findIndex((x) => x.id === r.id);
      return idx >= 0 ? prev.map((x) => (x.id === r.id ? r : x)) : [r, ...prev];
    });
    setModal(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this review?")) return;
    setDeletingId(id);
    try {
      await adminDeleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(review: ReviewOut) {
    try {
      const updated = await adminUpdateReview(review.id, { is_active: !review.is_active });
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage testimonials shown in the home page carousel
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ background: "#111" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Review
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading…</div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">No reviews yet.</p>
            <button
              onClick={() => setModal("new")}
              className="mt-4 text-sm font-medium text-gray-900 underline underline-offset-2"
            >
              Add the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm" style={{ color: "#111" }}>
            <thead>
              <tr className="border-b border-gray-100" style={{ fontSize: 10, color: "#9ca3af" }}>
                <th className={TH}>#</th>
                <th className={TH}>Reviewer</th>
                <th className={TH}>Rating</th>
                <th className={TH}>Content</th>
                <th className={TH}>Sort</th>
                <th className={TH}>Status</th>
                <th className={TH}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className={TD + " text-gray-400"}>{r.id}</td>
                  <td className={TD}>
                    <div className="font-medium text-gray-900">{r.reviewer_name}</div>
                    {r.reviewer_title && (
                      <div className="text-xs text-gray-400 mt-0.5">{r.reviewer_title}</div>
                    )}
                  </td>
                  <td className={TD}>
                    <StarRating rating={r.rating} />
                  </td>
                  <td className={TD}>
                    <p
                      className="text-gray-600 max-w-xs truncate"
                      title={r.content}
                      style={{ maxWidth: 220 }}
                    >
                      {r.content}
                    </p>
                  </td>
                  <td className={TD + " text-gray-500"}>{r.sort_order}</td>
                  <td className={TD}>
                    <button
                      onClick={() => handleToggleActive(r)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                      style={
                        r.is_active
                          ? { background: "#edfff5", color: "#1a7a45" }
                          : { background: "#f3f4f6", color: "#6b7280" }
                      }
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: r.is_active ? "#1a7a45" : "#9ca3af" }}
                      />
                      {r.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className={TD}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal(r)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: "#fff1f1", color: "#c92a2a", opacity: deletingId === r.id ? 0.5 : 1 }}
                      >
                        {deletingId === r.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <FormModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
