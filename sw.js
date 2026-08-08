
const CACHE_NAME = 'tictactoes-mini-v1';
 
// Liste des fichiers indispensables au fonctionnement hors-ligne.
// Ajuster les chemins si la structure du repo change.
const ASSETS_TO_CACHE = [
  '/tictactoesMini.html',
  '/app.css',
  '/js/ticTacToesLocal.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/hh.wav',
  '/assets/rimshot.wav',
];
 
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});
 
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
 
// Stratégie "cache d'abord, réseau en secours" :
// sert le fichier en cache instantanément si présent,
// sinon tente le réseau (et met en cache pour la prochaine fois).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Safari refuse une réponse de navigation marquée "redirected" —
          // on reconstruit une réponse "propre" avant toute utilisation
          const finalResponse = networkResponse.redirected
            ? new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: networkResponse.headers,
              })
            : networkResponse;

          // ne met en cache que les réponses valides, même origine
          if (
            finalResponse &&
            finalResponse.status === 200 &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const responseClone = finalResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return finalResponse;
        })
        .catch(() => {
          // hors-ligne et rien en cache pour cette ressource : échec silencieux
          return new Response('Ressource indisponible hors-ligne', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
    })
  );
});
 
