const CACHE_NAME = 'janopriyo-cache-v1';
const OFFLINE_URL = '/offline'; // We should ideally have an offline page

const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/icon-512x512.png',
  // Next.js static assets are handled differently but we can cache basic paths
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching assets individually');
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return fetch(url)
            .then((res) => {
              if (res.ok) {
                return cache.put(url, res);
              }
              console.warn(`Service Worker: Failed to fetch ${url} during install`);
            })
            .catch((err) => {
              console.error(`Service Worker: Error caching ${url} during install:`, err);
            });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Filter out non-http/https schemes (e.g., chrome-extension://)
  const url = new URL(event.request.url);
  if (!['http:', 'https:'].includes(url.protocol)) return;

  // Stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {
            // Silently ignore network fetch failures when serving from cache
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // If valid response, cache it for next time
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails and not handled by stale-while-revalidate,
          // attempt to recover from cache or return a valid Response.
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            return Response.error();
          });
        });
    })
  );
});
