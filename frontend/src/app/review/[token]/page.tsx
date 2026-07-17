"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReviewRequest, submitReviewViaToken } from "@/lib/api";

type Status = "loading" | "invalid" | "used" | "form" | "done";

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <svg width="34" height="34" viewBox="0 0 20 20"
            fill={n <= value ? "#f59e0b" : "none"}
            stroke={n <= value ? "#f59e0b" : "#d1d5db"} strokeWidth="1.5">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewPage({ params }: { params: { token: string } }) {
  const { token } = params;

  const [status, setStatus] = useState<Status>("loading");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReviewRequest(token)
      .then((r) => {
        if (!r.valid) setStatus("invalid");
        else if (r.used) setStatus("used");
        else {
          if (r.customer_name) setName(r.customer_name);
          setStatus("form");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || content.trim().length < 10) {
      setError("Please add your name and a review of at least 10 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await submitReviewViaToken(token, {
        reviewer_name: name.trim(),
        reviewer_title: title.trim() || undefined,
        rating,
        content: content.trim(),
      });
      setStatus("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit your review.";
      if (msg.toLowerCase().includes("already")) setStatus("used");
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#f4f4f0" }}>
      <div className="w-full max-w-lg">
        {status === "loading" && (
          <div className="text-center text-gray-400">Loading…</div>
        )}

        {status === "invalid" && (
          <Card emoji="🔗" title="Invalid review link">
            This link isn’t valid. Please check the URL or ask us for a new one.
            <BackHome />
          </Card>
        )}

        {status === "used" && (
          <Card emoji="✅" title="Already submitted">
            This review link has already been used. Thank you!
            <BackHome />
          </Card>
        )}

        {status === "done" && (
          <Card emoji="🎉" title="Thank you for your review!">
            Your review has been submitted and will appear on our site once it’s approved by our team.
            <BackHome />
          </Card>
        )}

        {status === "form" && (
          <div className="bg-white rounded-2xl p-7" style={{ border: "1px solid #eceef1" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f2890e", letterSpacing: 3 }}>
              PrototypeBD
            </p>
            <h1 className="font-extrabold tracking-tight text-gray-900 mb-1" style={{ fontSize: 24, letterSpacing: -0.5 }}>
              Leave us a review
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              We’d love to hear about your experience. It only takes a minute.
            </p>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#999" }}>
                  Your rating
                </label>
                <Stars value={rating} onChange={setRating} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name *"
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ border: "1px solid #e4e6ea" }}
                />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (e.g. Maker, optional)"
                  className="rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ border: "1px solid #e4e6ea" }}
                />
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Tell us what you thought… *"
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-y"
                style={{ border: "1px solid #e4e6ea" }}
              />

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full py-3 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(90deg,#fbab4d,#f2890e)" }}
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center" style={{ border: "1px solid #eceef1" }}>
      <p className="text-5xl mb-4">{emoji}</p>
      <h1 className="font-extrabold text-gray-900 mb-2" style={{ fontSize: 22 }}>{title}</h1>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">{children}</p>
    </div>
  );
}

function BackHome() {
  return (
    <div className="mt-6">
      <Link href="/" className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-white" style={{ background: "#1b1e23" }}>
        Back to PrototypeBD
      </Link>
    </div>
  );
}
