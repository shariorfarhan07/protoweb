import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const metadata: Metadata = {
  title: "My Account",
  description: "View your PrototypeBD orders and track their status.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div style={{ background: "#f4f4f0" }}>
      <div className="mx-auto px-5" style={{ maxWidth: 760, paddingTop: 40, paddingBottom: 64 }}>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: "#f2890e", letterSpacing: 3 }}
        >
          My Account
        </p>
        <h1
          className="font-extrabold tracking-tight text-gray-900 mb-7"
          style={{ fontSize: "clamp(26px,5vw,38px)", letterSpacing: -1 }}
        >
          Orders &amp; tracking
        </h1>
        <AccountClient />
      </div>
    </div>
  );
}
