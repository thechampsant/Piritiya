import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useChat as useChatHook } from '../hooks/useChat';
import { dbRepository } from '../services/DBRepository';
import { apiClient } from '../services/APIClient';
import { getOrCreateSession, createNewSession } from '../utils/session';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useApp } from './AppContext';
import type { Message, PendingQuery, ChatResponse } from '../types';

/**
 * ChatContext - Chat session state provider
 * 
 * Manages:
 * - Session ID
 * - Message history
 * - Loading state
 * - Error state
 * - Pending queries
 * 
 * Requirements: 3.1, 6.1, 16.2
 */

interface ChatState {
  sessionId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  pendingQueries: PendingQuery[];
}

interface ChatContextValue {
  state: ChatState;
  sendMessage: (text: string) => Promise<ChatResponse | undefined>;
  startNewSession: () => Promise<void>;
  openSession: (sessionId: string) => void;
  syncPendingQueries: () => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  farmerId: string;
}

export function ChatProvider({ children, farmerId }: ChatProviderProps) {
  const { addQueryToHistory, updateLastQueryPreview } = useApp();
  const [sessionId, setSessionId] = useState<string>('');
  const [pendingQueries, setPendingQueries] = useState<PendingQuery[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use the useChat hook for message management
  const {
    messages,
    isLoading,
    error,
    sendMessage: sendMessageHook,
    clearError,
  } = useChatHook({
    sessionId,
    farmerId,
    onResponsePreview: (responseText) => updateLastQueryPreview(sessionId, responseText),
  });

  // Use offline sync hook
  const { syncNow, isSyncing } = useOfflineSync();

  /**
   * Keep apiClient in sync with current farmer and session.
   * The farmer ID chosen at onboarding (Start) is used for all API calls until the user logs out.
   */
  useEffect(() => {
    if (!farmerId) {
      apiClient.setFarmerId('');
      apiClient.setSessionId('');
      return;
    }
    apiClient.setFarmerId(farmerId);
    if (sessionId) {
      apiClient.setSessionId(sessionId);
    }
  }, [farmerId, sessionId]);

  /**
   * Initialize or restore session on mount
   * Requirement 6.1: Get or create session
   */
  useEffect(() => {
    const initializeSession = async () => {
      if (!farmerId) {
        return;
      }

      try {
        // Get or create session for this farmer
        const session = await getOrCreateSession(farmerId);
        setSessionId(session.id);

        // Load pending queries
        const queries = await dbRepository.getPendingQueries();
        setPendingQueries(queries);

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initializeSession();
  }, [farmerId]);

  /**
   * Update pending queries periodically
   */
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const updatePendingQueries = async () => {
      try {
        const queries = await dbRepository.getPendingQueries();
        setPendingQueries(queries);
      } catch (error) {
        console.error('Failed to update pending queries:', error);
      }
    };

    // Update immediately
    updatePendingQueries();

    // Poll every 5 seconds
    const interval = setInterval(updatePendingQueries, 5000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  /**
   * Send a message using the useChat hook
   * Requirement 3.1: Send message to backend
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!sessionId) {
        throw new Error('Session not initialized');
      }

      addQueryToHistory(text, sessionId);
      const result = await sendMessageHook(text);

      // Update pending queries after sending
      const queries = await dbRepository.getPendingQueries();
      setPendingQueries(queries);

      return result;
    },
    [sessionId, sendMessageHook, addQueryToHistory]
  );

  /**
   * Open an existing session (e.g. when user taps a past conversation pill chip).
   */
  const openSession = useCallback((targetSessionId: string) => {
    if (targetSessionId && targetSessionId.trim() !== '') {
      setSessionId(targetSessionId.trim());
    }
  }, []);

  /**
   * Start a new session
   * Requirement 6.1: Create new session
   */
  const startNewSession = useCallback(async () => {
    if (!farmerId) {
      throw new Error('Farmer ID not set');
    }

    try {
      // Create a new session
      const newSession = await createNewSession(farmerId);
      setSessionId(newSession.id);

      // Clear error state
      clearError();
    } catch (error) {
      console.error('Failed to start new session:', error);
      throw error;
    }
  }, [farmerId, clearError]);

  /**
   * Sync pending queries to backend
   * Requirement 16.2: Sync pending queries when online
   */
  const syncPendingQueries = useCallback(async () => {
    try {
      // Use the syncNow function from useOfflineSync
      await syncNow();

      // Update pending queries after sync
      const queries = await dbRepository.getPendingQueries();
      setPendingQueries(queries);
    } catch (error) {
      console.error('Failed to sync pending queries:', error);
      throw error;
    }
  }, [syncNow]);

  const state: ChatState = {
    sessionId,
    messages,
    isLoading: isLoading || isSyncing,
    error,
    pendingQueries,
  };

  const value: ChatContextValue = {
    state,
    sendMessage,
    startNewSession,
    openSession,
    syncPendingQueries,
    clearError,
  };

  // Don't render children until session is initialized
  if (!isInitialized) {
    return null;
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/**
 * Custom hook to use ChatContext
 * Note: This is different from the useChat hook in hooks/useChat.ts
 * This hook provides access to the ChatContext, while the other is a lower-level hook
 */
export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
