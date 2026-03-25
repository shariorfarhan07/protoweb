const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // Absolute URLs pointing directly at the backend (http://localhost:8000/...)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      // Relative URLs served via the Next.js /static rewrite proxy below
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/static/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Proxy /static/* to the FastAPI backend so relative upload URLs work.
  // In production: set NEXT_PUBLIC_BACKEND_URL to your backend domain.
  async rewrites() {
    return [
      {
        source: "/static/:path*",
        destination: `${BACKEND_URL}/static/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["zustand"],
  },
};

export default nextConfig;
