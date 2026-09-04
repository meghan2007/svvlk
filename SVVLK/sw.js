self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // We just let the network handle it, this is a minimal SW just to trigger the "Install App" prompt
});