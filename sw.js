// Emergency Service Worker Disable
// This service worker immediately unregisters itself

self.addEventListener('install', (event) => {
  console.log('Service Worker: Emergency disable - installing');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Emergency disable - activating');
  
  event.waitUntil(
    // Clear all caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Service Worker: Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('Service Worker: All caches cleared');
      
      // Unregister this service worker
      return self.registration.unregister().then(() => {
        console.log('Service Worker: Unregistered successfully');
        
        // Take control of all clients and reload them
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            console.log('Service Worker: Reloading client:', client.url);
            client.navigate(client.url);
          });
        });
      });
    })
  );
});

// Don't handle any fetch events
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetch event ignored for:', event.request.url);
  // Don't call event.respondWith() - let the browser handle everything
});

console.log('Service Worker: Emergency disable script loaded');