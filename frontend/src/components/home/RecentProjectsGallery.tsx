"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { CommunityProject } from "@/lib/api-types";
import { buildImageUrl, imageBg } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const HALL_OF_FAME_HREF = "/blog/projects";
const AUTOPLAY_MS = 4500;

export function RecentProjectsGallery({ projects }: { projects: CommunityProject[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = projects.length;

  // Auto-advance one photo at a time (paused on hover).
  useEffect(() => {
    if (n <= 1 || paused) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % n), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [n, paused]);

  if (n === 0) return null;

  const go = (dir: number) => setIndex((p) => (p + dir + n) % n);
  const p = projects[index];

  return (
    <section className="pbd-wrap" style={{ marginTop: 56 }}>
      <div className="pbd-section-head">
        <div>
          <h2 className="pbd-section-title">Recent Projects Gallery</h2>
          <p style={{ color: "var(--pbd-ink-soft, #6b7280)", fontSize: 13.5, marginTop: 2 }}>
            Real builds from our community — tap the photo to enter the Hall of Fame.
          </p>
        </div>
        <div className="pbd-head-tools">
          <Link href={HALL_OF_FAME_HREF} className="pbd-orange-btn">🏆 Hall of Fame</Link>
          <button className="pbd-nav-arrow" onClick={() => go(-1)} aria-label="Previous project">
            <ChevronLeftIcon size={16} />
          </button>
          <button className="pbd-nav-arrow" onClick={() => go(1)} aria-label="Next project">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <div
        className="pbd-stage"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <Link href={HALL_OF_FAME_HREF} aria-label={`${p.title} — view in Hall of Fame`} className="block">
          <div key={p.id} className="pbd-stage-media pbd-fade" style={{ background: imageBg(p.image_url) }}>
            {p.image_url ? (
              <Image src={buildImageUrl(p.image_url)} alt={p.title} fill sizes="1200px" className="object-cover" priority={index === 0} />
            ) : (
              <span className="pbd-stage-placeholder">🛠️</span>
            )}
            {p.is_featured && <span className="pbd-proj-badge">★ Featured</span>}
            <div className="pbd-stage-overlay">
              <span className="pbd-stage-title">{p.title}</span>
              {p.description && <p className="pbd-stage-desc">{p.description}</p>}
              <span className="pbd-stage-author">by {p.author_name}</span>
            </div>
          </div>
        </Link>

        {/* Dots */}
        {n > 1 && (
          <div className="pbd-stage-dots">
            {projects.map((proj, i) => (
              <button
                key={proj.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to project ${i + 1}`}
                className="pbd-stage-dot"
                style={{
                  background: i === index ? "#f2890e" : "rgba(255,255,255,0.55)",
                  width: i === index ? 22 : 8,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
