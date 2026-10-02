/* Stage Ready service worker.
   Network-first for everything (HTML, JSON data, JS, CSS, icons) so Monday/Thursday refreshes
   and new deploys show up immediately; the cache is only an offline fallback.
   Bump CACHE_VERSION on every deploy that changes app files. */
const CACHE_VERSION = "stage-ready-v2026-10-02b";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./tabs.js",
  "./landing.js",
  "./manifest.webmanifest",
  "./announcements.json",
  "./guides.json",
  "./service.json",
  "./calendar.json",
  "./resources.json",
  "./assets/fc-logo-clean.png",
  "./assets/logos/students-internal-color.svg",
  "./assets/logos/students-internal-white.svg",
  "./assets/logos/students-internal-color.png",
  "./assets/logos/students-internal-white.png",
  "./assets/fonts/archivo-wide-latin.woff2", // heading font: Archivo Expanded (SIL OFL)
  "./assets/fonts/OFL.txt",
  "./icons/apple-touch-icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png",
  "./icons/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes("/games/")) return;   // games (e.g. Sword Drills) are web-only: never cached, always live
  if (url.pathname.includes("/sunday-setup/")) return;   // Sunday setup checklist: web-only, never cached, always live

  // Cache key ignores cache-busting query strings (?v=, ?cb=) so offline fallback still works.
  const key = url.origin + url.pathname;
  event.respondWith(
    fetch(req, { cache: "no-store" })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(key, copy));
        }
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_VERSION);
        const hit = await cache.match(key) || await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === "navigate") return (await cache.match(new URL("./index.html", self.location).href)) || Response.error();
        return Response.error();
      })
  );
});
