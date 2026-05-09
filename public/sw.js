const CACHE_NAME = 'picazo-live-v2';

// 1. Force the new worker to take over immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// 2. NETWORK-FIRST STRATEGY (The Magic Fix)
self.addEventListener('fetch', (event) => {
    // Only apply to our own files, ignore external stuff like dicebear avatars or socket.io
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If the Render server gives us the new code instantly, save a backup and show it!
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If the user's internet is dead (offline), use the saved backup
                return caches.match(event.request);
            })
    );
});
