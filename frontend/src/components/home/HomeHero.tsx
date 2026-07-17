"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ShoppingBagIcon } from "./icons";

interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  brands: string;
  gradient: string;
}

const SLIDES: Slide[] = [
  {
    title: "Next-Gen\nPrototyping\nSolution",
    subtitle: "Bangladesh's Largest 3D Printer Shop",
    cta: "Shop now",
    href: "/shop?product_type=printer",
    image: "/home/hero-printer.png",
    brands: "Bambu lab | Creality | Elegoo | Snapmaker",
    gradient:
      "linear-gradient(100deg, #f2ddc4 0%, #ecd9cf 22%, #e7e9f0 48%, #d2e1f4 74%, #c2d8ee 100%)",
  },
  {
    title: "Precision\nLaser\nEngraving",
    subtitle: "Cut & engrave wood, acrylic, leather & more",
    cta: "Explore lasers",
    href: "/shop?product_type=laser",
    image: "/home/hero-printer.png",
    brands: "Algo Laser | xTool | Creality | Elegoo",
    gradient:
      "linear-gradient(100deg, #f6dfca 0%, #f3dccd 26%, #efe4dd 52%, #f0d9cf 78%, #f3cdb6 100%)",
  },
  {
    title: "Premium\nFilament\nIn Stock",
    subtitle: "PLA, ABS, PETG, TPU & more — every colour",
    cta: "Shop filament",
    href: "/shop?product_type=filament",
    image: "/home/hero-printer.png",
    brands: "Sunlu | Bambu lab | Polymaker | eSun",
    gradient:
      "linear-gradient(100deg, #dcefe0 0%, #e3f0e6 26%, #e7ecef 52%, #d6e4f2 78%, #c4dbee 100%)",
  },
];

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const count = SLIDES.length;

  const go = useCallback((dir: number) => {
    setIndex((i) => (i + dir + count) % count);
  }, [count]);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count]);

  const slide = SLIDES[index];

  return (
    <section className="pbd-hero" style={{ background: slide.gradient }} aria-label="Featured">
      <button className="pbd-hero-side left" onClick={() => go(-1)} aria-label="Previous slide">
        <ChevronLeftIcon size={16} />
      </button>

      <div className="pbd-hero-inner">
        <div style={{ maxWidth: "46%" }} className="pbd-hero-text">
          <h1 className="pbd-hero-title" style={{ whiteSpace: "pre-line" }}>
            {slide.title}
          </h1>
          <p className="pbd-hero-sub">{slide.subtitle}</p>
          <Link href={slide.href} className="pbd-hero-cta">
            {slide.cta}
            <ShoppingBagIcon size={15} />
          </Link>
        </div>

        <Image
          key={slide.image + index}
          src={slide.image}
          alt={slide.subtitle}
          width={460}
          height={380}
          className="pbd-hero-img"
          priority
        />
      </div>

      <button className="pbd-hero-side right" onClick={() => go(1)} aria-label="Next slide">
        <ChevronRightIcon size={16} />
      </button>

      <p className="pbd-hero-brands">{slide.brands}</p>
    </section>
  );
}
