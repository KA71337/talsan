import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const csp = [
  "default-src 'self'",
  "img-src 'self' data: blob:",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(isProd ? [{ key: "Content-Security-Policy", value: csp }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/brand/**", search: "" },
      { pathname: "/media/**", search: "" },
    ],
  },
  // talsanpower.com is the only primary URL; the Vercel production alias permanently redirects to it.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "talsan.vercel.app" }],
        destination: "https://talsanpower.com/:path*",
        permanent: true,
      },
    ];
  },
  // Local-storage fallback reads JSON from ./data at runtime
  outputFileTracingIncludes: {
    "/**": ["./data/*.json"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
