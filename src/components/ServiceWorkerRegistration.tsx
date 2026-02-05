/**
 * Service Worker Registration
 * Handles SW registration, updates, and communication
 * @module components/ServiceWorkerRegistration
 */

'use client';

import { useEffect, useState, useCallback } from 'react';

interface ServiceWorkerRegistrationState {
  isSupported: boolean;
  isRegistered: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  offlineReady: boolean;
}

export function ServiceWorkerRegistration() {
  const [state, setState] = useState<ServiceWorkerRegistrationState>({
    isSupported: false,
    isRegistered: false,
    isUpdating: false,
    updateAvailable: false,
    offlineReady: false,
  });

  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    setState((prev) => ({ ...prev, isSupported: true }));

    let refreshing = false;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'imports',
        });

        setState((prev) => ({ ...prev, isRegistered: true }));

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available
                setState((prev) => ({
                  ...prev,
                  updateAvailable: true,
                  isUpdating: false,
                }));
                setShowUpdateNotification(true);
              }
            });
          }
        });

        // Check for updates periodically (every 30 minutes)
        const checkInterval = setInterval(() => {
          registration.update();
        }, 30 * 60 * 1000);

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          switch (event.data.type) {
            case 'SW_ACTIVATED':
              setState((prev) => ({ ...prev, offlineReady: true }));
              break;
            case 'CACHE_UPDATED':
              console.log('[SW] Cache updated:', event.data.payload);
              break;
            case 'SYNC_COMPLETED':
              console.log('[SW] Background sync completed:', event.data.payload);
              break;
          }
        });

        // Handle controller change (new version activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        return () => {
          clearInterval(checkInterval);
        };
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    // Wait for page to load before registering
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  // Update service worker
  const handleUpdate = useCallback(() => {
    if (!navigator.serviceWorker.controller) return;

    setState((prev) => ({ ...prev, isUpdating: true }));

    // Send skip waiting message to new service worker
    navigator.serviceWorker.controller.postMessage({
      type: 'SKIP_WAITING',
    });

    setShowUpdateNotification(false);
  }, []);

  // Dismiss update notification
  const handleDismiss = useCallback(() => {
    setShowUpdateNotification(false);
  }, []);

  // Show offline ready toast
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    if (state.offlineReady) {
      setShowOfflineToast(true);
      const timer = setTimeout(() => setShowOfflineToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state.offlineReady]);

  if (!state.isSupported) return null;

  return (
    <>
      {/* Update Available Notification */}
      {showUpdateNotification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Update available</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={state.isUpdating}
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition disabled:opacity-50"
            >
              {state.isUpdating ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-100 hover:text-white p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready Toast */}
      {showOfflineToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">App ready for offline use</span>
        </div>
      )}
    </>
  );
}

// ============================================================================
// Hook for service worker communication
// ============================================================================

export function useServiceWorker() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(() => {
      setIsReady(true);
    });
  }, []);

  const sendMessage = useCallback((type: string, payload?: unknown) => {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.controller.postMessage({
      type,
      payload,
    });
  }, []);

  const clearCache = useCallback(() => {
    sendMessage('CLEAR_CACHE');
  }, [sendMessage]);

  const cacheUrls = useCallback(
    (urls: string[]) => {
      sendMessage('CACHE_URLS', { urls });
    },
    [sendMessage]
  );

  return {
    isReady,
    sendMessage,
    clearCache,
    cacheUrls,
  };
}

// ============================================================================
// Hook for offline status
// ============================================================================

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

// ============================================================================
// Background Sync Hook
// ============================================================================

interface QueueItem {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
}

export function useBackgroundSync(queueName: string = 'default') {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const addToQueue = useCallback(
    async (type: string, data: unknown): Promise<void> => {
      const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
      };

      // Store in IndexedDB
      const db = await openSyncDB();
      const tx = db.transaction(queueName, 'readwrite');
      const store = tx.objectStore(queueName);
      await store.add(item);

      setQueue((prev) => [...prev, item]);

      // Request background sync if available
      if ('serviceWorker' in navigator && 'sync' in registration) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(`sync-${queueName}`);
      }
    },
    [queueName]
  );

  const removeFromQueue = useCallback(
    async (id: string): Promise<void> => {
      const db = await openSyncDB();
      const tx = db.transaction(queueName, 'readwrite');
      const store = tx.objectStore(queueName);
      await store.delete(id);

      setQueue((prev) => prev.filter((item) => item.id !== id));
    },
    [queueName]
  );

  const clearQueue = useCallback(async (): Promise<void> => {
    const db = await openSyncDB();
    const tx = db.transaction(queueName, 'readwrite');
    const store = tx.objectStore(queueName);
    await store.clear();

    setQueue([]);
  }, [queueName]);

  // Load queue on mount
  useEffect(() => {
    const loadQueue = async () => {
      const db = await openSyncDB();
      const tx = db.transaction(queueName, 'readonly');
      const store = tx.objectStore(queueName);
      const items = await store.getAll();
      setQueue(items);
    };

    loadQueue();
  }, [queueName]);

  return {
    queue,
    isSyncing,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
}

// IndexedDB helper for sync queue
function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('QuoteGenSyncDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('default')) {
        db.createObjectStore('default', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('quotes')) {
        db.createObjectStore('quotes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('emails')) {
        db.createObjectStore('emails', { keyPath: 'id' });
      }
    };
  });
}

export default ServiceWorkerRegistration;
