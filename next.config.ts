import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: false,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
  publicExcludes: ["!noprecache/**/*", "!manifest.json"],
  reloadOnOnline: true,
  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) =>
        url.origin === self.origin && url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
      method: "GET",
    },
    {
      urlPattern: ({ url }: { url: URL }) =>
        url.origin === self.origin && url.pathname.startsWith("/_next/static/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "active-mirror-app-code",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 60 * 5,
        },
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) =>
        url.origin === self.origin &&
        ["/", "/manifest.json", "/sw.js"].includes(url.pathname),
      handler: "NetworkOnly",
    },
  ],
});

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

export default withPWA(nextConfig);
