"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface Service {
  key: string;
  label: string;
  specs: string[];
  from: string;
}

const SERVICES: Service[] = [
  {
    key: "fdm",
    label: "FDM 3D Printing",
    specs: [
      "Format : STL, Obj, 3MF, 3dm, Skp",
      "Material : PLA, ABS, PETG, TPU, PA, CF Etc.",
      "Tolerance Down To ± 0.2mm",
    ],
    from: "8 taka per gram",
  },
  {
    key: "cad",
    label: "CAD Designing",
    specs: [
      "Format : STEP, IGES, STL, SLDPRT",
      "Parametric & mechanical modelling",
      "Design for manufacturability",
    ],
    from: "500 taka per model",
  },
  {
    key: "sla",
    label: "SLA 3D Printing",
    specs: [
      "Format : STL, Obj, 3MF",
      "Material : Standard, Tough & Resin",
      "Layer height down to 25 microns",
    ],
    from: "15 taka per gram",
  },
  {
    key: "cnc",
    label: "CNC 2D Cutting",
    specs: [
      "Format : DXF, DWG, AI, SVG",
      "Material : Wood, Acrylic, MDF, Foam",
      "Bed size up to 1200 x 1200mm",
    ],
    from: "12 taka per cut",
  },
  {
    key: "laser",
    label: "Laser Cutting/Engraving",
    specs: [
      "Format : DXF, SVG, AI, PNG",
      "Material : Wood, Acrylic, Leather, Paper",
      "Engraving precision 0.05mm",
    ],
    from: "10 taka per minute",
  },
  {
    key: "pcb",
    label: "PCB Printing",
    specs: [
      "Format : Gerber, KiCad, Eagle",
      "Single & double-sided boards",
      "Min trace width 6 mil",
    ],
    from: "300 taka per board",
  },
];

export function ServiceShowcase() {
  const [active, setActive] = useState(0);
  const svc = SERVICES[active];

  return (
    <section id="services" className="pbd-wrap" style={{ marginTop: 64, scrollMarginTop: 90 }}>
      <h2 className="pbd-section-title" style={{ maxWidth: 520, marginBottom: 28 }}>
        All-In-One Prototyping &amp; Manufacturing Solutions
      </h2>

      <div className="pbd-service">
        {/* Service selector */}
        <div className="pbd-service-list">
          {SERVICES.map((s, i) => (
            <button
              key={s.key}
              className="pbd-service-opt"
              data-active={i === active}
              onClick={() => setActive(i)}
            >
              <span className="pbd-service-dot" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Center image */}
        <Image
          src="/home/hero-printer.png"
          alt={svc.label}
          width={400}
          height={340}
          className="pbd-service-img"
          loading="lazy"
        />

        {/* Spec card */}
        <div className="pbd-service-card">
          <h3>{svc.label}</h3>
          <ul className="spec">
            {svc.specs.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
          <p className="from">
            Starts From: <b>{svc.from}</b>
          </p>
          <Link href="/contact-us" className="pbd-orange-btn" style={{ width: "100%" }}>
            Quote Now
          </Link>
          <Link href="/contact-us" className="pbd-ghost-btn">
            3D Printing Service
          </Link>
        </div>
      </div>
    </section>
  );
}
