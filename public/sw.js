const VERSION = "active-mirror-control-v7";
const SHELL_URLS = ["/aindia", "/api/aindia/manifest", "/api/aindia/claim-guard", "/api/aindia/contracts", "/api/aindia/wrappers", "/api/aindia/determinism", "/api/aindia/founder-relay", "/api/aindia/sovereignty", "/api/aindia/recursion", "/manifest.json"];
const SHELL_SET = new Set(SHELL_URLS);

function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(VERSION);
      await Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  if (!isSameOrigin(request)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(VERSION);
        return (await cache.match("/aindia")) || Response.error();
      }),
    );
    return;
  }

  const url = new URL(request.url);
  if (!SHELL_SET.has(url.pathname)) return;

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(VERSION);
      return (await cache.match(url.pathname)) || Response.error();
    }),
  );
});
