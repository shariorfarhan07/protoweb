"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { getTokenExpiryMs } from "@/lib/token";

// Pages that require an authenticated session — landing here after expiry sends
// the user to /login. Public pages just clear the session silently.
const GATED_PREFIXES = ["/admin", "/account"];
// setTimeout overflows past ~24.8 days; cap and re-check to stay correct.
const MAX_TIMEOUT = 2_147_483_647;

/**
 * Watches the access token and logs the user out the instant it expires —
 * without waiting for the next API call. Mounted once, app-wide.
 */
export function SessionGuard() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!accessToken) return;
    const expMs = getTokenExpiryMs(accessToken);
    if (expMs == null) return; // unknown expiry — fall back to the 401 handler

    let timer: ReturnType<typeof setTimeout>;

    const logout = () => {
      clearAuth();
      const onGatedPage = GATED_PREFIXES.some((p) => pathname?.startsWith(p));
      if (onGatedPage && !pathname?.startsWith("/login")) {
        router.replace("/login?expired=1");
      }
    };

    const tick = () => {
      const remaining = expMs - Date.now();
      if (remaining <= 0) {
        logout();
        return;
      }
      timer = setTimeout(tick, Math.min(remaining, MAX_TIMEOUT));
    };

    tick();
    return () => clearTimeout(timer);
  }, [accessToken, pathname, clearAuth, router]);

  return null;
}
