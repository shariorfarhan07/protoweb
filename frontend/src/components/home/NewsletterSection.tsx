"use client";

import { useState } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section
      className="mx-4 md:mx-8 lg:mx-16 my-16 rounded-3xl overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(77,166,255,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168,85,247,0.12) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 px-8 py-14 md:px-16 md:py-16">

        {/* Left: copy */}
        <div className="flex-1 text-center md:text-left">
          {/* Tag */}
          <span
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(77,166,255,0.12)", color: "#4da6ff", letterSpacing: 3 }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#4da6ff" }}
            />
            Newsletter
          </span>

          <h2
            className="font-black text-white leading-tight mb-3"
            style={{ fontSize: "clamp(28px, 4vw, 46px)", letterSpacing: -1 }}
          >
            Stay ahead of the{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #4da6ff, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              curve.
            </span>
          </h2>

          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#888" }}>
            New arrivals, flash deals, and 3D printing tips — delivered straight
            to your inbox. No spam, ever.
          </p>

          {/* Perks */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
            {[
              { icon: "⚡", text: "Flash deals first" },
              { icon: "📦", text: "New arrivals" },
              { icon: "🎁", text: "Exclusive discounts" },
            ].map((p) => (
              <span
                key={p.text}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "#666" }}
              >
                <span>{p.icon}</span>
                {p.text}
              </span>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="w-full md:w-auto md:min-w-[360px]">
          {submitted ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-4xl">🎉</span>
              <p className="font-bold text-white text-lg">You&apos;re in!</p>
              <p className="text-sm" style={{ color: "#777" }}>
                Watch your inbox for the good stuff.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-2 text-xs underline"
                style={{ color: "#555" }}
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                {/* Mail icon */}
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 shrink-0"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#555"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.08)",
                    color: "#ddd",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#4da6ff";
                    e.currentTarget.style.background = "rgba(77,166,255,0.06)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #4da6ff 0%, #a855f7 100%)",
                  boxShadow: "0 8px 24px rgba(77,166,255,0.3)",
                }}
              >
                Subscribe — it&apos;s free
              </button>

              <p className="text-center text-xs" style={{ color: "#444" }}>
                Unsubscribe anytime. We respect your inbox.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
