// Sanjeevani (ਸੰਜੀਵਨੀ) Offline PWA Service Worker — CTBF-AI-12
// Ensures zero-network boot, asset caching, and offline survival in Punjab flood basins.

const CACHE_NAME = 'sanjeevani-offline-v1';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.png',
  '/audio/evacuation_pa.mp3',
  '/audio/evacuation_en.mp3',
  '/audio/prepare_pa.mp3',
  '/audio/prepare_en.mp3',
  '/audio/siren.wav'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching asset warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and unsupported schemes (e.g. chrome-extension://)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Bypass webpack dev server and hot-module reload
  if (url.pathname.includes('webpack') || url.pathname.includes('hot-update')) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/');
          if (fallback) return fallback;
          return new Response('<h1>Sanjeevani Offline</h1><p>You are offline. Pre-cached evacuation is active.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Static Assets & Audio: Network-first to always serve fresh JS in dev, cache fallback when offline
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/audio/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

const OFFLINE_TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#F8FAFC" />
  <path d="M 0 0 L 256 0 M 0 64 L 256 64 M 0 128 L 256 128 M 0 192 L 256 192 M 0 256 L 256 256" stroke="#E2E8F0" stroke-width="1"/>
  <path d="M 0 0 L 0 256 M 64 0 L 64 256 M 128 0 L 128 256 M 192 0 L 192 256 M 256 0 L 256 256" stroke="#E2E8F0" stroke-width="1"/>
  <circle cx="128" cy="128" r="1.5" fill="#CBD5E1"/>
</svg>`;

  // OpenStreetMap, CartoDB & Esri Satellite Offline Map Tile Caching
  if (
    url.hostname.includes('tile.openstreetmap.org') ||
    url.hostname.includes('basemaps.cartocdn.com') ||
    url.hostname.includes('arcgisonline.com')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open('sanjeevani-map-tiles-v1').then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            return new Response(OFFLINE_TILE_SVG, {
              headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400',
              },
            });
          });
      })
    );
    return;
  }

  // Local Map Tile Cache (Passes through to /api/map-tiles via USB or LAN)
  if (url.pathname.startsWith('/api/map-tiles/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open('sanjeevani-map-tiles-v1').then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            return new Response(OFFLINE_TILE_SVG, {
              headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400',
              },
            });
          });
      })
    );
    return;
  }

  // API Requests: Network-first (Never cache stale broadcasts)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(async () => {
        return new Response(JSON.stringify({ success: false, offline: true, message: 'Offline mode active' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        });
      })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
