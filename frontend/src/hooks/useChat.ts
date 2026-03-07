import { useState, useEffect, useCallback, useRef } from 'react';
import { dbRepository } from '../services/DBRepository';
import { cacheManager } from '../services/CacheManager';
import { apiClient } from '../services/APIClient';
import { generateSessionId, incrementSessionMessageCount } from '../utils/session';
import type { Message } from '../types';

/**
 * useChat - Custom hook for chat functionality
 * 
 * Manages chat messages with offline support:
 * - Loads messages from IndexedDB on mount
 * - Sends messages to API when online
 * - Queues messages in IndexedDB when offline
 * - Caches responses for offline access
 * - Prevents duplicate submissions
 * 
 * Requirements: 3.1, 3.2, 4.1, 4.5, 7.1, 7.4, 7.5, 16.1
 */

interface UseChatOptions {
  sessionId: string;
  farmerId: string;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clearError: () => void;
}

export function useChat({ sessionId, farmerId }: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if a request is in progress to prevent duplicates
  const isSubmittingRef = useRef(false);

  /**
   * Load messages from IndexedDB on mount
   * Requirement 7.1: Load cached messages for offline access
   */
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await dbRepository.getMessagesBySession(sessionId);
        // Sort by timestamp ascending
        storedMessages.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(storedMessages);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setError('Failed to load message history');
      }
    };

    loadMessages();
  }, [sessionId]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Send a message with online/offline handling
   * Requirements: 3.2, 4.1, 4.5, 7.4, 7.5, 16.1
   */
  const sendMessage = useCallback(
    async (text: string) => {
      // Requirement 4.5: Prevent duplicate submissions
      if (isSubmittingRef.current || isLoading) {
        return;
      }

      if (!text.trim()) {
        return;
      }

      isSubmittingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Create user message
      const userMessage: Message = {
        id: generateSessionId(), // Use UUID v4 generator
        sessionId,
        sender: 'user',
        text: text.trim(),
        timestamp: Date.now(),
        status: 'sending',
      };

      try {
        // Add user message to state and save to IndexedDB
        setMessages((prev) => [...prev, userMessage]);
        await dbRepository.saveMessage(userMessage);

        // Check if online
        const isOnline = navigator.onLine;

        if (isOnline) {
          // Requirement 4.1: Send to API when online
          try {
            const response = await apiClient.sendChatMessage(text, sessionId);

            // Update user message status to sent
            userMessage.status = 'sent';
            await dbRepository.saveMessage(userMessage);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
              )
            );

            // Create bot response message
            const botMessage: Message = {
              id: generateSessionId(),
              sessionId,
              sender: 'bot',
              text: response.response,
              timestamp: Date.now(),
              status: 'sent',
            };

            // Add bot message to state and save to IndexedDB
            setMessages((prev) => [...prev, botMessage]);
            await dbRepository.saveMessage(botMessage);

            // Requirement 7.1: Cache response for offline access
            await cacheManager.cacheAPIResponse(text, response.response);

            // Update session message count
            await incrementSessionMessageCount(sessionId);
          } catch (apiError) {
            // API call failed - queue for later sync
            // Requirement 16.1: Queue messages when offline or API fails
            userMessage.status = 'failed';
            userMessage.isOffline = true;
            await dbRepository.saveMessage(userMessage);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessage.id
                  ? { ...msg, status: 'failed', isOffline: true }
                  : msg
              )
            );

            // Add to pending queries
            await dbRepository.addPendingQuery({
              id: generateSessionId(),
              sessionId,
              farmerId,
              query: text,
              timestamp: Date.now(),
              retryCount: 0,
            });

            throw apiError;
          }
        } else {
          // Requirement 7.4, 7.5: Handle offline mode
          // Try to find cached response
          const cachedResponse = await cacheManager.findSimilarCachedResponse(text);

          if (cachedResponse) {
            // Found cached response - display it with offline label
            userMessage.status = 'sent';
            userMessage.isOffline = true;
            await dbRepository.saveMessage(userMessage);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessage.id
                  ? { ...msg, status: 'sent', isOffline: true }
                  : msg
              )
            );

            const botMessage: Message = {
              id: generateSessionId(),
              sessionId,
              sender: 'bot',
              text: cachedResponse,
              timestamp: Date.now(),
              status: 'sent',
              isOffline: true,
            };

            setMessages((prev) => [...prev, botMessage]);
            await dbRepository.saveMessage(botMessage);
          } else {
            // No cached response - queue for later
            userMessage.status = 'failed';
            userMessage.isOffline = true;
            await dbRepository.saveMessage(userMessage);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessage.id
                  ? { ...msg, status: 'failed', isOffline: true }
                  : msg
              )
            );

            // Requirement 16.1: Queue message in IndexedDB when offline
            await dbRepository.addPendingQuery({
              id: generateSessionId(),
              sessionId,
              farmerId,
              query: text,
              timestamp: Date.now(),
              retryCount: 0,
            });

            setError('You are offline. Message will be sent when connection is restored.');
          }
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to send message. Please try again.'
        );
      } finally {
        setIsLoading(false);
        isSubmittingRef.current = false;
      }
    },
    [sessionId, farmerId, isLoading]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError,
  };
}
