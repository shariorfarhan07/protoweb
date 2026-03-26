"use client";

export function NewsletterForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
      <input
        type="email"
        placeholder="your@email.com"
        className="footer-email-input w-full px-4 py-2.5 rounded-xl text-sm outline-none"
      />
      <button
        type="submit"
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #ff8c42, #f59e0b)" }}
      >
        Subscribe
      </button>
    </form>
  );
}
