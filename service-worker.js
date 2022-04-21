const PRECACHE = 'odyssey-cache-v1.0'
const RUNTIME = 'runtime'
const PRECAHCE_URLS = [
    '/index.html',
    '/service-worker.js',
    '/site.webmanifest',
    '/src/css/style.css',
    '/src/font/exo-2.woff',
    '/src/font/Exo2Bold.fnt',
    '/src/font/Exo2Bold.png',
    '/src/js/bluetooth.js',
    '/src/js/ergo.js',
    '/src/js/low-poly.js',
    '/src/js/ocean.js',
    '/src/js/aframe.js',
]

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(PRECACHE).then((cache) => {
            return cache.addAll(PRECAHCE_URLS)
        })
    )
})

self.addEventListener('activate', (event) => {
    const currentCaches = [PRECACHE, RUNTIME]
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter(
                    (cacheName) => !currentCaches.includes(cacheName)
                )
            })
            .then((cachesToDelete) => {
                return Promise.all(
                    cachesToDelete.map((cacheToDelete) => {
                        return caches.delete(cacheToDelete)
                    })
                )
            })
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests, like those for Google Analytics.
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        // Put a copy of the response in the runtime cache.
                        return cache
                            .put(event.request, response.clone())
                            .then(() => {
                                return response
                            })
                    })
                })
            })
        )
    }
})
