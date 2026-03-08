import { useState, useEffect, useCallback, useRef } from 'react';
import { dbRepository } from '../services/DBRepository';
import { apiClient } from '../services/APIClient';
import type { PendingQuery } from '../types';

/**
 * useOfflineSync - Custom hook for managing offline/online status and syncing pending queries
 * 
 * Features:
 * - Monitors online/offline status using navigator.onLine
 * - Tracks pending query count from IndexedDB
 * - Provides syncNow function to manually trigger sync
 * - Auto-syncs when network reconnects
 * - Manages syncing state
 * 
 * Requirements: 7.2, 7.3, 7.7, 16.2, 16.3
 */
export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  
  // Use ref to prevent multiple simultaneous syncs
  const syncInProgressRef = useRef<boolean>(false);

  /**
   * Update pending query count from IndexedDB
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const queries = await dbRepository.getPendingQueries();
      setPendingCount(queries.length);
    } catch (error) {
      console.error('Failed to get pending query count:', error);
    }
  }, []);

  /**
   * Sync pending queries to backend
   * Processes queries in FIFO order (oldest first)
   */
  const syncNow = useCallback(async () => {
    // Prevent multiple simultaneous syncs
    if (syncInProgressRef.current || !navigator.onLine) {
      return;
    }

    syncInProgressRef.current = true;
    setIsSyncing(true);

    try {
      // Get all pending queries sorted by timestamp (oldest first)
      const pendingQueries = await dbRepository.getPendingQueries();

      if (pendingQueries.length === 0) {
        return;
      }

      // Process each query in order
      for (const query of pendingQueries) {
        try {
          // Send query to backend
          await apiClient.sendChatMessage(query.query, query.sessionId);
          
          // Remove from pending queue on success
          await dbRepository.removePendingQuery(query.id);
        } catch (error) {
          console.error(`Failed to sync query ${query.id}:`, error);
          
          // Update retry count
          const updatedQuery: PendingQuery = {
            ...query,
            retryCount: query.retryCount + 1,
          };
          await dbRepository.addPendingQuery(updatedQuery);
          
          // Stop syncing on first failure to maintain order
          // Failed queries will be retried on next sync attempt
          break;
        }
      }

      // Update pending count after sync
      await updatePendingCount();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
      syncInProgressRef.current = false;
    }
  }, [updatePendingCount]);

  /**
   * Handle online event
   */
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    // Auto-sync when network reconnects
    syncNow();
  }, [syncNow]);

  /**
   * Handle offline event
   */
  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  /**
   * Set up online/offline event listeners
   */
  useEffect(() => {
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending count update
    updatePendingCount();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, updatePendingCount]);

  /**
   * Poll pending count periodically (every 5 seconds)
   * This ensures the count stays up-to-date even if queries are added elsewhere
   */
  useEffect(() => {
    const interval = setInterval(() => {
      updatePendingCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow,
  };
}
