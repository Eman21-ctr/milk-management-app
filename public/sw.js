// Service Worker paling basic untuk PWA
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  // Skip waiting agar SW langsung aktif
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  // Claim semua clients yang sudah terbuka
  event.waitUntil(self.clients.claim());
});

// Handle fetch requests (minimal handling)
self.addEventListener('fetch', function(event) {
  // Biarkan browser handle request normal
  event.respondWith(fetch(event.request));
});