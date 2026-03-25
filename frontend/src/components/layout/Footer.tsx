import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="mt-20 border-t"
      style={{ borderColor: "var(--border)", background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p
              className="font-black uppercase"
              style={{ fontSize: 18, letterSpacing: 1, marginBottom: 12 }}
            >
              PrototypeBD
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Bangladesh's premier source for 3D printers, laser engravers, and
              premium filament.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p
              className="font-semibold uppercase text-xs mb-4"
              style={{ letterSpacing: 2, color: "var(--subtle)" }}
            >
              Shop
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              {[
                { href: "/shop?product_type=printer", label: "3D Printers" },
                { href: "/shop?product_type=filament", label: "Filament" },
                { href: "/shop?product_type=cnc", label: "CNC Machines" },
                { href: "/shop?product_type=printed", label: "3D Prints" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gray-900 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p
              className="font-semibold uppercase text-xs mb-4"
              style={{ letterSpacing: 2, color: "var(--subtle)" }}
            >
              Support
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Contact Us", "Shipping Policy", "Return Policy", "FAQ"].map(
                (l) => (
                  <li key={l}>
                    <Link href="#" className="hover:text-gray-900 transition-colors">
                      {l}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p
              className="font-semibold uppercase text-xs mb-4"
              style={{ letterSpacing: 2, color: "var(--subtle)" }}
            >
              Company
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              {["About", "Blog", "Careers", "Privacy Policy"].map((l) => (
                <li key={l}>
                  <Link href="#" className="hover:text-gray-900 transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400"
          style={{ borderColor: "var(--border)" }}
        >
          <p>© {new Date().getFullYear()} PrototypeBD. All rights reserved.</p>
          <p>Made with ♥ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
