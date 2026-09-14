/**
 * Service Worker for Capital Network
 * Strategy: Cache-First for static assets, Network-First for API/HTML
 * 
 * Cache layers:
 *   1. IMMUTABLE_CACHE — hashed JS/CSS/fonts (1 year, cache-first)
 *   2. STATIC_CACHE   — images, SVG, JSON configs (30 days, stale-while-revalidate)
 *   3. HTML fallback  — SPA index.html from cache
 */

const SW_VERSION = 'cn-v1';
const IMMUTABLE_CACHE = `${SW_VERSION}-immutable`;
const STATIC_CACHE    = `${SW_VERSION}-static`;

// Patterns for cache-first immutable resources
const IMMUTABLE_PATTERNS = [
  /\/assets\/.*\.[a-zA-Z0-9]{8,}\.(js|css)$/,
  /\/fonts\/.*\.woff2?$/,
];

// Static resources: images, videos config, favicon
const STATIC_PATTERNS = [
  /\.(png|jpg|jpeg|gif|webp|avif|ico|svg)$/,
  /\/videos\/videos\.config\.json$/,
  /favicon\.svg$/,
];

// Precache critical assets on install
const PRECACHE_URLS = [
  '/',
  '/fonts/almarai-400-arabic.woff2',
  '/fonts/almarai-700-arabic.woff2',
  '/fonts/almarai-800-arabic.woff2',
  '/fonts/almarai.css',
  '/favicon.svg',
];

// ─── Install: precache critical assets ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-fatal: some precaches might fail in dev
      })
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== IMMUTABLE_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: routing logic ──────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Skip Supabase API calls — always network
  if (url.hostname.includes('supabase')) return;

  const pathname = url.pathname;

  // ── Strategy 1: Immutable assets — Cache First, fallback to network ────────
  if (IMMUTABLE_PATTERNS.some((p) => p.test(pathname))) {
    event.respondWith(
      caches.open(IMMUTABLE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // ── Strategy 2: Static assets — Stale-While-Revalidate ────────────────────
  if (STATIC_PATTERNS.some((p) => p.test(pathname))) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // ── Strategy 3: HTML/SPA — Network First, fallback to cached index.html ───
  if (request.headers.get('Accept')?.includes('text/html') || pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((c) => c.put('/', clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/');
          return cached || new Response('Offline', { status: 503 });
        })
    );
    return;
  }
});
