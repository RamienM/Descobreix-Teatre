/*
    JavaScript "service-worker.js", el siguiente JavaScript nos permitirá (en conjunto
    con manifest.json) convertir nuestra web en una aplicación web.

    -----------------------------------------Autores----------------------------------------------------------
        -> Rubén Ramis
        -> Silvia Moia
        -> Arnau Vidal
    ----------------------------------------------------------------------------------------------------------
*/

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker instalando...');
    // Puedes precachear recursos aquí
    event.waitUntil(caches.open('mi-cache').then(cache => {return cache.addAll([
        '/',
        '/index.html',
        '/assets/vendor/bootstrap/css/bootstrap.min.css',
        '/assets/vendor/bootstrap-icons/bootstrap-icons.css',
        '/assets/vendor/glightbox/css/glightbox.min.css',
        '/assets/vendor/swiper/swiper-bundle.min.css',
        '/assets/css/main.css',
        '/lib/leaflet/leaflet.css',
        '/lib/leaflet-routing-machine/dist/leaflet-routing-machine.css',
        '/assets/vendor/bootstrap/js/bootstrap.bundle.min.js',
        '/assets/vendor/glightbox/js/glightbox.min.js',
        '/assets/vendor/purecounter/purecounter_vanilla.js',
        '/assets/vendor/swiper/swiper-bundle.min.js',
        '/assets/js/main.js',
        '/assets/js/teatre.js',
        '/assets/js/obres.js',
        '/lib/leaflet/leaflet.js',
        '/lib/leaflet-routing-machine/dist/leaflet-routing-machine.js',
        '/assets/js/mapa.js',
        '/assets/js/index.js'
    ]); }));
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker activado');
});
// Intercepta las peticiones de red
self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(response => {return response || fetch(event.request);}));
});