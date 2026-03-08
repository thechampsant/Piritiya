import { useState, useEffect, useCallback, useRef } from 'react';
import { dbRepository } from '../services/DBRepository';
import { cacheManager } from '../services/CacheManager';
import { apiClient } from '../services/APIClient';
import { generateSessionId, incrementSessionMessageCount } from '../utils/session';
import type { Message, ChatResponse } from '../types';

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
  /** Called with the first few words of the bot response to store as conversation card preview. */
  onResponsePreview?: (responseText: string) => void;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string, options?: { signal?: AbortSignal }) => Promise<ChatResponse | undefined>;
  clearError: () => void;
}

export function useChat({ sessionId, farmerId, onResponsePreview }: UseChatOptions): UseChatReturn {
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
   * When cache is cleared from Settings, clear in-memory messages so the Chat tab updates immediately.
   */
  useEffect(() => {
    const handler = () => setMessages([]);
    window.addEventListener('piritiya-cache-cleared', handler);
    return () => window.removeEventListener('piritiya-cache-cleared', handler);
  }, []);

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
    async (text: string, options?: { signal?: AbortSignal }) => {
      // Requirement 4.5: Prevent duplicate submissions
      if (isSubmittingRef.current || isLoading) {
        return undefined;
      }

      if (!text.trim()) {
        return undefined;
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
          // Requirement 4.1: Send to API when online; stream response so first tokens appear in ~800ms
          try {
            const cachedPrefetch = await apiClient.getPrefetchData();
            const botMessageId = generateSessionId();
            const botMessage: Message = {
              id: botMessageId,
              sessionId,
              sender: 'bot',
              text: '',
              timestamp: Date.now(),
              status: 'sending',
            };
            setMessages((prev) => [...prev, botMessage]);
            await dbRepository.saveMessage(botMessage);

            userMessage.status = 'sent';
            await dbRepository.saveMessage(userMessage);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
              )
            );

            const response = await apiClient.sendChatMessageStream(
              text,
              sessionId,
              farmerId,
              {
                signal: options?.signal,
                cachedPrefetch: Object.keys(cachedPrefetch).length > 0 ? cachedPrefetch : undefined,
                onChunk: (delta) => {
                  setMessages((prev) => {
                    const next = [...prev];
                    const idx = next.findIndex((m) => m.id === botMessageId);
                    if (idx >= 0) next[idx] = { ...next[idx], text: next[idx].text + delta };
                    return next;
                  });
                },
              }
            );

            const fullText = response.response;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, text: fullText, status: 'sent' } : msg
              )
            );
            botMessage.text = fullText;
            botMessage.status = 'sent';
            await dbRepository.saveMessage(botMessage);

            onResponsePreview?.(fullText);
            await cacheManager.cacheAPIResponse(text, fullText);
            await incrementSessionMessageCount(sessionId);
            return response;
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
            onResponsePreview?.(cachedResponse);
            return { response: cachedResponse, session_id: sessionId, message: text };
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
            return undefined;
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
      return undefined;
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
