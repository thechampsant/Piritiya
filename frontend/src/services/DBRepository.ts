import { openDB, type IDBPDatabase } from 'idb';
import type {
  Message,
  Session,
  Settings,
  CachedResponse,
  PendingQuery,
} from '../types';
import { DB_NAME, DB_VERSION, DB_STORES } from '../utils/constants';

/**
 * DBRepository - IndexedDB wrapper for offline data storage
 * Manages all local data persistence for the Piritiya app
 */
export class DBRepository {
  private db: IDBPDatabase | null = null;

  /**
   * Initialize IndexedDB with schema
   */
  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Messages store
        if (!db.objectStoreNames.contains(DB_STORES.MESSAGES)) {
          const messageStore = db.createObjectStore(DB_STORES.MESSAGES, {
            keyPath: 'id',
          });
          messageStore.createIndex('sessionId', 'sessionId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sessions store
        if (!db.objectStoreNames.contains(DB_STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(DB_STORES.SESSIONS, {
            keyPath: 'id',
          });
          sessionStore.createIndex('farmerId', 'farmerId', { unique: false });
          sessionStore.createIndex('lastActivity', 'lastActivity', {
            unique: false,
          });
        }

        // Settings store
        if (!db.objectStoreNames.contains(DB_STORES.SETTINGS)) {
          db.createObjectStore(DB_STORES.SETTINGS, {
            keyPath: 'farmerId',
          });
        }

        // Cached responses store
        if (!db.objectStoreNames.contains(DB_STORES.CACHED_RESPONSES)) {
          const cacheStore = db.createObjectStore(DB_STORES.CACHED_RESPONSES, {
            keyPath: 'id',
          });
          cacheStore.createIndex('query', 'query', { unique: false });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Pending queries store
        if (!db.objectStoreNames.contains(DB_STORES.PENDING_QUERIES)) {
          const pendingStore = db.createObjectStore(DB_STORES.PENDING_QUERIES, {
            keyPath: 'id',
          });
          pendingStore.createIndex('sessionId', 'sessionId', { unique: false });
          pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      },
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBPDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // ==================== Message Methods ====================

  /**
   * Save a message to IndexedDB
   */
  async saveMessage(message: Message): Promise<void> {
    const db = await this.ensureDB();
    await db.put(DB_STORES.MESSAGES, message);
  }

  /**
   * Get all messages for a session
   */
  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    const db = await this.ensureDB();
    const index = db
      .transaction(DB_STORES.MESSAGES)
      .objectStore(DB_STORES.MESSAGES)
      .index('sessionId');
    return await index.getAll(sessionId);
  }

  /**
   * Get all messages (for debugging/admin)
   */
  async getAllMessages(): Promise<Message[]> {
    const db = await this.ensureDB();
    return await db.getAll(DB_STORES.MESSAGES);
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete(DB_STORES.MESSAGES, messageId);
  }

  // ==================== Session Methods ====================

  /**
   * Save a session
   */
  async saveSession(session: Session): Promise<void> {
    const db = await this.ensureDB();
    await db.put(DB_STORES.SESSIONS, session);
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<Session | undefined> {
    const db = await this.ensureDB();
    return await db.get(DB_STORES.SESSIONS, sessionId);
  }

  /**
   * Get the most recent session for a farmer
   */
  async getLatestSession(farmerId: string): Promise<Session | undefined> {
    const db = await this.ensureDB();
    const index = db
      .transaction(DB_STORES.SESSIONS)
      .objectStore(DB_STORES.SESSIONS)
      .index('farmerId');
    const sessions = await index.getAll(farmerId);

    if (sessions.length === 0) return undefined;

    // Sort by lastActivity descending
    sessions.sort((a, b) => b.lastActivity - a.lastActivity);
    return sessions[0];
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete(DB_STORES.SESSIONS, sessionId);
  }

  // ==================== Settings Methods ====================

  /**
   * Save settings
   */
  async saveSetting(settings: Settings): Promise<void> {
    const db = await this.ensureDB();
    await db.put(DB_STORES.SETTINGS, settings);
  }

  /**
   * Get settings for a farmer
   */
  async getSetting(farmerId: string): Promise<Settings | undefined> {
    const db = await this.ensureDB();
    return await db.get(DB_STORES.SETTINGS, farmerId);
  }

  /**
   * Delete settings
   */
  async deleteSetting(farmerId: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete(DB_STORES.SETTINGS, farmerId);
  }

  // ==================== Cache Methods ====================

  /**
   * Cache an API response
   */
  async cacheResponse(cache: CachedResponse): Promise<void> {
    const db = await this.ensureDB();
    await db.put(DB_STORES.CACHED_RESPONSES, cache);
  }

  /**
   * Find a cached response by exact query match
   */
  async findCachedResponse(query: string): Promise<CachedResponse | undefined> {
    const db = await this.ensureDB();
    const index = db
      .transaction(DB_STORES.CACHED_RESPONSES)
      .objectStore(DB_STORES.CACHED_RESPONSES)
      .index('query');
    return await index.get(query);
  }

  /**
   * Get all cached responses (for size calculation)
   */
  async getAllCachedResponses(): Promise<CachedResponse[]> {
    const db = await this.ensureDB();
    return await db.getAll(DB_STORES.CACHED_RESPONSES);
  }

  /**
   * Delete a cached response
   */
  async deleteCachedResponse(cacheId: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete(DB_STORES.CACHED_RESPONSES, cacheId);
  }

  /**
   * Clear all cached responses
   */
  async clearCache(): Promise<void> {
    const db = await this.ensureDB();
    await db.clear(DB_STORES.CACHED_RESPONSES);
  }

  // ==================== Pending Query Methods ====================

  /**
   * Add a pending query (for offline mode)
   */
  async addPendingQuery(query: PendingQuery): Promise<void> {
    const db = await this.ensureDB();
    await db.put(DB_STORES.PENDING_QUERIES, query);
  }

  /**
   * Get all pending queries
   */
  async getPendingQueries(): Promise<PendingQuery[]> {
    const db = await this.ensureDB();
    const queries = await db.getAll(DB_STORES.PENDING_QUERIES);
    // Sort by timestamp ascending (oldest first)
    return queries.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get pending queries for a session
   */
  async getPendingQueriesBySession(sessionId: string): Promise<PendingQuery[]> {
    const db = await this.ensureDB();
    const index = db
      .transaction(DB_STORES.PENDING_QUERIES)
      .objectStore(DB_STORES.PENDING_QUERIES)
      .index('sessionId');
    const queries = await index.getAll(sessionId);
    return queries.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Remove a pending query (after successful sync)
   */
  async removePendingQuery(queryId: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete(DB_STORES.PENDING_QUERIES, queryId);
  }

  /**
   * Clear all pending queries
   */
  async clearPendingQueries(): Promise<void> {
    const db = await this.ensureDB();
    await db.clear(DB_STORES.PENDING_QUERIES);
  }

  // ==================== Utility Methods ====================

  /**
   * Clear all data from all stores
   */
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    await Promise.all([
      db.clear(DB_STORES.MESSAGES),
      db.clear(DB_STORES.SESSIONS),
      db.clear(DB_STORES.SETTINGS),
      db.clear(DB_STORES.CACHED_RESPONSES),
      db.clear(DB_STORES.PENDING_QUERIES),
    ]);
  }

  /**
   * Get database size estimate (in bytes)
   */
  async getDatabaseSize(): Promise<number> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return 0;
    }
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const dbRepository = new DBRepository();
