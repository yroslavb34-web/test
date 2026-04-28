'use strict';

// The version of the cache
const CACHE_NAME = 'v1';

// URLs to cache
const urlsToCache = [
    '/index.html',
    '/styles/main.css',
    '/script/main.js',
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cached responses are returned if available, otherwise, fetch from the network
                return response || fetch(event.request);
            })
    );
});

// Activate event
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync event
self.addEventListener('sync', event => {
    if (event.tag === 'sync-updates') {
        event.waitUntil(
            // Your background sync logic goes here
            fetch('/api/sync')
                .then(response => response.json())
                .then(data => {
                    console.log('Data synced:', data);
                })
        );
    }
});