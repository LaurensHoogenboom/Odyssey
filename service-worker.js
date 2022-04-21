const cache_name = 'web-app-cache-v1.0'
const filesToCache = [
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
        caches.open(cache_name).then((cache) => {
            //Cache has been opened succesfully
            return cache.addAll(filesToCache)
        })
    )
})

self.addEventListener('fetch', (e) => {
    e.respondWith(
        (async () => {
            const r = await caches.match(e.request)
            console.log(`[Service Worker] Fetching resource: ${e.request.url}`)
            if (r) {
                return r
            }
            const response = await fetch(e.request)
            const cache = await caches.open(cache_name)
            console.log(
                `[Service Worker] Caching new resource: ${e.request.url}`
            )
            cache.put(e.request, response.clone())
            return response
        })()
    )
})
