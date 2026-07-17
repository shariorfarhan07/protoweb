import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6"
      style={{ background: "#f4f3f0" }}
    >
      <p
        className="font-black"
        style={{ fontSize: "clamp(80px, 18vw, 160px)", letterSpacing: "-0.05em", color: "#111", lineHeight: 1 }}
      >
        404
      </p>
      <h1 className="mt-4 font-bold text-gray-900" style={{ fontSize: "clamp(20px, 4vw, 28px)" }}>
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 text-gray-500 max-w-md">
        The page you&apos;re looking for may have been moved, removed, or never existed. Let&apos;s
        get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-white"
          style={{ background: "#111" }}
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center rounded-full px-6 py-3 text-sm font-bold"
          style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.12)", color: "#111" }}
        >
          Browse the shop
        </Link>
      </div>
    </main>
  );
}
