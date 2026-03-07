import { useState, useEffect, useRef, useCallback } from 'react';
import type { Language } from '../types';
import { apiClient } from '../services/APIClient';

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

export interface UseVoiceInputOptions {
  /** When true and online, use backend (Amazon Transcribe) instead of Web Speech API */
  useBackend?: boolean;
}

/**
 * Custom hook for voice input using Web Speech API or backend (Amazon Transcribe)
 * Handles speech recognition with browser compatibility detection
 *
 * @param language - Language locale ('hi' for Hindi, 'en' for English)
 * @param options - useBackend: when true and online, record and send to backend for transcription
 * @returns Voice input state and control functions
 */
export function useVoiceInput(
  language: Language,
  options: UseVoiceInputOptions = {}
): UseVoiceInputReturn {
  const { useBackend = false } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check browser compatibility on mount
  useEffect(() => {
    if (useBackend) {
      const hasMediaRecorder = typeof window !== 'undefined' && !!window.MediaRecorder;
      const hasGetUserMedia =
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia;
      const supported = !!(hasMediaRecorder && hasGetUserMedia);
      setIsSupported(supported);
      if (!supported) {
        setError(new Error('Recording not supported in this browser'));
      }
    } else {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        setIsSupported(true);
        recognitionRef.current = new SpeechRecognitionAPI();
      } else {
        setIsSupported(false);
        setError(new Error('Speech recognition is not supported in this browser'));
      }
    }
  }, [useBackend]);

  // Configure recognition when language changes (Web Speech path only)
  useEffect(() => {
    if (useBackend || !recognitionRef.current) return;

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
  }, [language, useBackend]);

  // Start listening function
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError(new Error(useBackend ? 'Recording not supported' : 'Speech recognition is not supported'));
      return;
    }

    if (isListening) {
      return; // Already listening
    }

    if (useBackend) {
      try {
        setTranscript('');
        setError(null);
        setIsListening(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          mediaRecorderRef.current = null;
          setIsListening(false);
          if (chunksRef.current.length === 0) return;
          const blob = new Blob(chunksRef.current, { type: mime });
          const languageCode = language === 'hi' ? 'hi-IN' : 'en-IN';
          try {
            const result = await apiClient.transcribeAudio(blob, languageCode);
            setTranscript(result.transcript || '');
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err : new Error('Transcription failed'));
            setTranscript('');
          }
        };

        recorder.onerror = () => {
          setError(new Error('Recording failed'));
          setIsListening(false);
        };

        recorder.start(100);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to start recording'));
        setIsListening(false);
      }
      return;
    }

    // Web Speech path
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start speech recognition');
      setError(error);
      setIsListening(false);
    }
  }, [isSupported, isListening, useBackend, language]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!isListening) return;

    if (useBackend && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    if (!useBackend && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to stop speech recognition');
        setError(error);
      }
    }
  }, [isListening, useBackend]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (useBackend && mediaRecorderRef.current?.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
      if (!useBackend && recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isListening, useBackend]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  };
}
