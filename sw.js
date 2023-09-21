self.addEventListener('install', (event) => {
    console.log(event);
});

self.addEventListener('activate', (event) => {
    console.log(event);
});

self.addEventListener('fetch', (event) => {
    console.log(event);
});

const assetsCacheName = 'spelling-quest-assets';
self.addEventListener('fetch', (event) => {
    event.respondWith(
        // Open the cache
        caches.open(assetsCacheName)
            .then((cache) => {
                // Look for matching request in the cache
                return cache.match(event.request)
                    .then((matched) => {
                        // If a match is found return the cached version first
                        if (matched) {
                            console.log("matched version");
                            return matched;
                        }
                        // Otherwise continue to the network
                        return fetch(event.request)
                            .then((response) => {
                                // Cache the response
                                console.log("saving cached");
                                cache.put(event.request, response.clone());
                                // Return the original response to the page
                                return response;
                            });
                    });
            })
    );
});
