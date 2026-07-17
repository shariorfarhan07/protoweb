"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/api";

type State = "idle" | "submitting" | "success" | "error";

const darkInput: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.1)",
  color: "#eee",
};

function focusOn(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#f2890e";
  e.currentTarget.style.background = "rgba(242,137,14,0.07)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
}

export function ContactCTASection() {
  const [state, setState] = useState<State>("idle");
  const [fields, setFields] = useState({ name: "", email: "", phone: "", message: "" });

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name.trim() || !fields.email.trim() || !fields.message.trim()) return;
    setState("submitting");
    try {
      await submitContactMessage({
        name: fields.name.trim(),
        email: fields.email.trim(),
        phone: fields.phone.trim() || undefined,
        message: fields.message.trim(),
      });
      setState("success");
      setFields({ name: "", email: "", phone: "", message: "" });
    } catch {
      setState("error");
    }
  }

  return (
    <section className="pbd-wrap" style={{ marginTop: 60 }}>
      <div
        className="rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #15171b 0%, #1d1f24 55%, #16181c 100%)" }}
      >
        {/* Decorative warm glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 18% 30%, rgba(251,171,77,0.14) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(242,137,14,0.12) 0%, transparent 45%)",
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 px-8 py-12 md:px-14 md:py-14">
          {/* Left: copy */}
          <div className="flex-1 text-center md:text-left">
            <span
              className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: "rgba(242,137,14,0.14)", color: "#fbab4d", letterSpacing: 3 }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f2890e" }} />
              Get in touch
            </span>

            <h2
              className="font-extrabold text-white leading-tight mb-3"
              style={{ fontSize: "clamp(26px, 3.6vw, 42px)", letterSpacing: -1 }}
            >
              Got a question?{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #fbab4d, #f2890e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Let&apos;s talk.
              </span>
            </h2>

            <p className="text-sm leading-relaxed max-w-sm mx-auto md:mx-0" style={{ color: "#9aa0a8" }}>
              Tell us about your project, ask about a product, or get printing advice — we usually
              reply within a day.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              {[
                { icon: "⚡", text: "Fast replies" },
                { icon: "🛠️", text: "Expert advice" },
                { icon: "📦", text: "Order help" },
              ].map((p) => (
                <span key={p.text} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#7a8088" }}>
                  <span>{p.icon}</span>
                  {p.text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: message form */}
          <div className="w-full md:w-auto md:min-w-[380px]">
            {state === "success" ? (
              <div
                className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <span className="text-4xl">✅</span>
                <p className="font-bold text-white text-lg">Message sent!</p>
                <p className="text-sm" style={{ color: "#8a9098" }}>
                  Thanks for reaching out — we&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setState("idle")}
                  className="mt-2 text-xs underline"
                  style={{ color: "#fbab4d" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Full name *"
                    value={fields.name}
                    onChange={update}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={darkInput}
                  />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone (optional)"
                    value={fields.phone}
                    onChange={update}
                    onFocus={focusOn}
                    onBlur={focusOff}
                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={darkInput}
                  />
                </div>

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address *"
                  value={fields.email}
                  onChange={update}
                  onFocus={focusOn}
                  onBlur={focusOff}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                  style={darkInput}
                />

                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Your message *"
                  value={fields.message}
                  onChange={update}
                  onFocus={focusOn}
                  onBlur={focusOff}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all resize-none"
                  style={darkInput}
                />

                {state === "error" && (
                  <p className="text-xs" style={{ color: "#ff8080" }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="w-full py-4 rounded-full text-sm font-bold text-white transition-all duration-200 hover:opacity-95 hover:-translate-y-0.5 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(90deg, #fbab4d 0%, #f2890e 100%)",
                    boxShadow: "0 8px 24px rgba(242,137,14,0.32)",
                  }}
                >
                  {state === "submitting" ? "Sending…" : "Send a message →"}
                </button>

                <p className="text-center text-xs" style={{ color: "#5c6168" }}>
                  We&apos;ll never share your details.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
