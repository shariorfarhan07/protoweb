"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompareBar } from "@/components/comparison/CompareBar";
import { SessionGuard } from "@/components/auth/SessionGuard";

/**
 * Renders the storefront chrome (navbar, footer, compare bar) for all public
 * pages. The admin panel (`/admin/*`) has its own full-screen layout, so the
 * storefront chrome is suppressed there.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <><SessionGuard />{children}</>;

  return (
    <>
      <SessionGuard />
      <Navbar />
      <main>{children}</main>
      <CompareBar />
      <Footer />
    </>
  );
}
