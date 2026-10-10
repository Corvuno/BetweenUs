// Offline + always-fresh service worker for the installed app.
//
// Same-origin files (the page, styles, scripts, icons) are network-first: when
// there's a connection, every open fetches the newest file from the site (the
// request revalidates, so a push to main shows up on the next open, no release
// needed) and keeps a copy; with no connection (or a very slow one) the saved
// copy is used. Google Fonts are served from the saved copy and refreshed in
// the background. Saved copies are keyed without the query string, so
// ?profile=work / ?profile=editor open offline too.
//
// Nothing here has a version number to bump: files are re-saved on every
// online load. Change CACHE only to throw away everything saved.

const CACHE = 'between-us';
const NETWORK_TIMEOUT_MS = 5000;

const PRECACHE = [
  './',
  'between-us.html',
  'between-us-work.html',
  'between-us-dev.html',
  'index.html',
  'styles.css',
  'questions.js',
  'config.js',
  'gilt.js',
  'state.js',
  'deck.js',
  'card.js',
  'library.js',
  'session.js',
  'selection.js',
  'presentation.js',
  'ui.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // One missing file shouldn't stop the rest from being saved.
      .then(cache => Promise.all(PRECACHE.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// One saved copy per file, keyed without the query string, so the newest
// download always replaces the old one (?v= cache-busters and ?profile= both
// change the URL, not the file).
function keyFor(request) {
  const url = new URL(request.url);
  return new Request(url.origin + url.pathname);
}

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  try {
    // no-cache: revalidate with the server instead of trusting the browser's
    // own HTTP cache (GitHub Pages lets that go stale for ~10 minutes).
    const response = await fetch(request, { cache: 'no-cache', signal: controller.signal });
    clearTimeout(timer);
    if (response.ok) cache.put(keyFor(request), response.clone());
    return response;
  } catch (err) {
    clearTimeout(timer);
    const saved = await cache.match(keyFor(request));
    if (saved) return saved;
    if (request.mode === 'navigate') {
      const shell = await cache.match('between-us.html');
      if (shell) return shell;
    }
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  const refresh = fetch(request)
    .then(response => {
      if (response.ok || response.type === 'opaque') cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return saved || (await refresh) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
