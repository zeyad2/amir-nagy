// Service Worker for SAT Learning Platform Admin Panel
const CACHE_NAME = 'sat-admin-v1';
const API_CACHE_NAME = 'sat-api-cache-v1';

// Resources to cache for offline use
const STATIC_RESOURCES = [
  '/',
  '/admin',
  '/admin/courses',
  '/admin/students',
  '/admin/reports',
  '/offline.html',
  '/manifest.json'
];

// API endpoints to cache for offline viewing
const API_PATTERNS = [
  /\/api\/courses$/,
  /\/api\/admin\/courses$/,
  /\/api\/admin\/students$/,
  /\/api\/admin\/enrollment-requests$/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static resources');
      return cache.addAll(STATIC_RESOURCES.filter(url => !url.includes('/offline.html')));
    }).catch(error => {
      console.error('[SW] Failed to cache static resources:', error);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If online, cache the response and return it
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Fallback to offline page for admin routes
            if (url.pathname.startsWith('/admin')) {
              return caches.match('/admin') ||
                     caches.match('/') ||
                     new Response('Offline - Please check your connection', {
                       status: 503,
                       statusText: 'Service Unavailable'
                     });
            }

            return new Response('Page not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful GET requests for offline viewing
          if (response.ok && request.method === 'GET') {
            const shouldCache = API_PATTERNS.some(pattern => pattern.test(url.pathname));

            if (shouldCache) {
              const responseClone = response.clone();
              caches.open(API_CACHE_NAME).then(cache => {
                cache.put(request, responseClone);
              });
            }
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve cached API data for GET requests
          if (request.method === 'GET') {
            return caches.match(request).then(cachedResponse => {
              if (cachedResponse) {
                console.log('[SW] Serving cached API response for:', url.pathname);
                return cachedResponse;
              }

              // Return offline indicator for API requests
              return new Response(
                JSON.stringify({
                  error: 'Offline - cached data not available',
                  offline: true
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
          }

          // For non-GET requests, return error
          return new Response(
            JSON.stringify({
              error: 'Network unavailable',
              message: 'This action requires an internet connection'
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then(response => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Handle push notifications for enrollment requests
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received');

  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'New notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/view-action.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss-action.png'
        }
      ],
      requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SAT Admin', options)
    );
  } catch (error) {
    console.error('[SW] Error processing push message:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  const data = event.notification.data || {};
  let urlToOpen = '/admin';

  if (event.action === 'view' && data.url) {
    urlToOpen = data.url;
  } else if (data.type === 'enrollment') {
    urlToOpen = '/admin/students?tab=requests';
  } else if (data.type === 'payment') {
    urlToOpen = '/admin/reports?tab=payments';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if the app is already open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if not already open
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-forms') {
    event.waitUntil(
      // Retry failed form submissions when back online
      retryFailedRequests()
    );
  }
});

// Helper function to retry failed requests
async function retryFailedRequests() {
  try {
    const cache = await caches.open('failed-requests');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.delete(request);
          console.log('[SW] Successfully retried request:', request.url);
        }
      } catch (error) {
        console.log('[SW] Failed to retry request:', request.url, error);
      }
    }
  } catch (error) {
    console.error('[SW] Error in retryFailedRequests:', error);
  }
}