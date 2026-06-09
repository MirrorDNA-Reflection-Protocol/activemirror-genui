import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
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
      {
        source: "/",
        headers: [
          ...globalSecurityHeaders,
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
