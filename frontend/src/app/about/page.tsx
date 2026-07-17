import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Bangladesh's Premier 3D Printing Shop",
  description:
    "Learn about PrototypeBD — Bangladesh's leading source for 3D printers, laser engravers, CNC machines, and premium filament. Based in Aftab Nagar, Dhaka.",
  keywords: [
    "PrototypeBD about",
    "3D printing Bangladesh",
    "laser engraver Dhaka",
    "3D printer shop Bangladesh",
    "about PrototypeBD",
    "3D printing company Dhaka",
  ],
  openGraph: {
    title: "About PrototypeBD — 3D Printing & Tech Solutions, Dhaka",
    description:
      "Discover PrototypeBD's story, mission, and commitment to making 3D printing and laser engraving accessible across Bangladesh.",
    url: "/about",
  },
  alternates: { canonical: "/about" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://prototypebd.com/about",
      name: "About PrototypeBD",
      url: "https://prototypebd.com/about",
      description:
        "Bangladesh's premier source for 3D printers, laser engravers, CNC machines, and premium filament, based in Aftab Nagar, Dhaka.",
      about: {
        "@type": "Organization",
        "@id": "https://prototypebd.com/#organization",
        name: "PrototypeBD",
        url: "https://prototypebd.com",
        logo: "https://prototypebd.com/logo.png",
        foundingDate: "2020",
        address: {
          "@type": "PostalAddress",
          streetAddress: "House 53, Road 05, Sector 01, Block E, Aftab Nagar",
          addressLocality: "Dhaka",
          postalCode: "1212",
          addressCountry: "BD",
        },
        telephone: ["+8801884502768", "+8801970553712"],
        email: "admin@prototypebd.com",
        sameAs: ["https://facebook.com/pbd2.0"],
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://prototypebd.com/" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://prototypebd.com/about" },
      ],
    },
  ],
};

const OFFERINGS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    color: "#4f46e5",
    bg: "linear-gradient(135deg,#eef2ff,#e0e7ff)",
    title: "3D Printers",
    body:
      "FDM and resin printers from top global brands. We carry entry-level machines for hobbyists all the way to professional desktop printers for engineers and designers.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 22V12" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        <circle cx="12" cy="5" r="3" />
        <path d="M6.6 18.4 4 20" />
        <path d="M17.4 18.4 20 20" />
      </svg>
    ),
    color: "#f97316",
    bg: "linear-gradient(135deg,#fff7ed,#ffedd5)",
    title: "Laser Engravers & CNC",
    body:
      "Desktop diode laser engravers and CNC routers for wood, acrylic, leather, and metal. Perfect for small businesses, makers, and creative studios.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    color: "#0ea5e9",
    bg: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
    title: "Premium Filament",
    body:
      "PLA, PETG, ABS, ASA, TPU, and specialty filaments in a wide range of colours. Sourced from reliable manufacturers for consistent, reliable prints every time.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
    color: "#16a34a",
    bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
    title: "3D Printed Products",
    body:
      "Need something printed? We offer on-demand 3D printing services — from custom prototypes and replacement parts to decorative items and functional gadgets.",
  },
];

const VALUES = [
  {
    icon: "🎯",
    title: "Accessibility",
    body: "We believe cutting-edge manufacturing tools should be within reach of every maker, startup, and student in Bangladesh — not just large factories.",
  },
  {
    icon: "🔬",
    title: "Expert Knowledge",
    body: "Our team uses the products we sell. Every recommendation comes from real hands-on experience so you buy the right machine for your specific needs.",
  },
  {
    icon: "⚡",
    title: "Fast Support",
    body: "Questions answered within 30 minutes during business hours. We are one phone call or Facebook message away whenever you need help.",
  },
  {
    icon: "🤝",
    title: "After-Sales Care",
    body: "Our relationship doesn't end at checkout. We provide setup guidance, troubleshooting help, and honest advice on upgrades and consumables.",
  },
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        @keyframes aboutFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes aboutFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes aboutShimmer {
          from { background-position: -200% 0; }
          to   { background-position:  200% 0; }
        }

        .about-shell {
          background:
            radial-gradient(circle at 92% 8%,  rgba(79,70,229,0.13),  transparent 28%),
            radial-gradient(circle at 6%  48%,  rgba(249,115,22,0.11), transparent 24%),
            radial-gradient(circle at 68% 80%,  rgba(14,165,233,0.09), transparent 24%),
            #f4f3f0;
        }

        .about-card {
          border-radius: 22px;
          border: 1px solid rgba(15,23,42,0.08);
          background: #fff;
          box-shadow: 0 14px 40px rgba(15,23,42,0.07);
          animation: aboutFadeUp 0.45s ease both;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .about-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(15,23,42,0.12);
          border-color: rgba(79,70,229,0.2);
        }

        .about-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .hero-glass {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 100% 0%,  rgba(249,115,22,0.32),  transparent 36%),
            radial-gradient(circle at 0%   100%, rgba(79,70,229,0.36),   transparent 34%),
            linear-gradient(135deg, #0b1020 0%, #101935 46%, #1f1140 100%);
          border: 1px solid rgba(255,255,255,0.11);
          box-shadow: 0 28px 70px rgba(8,10,22,0.42);
          backdrop-filter: blur(6px);
        }
        .hero-glass::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.28) 50%, transparent 68%);
          background-size: 220% 100%;
          animation: aboutShimmer 4.5s linear infinite;
          opacity: 0.5;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.28;
          background-image: radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        .hero-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(1px);
          pointer-events: none;
          animation: aboutFloat 6s ease-in-out infinite;
        }
        .hero-title-gradient {
          background-image: linear-gradient(90deg, #ffffff 10%, #c7d2fe 42%, #fdba74 95%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-pill {
          border: 1px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(6px);
          border-radius: 16px;
        }
        .hero-muted { color: rgba(255,255,255,0.74); }

        .icon-orb {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.22s ease, box-shadow 0.24s ease;
        }
        .cta-btn::after {
          content: "";
          position: absolute;
          top: 0; left: -130%;
          width: 120%; height: 100%;
          background: linear-gradient(110deg, transparent 10%, rgba(255,255,255,0.45) 50%, transparent 90%);
          transition: left 0.5s ease;
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(15,23,42,0.2); }
        .cta-btn:hover::after { left: 120%; }

        .pulse-dot {
          width: 8px; height: 8px;
          border-radius: 9999px;
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34,197,94,0.3);
        }

        .value-card {
          border-radius: 18px;
          border: 1px solid rgba(15,23,42,0.08);
          background: #fff;
          padding: 24px;
          animation: aboutFadeUp 0.45s ease both;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .value-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 40px rgba(15,23,42,0.1);
        }
      `}</style>

      <main className="min-h-screen about-shell">

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto px-6 pt-6">
          <ol
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "#9ca3af" }}
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" itemProp="item" className="transition-colors hover:text-gray-800">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" style={{ color: "#4b5563" }}>About</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-8 pb-14">
          <div className="about-card hero-glass p-8 md:p-10 lg:p-14" style={{ animationDelay: "0.03s" }}>
            <div className="hero-grid" aria-hidden="true" />
            <div
              className="hero-glow"
              aria-hidden="true"
              style={{ width: 200, height: 200, top: -50, right: -30, background: "rgba(249,115,22,0.32)" }}
            />
            <div
              className="hero-glow"
              aria-hidden="true"
              style={{ width: 260, height: 260, bottom: -80, left: -50, background: "rgba(99,102,241,0.35)", animationDelay: "1s" }}
            />

            <div className="max-w-3xl relative">
              <span
                className="about-chip"
                style={{ background: "rgba(255,255,255,0.15)", color: "#e0e7ff" }}
              >
                <span className="pulse-dot" aria-hidden="true" />
                Est. 2020 · Dhaka, Bangladesh
              </span>

              <h1
                className="mt-5 font-black leading-tight"
                style={{ fontSize: "clamp(34px, 6.2vw, 62px)", letterSpacing: "-0.03em" }}
              >
                <span className="hero-title-gradient">Making advanced manufacturing</span>
                <span className="text-white block">accessible to every maker.</span>
              </h1>

              <p className="mt-6 hero-muted leading-8 max-w-2xl" style={{ fontSize: 17 }}>
                PrototypeBD started with a simple belief: the tools that power global innovation should
                be within reach of every engineer, student, and creative mind in Bangladesh.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {[
                { label: "Founded", value: "2020", accent: "#c7d2fe" },
                { label: "Products", value: "200+", accent: "#fdba74" },
                { label: "Customers", value: "1 000+", accent: "#6ee7b7" },
                { label: "Support", value: "6 days/wk", accent: "#fca5a5" },
              ].map((s) => (
                <div key={s.label} className="stat-pill px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: s.accent }}>
                    {s.label}
                  </p>
                  <p className="text-sm font-black text-white mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
                style={{ background: "#f97316" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Browse our products
              </Link>
              <Link
                href="/contact-us"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Get in touch
              </Link>
            </div>
          </div>
        </section>

        {/* ── Our Story ──────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="about-card p-8 md:p-10" style={{ animationDelay: "0.08s" }}>
              <span
                className="about-chip"
                style={{ background: "rgba(79,70,229,0.1)", color: "#4f46e5" }}
              >
                Our story
              </span>
              <h2
                className="mt-4 font-black leading-tight text-gray-900"
                style={{ fontSize: "clamp(24px, 3.5vw, 36px)", letterSpacing: "-0.02em" }}
              >
                From hobbyists to Bangladesh&apos;s go-to 3D printing hub
              </h2>
              <div className="mt-5 space-y-4 text-gray-600 leading-7" style={{ fontSize: 15 }}>
                <p>
                  PrototypeBD was founded in 2020 by a small group of engineers and makers who were
                  frustrated by the lack of reliable access to quality 3D printing hardware in
                  Bangladesh. Sourcing a decent filament or a replacement part meant waiting weeks
                  for overseas shipping — or settling for inferior alternatives.
                </p>
                <p>
                  We set out to fix that. Starting from a small workshop in Aftab Nagar, Dhaka, we
                  built direct relationships with leading manufacturers to bring their products to
                  the local market with proper warranty, after-sales support, and honest pricing.
                </p>
                <p>
                  Today we serve individual hobbyists, university labs, small businesses, and product
                  studios across the country — all from the same address, with the same commitment to
                  keeping makers in motion.
                </p>
              </div>
            </div>

            <div className="about-card p-8 md:p-10" style={{ animationDelay: "0.12s" }}>
              <span
                className="about-chip"
                style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
              >
                Our mission
              </span>
              <h2
                className="mt-4 font-black leading-tight text-gray-900"
                style={{ fontSize: "clamp(24px, 3.5vw, 36px)", letterSpacing: "-0.02em" }}
              >
                Empower ideas through better tools
              </h2>
              <div className="mt-5 space-y-4 text-gray-600 leading-7" style={{ fontSize: 15 }}>
                <p>
                  Our mission is straightforward: give every maker, entrepreneur, and educator in
                  Bangladesh access to the same professional-grade fabrication hardware and consumables
                  used by innovation labs around the world.
                </p>
                <p>
                  We curate our catalogue carefully — every printer, engraver, and spool we stock has
                  been evaluated by our own team. If we wouldn&apos;t recommend it to a friend, it
                  doesn&apos;t make the shelf.
                </p>
              </div>

              <div
                className="mt-6 rounded-2xl p-5"
                style={{ background: "linear-gradient(135deg,#fef9f0,#fff7ed)", border: "1px solid rgba(249,115,22,0.15)" }}
              >
                <p className="text-sm font-bold text-gray-800 leading-7">
                  &ldquo;We don&apos;t just sell hardware — we help you succeed with it.&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-500 font-medium">— PrototypeBD Team</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── What We Offer ──────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="mb-8">
            <p
              className="font-bold uppercase text-gray-400"
              style={{ fontSize: 11, letterSpacing: 4 }}
            >
              What we offer
            </p>
            <h2
              className="mt-2 font-black text-gray-900"
              style={{ fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.02em" }}
            >
              Everything a maker needs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {OFFERINGS.map((item, i) => (
              <div
                key={item.title}
                className="about-card p-7"
                style={{ animationDelay: `${0.06 * i}s` }}
              >
                <div className="flex items-start gap-4">
                  <span
                    className="icon-orb"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900" style={{ fontSize: 16 }}>{item.title}</h3>
                    <p className="mt-2 text-gray-500 leading-7" style={{ fontSize: 14 }}>{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Choose Us ──────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-14">
          <div className="mb-8">
            <p
              className="font-bold uppercase text-gray-400"
              style={{ fontSize: 11, letterSpacing: 4 }}
            >
              Why choose us
            </p>
            <h2
              className="mt-2 font-black text-gray-900"
              style={{ fontSize: "clamp(22px, 3vw, 32px)", letterSpacing: "-0.02em" }}
            >
              The PrototypeBD difference
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div key={v.title} className="value-card" style={{ animationDelay: `${0.07 * i}s` }}>
                <span style={{ fontSize: 32 }} aria-hidden="true">{v.icon}</span>
                <h3 className="mt-4 font-bold text-gray-900" style={{ fontSize: 15 }}>{v.title}</h3>
                <p className="mt-2 text-gray-500 leading-6" style={{ fontSize: 13 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="about-card rounded-3xl p-8 md:p-12 text-center"
            style={{
              animationDelay: "0.1s",
              background:
                "linear-gradient(135deg, #0b1020 0%, #101935 50%, #1f1140 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <p
              className="font-bold uppercase tracking-[0.2em] text-indigo-300"
              style={{ fontSize: 11 }}
            >
              Ready to build?
            </p>
            <h2
              className="mt-3 font-black text-white"
              style={{ fontSize: "clamp(24px, 4vw, 42px)", letterSpacing: "-0.025em" }}
            >
              Your next prototype starts here.
            </h2>
            <p
              className="mt-4 max-w-xl mx-auto leading-7"
              style={{ color: "rgba(255,255,255,0.65)", fontSize: 16 }}
            >
              Browse our full catalogue of 3D printers, laser engravers, filament, and accessories —
              or talk to our team to find the right setup for your project.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white"
                style={{ background: "#f97316" }}
              >
                Shop now →
              </Link>
              <Link
                href="/contact-us"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  color: "#e0e7ff",
                }}
              >
                Talk to us
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
