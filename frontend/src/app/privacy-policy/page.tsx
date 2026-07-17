import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PrototypeBD collects, uses, and protects your personal information when you shop with us.",
  alternates: { canonical: "/privacy-policy" },
  openGraph: { type: "website", title: "Privacy Policy — PrototypeBD", url: "/privacy-policy" },
};

const UPDATED = "June 21, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: "#f4f4f0" }}>
      <article className="mx-auto px-5" style={{ maxWidth: 760, paddingTop: 48, paddingBottom: 64 }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f2890e", letterSpacing: 3 }}>
          Legal
        </p>
        <h1 className="font-extrabold tracking-tight text-gray-900" style={{ fontSize: "clamp(28px,5vw,40px)", letterSpacing: -1 }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mt-2">Last updated: {UPDATED}</p>

        <div className="blog-content mt-8">
          <p>
            PrototypeBD (“we”, “us”, “our”) respects your privacy. This policy explains what
            information we collect when you use <strong>prototypebd.com</strong>, how we use it, and
            the choices you have.
          </p>

          <h2>1. Information we collect</h2>
          <ul>
            <li><strong>Information you provide:</strong> name, email, phone number, and shipping
              address when you place an order, create an account, or contact us.</li>
            <li><strong>Order details:</strong> the products you buy and your payment method
              (we do not store full card numbers).</li>
            <li><strong>Usage data:</strong> pages visited, device and browser type, and similar
              analytics collected automatically via cookies.</li>
          </ul>

          <h2>2. How we use your information</h2>
          <ul>
            <li>To process and deliver your orders and provide customer support.</li>
            <li>To send order updates and, with your consent, marketing about new products and deals.</li>
            <li>To improve our website, products, and services.</li>
            <li>To detect and prevent fraud, and to meet legal obligations.</li>
          </ul>

          <h2>3. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep your cart, remember preferences, and
            understand how the site is used. You can disable cookies in your browser, though some
            features may not work as intended.
          </p>

          <h2>4. Sharing your information</h2>
          <p>
            We do not sell your personal data. We share it only with trusted partners who help us
            operate — such as delivery couriers and payment processors — and only to the extent
            needed to fulfil your order, or when required by law.
          </p>

          <h2>5. Data retention &amp; security</h2>
          <p>
            We keep your information only as long as necessary for the purposes above or as required
            by law, and we apply reasonable technical and organisational measures to protect it.
          </p>

          <h2>6. Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data, and you can
            opt out of marketing at any time. To exercise these rights, contact us using the details
            below.
          </p>

          <h2>7. Contact us</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href="mailto:admin@prototypebd.com">admin@prototypebd.com</a> or call{" "}
            <a href="tel:+8801884502768">+880 1884-502768</a>. PrototypeBD, Aftab Nagar, Dhaka 1212,
            Bangladesh.
          </p>

          <p style={{ color: "#888", fontSize: 14 }}>
            We may update this policy from time to time. Material changes will be posted on this page
            with a new “last updated” date.
          </p>
        </div>
      </article>
    </div>
  );
}
