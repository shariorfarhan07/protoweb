"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<FormState>("idle");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    // TODO: wire to backend endpoint
    await new Promise((r) => setTimeout(r, 1000));
    setState("success");
    setFields({ name: "", email: "", phone: "", message: "" });
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <span className="text-5xl">✅</span>
        <h3 className="font-black text-2xl text-gray-900">Message sent!</h3>
        <p className="text-gray-500 max-w-xs">
          We&apos;ve received your message and will get back to you as soon as
          possible.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-2 text-sm font-medium text-indigo-500 hover:text-indigo-700 transition-colors underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
        >
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="e.g. Rahim Uddin"
          value={fields.name}
          onChange={handleChange}
          className="contact-input w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
        >
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={handleChange}
          className="contact-input w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="contact-phone"
          className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
        >
          Phone{" "}
          <span className="normal-case font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+880 1XXX-XXXXXX"
          value={fields.phone}
          onChange={handleChange}
          className="contact-input w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
        />
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about your inquiry, project, or question…"
          value={fields.message}
          onChange={handleChange}
          className="contact-input w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all resize-none"
        />
      </div>

      {state === "error" && (
        <p className="text-sm text-red-500 font-medium">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="btn-pill w-full py-4 text-sm font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontSize: 14 }}
        aria-label="Send your message to PrototypeBD"
      >
        {state === "submitting" ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Sending…
          </span>
        ) : (
          "Send Message →"
        )}
      </button>
    </form>
  );
}
