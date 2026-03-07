import { useState, useEffect, useRef, useCallback } from 'react';
import type { Language } from '../types';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  error: Error | null;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

/**
 * Custom hook for voice input using Web Speech API
 * Handles speech recognition with browser compatibility detection
 * 
 * @param language - Language locale ('hi' for Hindi, 'en' for English)
 * @returns Voice input state and control functions
 */
export function useVoiceInput(language: Language): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser compatibility on mount
  useEffect(() => {
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
    } else {
      setIsSupported(false);
      setError(new Error('Speech recognition is not supported in this browser'));
    }
  }, []);

  // Configure recognition when language changes
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    // Map language to locale
    const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.lang = locale;
    
    // Configure for better UX on slow networks
    recognition.continuous = false;
    recognition.interimResults = false;

    // Handle recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcribedText = lastResult[0].transcript;
        setTranscript(transcribedText);
        setError(null);
      }
    };

    // Handle recognition errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not available. Please check your device.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'aborted':
          // User stopped recording, not an error
          return;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(new Error(errorMessage));
      setIsListening(false);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
    };

    // Handle recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

  }, [language]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      setError(new Error('Speech recognition is not supported'));
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    try {
      // Clear previous transcript when starting new recording
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start speech recognition');
      setError(error);
      setIsListening(false);
    }
  }, [isSupported, isListening]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to stop speech recognition');
      setError(error);
    }
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  };
}
