const CACHE_VERSION = 'whc-v1.0.2';
const APP_SHELL_CACHE = `whc-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `whc-runtime-${CACHE_VERSION}`;

const APP_SHELL_ASSETS = [
  '/wildhoundapp/',
  '/wildhoundapp/index.html',
  '/wildhoundapp/dashboard.html',
  '/wildhoundapp/skills.html',
  '/wildhoundapp/rewards.html',
  '/wildhoundapp/booking.html',
  '/wildhoundapp/logged.html',
  '/wildhoundapp/about.html',
  '/wildhoundapp/app-shell.html',
  '/wildhoundapp/css/base.css',
  '/wildhoundapp/css/components.css',
  '/wildhoundapp/css/pages.css',
  '/wildhoundapp/js/page-loader.js',
  '/wildhoundapp/js/app-shell-inline.js',
  '/wildhoundapp/js/config.js',
  '/wildhoundapp/js/validators.js',
  '/wildhoundapp/js/codebook.js',
  '/wildhoundapp/js/events-data.js',
  '/wildhoundapp/js/app-core.js',
  '/wildhoundapp/js/app-render.js',
  '/wildhoundapp/js/app-events.js',
  '/wildhoundapp/js/services/state-store.js',
  '/wildhoundapp/js/services/codebook-service.js',
  '/wildhoundapp/js/services/events-service.js',
  '/wildhoundapp/js/services/backup-service.js',
  '/wildhoundapp/js/services/points-service.js',
  '/wildhoundapp/manifest.webmanifest',
  '/wildhoundapp/icon-192-v3.png',
  '/wildhoundapp/icon-512-v3.png',
  '/wildhoundapp/apple-touch-icon-v3.png'
  ,
  '/wildhoundapp/assets/Wild_Hound_Club_Trail-Ready_Dog_Starter_Guide.pdf'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (!event || !event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isDataEndpoint(url) {
  return url.pathname.endsWith('/events.json') || url.pathname.endsWith('/codebook.json');
}

function isMutableAppAsset(url, request) {
  if (request.mode === 'navigate') return true;
  return (
    url.pathname.endsWith('.html')
    || url.pathname.endsWith('.js')
    || url.pathname.endsWith('.css')
    || url.pathname.endsWith('.webmanifest')
  );
}

function cachePutSafe(request, response, cacheName) {
  if (!response || response.status !== 200) return;
  const clone = response.clone();
  caches.open(cacheName).then((cache) => cache.put(request, clone));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (isDataEndpoint(url) || isMutableAppAsset(url, event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          cachePutSafe(event.request, response, RUNTIME_CACHE);
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/wildhoundapp/index.html');
          }
          throw new Error('offline');
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
