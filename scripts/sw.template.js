// EduFlow's service worker (generated into dist/sw.js by prerender.mjs).
//
// The app shell (every script, style and font, the main pages in both
// languages) is precached on install. Lessons are cached as you read them,
// and a whole course is cached when you press "Download for offline"
// (the page fills the `eduflow-content` cache directly). The Python
// engine (Pyodide, from its CDN) is cached the first time you run Python,
// so exercises keep working offline afterwards.
//
// Pages: network first (fresh after a deploy), the cached copy when offline
// or when the network takes over 3 seconds; for a page never visited, the
// app shell, which then renders it.
// Hashed assets: cache first. Content, data and playground files (URLs
// versioned with ?v=CONTENT_VERSION): cache first, and on each update every
// entry of an older content version is dropped.

const VERSION = '__VERSION__';
const CONTENT_VERSION = '__CONTENT_VERSION__';
const CACHE = `eduflow-${VERSION}`;
const CONTENT = 'eduflow-content';
const CDN = 'eduflow-cdn';
const PRECACHE = ['__PRECACHE__'];
const CDN_HOSTS = ['cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

// Downloaded courses survive an update only while their content is current;
// anything else in the content cache (an older ?v=, pages cached by an old
// version whose scripts are gone) is dropped.
async function pruneContent() {
  const cache = await caches.open(CONTENT);
  const requests = await cache.keys();
  await Promise.all(requests.filter((r) => new URL(r.url).searchParams.get('v') !== CONTENT_VERSION).map((r) => cache.delete(r)));
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('eduflow-') && key !== CACHE && key !== CONTENT && key !== CDN).map((key) => caches.delete(key))))
      .then(pruneContent)
      .then(() => self.clients.claim()),
  );
});

const pageKey = (url) => url.pathname.replace(/\/index\.html$/, '').replace(/(.)\/+$/, '$1') || '/';
const shellFor = (key) => (key === '/ar' || key.startsWith('/ar/') ? '/ar' : '/');
const NETWORK_TIMEOUT = 3000;
const match = (key) => caches.match(key, { ignoreVary: true });

async function networkFirst(request) {
  const key = pageKey(new URL(request.url));
  const cached = () => match(key).then((hit) => hit ?? match(shellFor(key))).then((hit) => hit ?? match('/'));
  const network = fetch(request).then(async (response) => {
    const html = (response.headers.get('content-type') ?? '').includes('text/html');
    if (response.ok && html) {
      // Pages you've read (lessons too) open offline as they were, until the
      // next update; after that the app shell renders them from their content.
      const cache = await caches.open(CACHE);
      cache.put(key, response.clone());
    }
    return response;
  });
  const exact = await match(key);
  if (!exact) {
    try {
      return await network;
    } catch {
      return (await cached()) ?? Response.error();
    }
  }
  const slow = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT));
  try {
    return (await Promise.race([network, slow])) ?? exact;
  } catch {
    return exact;
  }
}

async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request, { ignoreVary: true });
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (CDN_HOSTS.includes(url.hostname) && url.pathname.startsWith('/pyodide/')) event.respondWith(cacheFirst(request, CDN));
    return;
  }
  if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else if (/^\/(content|data|playground)\//.test(url.pathname)) event.respondWith(cacheFirst(request, CONTENT));
  else event.respondWith(cacheFirst(request, CACHE));
});
