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
    description:
      "High-precision machines for every maker and creator. Push the limits of what's possible.",
    ctaLabel: "Shop Now",
    ctaHref: "/shop?product_type=printer",
    image: "/images/asthetic-printer-595x595.png",
    alt: "3D Printer",
    bgGradient: "linear-gradient(120deg, #e8f4fd 0%, #f0f7ff 60%, #ddeeff 100%)",
  },
  {
    tag: "Two Trees",
    heading: "Built for\nCreators",
    description:
      "Reliable machines designed for precision and performance. Trusted by professionals worldwide.",
    ctaLabel: "Explore",
    ctaHref: "/shop?product_type=cnc",
    image: "/images/Twotrees-595x595.png",
    alt: "Two Trees",
    bgGradient: "linear-gradient(120deg, #fdf0e8 0%, #fff5f0 60%, #ffe8d6 100%)",
  },
  {
    tag: "Laser Engravers",
    heading: "Engrave\nAnything",
    description:
      "Pinpoint accuracy on wood, metal, acrylic and more. Precision you can see.",
    ctaLabel: "Discover",
    ctaHref: "/shop?product_type=laser",
    image: "/images/Laser-Engraver-595x595.png",
    alt: "Laser Engraver",
    bgGradient: "linear-gradient(120deg, #e8fdf0 0%, #f0fff5 60%, #d6ffe8 100%)",
  },
  {
    tag: "Filament",
    heading: "Premium\nFilament",
    description:
      "Consistent color, flawless finish on every single print. The material matters.",
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

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % total),
      AUTO_INTERVAL
    );
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  function changeSlide(dir: number) {
    setCurrent((c) => ((c + dir) % total + total) % total);
    resetTimer();
  }

  function goToSlide(n: number) {
    setCurrent(n);
    resetTimer();
  }

  return (
    <div
      className="hero-carousel"
      style={{
        position: "relative",
        overflow: "hidden",
        height: 560,
        margin: 24,
        borderRadius: 24,
        background: "#fff",
      }}
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
            style={{
              minWidth: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "64px 80px",
              position: "relative",
            }}
          >
            {/* Per-slide background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background: s.bgGradient,
              }}
              aria-hidden="true"
            />

            {/* Slide content */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              {/* Text */}
              <div style={{ maxWidth: "44%" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    color: "#888",
                    marginBottom: 20,
                    background: "rgba(0,0,0,0.05)",
                    padding: "5px 12px",
                    borderRadius: 100,
                  }}
                >
                  {s.tag}
                </span>
                <h1
                  style={{
                    fontSize: 54,
                    fontWeight: 900,
                    lineHeight: 1.0,
                    letterSpacing: -2,
                    color: "#111",
                    marginBottom: 16,
                    whiteSpace: "pre-line",
                  }}
                >
                  {s.heading}
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    color: "#666",
                    lineHeight: 1.7,
                    marginBottom: 36,
                    fontWeight: 400,
                  }}
                >
                  {s.description}
                </p>
                <Link
                  href={s.ctaHref}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "#111",
                    color: "#fff",
                    padding: "14px 28px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    textDecoration: "none",
                    transition: "transform 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#333";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#111";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  {s.ctaLabel}{" "}
                  <span style={{ fontSize: 16 }}>→</span>
                </Link>
              </div>

              {/* Image */}
              <div
                style={{
                  position: "relative",
                  width: 400,
                  height: 400,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* Circle bg */}
                <div
                  style={{
                    position: "absolute",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.04)",
                    zIndex: 0,
                  }}
                  aria-hidden="true"
                />
                <Image
                  src={s.image}
                  alt={s.alt}
                  width={340}
                  height={340}
                  style={{
                    objectFit: "contain",
                    position: "relative",
                    zIndex: 1,
                    animation: "floatImg 4s ease-in-out infinite",
                    filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.12))",
                  }}
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
        style={{
          position: "absolute",
          top: "50%",
          left: 24,
          transform: "translateY(-50%)",
          background: "#fff",
          border: "none",
          color: "#111",
          fontSize: 18,
          width: 46,
          height: 46,
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 10,
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.1)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%)";
        }}
      >
        &#8592;
      </button>

      {/* Next button */}
      <button
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        style={{
          position: "absolute",
          top: "50%",
          right: 24,
          transform: "translateY(-50%)",
          background: "#fff",
          border: "none",
          color: "#111",
          fontSize: 18,
          width: 46,
          height: 46,
          borderRadius: "50%",
          cursor: "pointer",
          zIndex: 10,
          boxShadow: "0 2px 16px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "box-shadow 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.18)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.1)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-50%)";
        }}
      >
        &#8594;
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          zIndex: 10,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: i === current ? 24 : 6,
              height: 6,
              borderRadius: i === current ? 4 : "50%",
              background: i === current ? "#111" : "rgba(0,0,0,0.2)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "background 0.3s, width 0.3s, border-radius 0.3s",
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 36,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 2,
          color: "#aaa",
          zIndex: 10,
        }}
        aria-live="polite"
      >
        0{current + 1} / 0{total}
      </div>
    </div>
  );
}
