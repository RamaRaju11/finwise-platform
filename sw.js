const CACHE_NAME = 'bizscale-v6';

const SHELL_FILES = [
  './index.html',
  './dashboard.html',
  './checkup.html',
  './sidebar.js',
  './manifest.json',
  './modules/nav.js',
  './modules/fw-auth.js',
];

// Install: cache app shell only
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(SHELL_FILES).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Supabase / API calls: always network, never cache
// - HTML pages: network-first (get latest, fall back to cache)
// - JS/CSS/images: stale-while-revalidate
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin API calls
  if (event.request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co') || url.hostname.includes('plaid.com') || url.hostname.includes('resend.com')) return;

  const isHtml = url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/');
  const isAsset = url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg');

  if (isHtml) {
    // Network-first for HTML — always get latest version
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else if (isAsset) {
    // Network-first for JS/CSS — always get latest code, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then(res => {
          caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
