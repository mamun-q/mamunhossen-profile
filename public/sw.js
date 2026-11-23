/*
 * LIMON identity site — service worker (P-08).
 *
 * Strategy, deliberately conservative so a deploy can never trap
 * a visitor on a stale build:
 *  - Navigations: NETWORK-FIRST. A fresh deploy shows immediately;
 *    the cached shell is only a fallback, and the branded offline
 *    page is the last resort.
 *  - Same-origin static assets (content-hashed JS/CSS, icons):
 *    CACHE-FIRST — hashed names are immutable, so this is safe.
 *  - Cross-origin requests (Supabase, Cloudinary, Google Fonts)
 *    and non-GET requests are never intercepted or cached.
 * Bump VERSION on any strategy change; old caches are purged on
 * activate.
 */
const VERSION = 'limon-sw-v1';
const CACHE = `${VERSION}-static`;
const OFFLINE_URL = './offline.html';
const SHELL_URL = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, './favicon.svg', './manifest.webmanifest']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(SHELL_URL, copy));
          return response;
        })
        .catch(() =>
          caches.match(SHELL_URL).then((shell) => shell || caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
