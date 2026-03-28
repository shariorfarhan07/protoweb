import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";

const ContactForm = dynamic(
  () => import("@/components/contact/ContactForm").then((mod) => mod.ContactForm),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
        Loading contact form...
      </div>
    ),
  }
);

/* ── SEO Metadata ──────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Contact Us — PrototypeBD | Dhaka, Bangladesh",
  description:
    "Get in touch with PrototypeBD — Bangladesh's premier 3D printer, laser engraver & filament shop. Located in Aftab Nagar, Dhaka. Call, email, or message us today.",
  keywords: [
    "PrototypeBD contact",
    "3D printer shop Dhaka",
    "laser engraver Bangladesh",
    "CNC machine Dhaka contact",
    "3D printing Aftab Nagar",
    "filament shop Dhaka",
    "contact PrototypeBD",
    "Bangladesh 3D printing support",
  ],
  openGraph: {
    title: "Contact PrototypeBD — 3D Printing & Tech Solutions, Dhaka",
    description:
      "Reach PrototypeBD by phone, email, or our contact form. Visit us at Aftab Nagar, Dhaka. Expert support for 3D printers, laser engravers, CNC & filament.",
    url: "/contact-us",
    images: [{ url: "/og-contact.png", width: 1200, height: 630, alt: "Contact PrototypeBD" }],
  },
  alternates: { canonical: "/contact-us" },
};

/* ── JSON-LD ────────────────────────────────────────────────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://prototypebd.com/#business",
      name: "PrototypeBD",
      url: "https://prototypebd.com",
      logo: "https://prototypebd.com/logo.png",
      description:
        "Bangladesh's premier source for 3D printers, laser engravers, CNC machines, and premium filament.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "House 53, Road 05, Sector 01, Block E, Aftab Nagar",
        addressLocality: "Dhaka",
        postalCode: "1212",
        addressCountry: "BD",
      },
      geo: { "@type": "GeoCoordinates", latitude: 23.7937, longitude: 90.4354 },
      hasMap: "https://maps.app.goo.gl/VP8ieFEooqrHw1MP8",
      telephone: ["+8801884502768", "+8801970553712"],
      email: ["admin@prototypebd.com", "prototypebd2020@gmail.com"],
      sameAs: ["https://facebook.com/pbd2.0"],
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "21:00",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://prototypebd.com/" },
        { "@type": "ListItem", position: 2, name: "Contact Us", item: "https://prototypebd.com/contact-us" },
      ],
    },
  ],
};

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function ContactUsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        @keyframes contactFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes contactFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes contactGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(79, 70, 229, 0.25); }
          50% { box-shadow: 0 0 28px rgba(79, 70, 229, 0.35); }
        }
        @keyframes contactShimmer {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }

        .contact-shell {
          background:
            radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.13), transparent 28%),
            radial-gradient(circle at 8% 42%, rgba(249, 115, 22, 0.12), transparent 24%),
            radial-gradient(circle at 70% 78%, rgba(24, 119, 242, 0.09), transparent 24%),
            #f4f3f0;
        }

        .contact-card {
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #fff;
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.07);
          animation: contactFadeUp 0.45s ease both;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(15, 23, 42, 0.12);
          border-color: rgba(79, 70, 229, 0.24);
        }

        .contact-chip {
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
            radial-gradient(circle at 100% 0%, rgba(249, 115, 22, 0.32), transparent 36%),
            radial-gradient(circle at 0% 100%, rgba(79, 70, 229, 0.36), transparent 34%),
            linear-gradient(135deg, #0b1020 0%, #101935 46%, #1f1140 100%);
          border: 1px solid rgba(255,255,255,0.11);
          box-shadow: 0 28px 70px rgba(8, 10, 22, 0.42);
          backdrop-filter: blur(6px);
        }
        .hero-glass::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(105deg, transparent 32%, rgba(255,255,255,0.28) 50%, transparent 68%);
          background-size: 220% 100%;
          animation: contactShimmer 4.5s linear infinite;
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
          animation: contactFloat 6s ease-in-out infinite;
        }
        .hero-title-gradient {
          background-image: linear-gradient(90deg, #ffffff 10%, #c7d2fe 42%, #fdba74 95%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-pill {
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(6px);
          border-radius: 16px;
        }
        .hero-muted {
          color: rgba(255,255,255,0.74);
        }

        .icon-orb {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: contactFloat 4s ease-in-out infinite;
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
          top: 0;
          left: -130%;
          width: 120%;
          height: 100%;
          background: linear-gradient(110deg, transparent 10%, rgba(255,255,255,0.45) 50%, transparent 90%);
          transition: left 0.5s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
        }
        .cta-btn:hover::after {
          left: 120%;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: #22c55e;
          animation: contactGlow 2s ease-in-out infinite;
        }

        .contact-link {
          color: #1f2937;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .contact-link:hover {
          color: #4f46e5;
          transform: translateX(2px);
        }
        .section-card-title {
          color: #0f172a;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 11px;
          font-weight: 800;
        }
      `}</style>

      <main className="min-h-screen contact-shell">
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
              <span itemProp="name" style={{ color: "#4b5563" }}>Contact</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        <section className="max-w-6xl mx-auto px-6 pt-8 pb-14">
          <div className="contact-card hero-glass p-8 md:p-10 lg:p-12" style={{ animationDelay: "0.03s" }}>
            <div className="hero-grid" aria-hidden="true" />
            <div
              className="hero-glow"
              aria-hidden="true"
              style={{ width: 170, height: 170, top: -40, right: -20, background: "rgba(249,115,22,0.32)" }}
            />
            <div
              className="hero-glow"
              aria-hidden="true"
              style={{ width: 220, height: 220, bottom: -70, left: -40, background: "rgba(99,102,241,0.35)", animationDelay: "1s" }}
            />
            <div className="max-w-3xl">
              <span
                className="contact-chip"
                style={{ background: "rgba(255, 255, 255, 0.15)", color: "#e0e7ff" }}
              >
                <span className="pulse-dot" aria-hidden="true" />
                Contact PrototypeBD
              </span>
              <h1
                id="contact-hero-heading"
                className="mt-5 font-black leading-tight text-white"
                style={{ fontSize: "clamp(34px, 6.2vw, 64px)", letterSpacing: "-0.03em" }}
              >
                Let&apos;s build your{" "}
                <span className="hero-title-gradient">next idea together.</span>
              </h1>
              <p className="mt-5 hero-muted leading-8 max-w-2xl">
                Reach out for product advice, order support, or a custom project quote. We usually
                respond within 30 minutes during business hours.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              <div className="stat-pill px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200 font-bold">Response</p>
                <p className="text-sm font-black text-white mt-1">Under 30 mins</p>
              </div>
              <div className="stat-pill px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-orange-200 font-bold">Open</p>
                <p className="text-sm font-black text-white mt-1">Sat-Thu, 9AM-9PM</p>
              </div>
              <div className="stat-pill px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sky-200 font-bold">Support</p>
                <p className="text-sm font-black text-white mt-1">Product & Order Help</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="tel:+8801884502768"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "#f97316" }}
                aria-label="Call PrototypeBD"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call now
              </a>
              <a
                href="mailto:admin@prototypebd.com"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "#4f46e5" }}
                aria-label="Email PrototypeBD"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Send email
              </a>
              <a
                href="https://facebook.com/pbd2.0"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                style={{ background: "#1877f2" }}
                aria-label="PrototypeBD on Facebook"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Message on Facebook
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-14 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          <aside className="space-y-4">
            <div className="contact-card p-6" style={{ animationDelay: "0.08s" }}>
              <div className="flex items-center gap-3">
                <span className="icon-orb" style={{ background: "linear-gradient(135deg,#eef2ff,#e0e7ff)", color: "#4f46e5" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <h2 className="section-card-title" style={{ color: "#4f46e5" }}>Visit us</h2>
              </div>
              <p
                className="mt-3 text-sm leading-7 text-gray-700"
                itemScope
                itemType="https://schema.org/PostalAddress"
              >
                <span itemProp="streetAddress">House 53, Road 05, Sector 01, Block E, Aftab Nagar</span><br />
                <span itemProp="addressLocality">Dhaka</span> <span itemProp="postalCode">1212</span>,{" "}
                <span itemProp="addressCountry">Bangladesh</span>
              </p>
            </div>

            <div className="contact-card p-6" style={{ animationDelay: "0.13s" }}>
              <div className="flex items-center gap-3">
                <span className="icon-orb" style={{ background: "linear-gradient(135deg,#fff7ed,#ffedd5)", color: "#f97316", animationDelay: "0.3s" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <h2 className="section-card-title" style={{ color: "#f97316" }}>Phone</h2>
              </div>
              <div className="mt-3 text-sm font-semibold leading-7">
                <a href="tel:+8801884502768" className="contact-link block">+880 1884-502768</a>
                <a href="tel:+8801970553712" className="contact-link block">+880 1970-553712</a>
              </div>
            </div>

            <div className="contact-card p-6" style={{ animationDelay: "0.18s" }}>
              <div className="flex items-center gap-3">
                <span className="icon-orb" style={{ background: "linear-gradient(135deg,#eff6ff,#dbeafe)", color: "#1877f2", animationDelay: "0.6s" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <h2 className="section-card-title" style={{ color: "#1877f2" }}>Email & social</h2>
              </div>
              <div className="mt-3 text-sm font-semibold leading-7">
                <a href="mailto:admin@prototypebd.com" className="contact-link block">admin@prototypebd.com</a>
                <a href="mailto:prototypebd2020@gmail.com" className="contact-link block">
                  prototypebd2020@gmail.com
                </a>
                <a
                  href="https://facebook.com/pbd2.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link block"
                  aria-label="PrototypeBD on Facebook"
                >
                  facebook.com/pbd2.0
                </a>
              </div>
            </div>

            <div className="contact-card p-6" style={{ animationDelay: "0.23s" }}>
              <div className="flex items-center gap-3">
                <span className="icon-orb" style={{ background: "linear-gradient(135deg,#ecfdf5,#dcfce7)", color: "#16a34a", animationDelay: "0.9s" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </span>
                <h2 className="section-card-title" style={{ color: "#16a34a" }}>Business hours</h2>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-800">Saturday - Thursday: 9 AM - 9 PM</p>
              <p className="text-xs text-gray-500 mt-1">Friday closed</p>
            </div>
          </aside>

          <div id="contact-form" className="contact-card p-6 md:p-8" style={{ animationDelay: "0.12s" }}>
            <div
              className="contact-chip mb-5"
              style={{ background: "rgba(249, 115, 22, 0.12)", color: "#ea580c" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Send a message
            </div>
            <ContactForm />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="contact-card p-4 md:p-6" style={{ animationDelay: "0.26s" }}>
            <div className="flex items-center gap-3">
              <span className="icon-orb" style={{ background: "linear-gradient(135deg,#e0e7ff,#dbeafe)", color: "#4f46e5", animationDelay: "1.2s" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em]" style={{ color: "#4f46e5" }}>
                Find us on map
              </h2>
            </div>
            <div
              className="mt-4 overflow-hidden rounded-2xl"
              style={{
                position: "relative",
                paddingBottom: "min(440px, 48vw)",
                minHeight: 280,
                border: "1px solid rgba(79,70,229,0.12)",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.548!2d90.4354!3d23.7937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ3JzM3LjMiTiA5MMKwMjYnMDcuNCJF!5e0!3m2!1sen!2sbd!4v1"
                title="PrototypeBD location — Aftab Nagar, Dhaka 1212"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                allowFullScreen
              />
            </div>
            <p className="mt-4 text-xs text-gray-500">
              House 53, Road 05, Sector 01, Block E, Aftab Nagar, Dhaka 1212
            </p>
          </div>
        </section>

      </main>
    </>
  );
}
