export interface QueuedMutation {
  id: string;
  type: 'CREATE_LISTING' | 'SUBMIT_OFFER';
  payload: any;
  timestamp: number;
  synced: boolean;
}

export const QUEUE_STORAGE_KEY = 'kisaansahyog_offline_queue';

/**
 * Checks if the browser is currently online.
 */
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Retrieves all mutations stored in localStorage.
 */
export function getQueuedMutations(): QueuedMutation[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('[offlineQueue] Error reading offline mutations from localStorage:', err);
    return [];
  }
}

/**
 * Persists mutations array into localStorage and notifies listeners.
 */
export function saveQueuedMutations(queue: QueuedMutation[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('kisaan_queue_updated', { detail: queue }));
  } catch (err) {
    console.error('[offlineQueue] Error saving offline mutations to localStorage:', err);
  }
}

/**
 * Adds a new mutation to the offline queue.
 */
export function enqueueMutation(
  type: 'CREATE_LISTING' | 'SUBMIT_OFFER',
  payload: any,
): QueuedMutation {
  const mutation: QueuedMutation = {
    id: `queue-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
    synced: false,
  };

  const queue = getQueuedMutations();
  queue.push(mutation);
  saveQueuedMutations(queue);
  console.log(`[offlineQueue] Enqueued mutation ${mutation.id} (${type})`);

  // If online, attempt background sync immediately
  if (isOnline()) {
    syncOfflineQueue().catch((err) => {
      console.warn('[offlineQueue] Automatic immediate sync attempt failed:', err);
    });
  }

  return mutation;
}

/**
 * Removes a specific mutation from the queue by its ID.
 */
export function removeQueuedMutation(id: string): void {
  const queue = getQueuedMutations().filter((item) => item.id !== id);
  saveQueuedMutations(queue);
}

/**
 * Clears all mutations from the offline queue.
 */
export function clearQueuedMutations(): void {
  saveQueuedMutations([]);
}

/**
 * Returns all pending (unsynced) mutations.
 */
export function getPendingMutations(): QueuedMutation[] {
  return getQueuedMutations().filter((item) => !item.synced);
}

/**
 * Marks a specific mutation as synced.
 */
export function markMutationSynced(id: string): void {
  const queue = getQueuedMutations().map((item) =>
    item.id === id ? { ...item, synced: true } : item,
  );
  saveQueuedMutations(queue);
}

/**
 * Synchronizes pending offline mutations with the API server.
 */
export async function syncOfflineQueue(
  apiBaseUrl?: string,
): Promise<{ syncedCount: number; failedCount: number }> {
  if (!isOnline()) {
    console.log('[offlineQueue] Device is offline; sync skipped.');
    return { syncedCount: 0, failedCount: 0 };
  }

  const pending = getPendingMutations();
  if (pending.length === 0) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const baseUrl =
    apiBaseUrl ||
    (typeof window !== 'undefined' && (window as any).__KISAAN_API_URL__) ||
    ((import.meta as any).env?.VITE_API_URL as string) ||
    'http://localhost:4000';

  let syncedCount = 0;
  let failedCount = 0;

  console.log(`[offlineQueue] Starting sync for ${pending.length} pending mutations...`);

  for (const mutation of pending) {
    try {
      let endpoint = '';
      if (mutation.type === 'CREATE_LISTING') {
        endpoint = `${baseUrl}/api/listings`;
      } else if (mutation.type === 'SUBMIT_OFFER') {
        endpoint = `${baseUrl}/api/offers`;
      } else {
        console.warn(`[offlineQueue] Unknown mutation type: ${mutation.type}`);
        continue;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mutation.payload),
      });

      if (response.ok) {
        console.log(`[offlineQueue] Successfully synced mutation ${mutation.id}`);
        // Remove completed mutation from queue
        removeQueuedMutation(mutation.id);
        syncedCount++;
      } else {
        console.warn(
          `[offlineQueue] Mutation ${mutation.id} returned status ${response.status}`,
        );
        failedCount++;
      }
    } catch (err) {
      console.error(`[offlineQueue] Network error while syncing mutation ${mutation.id}:`, err);
      failedCount++;
      // Stop further sync if connection drops
      break;
    }
  }

  console.log(
    `[offlineQueue] Sync complete. Synced: ${syncedCount}, Failed: ${failedCount}`,
  );

  return { syncedCount, failedCount };
}

/**
 * Initializes a listener for the window 'online' event to trigger automatic sync.
 * Returns a cleanup unsubscribe function.
 */
export function initOfflineSyncWatcher(
  onSyncComplete?: (result: { syncedCount: number; failedCount: number }) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = async () => {
    console.log('[offlineQueue] Network restored (online event). Initiating sync...');
    try {
      const result = await syncOfflineQueue();
      if (onSyncComplete) {
        onSyncComplete(result);
      }
    } catch (err) {
      console.error('[offlineQueue] Error in online event handler:', err);
    }
  };

  window.addEventListener('online', handleOnline);

  // If already online at startup, attempt an initial sync
  if (isOnline()) {
    syncOfflineQueue().catch(() => {});
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
