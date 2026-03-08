import { useState, useEffect, useRef, useCallback } from 'react';
import type { Language } from '../types';
import { apiClient } from '../services/APIClient';

interface UseVoiceOutputReturn {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  isSupported: boolean;
}

export interface UseVoiceOutputOptions {
  /** When true and online, use backend (Amazon Polly) instead of Web Speech API */
  useBackend?: boolean;
}

/**
 * Custom hook for voice output using Web Speech API or backend (Amazon Polly)
 * Handles text-to-speech synthesis with browser compatibility detection
 *
 * @param language - Language locale ('hi' for Hindi, 'en' for English)
 * @param options - useBackend: when true, use backend for synthesis
 * @returns Voice output state and control functions
 */
export function useVoiceOutput(
  language: Language,
  options: UseVoiceOutputOptions = {}
): UseVoiceOutputReturn {
  const { useBackend = false } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Check browser compatibility on mount
  useEffect(() => {
    if (useBackend) {
      setIsSupported(true);
      return;
    }
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices (some browsers load them asynchronously)
      const loadVoices = () => {
        voicesLoadedRef.current = true;
      };
      
      // Check if voices are already loaded
      if (window.speechSynthesis.getVoices().length > 0) {
        voicesLoadedRef.current = true;
      }
      
      // Listen for voices changed event
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    } else {
      setIsSupported(false);
    }
  }, [useBackend]);

  // Get appropriate voice for the locale
  const getVoiceForLocale = useCallback((locale: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find exact locale match
    let voice = voices.find(v => v.lang === locale);
    
    // If no exact match, try language code match (e.g., 'hi' for 'hi-IN')
    if (!voice) {
      const langCode = locale.split('-')[0];
      voice = voices.find(v => v.lang.startsWith(langCode));
    }
    
    // If still no match, return null (will use default voice)
    return voice || null;
  }, []);

  // Stop function (declared before speak so speak can list it in deps)
  const stop = useCallback(() => {
    if (useBackend) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    } catch (error) {
      console.error('Failed to stop speech synthesis:', error);
    }
  }, [isSupported, useBackend]);

  // Speak function
  const speak = useCallback(
    async (text: string) => {
      if (!isSupported || !text.trim()) {
        return;
      }

      if (useBackend) {
        try {
          stop();
          setIsSpeaking(true);
          const blob = await apiClient.synthesizeSpeech(text, language);
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
            audioRef.current = null;
            setIsSpeaking(false);
          };
          audio.onerror = () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
            audioRef.current = null;
            setIsSpeaking(false);
          };
          await audio.play();
        } catch (err) {
          console.error('Polly synthesis failed, falling back to Web Speech:', err);
          if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
            setIsSpeaking(true);
            window.speechSynthesis.speak(utterance);
          } else {
            setIsSpeaking(false);
          }
        }
        return;
      }

      // Web Speech path
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = locale;

      const voice = getVoiceForLocale(locale);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Failed to start speech synthesis:', error);
        setIsSpeaking(false);
        utteranceRef.current = null;
      }
    },
    [isSupported, isSpeaking, language, getVoiceForLocale, useBackend, stop]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        try {
          window.speechSynthesis.cancel();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isSpeaking]);

  // Stop speaking when language changes
  useEffect(() => {
    if (isSpeaking) {
      stop();
    }
  }, [language]); // Intentionally not including stop to avoid infinite loop

  return {
    isSpeaking,
    speak,
    stop,
    isSupported,
  };
}
