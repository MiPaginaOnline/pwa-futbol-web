const CACHE_NAME = 'futbol-feed-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
  console.log('🟢 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache abierto, agregando archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ Todos los recursos cacheados correctamente');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('❌ Error en cache:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', function(event) {
  console.log('🟡 Service Worker activado');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ Service Worker listo para controlar clientes');
      return self.clients.claim();
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', function(event) {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Devuelve desde cache si está disponible
        if (response) {
          return response;
        }

        // Si no está en cache, haz la solicitud a la red
        return fetch(event.request).then(function(response) {
          // Verifica si la respuesta es válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona la respuesta
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(function() {
        // Si falla todo, intenta servir la página offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});
