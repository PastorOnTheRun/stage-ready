const CACHE = "be-class-v2";
const SHELL = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./content.json",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("be-class-") && key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isContent = path.endsWith("/content.json") || path.endsWith("content.json");
  const isDoc = request.mode === "navigate" || path.endsWith("/") || path.endsWith("/index.html");
  if (isDoc || isContent) {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(cacheFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = (await cache.match(request)) || (await cache.match("./index.html"));
    if (cached) return cached;
    return new Response("Be Class is offline and this phone has no saved copy yet.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh.ok) await cache.put(request, fresh.clone());
  return fresh;
}
