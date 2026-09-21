// Minimal service worker: enables "Add to Home Screen" installability and a
// basic offline fallback for the login shell. Deliberately does NOT cache
// authenticated pages or API responses, since this app's data changes
// constantly and staff/parents should never see stale school records.
const CACHE_NAME = "alphson360-shell-v1";
const SHELL_URLS = ["/login", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((cached) => cached ?? caches.match("/login"))
    )
  );
});
