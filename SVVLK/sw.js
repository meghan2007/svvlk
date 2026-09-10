const CACHE_NAME = 'svvlk-store-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js'
];

// Install Event
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event (Clear old caches)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch Event (Network First Strategy)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If network fetch is successful, update cache and return it
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If network fails (offline), return from cache
        return caches.match(e.request);
      })
  );
});