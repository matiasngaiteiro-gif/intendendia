// La versión de GitHub se retiró: la aplicación se abre desde Google.
// Este archivo reemplaza a la copia guardada en los navegadores: borra lo guardado,
// se da de baja y recarga las pestañas abiertas para que muestren el aviso.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('intendencia-')).map(k => caches.delete(k)));
    await self.registration.unregister();
    const tabs = await self.clients.matchAll({type: 'window'});
    tabs.forEach(t => t.navigate(t.url.split('#')[0]).catch(() => {}));
  })());
});
