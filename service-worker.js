const web_cache = 'web-app-cache-v1.0'
const filesToCache = ['/']

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(web_cache).then((cache) => {
            //Cache has been opened succesfully
            return cache.addAll(filesToCache)
        })
    )
})
