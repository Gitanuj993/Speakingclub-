/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const DB_NAME = 'speaklab_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

export interface StoredAudioBlob {
  id: string; // uuid or timestamp string
  blob: Blob;
  mimeType: string;
  durationMs: number;
  createdAt: string;
}

// In-memory fallback if IndexedDB is blocked or in incognito restricted mode
const inMemoryAudioStore = new Map<string, StoredAudioBlob>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this browser.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioBlob(item: StoredAudioBlob): Promise<string> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve(item.id);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    // Fallback to in-memory store
    console.warn('IndexedDB unavailable, falling back to session memory:', err);
    inMemoryAudioStore.set(item.id, item);
    return item.id;
  }
}

export async function getAudioBlob(id: string): Promise<StoredAudioBlob | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return inMemoryAudioStore.get(id) || null;
  }
}

export async function deleteAudioBlob(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    inMemoryAudioStore.delete(id);
  }
}

export async function clearAllAudioBlobs(): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    inMemoryAudioStore.clear();
  }
}
