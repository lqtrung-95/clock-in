// Clockin Service Worker — app shell caching for offline focus timer
const CACHE_NAME = "clockin-v1";

// Static assets / app shell to precache
const PRECACHE_URLS = [
  "/focus",
  "/dashboard",
  "/manifest.json",
];

// Install: precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Supabase API / auth API calls: network only (never cache authenticated data)
// - /api/* routes: network first, no cache fallback
// - Static assets (_next/static, fonts, icons): cache first
// - Navigation (HTML pages): network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s) requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Never cache Supabase or authenticated API calls
  if (
    url.hostname.includes("supabase.co") ||
    url.pathname.startsWith("/api/")
  ) {
    return; // let browser handle normally (network only)
  }

  // Cache-first for static assets (_next/static, fonts, icons)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.match(/\.(ico|png|svg|webp|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for navigation and everything else; fall back to cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        // Cache successful navigation responses
        if (res.ok && request.mode === "navigate") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
