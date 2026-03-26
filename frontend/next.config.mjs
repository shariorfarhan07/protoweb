// In Docker the rewrite runs server-side, so use the internal service name.
// Locally (dev) falls back to the public localhost URL.
const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:8888";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8888" },
      { protocol: "http", hostname: "backend" },           // Docker internal
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/static/**" },
      { protocol: "http", hostname: "localhost", port: "5555", pathname: "/static/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Proxy /static/* to the FastAPI backend so relative upload URLs work.
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
