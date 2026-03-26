import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";

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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }

        .cinfo-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          border-radius: 18px;
          border-left: 4px solid transparent;
          border-top: 1px solid transparent;
          border-right: 1px solid rgba(0,0,0,0.05);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: fadeUp 0.5s ease both;
        }
        .cinfo-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 32px rgba(0,0,0,0.09);
        }
        .cinfo-card.blue  { background: linear-gradient(135deg,#eff6ff,#f0f9ff); border-left-color:#3b82f6; border-top-color:rgba(59,130,246,0.15); }
        .cinfo-card.orange{ background: linear-gradient(135deg,#fff7ed,#fff3e8); border-left-color:#f97316; border-top-color:rgba(249,115,22,0.15); }
        .cinfo-card.indigo{ background: linear-gradient(135deg,#eef2ff,#f5f3ff); border-left-color:#6366f1; border-top-color:rgba(99,102,241,0.15); }
        .cinfo-card.fb    { background: linear-gradient(135deg,#eff6ff,#eef2ff); border-left-color:#1877f2; border-top-color:rgba(24,119,242,0.15); }
        .cinfo-card.green { background: linear-gradient(135deg,#f0fdf4,#ecfdf5); border-left-color:#22c55e; border-top-color:rgba(34,197,94,0.15); }

        .cinfo-card.orange a { color: #7c2d12; }
        .cinfo-card.orange a:hover { color: #f97316; }
        .cinfo-card.indigo a { color: #312e81; }
        .cinfo-card.indigo a:hover { color: #6366f1; }
        .cinfo-card.fb     a { color: #1e3a8a; }
        .cinfo-card.fb     a:hover { color: #1877f2; }

        .icon-chip {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.18s, box-shadow 0.2s;
        }
        .quick-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(0,0,0,0.15);
        }

        .form-card {
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 2px 24px rgba(0,0,0,0.06);
          animation: fadeUp 0.5s 0.3s ease both;
        }
        .form-card-inner {
          padding: 32px;
        }
        .section-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 50px;
          margin-bottom: 20px;
        }
      `}</style>

      <main className="min-h-screen" style={{ background: "#f4f3f0" }}>

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-6 pt-6">
          <ol
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "#aaa" }}
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link href="/" itemProp="item" className="transition-colors hover:text-gray-800">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li aria-hidden="true" style={{ color: "#ccc" }}>/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" style={{ color: "#555" }}>Contact</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* ══ HERO ════════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e0a0a 100%)",
          }}
        >
          {/* Coloured blobs */}
          <div aria-hidden="true" style={{
            position:"absolute", top:-80, right:-60,
            width:420, height:420, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 65%)",
            animation:"floatSlow 7s ease-in-out infinite",
            pointerEvents:"none",
          }} />
          <div aria-hidden="true" style={{
            position:"absolute", bottom:-60, left:-40,
            width:320, height:320, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%)",
            animation:"float 9s ease-in-out infinite reverse",
            pointerEvents:"none",
          }} />
          <div aria-hidden="true" style={{
            position:"absolute", top:"40%", left:"45%",
            width:200, height:200, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 65%)",
            animation:"float 11s ease-in-out infinite",
            pointerEvents:"none",
          }} />
          {/* Dot grid overlay */}
          <div aria-hidden="true" style={{
            position:"absolute", inset:0, pointerEvents:"none",
            backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize:"28px 28px",
          }} />

          <div
            className="relative max-w-5xl mx-auto px-6"
            style={{ paddingTop:"clamp(56px,8vw,100px)", paddingBottom:"clamp(56px,8vw,100px)" }}
          >
            {/* Live pill */}
            <div style={{ animation:"fadeIn 0.4s ease both", marginBottom:28 }}>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-1.5"
                style={{ background:"rgba(249,115,22,0.15)", color:"#fb923c", border:"1px solid rgba(249,115,22,0.3)", letterSpacing:0.5 }}
              >
                <span className="relative flex w-2 h-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ background:"#f97316", animation:"ping 1.4s cubic-bezier(0,0,0.2,1) infinite" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2" style={{ background:"#f97316" }} />
                </span>
                Online — reply in &lt;30 min
              </span>
            </div>

            {/* Heading */}
            <h1
              id="contact-hero-heading"
              className="font-black leading-none mb-6 text-white"
              style={{ fontSize:"clamp(46px,7.5vw,90px)", letterSpacing:-3, animation:"fadeUp 0.5s 0.1s ease both" }}
            >
              Let&apos;s{" "}
              <span style={{
                backgroundImage:"linear-gradient(90deg,#f97316,#facc15)",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
              }}>
                talk.
              </span>
            </h1>

            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:16, maxWidth:480, lineHeight:1.8, animation:"fadeUp 0.5s 0.2s ease both" }}>
              Whether you need help choosing a 3D printer, have a question about an order,
              or just want to say hi — we&apos;re one message away.
            </p>

            {/* Quick-action pills */}
            <div className="flex flex-wrap gap-3 mt-8" style={{ animation:"fadeUp 0.5s 0.3s ease both" }}>
              <a href="tel:+8801884502768" className="quick-pill"
                style={{ background:"#f97316", color:"#fff" }}
                aria-label="Call PrototypeBD">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call Us
              </a>
              <a href="mailto:admin@prototypebd.com" className="quick-pill"
                style={{ background:"rgba(99,102,241,0.85)", color:"#fff", backdropFilter:"blur(4px)" }}
                aria-label="Email PrototypeBD">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                Email Us
              </a>
              <a href="https://facebook.com/pbd2.0" target="_blank" rel="noopener noreferrer"
                className="quick-pill"
                style={{ background:"#1877f2", color:"#fff" }}
                aria-label="PrototypeBD on Facebook">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
            </div>

            {/* Stats strip */}
            <div
              className="flex flex-wrap gap-6 mt-10 pt-8"
              style={{ borderTop:"1px solid rgba(255,255,255,0.08)", animation:"fadeUp 0.5s 0.4s ease both" }}
            >
              {[
                { value:"< 30 min", label:"Response time",  color:"#f97316" },
                { value:"5+ years", label:"In business",    color:"#a78bfa" },
                { value:"Sat–Thu",  label:"Open 9 AM–9 PM", color:"#34d399" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-black text-white" style={{ fontSize:22, letterSpacing:-0.5, color:s.color }}>{s.value}</p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ Main grid ═══════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10">

          {/* ── Left: contact cards ──────────────────────────────────────── */}
          <div className="space-y-3">
            <div className="section-chip" style={{ background:"rgba(249,115,22,0.1)", color:"#f97316" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Get in touch
            </div>

            {/* Address */}
            <div className="cinfo-card blue" style={{ animationDelay:"0.05s" }}>
              <span className="icon-chip" style={{ background:"rgba(59,130,246,0.12)", color:"#3b82f6" }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[3px] mb-1" style={{ color:"#3b82f6" }}>Visit Us</p>
                <p className="text-sm font-semibold leading-relaxed" style={{ color:"#1e3a5f" }}
                  itemScope itemType="https://schema.org/PostalAddress">
                  <span itemProp="streetAddress">House 53, Road 05, Sector 01, Block E, Aftab Nagar</span><br/>
                  <span itemProp="addressLocality">Dhaka</span>{" "}
                  <span itemProp="postalCode">1212</span>,{" "}
                  <span itemProp="addressCountry">Bangladesh</span>
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="cinfo-card orange" style={{ animationDelay:"0.12s" }}>
              <span className="icon-chip" style={{ background:"rgba(249,115,22,0.15)", color:"#f97316" }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[3px] mb-1" style={{ color:"#f97316" }}>Call Us</p>
                <a href="tel:+8801884502768" className="block text-sm font-semibold transition-colors">+880 1884-502768</a>
                <a href="tel:+8801970553712" className="block text-sm font-semibold transition-colors mt-0.5">+880 1970-553712</a>
              </div>
            </div>

            {/* Email */}
            <div className="cinfo-card indigo" style={{ animationDelay:"0.19s" }}>
              <span className="icon-chip" style={{ background:"rgba(99,102,241,0.15)", color:"#6366f1" }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[3px] mb-1" style={{ color:"#6366f1" }}>Email Us</p>
                <a href="mailto:admin@prototypebd.com" className="block text-sm font-semibold transition-colors">admin@prototypebd.com</a>
                <a href="mailto:prototypebd2020@gmail.com" className="block text-sm font-semibold transition-colors mt-0.5">prototypebd2020@gmail.com</a>
              </div>
            </div>

            {/* Facebook */}
            <div className="cinfo-card fb" style={{ animationDelay:"0.26s" }}>
              <span className="icon-chip" style={{ background:"rgba(24,119,242,0.15)", color:"#1877f2" }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[3px] mb-1" style={{ color:"#1877f2" }}>Follow Us</p>
                <a href="https://facebook.com/pbd2.0" target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold transition-colors"
                  aria-label="PrototypeBD on Facebook">
                  facebook.com/pbd2.0
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="cinfo-card green" style={{ animationDelay:"0.33s" }}>
              <span className="icon-chip" style={{ background:"rgba(34,197,94,0.15)", color:"#22c55e" }} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[3px] mb-1" style={{ color:"#22c55e" }}>Hours</p>
                <p className="text-sm font-semibold" style={{ color:"#14532d" }}>Sat – Thu &nbsp;·&nbsp; 9 AM – 9 PM</p>
                <p className="text-xs mt-0.5" style={{ color:"#4ade80" }}>Friday closed</p>
              </div>
            </div>
          </div>

          {/* ── Right: form card ─────────────────────────────────────────── */}
          <div id="contact-form" className="form-card">
            {/* Coloured top bar */}
            <div style={{ height:5, background:"linear-gradient(90deg,#f97316,#6366f1,#1877f2,#22c55e)" }} />
            <div className="form-card-inner">
              <div className="section-chip" style={{ background:"rgba(99,102,241,0.08)", color:"#6366f1" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                Send a message
              </div>
              <ContactForm />
            </div>
          </div>
        </section>

        {/* ══ Map ═════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 pb-20" style={{ animation:"fadeUp 0.5s 0.45s ease both" }}>
          <div className="section-chip" style={{ background:"rgba(59,130,246,0.08)", color:"#3b82f6" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Find us on the map
          </div>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              position:"relative",
              paddingBottom:"min(400px,48vw)",
              minHeight:260,
              border:"1px solid rgba(59,130,246,0.15)",
              boxShadow:"0 4px 28px rgba(59,130,246,0.08)",
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.548!2d90.4354!3d23.7937!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ3JzM3LjMiTiA5MMKwMjYnMDcuNCJF!5e0!3m2!1sen!2sbd!4v1"
              title="PrototypeBD location — Aftab Nagar, Dhaka 1212"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:0 }}
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-xs" style={{ color:"#aaa" }}>
            House 53, Road 05, Sector 01, Block E, Aftab Nagar, Dhaka 1212
          </p>
        </section>

      </main>
    </>
  );
}
