import { useState, useEffect, useRef, useCallback } from 'react';
import type { Language } from '../types';

interface UseVoiceOutputReturn {
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  isSupported: boolean;
}

/**
 * Custom hook for voice output using Web Speech API
 * Handles text-to-speech synthesis with browser compatibility detection
 * 
 * @param language - Language locale ('hi' for Hindi, 'en' for English)
 * @returns Voice output state and control functions
 */
export function useVoiceOutput(language: Language): UseVoiceOutputReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  // Check browser compatibility on mount
  useEffect(() => {
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
  }, []);

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

  // Speak function
  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) {
      return;
    }

    // Stop any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Map language to locale
    const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = locale;

    // Try to set appropriate voice
    const voice = getVoiceForLocale(locale);
    if (voice) {
      utterance.voice = voice;
    }

    // Configure utterance properties
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Handle utterance events
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    // Start speaking
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Failed to start speech synthesis:', error);
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [isSupported, isSpeaking, language, getVoiceForLocale]);

  // Stop function
  const stop = useCallback(() => {
    if (!isSupported) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    } catch (error) {
      console.error('Failed to stop speech synthesis:', error);
    }
  }, [isSupported]);

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
