import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  cacheStartUrl: false,
  dynamicStartUrl: false,
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
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }],
      },
      {
        source: "/",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default withPWA(nextConfig);
