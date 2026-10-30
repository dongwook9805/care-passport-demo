// Offline cache for the app shell. Network first, so a phone always gets the latest files when it is online;
// the cache is only used when the network fails or is too slow, which keeps the emergency card working offline.
// Bump VERSION when files change so old caches are dropped.
const VERSION = 'kcl-v9';
const FILES = [
  './', 'index.html', 'css/app.css', 'manifest.webmanifest',
  'js/app.js', 'js/views.js', 'js/i18n.js', 'js/demo-data.js', 'js/share.js', 'js/card-image.js', 'js/vendor/qrcode.js',
  'icons/icon-192.png', 'icons/icon-512.png'
];
const TIMEOUT = 4000;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('kcl-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.pkpass')) return; // let Safari hand wallet passes straight to Wallet
  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), TIMEOUT))]);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('index.html')) || Response.error();
    }
  })());
});
