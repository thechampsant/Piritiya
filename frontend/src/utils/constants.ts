import type { Language, QuickAction } from '../types';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  CHAT: '/chat',
  FARMERS: '/farmers',
  SOIL_MOISTURE: '/soil-moisture',
  CROP_ADVICE: '/crop-advice',
  MARKET_PRICES: '/market-prices',
  GOVT_SCHEMES: '/govt-schemes',
  ADVICE: '/advice',
  HEALTH: '/health',
  TRANSCRIBE: '/speech/transcribe',
  TRANSCRIBE_STREAM_WS: '/speech/transcribe/stream',
  SYNTHESIZE: '/speech/synthesize',
} as const;

/** Base URL for WebSocket (http -> ws, https -> wss). */
export function getTranscribeStreamWsUrl(): string {
  const base = API_BASE_URL.replace(/^http/, 'ws');
  return `${base}${API_ENDPOINTS.TRANSCRIBE_STREAM_WS}`;
}

/** WhatsApp link for Contact Support in Settings. Replace with real number as needed. */
export const SUPPORT_WHATSAPP_URL = 'https://wa.me/919876543210';

// Cache Configuration
export const CACHE_SIZE_LIMIT_MB = 50;
export const CACHE_SIZE_LIMIT_BYTES = CACHE_SIZE_LIMIT_MB * 1024 * 1024;
export const CACHE_PRUNE_PERCENTAGE = 0.2; // Remove oldest 20% when limit exceeded

// Session Configuration
export const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_TIMEOUT_HOURS = 24;

// Retry Configuration
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000;
export const RETRY_BACKOFF_MULTIPLIER = 2;
export const API_TIMEOUT_MS = 30000; // 30 seconds

// Supported Languages
export const SUPPORTED_LANGUAGES: Language[] = ['hi', 'en'];

export const LANGUAGE_NAMES = {
  hi: 'हिंदी',
  en: 'English',
} as const;

export const LANGUAGE_LOCALES = {
  hi: 'hi-IN',
  en: 'en-IN',
} as const;

/** Per-language AWS voice support (matches piritiya-design-system i18n polly/transcribeRT). */
export const VOICE_LANGUAGE_CONFIG: Record<string, { polly: boolean; transcribeRT: boolean }> = {
  hi: { polly: true, transcribeRT: true },
  en: { polly: true, transcribeRT: true },
  bn: { polly: false, transcribeRT: false },
  gu: { polly: false, transcribeRT: false },
  kn: { polly: false, transcribeRT: false },
  ml: { polly: false, transcribeRT: false },
  ta: { polly: false, transcribeRT: false },
  te: { polly: false, transcribeRT: false },
};

// Pre-fetch cache TTL (for Bedrock context)
export const PREFETCH_TTL_SOIL_MS = 30 * 60 * 1000; // 30 min
export const PREFETCH_TTL_MARKET_MS = 15 * 60 * 1000; // 15 min
export const PREFETCH_TTL_GOVT_MS = 24 * 60 * 60 * 1000; // 24 h
export const PREFETCH_TTL_CROP_MS = 30 * 60 * 1000; // 30 min

export const PREFETCH_KEYS = {
  SOIL_MOISTURE: 'soil_moisture',
  CROP_ADVICE: 'crop_advice',
  MARKET_PRICES: 'market_prices',
  GOVT_SCHEMES: 'govt_schemes',
} as const;

export type PrefetchKey = (typeof PREFETCH_KEYS)[keyof typeof PREFETCH_KEYS];

// IndexedDB Configuration
export const DB_NAME = 'piritiya-db';
export const DB_VERSION = 2;

export const DB_STORES = {
  MESSAGES: 'messages',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  CACHED_RESPONSES: 'cachedResponses',
  PENDING_QUERIES: 'pendingQueries',
  PREFETCH_CACHE: 'prefetchCache',
} as const;

// Quick Actions
export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'soil-moisture',
    labelEn: 'Check Soil Moisture',
    labelHi: 'मिट्टी की नमी जांचें',
    query: 'What is my current soil moisture level?',
    icon: '💧',
  },
  {
    id: 'crop-advice',
    labelEn: 'Get Crop Advice',
    labelHi: 'फसल की सलाह लें',
    query: 'What crops should I plant this season?',
    icon: '🌾',
  },
  {
    id: 'market-prices',
    labelEn: 'Market Prices',
    labelHi: 'बाजार भाव',
    query: 'What are the current market prices?',
    icon: '💰',
  },
  {
    id: 'water-saving',
    labelEn: 'Water Saving Tips',
    labelHi: 'पानी बचाने के उपाय',
    query: 'How can I save water in farming?',
    icon: '💦',
  },
];

// Accessibility
export const MIN_TOUCH_TARGET_SIZE = 44; // pixels
export const MIN_FONT_SIZE = 16; // pixels
export const MIN_CONTRAST_RATIO = 4.5; // WCAG AA standard

// Performance
export const VIRTUAL_SCROLL_THRESHOLD = 50; // messages
export const DEBOUNCE_DELAY_MS = 300;
export const SCROLL_DEBOUNCE_MS = 150;

// Service Worker
export const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
export const SW_CACHE_NAME = 'piritiya-cache-v1';

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: {
    en: 'Network error. Please check your connection.',
    hi: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
  },
  API_ERROR: {
    en: 'Server error. Please try again later.',
    hi: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
  },
  VOICE_NOT_SUPPORTED: {
    en: 'Voice input is not supported in your browser.',
    hi: 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।',
  },
  VOICE_PERMISSION_DENIED: {
    en: 'Microphone permission denied.',
    hi: 'माइक्रोफ़ोन अनुमति अस्वीकृत।',
  },
  STORAGE_QUOTA_EXCEEDED: {
    en: 'Storage limit exceeded. Please clear cache.',
    hi: 'स्टोरेज सीमा पार हो गई। कृपया कैश साफ़ करें।',
  },
  SESSION_EXPIRED: {
    en: 'Session expired. Starting new session.',
    hi: 'सत्र समाप्त हो गया। नया सत्र शुरू हो रहा है।',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CACHE_CLEARED: {
    en: 'Cache cleared successfully.',
    hi: 'कैश सफलतापूर्वक साफ़ हो गया।',
  },
  DATA_CLEARED: {
    en: 'All data cleared successfully.',
    hi: 'सभी डेटा सफलतापूर्वक साफ़ हो गया।',
  },
  SETTINGS_SAVED: {
    en: 'Settings saved successfully.',
    hi: 'सेटिंग्स सफलतापूर्वक सहेजी गईं।',
  },
  SYNC_COMPLETE: {
    en: 'Sync completed successfully.',
    hi: 'सिंक सफलतापूर्वक पूर्ण हुआ।',
  },
} as const;

// App Metadata
export const APP_NAME = 'Piritiya';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Agricultural advisory system for Uttar Pradesh farmers';

// Default Values
export const DEFAULT_LANGUAGE: Language = 'hi';
export const DEFAULT_FARMER_ID = '';
export const DEFAULT_VOICE_ENABLED = true;
