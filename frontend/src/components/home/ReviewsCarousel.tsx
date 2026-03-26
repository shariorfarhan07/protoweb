"use client";

import { useEffect, useRef, useState } from "react";
import type { ReviewOut } from "@/lib/api-types";

const PER_VIEW = 3;
const SLIDE_INTERVAL = 3500; // ms between auto-slides
const TRANSITION = "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

interface Props {
  reviews: ReviewOut[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" aria-hidden="true"
          fill={i <= rating ? "#f59e0b" : "none"}
          stroke={i <= rating ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hue = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (url) {
    return <img src={url} alt={name} width={44} height={44} className="w-11 h-11 rounded-full object-cover ring-2 ring-white flex-shrink-0" />;
  }
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center ring-2 ring-white text-white font-semibold text-sm select-none flex-shrink-0"
      style={{ background: `hsl(${hue},55%,60%)` }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewOut }) {
  return (
    <article className="bg-white rounded-2xl shadow-sm px-6 py-7 flex flex-col h-full">
      <div className="mb-3">
        <StarRating rating={review.rating} />
      </div>
      <blockquote className="flex-1 mb-5">
        <p className="text-gray-600 leading-relaxed text-sm">
          &ldquo;{review.content}&rdquo;
        </p>
      </blockquote>
      <footer className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <Avatar name={review.reviewer_name} url={review.avatar_url} />
        <div>
          <cite className="not-italic font-semibold text-gray-900 text-sm block">
            {review.reviewer_name}
          </cite>
          {review.reviewer_title && (
            <span className="text-gray-400 text-xs">{review.reviewer_title}</span>
          )}
        </div>
      </footer>
    </article>
  );
}

export default function ReviewsCarousel({ reviews }: Props) {
  const n = reviews.length;

  // Build infinite track: clone last PER_VIEW before + clone first PER_VIEW after
  const cloneBefore = reviews.slice(-PER_VIEW);
  const cloneAfter  = reviews.slice(0, PER_VIEW);
  const items = [...cloneBefore, ...reviews, ...cloneAfter];
  // Real reviews occupy indices PER_VIEW … PER_VIEW+n-1

  const [idx, setIdx]       = useState(PER_VIEW); // start at first real review
  const [instant, setInstant] = useState(false);   // true = no transition (snap)
  const idxRef   = useRef(idx);
  const pauseRef = useRef(false);
  idxRef.current = idx;

  // Silently jump to the mirrored real position after crossing a clone boundary
  function jumpTo(newIdx: number) {
    setInstant(true);
    setIdx(newIdx);
    // Re-enable transition after the browser has painted the jump
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setInstant(false))
    );
  }

  function handleTransitionEnd() {
    const cur = idxRef.current;
    if (cur < PER_VIEW) {
      jumpTo(cur + n);           // slid left past clone-before → snap to real end
    } else if (cur >= PER_VIEW + n) {
      jumpTo(cur - n);           // slid right past clone-after  → snap to real start
    }
  }

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      if (!pauseRef.current) setIdx((i) => i + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  if (n === 0) return null;

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / n).toFixed(1);

  // Active dot: which real review is the leftmost visible one
  const activeDot = ((idx - PER_VIEW) % n + n) % n;

  // Translate: each slot = 100% / PER_VIEW of container. Shift by idx slots.
  // Track width = items.length / PER_VIEW * 100% of container.
  // translateX(%) is relative to the element itself (the track).
  // So: shift = idx * (containerW / PER_VIEW) = idx * (trackW / items.length)
  // As % of track: idx / items.length * 100%
  const trackWidthPct = (items.length / PER_VIEW) * 100; // % relative to container
  const translatePct  = (idx / items.length) * 100;       // % relative to track

  return (
    <section
      aria-label={`Customer reviews — ${avgRating} average rating from ${n} customers`}
      style={{ background: "linear-gradient(135deg, #f9f9f7 0%, #f0ede8 100%)" }}
      className="px-6 md:px-12 py-20"
    >
      {/* SEO: all reviews in DOM, visually hidden */}
      <ol className="sr-only" aria-label="All customer reviews">
        {reviews.map((r) => (
          <li key={r.id}>
            <article>
              <h3>{r.reviewer_name}{r.reviewer_title ? `, ${r.reviewer_title}` : ""}</h3>
              <p>Rating: {r.rating} out of 5 stars</p>
              <blockquote>{r.content}</blockquote>
            </article>
          </li>
        ))}
      </ol>

      {/* Heading */}
      <div className="text-center mb-10">
        <p className="font-semibold uppercase text-gray-400 mb-2" style={{ fontSize: 11, letterSpacing: 4 }} aria-hidden="true">
          Customer Reviews
        </p>
        <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: -0.5 }}>
          What our customers say
        </h2>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white rounded-full shadow-sm">
          <svg width="13" height="13" viewBox="0 0 20 20" fill="#f59e0b" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-semibold text-gray-900">{avgRating}</span>
          <span className="text-sm text-gray-400">from {n} reviews</span>
        </div>
      </div>

      {/* Carousel viewport */}
      <div className="relative max-w-6xl mx-auto">
        {/* Overflow mask — negative margin compensates for card padding */}
        <div
          style={{ overflow: "hidden", margin: "0 -10px" }}
          onMouseEnter={() => { pauseRef.current = true; }}
          onMouseLeave={() => { pauseRef.current = false; }}
        >
          {/* Sliding track */}
          <div
            style={{
              display: "flex",
              width: `${trackWidthPct}%`,
              transform: `translateX(-${translatePct}%)`,
              transition: instant ? "none" : TRANSITION,
              willChange: "transform",
            }}
            onTransitionEnd={handleTransitionEnd}
            aria-live="polite"
          >
            {items.map((r, i) => (
              <div
                key={`${r.id}-${i}`}
                style={{
                  width: `${100 / items.length}%`,
                  flexShrink: 0,
                  padding: "0 10px",
                  boxSizing: "border-box",
                }}
              >
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>

        {/* Prev arrow */}
        <button
          onClick={() => setIdx((i) => i - 1)}
          aria-label="Previous review"
          className="absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={() => setIdx((i) => i + 1)}
          aria-label="Next review"
          className="absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* Dot indicators — one per review */}
        <div className="flex justify-center gap-1.5 mt-7" role="tablist" aria-label="Review navigation">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(PER_VIEW + i)}
              role="tab"
              aria-selected={i === activeDot}
              aria-label={`Go to review ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeDot ? 20 : 6,
                height: 6,
                background: i === activeDot ? "#111" : "#d1d5db",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
