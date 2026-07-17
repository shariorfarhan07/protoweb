"use client";

import { useState } from "react";
import { subscribeNewsletter } from "@/lib/api";

type State = "idle" | "submitting" | "done" | "error";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("submitting");
    try {
      const res = await subscribeNewsletter(email.trim());
      setMessage(res.message);
      setState("done");
      setEmail("");
    } catch {
      setMessage("Couldn't subscribe. Please try again.");
      setState("error");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#ff8c42" }} />
        <p className="text-xs font-bold uppercase tracking-widest text-white" style={{ letterSpacing: 2 }}>
          Newsletter
        </p>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: "#777", maxWidth: 240 }}>
        New products, deals & printing tips — straight to your inbox.
      </p>

      {state === "done" ? (
        <p
          className="text-xs rounded-lg px-3 py-2.5"
          style={{ background: "rgba(46,204,113,0.12)", color: "#5fe09a", border: "1px solid rgba(46,204,113,0.25)" }}
        >
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2" style={{ maxWidth: 260 }}>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#eee" }}
            />
            <button
              type="submit"
              disabled={state === "submitting"}
              className="rounded-lg px-3 py-2 text-sm font-bold text-white shrink-0 disabled:opacity-60"
              style={{ background: "linear-gradient(90deg,#fbab4d,#f2890e)" }}
            >
              {state === "submitting" ? "…" : "Join"}
            </button>
          </div>
          {state === "error" && (
            <p className="text-xs" style={{ color: "#ff8080" }}>{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
