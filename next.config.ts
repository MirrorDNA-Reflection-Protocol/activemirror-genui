import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/start", destination: "/intake?focus=pilot", permanent: false },
      { source: "/confessions", destination: "/glass", permanent: false },
      { source: "/hub", destination: "/", permanent: false },
      { source: "/pricing", destination: "/proof-sprint", permanent: false },
      { source: "/scan", destination: "/mirror", permanent: false },
      { source: "/demo", destination: "/mirror", permanent: false },
      { source: "/products", destination: "/", permanent: false },
      { source: "/docs/architecture", destination: "/intake?focus=architecture", permanent: false },
      { source: "/skills", destination: "/mirror", permanent: false },
      { source: "/brief", destination: "/mirror", permanent: false },
      { source: "/legal", destination: "/terms", permanent: false },
      { source: "/proof", destination: "/proof-sprint", permanent: false },
      { source: "/products/mirrorgate", destination: "/trust", permanent: false },
      { source: "/cast", destination: "/mirror", permanent: false },
      { source: "/preview", destination: "/mirror", permanent: false },
      { source: "/products/agentdna", destination: "/compare", permanent: false },
      { source: "/mirror-beta", destination: "/mirror", permanent: false },
    ];
  },
  async headers() {
    const htmlRoutes = [
      "/",
      "/about",
      "/about/roadmap",
      "/app",
      "/compare",
      "/glass",
      "/intake",
      "/mirror",
      "/ops/funnel",
      "/privacy",
      "/proof-sprint",
      "/terms",
      "/trust",
    ];
    const htmlNoTransformCache = { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate, no-transform" };
    const globalSecurityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self' mailto:",
        ].join("; "),
      },
    ];

    return [
      {
        source: "/:path*",
        headers: globalSecurityHeaders,
      },
      ...htmlRoutes.map((source) => ({
        source,
        headers: [
          ...globalSecurityHeaders,
          htmlNoTransformCache,
        ],
      })),
      {
        source: "/sw.js",
        headers: [
          ...globalSecurityHeaders,
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          ...globalSecurityHeaders,
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          ...globalSecurityHeaders,
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
