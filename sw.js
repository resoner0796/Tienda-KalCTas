const CACHE_NAME = 'kalctas-tienda-v1';
const urlsToCache = [
  '.',
  'index.html',
  'manifest.webmanifest',
  'LOGO.png',
  'icon-192x192.png',
  'icon-512x512.png',
  'https://js.stripe.com/v3/',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions-compat.js'
];

// Evento de instalación: se abre el caché y se guardan los archivos principales.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de activación: se limpia el caché antiguo si existe una nueva versión.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Evento Fetch: intercepta las peticiones.
// Primero busca en el caché, si no lo encuentra, lo busca en la red.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si la respuesta está en el caché, la retorna
        if (response) {
          return response;
        }

        // Si no, la busca en la red
        return fetch(event.request).then(
          networkResponse => {
            // Y si es una respuesta válida, la clona y la guarda en el caché para la próxima vez
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});
