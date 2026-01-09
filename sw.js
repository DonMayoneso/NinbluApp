const CACHE_NAME = 'ninblu-connect-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
    // Añade aquí tus imágenes si tienes (ej: './assets/logo.png')
];

// 1. INSTALACIÓN: Cachear los recursos estáticos (App Shell)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cacheando App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // Activar worker inmediatamente
    );
});

// 2. ACTIVACIÓN: Limpiar caches antiguas (Vital para actualizaciones)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Borrando cache antigua:', key);
                    return caches.delete(key);
                }
            }));
        })
        .then(() => self.clients.claim()) // Tomar control de clientes abiertos
    );
});

// 3. INTERCEPTACIÓN DE RED (FETCH): Estrategia Cache-First
self.addEventListener('fetch', (event) => {
    // Solo interceptamos peticiones GET (no APIs de escritura)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Si existe en caché, lo devolvemos (OFFLINE READY)
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Si no, vamos a la red
                return fetch(event.request);
            })
    );
});