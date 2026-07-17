"use client";

import { useEffect, useState } from "react";
import { getProductComments, addProductComment } from "@/lib/api";
import type { ProductComment } from "@/lib/api-types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** FastAPI returns errors as JSON `{"detail": "..."}`; api throws that raw body. */
function readError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(msg) as { detail?: string };
    if (parsed?.detail) return parsed.detail;
  } catch {
    /* not JSON */
  }
  return msg || "Could not post comment";
}

export function ProductComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getProductComments(slug)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      const created = await addProductComment(slug, {
        author_name: name.trim(),
        author_email: email.trim() || undefined,
        content: content.trim(),
      });
      // Held for moderation — only show immediately if already approved.
      if (created.is_approved) {
        setComments((c) => [...c, created]);
      } else {
        setNotice("Thanks! Your comment was submitted and will appear once a moderator approves it.");
      }
      setContent("");
    } catch (err) {
      setError(readError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16">
      <h2
        className="font-semibold uppercase text-xs mb-6"
        style={{ letterSpacing: 3, color: "var(--subtle)" }}
      >
        {loading ? "Comments" : `Comments (${comments.length})`}
      </h2>

      {/* Comment form */}
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl p-5 mb-8"
        style={{ border: "1px solid #eceef1" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name *"
            required
            className="rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: "1px solid #e4e6ea" }}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email (optional, not shown)"
            className="rounded-lg px-3 py-2.5 text-sm outline-none"
            style={{ border: "1px solid #e4e6ea" }}
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ask a question or share your experience…"
          required
          rows={3}
          className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-y"
          style={{ border: "1px solid #e4e6ea" }}
        />
        <p className="text-xs text-gray-400 mt-2">
          Comments are reviewed before they appear. You can post once every 5 minutes.
        </p>
        {error && (
          <p
            className="text-xs mt-2 rounded-lg px-3 py-2"
            style={{ background: "#fff1f1", color: "#c92a2a", border: "1px solid #ffd6d6" }}
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            className="text-xs mt-2 rounded-lg px-3 py-2"
            style={{ background: "#ecfdf3", color: "#15803d", border: "1px solid #bbf7d0" }}
          >
            {notice}
          </p>
        )}
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(90deg,#fbab4d,#f2890e)" }}
          >
            {submitting ? "Posting…" : "Post comment"}
          </button>
        </div>
      </form>

      {/* Comment list */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">Be the first to comment.</p>
      ) : (
        <ul className="space-y-5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: `hsl(${(c.author_name.charCodeAt(0) * 7) % 360},55%,55%)` }}
              >
                {initials(c.author_name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900">{c.author_name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
