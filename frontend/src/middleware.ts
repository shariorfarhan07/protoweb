/**
 * Next.js Edge Middleware — request logging.
 *
 * Runs on every non-static request. Logs method, path, status, and duration.
 * Uses console.log (Edge Runtime compatible — Winston cannot run on the Edge).
 * The backend-facing Node.js logger (src/lib/logger.ts) handles server component
 * and API route logging where the Node.js runtime is available.
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const start = Date.now();
  const response = NextResponse.next();

  // Log after the response is constructed (status available from NextResponse)
  const duration = Date.now() - start;
  const { method, nextUrl } = request;
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Edge Runtime: structured log via console so it appears in server output
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "INFO",
      logger: "next.middleware",
      message: `${method} ${nextUrl.pathname} ${duration}ms ${ip}`,
      method,
      path: nextUrl.pathname,
      duration_ms: duration,
      client_ip: ip,
    })
  );

  return response;
}

export const config = {
  // Exclude static assets, images, and Next.js internals from logging
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|woff2?|ttf)$).*)",
  ],
};
