// The demo used to live at the site root with its own service worker. This file replaces that worker:
// it removes the old cache, unregisters itself and reloads open pages so they get the new homepage.
// The demo's own worker now lives at demo/sw.js.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.delete('kcl-v1')
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.navigate(c.url)))
  );
});
