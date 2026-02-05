/**
 * QuoteGen Service Worker
 * Provides offline support, caching strategies, and background sync
 * @version 1.0.0
 */

// ============================================================================
// Configuration
// ============================================================================

const CACHE_VERSION = 'v1';
const STATIC_CACHE_NAME = `quotegen-static-${CACHE_VERSION}`;
const API_CACHE_NAME = `quotegen-api-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `quotegen-images-${CACHE_VERSION}`;

// ============================================================================
// Cache Strategies
// ============================================================================

const CACHE_STRATEGIES = {
  // Static assets: Cache first, fallback to network
  STATIC: 'static',
  
  // API calls: Network first, fallback to cache (stale-while-revalidate)
  API: 'api',
  
  // Images: Cache first with background refresh
  IMAGES: 'images',
  
  // User data: Network first with aggressive caching
  USER_DATA: 'user-data',
};

// ============================================================================
// Static Assets to Cache
// ============================================================================

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/quotes',
  '/analytics',
  '/settings',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ============================================================================
// Install Event - Cache Static Assets
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ============================================================================
// Activate Event - Cleanup Old Caches
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old version caches
              return name.startsWith('quotegen-') && 
                     !name.includes(CACHE_VERSION);
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        // Claim clients to take control immediately
        return self.clients.claim();
      })
  );
});

// ============================================================================
// Fetch Event - Cache Strategies
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on request
  const strategy = determineCacheStrategy(request, url);
  
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
      break;
      
    case CACHE_STRATEGIES.API:
      event.respondWith(staleWhileRevalidate(request, API_CACHE_NAME));
      break;
      
    case CACHE_STRATEGIES.IMAGES:
      event.respondWith(cacheFirstWithBackgroundRefresh(request, IMAGE_CACHE_NAME));
      break;
      
    case CACHE_STRATEGIES.USER_DATA:
      event.respondWith(networkFirst(request, API_CACHE_NAME));
      break;
      
    default:
      // Default: network only
      event.respondWith(fetch(request));
  }
});

// ============================================================================
// Cache Strategy Determination
// ============================================================================

function determineCacheStrategy(request, url) {
  // Static assets (JS, CSS, HTML)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'document' ||
    url.pathname.match(/\.(js|css|html)$/)
  ) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  // Images
  if (
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)
  ) {
    return CACHE_STRATEGIES.IMAGES;
  }
  
  // API calls
  if (url.pathname.startsWith('/api/')) {
    // User-specific data - network first
    if (url.pathname.includes('/api/quotes') || 
        url.pathname.includes('/api/user')) {
      return CACHE_STRATEGIES.USER_DATA;
    }
    // General API - stale while revalidate
    return CACHE_STRATEGIES.API;
  }
  
  // Next.js static files
  if (url.pathname.startsWith('/_next/')) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  // Fonts
  if (request.destination === 'font') {
    return CACHE_STRATEGIES.STATIC;
  }
  
  return null;
}

// ============================================================================
// Cache Strategy Implementations
// ============================================================================

/**
 * Cache First Strategy
 * Returns cached version if available, otherwise fetches and caches
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone response before caching
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first fetch failed:', error);
    // Return offline fallback if available
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First Strategy
 * Returns network response, falls back to cache on failure
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache in background
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, serving from cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Stale While Revalidate Strategy
 * Returns cached version immediately, updates cache in background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Always fetch fresh data in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error);
      return cachedResponse;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Revalidate in background
    fetchPromise.catch(() => {});
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return fetchPromise;
}

/**
 * Cache First with Background Refresh
 * Similar to stale-while-revalidate but for images
 */
async function cacheFirstWithBackgroundRefresh(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Refresh cache in background if we have a cached version
  if (cachedResponse) {
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }
  
  // Fetch and cache if not in cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Image fetch failed:', error);
    // Return transparent 1x1 pixel as fallback
    return new Response(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}

// ============================================================================
// Background Sync
// ============================================================================

const SYNC_QUEUE_NAME = 'quotegen-sync-queue';

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quotes') {
    event.waitUntil(syncQuotes());
  } else if (event.tag === 'sync-emails') {
    event.waitUntil(syncEmails());
  }
});

/**
 * Sync queued quotes when back online
 */
async function syncQuotes() {
  console.log('[SW] Syncing queued quotes...');
  
  try {
    const db = await openIndexedDB();
    const queue = await getQueuedItems(db, 'quotes');
    
    for (const item of queue) {
      try {
        const response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        
        if (response.ok) {
          await removeQueuedItem(db, 'quotes', item.id);
          console.log('[SW] Synced quote:', item.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync quote:', item.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Quote sync failed:', error);
  }
}

/**
 * Sync queued emails when back online
 */
async function syncEmails() {
  console.log('[SW] Syncing queued emails...');
  
  try {
    const db = await openIndexedDB();
    const queue = await getQueuedItems(db, 'emails');
    
    for (const item of queue) {
      try {
        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        
        if (response.ok) {
          await removeQueuedItem(db, 'emails', item.id);
          console.log('[SW] Synced email:', item.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync email:', item.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Email sync failed:', error);
  }
}

// ============================================================================
// IndexedDB Helpers
// ============================================================================

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('QuoteGenDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('quotes')) {
        db.createObjectStore('quotes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('emails')) {
        db.createObjectStore('emails', { keyPath: 'id' });
      }
    };
  });
}

function getQueuedItems(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeQueuedItem(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// Push Notifications (optional)
// ============================================================================

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'QuoteGen';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.data || {},
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // Focus existing window if open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================================================
// Message Handling (from main thread)
// ============================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((names) =>
          Promise.all(names.map((name) => caches.delete(name)))
        )
      );
      break;
      
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(STATIC_CACHE_NAME).then((cache) =>
          cache.addAll(payload.urls)
        )
      );
      break;
      
    default:
      break;
  }
});

console.log('[SW] Service worker loaded');
