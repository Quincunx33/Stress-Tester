const CACHE_NAME = 'xio-stress-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

// Install: pre-cache core shell & skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
});

// Activate: clean up ALL old caches and claim existing clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Pure Network-First strategy with fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Never intercept non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Never intercept or cache API endpoints or SSE streams
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/stream')) {
    return;
  }

  // 3. Never intercept Vite development endpoints / modules
  if (
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('t') ||
    url.searchParams.has('import')
  ) {
    return;
  }

  // 4. Network-First for everything else
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, update the cache in the background
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Offline Fallback: Serve from cache only if network fails
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }

        // If navigation request (page refresh while offline), return root index.html
        if (event.request.mode === 'navigate') {
          return (await caches.match('/index.html')) || (await caches.match('/'));
        }

        return new Response('Network offline and asset not in cache', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});
