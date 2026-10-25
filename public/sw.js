// Flow's guest workspace uses bundled research. Fetch the current application
// shell from the network so an earlier release cannot pin development or UI.
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('flow-')).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
