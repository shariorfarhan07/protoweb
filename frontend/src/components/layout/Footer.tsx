import Link from "next/link";
import Image from "next/image";

const SHOP_LINKS = [
  { href: "/shop?product_type=printer",  label: "3D Printers",  icon: "🖨️" },
  { href: "/shop?product_type=filament", label: "Filament",     icon: "🧵" },
  { href: "/shop?product_type=cnc",      label: "CNC / Laser",  icon: "⚡" },
  { href: "/shop?product_type=printed",  label: "3D Prints",    icon: "🎨" },
];

const SUPPORT_LINKS = ["Contact Us", "Shipping Policy", "Return Policy", "FAQ"];
const COMPANY_LINKS = ["About", "Blog", "Careers", "Privacy Policy"];

const SOCIALS = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "#",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.843L.057 23.571a.75.75 0 0 0 .92.92l5.728-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.371l-.36-.214-3.733.956.974-3.562-.234-.376A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-20" style={{ background: "#0f0f0f", color: "#e5e5e5" }}>

      {/* ── Top accent bar ───────────────────────────────────────────── */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #4da6ff, #ff8c42, #2ecc71, #a855f7)" }} />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-10 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 md:col-start-1">
            {/* Logo + name */}
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image src="/logo.png" alt="PrototypeBD" width={48} height={48} className="rounded-full" />
              <span className="font-black uppercase text-white" style={{ fontSize: 18, letterSpacing: 1 }}>
                PrototypeBD
              </span>
            </Link>

            <p className="text-xs leading-relaxed mb-5" style={{ color: "#666", maxWidth: 240 }}>
              3D printers, laser engravers &amp; filament — delivered fast across Bangladesh.
            </p>

            {/* Contact info */}
            <div className="space-y-1.5 text-xs mb-5" style={{ color: "#666" }}>
              <a href="tel:+8801884502768" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.84a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.03z" />
                </svg>
                +880 1884-502768
              </a>
              <a href="mailto:admin@prototypebd.com" className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                admin@prototypebd.com
              </a>
              <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Aftab Nagar, Dhaka 1212
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="footer-social w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="col-span-1 md:col-span-2 md:col-start-5">
            <FooterHeading color="#4da6ff">Shop</FooterHeading>
            <ul className="space-y-3">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="flex items-center gap-2 text-sm transition-colors duration-150 group"
                    style={{ color: "#888" }}
                  >
                    <span className="text-base leading-none">{l.icon}</span>
                    <span className="group-hover:text-white transition-colors">{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1 md:col-span-2">
            <FooterHeading color="#2ecc71">Support</FooterHeading>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm hover:text-white transition-colors" style={{ color: "#888" }}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-2">
            <FooterHeading color="#a855f7">Company</FooterHeading>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm hover:text-white transition-colors" style={{ color: "#888" }}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid #1e1e1e" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "#555" }}>
            © {new Date().getFullYear()} PrototypeBD. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: "#555" }}>
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms</Link>
            <span>Made with <span style={{ color: "#ef4444" }}>♥</span> in Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <p className="text-xs font-bold uppercase tracking-widest text-white" style={{ letterSpacing: 2 }}>
        {children}
      </p>
    </div>
  );
}
