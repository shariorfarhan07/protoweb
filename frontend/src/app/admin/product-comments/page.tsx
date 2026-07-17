"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminProductComments,
  approveProductComment,
  deleteProductComment,
} from "@/lib/api";
import type { ProductCommentAdmin } from "@/lib/api-types";

export default function AdminProductCommentsPage() {
  const [comments, setComments] = useState<ProductCommentAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setComments(await getAdminProductComments());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: number) {
    setBusy(id);
    try {
      await approveProductComment(id);
      setComments((cs) => cs.map((c) => (c.id === id ? { ...c, is_approved: true } : c)));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this comment permanently?")) return;
    setBusy(id);
    try {
      await deleteProductComment(id);
      setComments((cs) => cs.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  const pending = comments.filter((c) => !c.is_approved);
  const approved = comments.filter((c) => c.is_approved);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#111" }}>
          Product Comments
        </h1>
        <p style={{ color: "#aaa", fontSize: 13 }} className="mt-1">
          Comments appear on product pages only after you approve them.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl px-4 py-3 text-sm" style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}>
          {error}
        </div>
      )}

      {/* Pending */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold" style={{ fontSize: 15 }}>Pending</h2>
          {pending.length > 0 && (
            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "#fff4e5", color: "#c45b00" }}>
              {pending.length} awaiting approval
            </span>
          )}
        </div>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-gray-400">Nothing to review — all caught up. 🎉</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((c) => (
              <Row key={c.id} c={c} busy={busy === c.id} onApprove={handleApprove} onDelete={handleDelete} />
            ))}
          </ul>
        )}
      </div>

      {/* Approved */}
      <div className="rounded-2xl p-6" style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 className="font-semibold mb-4" style={{ fontSize: 15 }}>Approved ({approved.length})</h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : approved.length === 0 ? (
          <p className="text-sm text-gray-400">No approved comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {approved.map((c) => (
              <Row key={c.id} c={c} busy={busy === c.id} onDelete={handleDelete} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({
  c,
  busy,
  onApprove,
  onDelete,
}: {
  c: ProductCommentAdmin;
  busy: boolean;
  onApprove?: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <li className="rounded-xl p-4" style={{ border: "1px solid #f0f0ee" }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-sm">
            <span className="font-semibold text-gray-900">{c.author_name}</span>
            {c.author_email && <span className="text-gray-400"> · {c.author_email}</span>}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            on{" "}
            <a href={`/products/${c.product_slug}`} target="_blank" rel="noreferrer" className="underline">
              {c.product_name}
            </a>
            {" · "}
            {new Date(c.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {onApprove && (
            <button
              onClick={() => onApprove(c.id)}
              disabled={busy}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              style={{ background: "#1a7a45" }}
            >
              {busy ? "…" : "Approve"}
            </button>
          )}
          <button
            onClick={() => onDelete(c.id)}
            disabled={busy}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            style={{ background: "#fff1f1", color: "#c92a2a" }}
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{c.content}</p>
    </li>
  );
}
