// Guarda una copia de los archivos de la aplicación (no de los datos) para que abra rápido
// aunque GitHub o internet anden lentos. Siempre intenta primero la versión nueva.
const CACHE = 'intendencia-piloto-17';
const ESPERA = 4000; // si en 4 segundos no llegó la versión nueva, abre con la guardada

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html'])).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('intendencia-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // la planilla de Google nunca pasa por acá
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const red = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    });
    const guardada = await cache.match(req, {ignoreSearch: req.mode === 'navigate'});
    if (!guardada) return red;
    const tarde = new Promise(r => setTimeout(() => r(guardada), ESPERA));
    return Promise.race([red.catch(() => guardada), tarde]);
  })());
});
