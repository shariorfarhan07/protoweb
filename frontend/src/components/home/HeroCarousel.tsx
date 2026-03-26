"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  tag: string;
  heading: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  alt: string;
  bgGradient: string;
}

const SLIDES: Slide[] = [
  {
    tag: "3D Printers",
    heading: "Print\nthe Future",
    description: "High-precision machines for every maker and creator. Push the limits of what's possible.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop?product_type=printer",
    image: "/images/asthetic-printer-595x595.png",
    alt: "3D Printer",
    bgGradient: "linear-gradient(120deg, #e8f4fd 0%, #f0f7ff 60%, #ddeeff 100%)",
  },
  {
    tag: "Two Trees",
    heading: "Built for\nCreators",
    description: "Reliable machines designed for precision and performance. Trusted by professionals worldwide.",
    ctaLabel: "Explore",
    ctaHref: "/shop?product_type=cnc",
    image: "/images/Twotrees-595x595.png",
    alt: "Two Trees",
    bgGradient: "linear-gradient(120deg, #fdf0e8 0%, #fff5f0 60%, #ffe8d6 100%)",
  },
  {
    tag: "Laser Engravers",
    heading: "Engrave\nAnything",
    description: "Pinpoint accuracy on wood, metal, acrylic and more. Precision you can see.",
    ctaLabel: "Discover",
    ctaHref: "/shop?product_type=laser",
    image: "/images/Laser-Engraver-595x595.png",
    alt: "Laser Engraver",
    bgGradient: "linear-gradient(120deg, #e8fdf0 0%, #f0fff5 60%, #d6ffe8 100%)",
  },
  {
    tag: "Filament",
    heading: "Premium\nFilament",
    description: "Consistent color, flawless finish on every single print. The material matters.",
    ctaLabel: "View Range",
    ctaHref: "/shop?product_type=filament",
    image: "/images/Filament.png",
    alt: "Filament",
    bgGradient: "linear-gradient(120deg, #f5e8fd 0%, #faf0ff 60%, #ead6ff 100%)",
  },
];

const AUTO_INTERVAL = 5000;
const total = SLIDES.length;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent((c) => (c + 1) % total), AUTO_INTERVAL);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  function changeSlide(dir: number) {
    setCurrent((c) => ((c + dir) % total + total) % total);
    resetTimer();
  }

  function goToSlide(n: number) {
    setCurrent(n);
    resetTimer();
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) changeSlide(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  }

  return (
    <div
      className="hero-carousel"
      style={{ position: "relative", overflow: "hidden", background: "#fff" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides track */}
      <div
        style={{
          display: "flex",
          height: "100%",
          transition: "transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)",
          transform: `translateX(-${current * 100}%)`,
        }}
      >
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className="hero-slide"
            style={{ minWidth: "100%", height: "100%", position: "relative" }}
          >
            {/* Background */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0, background: s.bgGradient }} aria-hidden="true" />

            {/* Content: flex-col on mobile, row on desktop */}
            <div className="hero-slide-inner" style={{ position: "relative", zIndex: 1, height: "100%" }}>
              {/* Text block */}
              <div className="hero-slide-text">
                <span className="hero-tag">{s.tag}</span>
                <h1 className="hero-heading" style={{ whiteSpace: "pre-line" }}>{s.heading}</h1>
                <p className="hero-desc">{s.description}</p>
                <Link href={s.ctaHref} className="hero-cta">
                  {s.ctaLabel} <span>→</span>
                </Link>
              </div>

              {/* Image — hidden on very small screens */}
              <div className="hero-img-wrap" aria-hidden="true">
                <div className="hero-img-circle" />
                <Image
                  src={s.image}
                  alt={s.alt}
                  width={340}
                  height={340}
                  className="hero-img"
                  priority={i === 0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev button */}
      <button
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
        className="hero-arrow hero-arrow-left"
      >
        &#8592;
      </button>

      {/* Next button */}
      <button
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        className="hero-arrow hero-arrow-right"
      >
        &#8594;
      </button>

      {/* Dots */}
      <div className="hero-dots" aria-label="Slide indicators">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-pressed={i === current}
            className="hero-dot"
            style={{
              width: i === current ? 24 : 6,
              background: i === current ? "#111" : "rgba(0,0,0,0.2)",
              borderRadius: i === current ? 4 : "50%",
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="hero-counter" aria-live="polite">
        0{current + 1} / 0{total}
      </div>
    </div>
  );
}
