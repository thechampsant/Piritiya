import { CACHE_SIZE_LIMIT_BYTES } from './constants';

/**
 * Validate farmer ID format
 * Expected format: UP-DISTRICT-BLOCK-XXXXX
 * Example: UP-LUCKNOW-MALIHABAD-00001
 */
export function validateFarmerId(farmerId: string): {
  isValid: boolean;
  error?: string;
} {
  if (!farmerId || farmerId.trim() === '') {
    return {
      isValid: false,
      error: 'Farmer ID is required',
    };
  }

  // Check format: UP-DISTRICT-BLOCK-XXXXX
  const pattern = /^UP-[A-Z]+-[A-Z]+-\d{5}$/;
  if (!pattern.test(farmerId)) {
    return {
      isValid: false,
      error: 'Invalid farmer ID format. Expected: UP-DISTRICT-BLOCK-XXXXX',
    };
  }

  return { isValid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate cache size
 */
export function validateCacheSize(sizeBytes: number): {
  isValid: boolean;
  error?: string;
} {
  if (sizeBytes < 0) {
    return {
      isValid: false,
      error: 'Cache size cannot be negative',
    };
  }

  if (sizeBytes > CACHE_SIZE_LIMIT_BYTES) {
    return {
      isValid: false,
      error: `Cache size exceeds limit of ${CACHE_SIZE_LIMIT_BYTES / (1024 * 1024)}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Validate message text
 */
export function validateMessage(message: string): {
  isValid: boolean;
  error?: string;
} {
  if (!message || message.trim() === '') {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  if (message.length > 1000) {
    return {
      isValid: false,
      error: 'Message is too long (max 1000 characters)',
    };
  }

  return { isValid: true };
}

/**
 * Validate session ID format (UUID v4)
 */
export function validateSessionId(sessionId: string): {
  isValid: boolean;
  error?: string;
} {
  if (!sessionId || sessionId.trim() === '') {
    return {
      isValid: false,
      error: 'Session ID is required',
    };
  }

  // UUID v4 pattern
  const pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!pattern.test(sessionId)) {
    return {
      isValid: false,
      error: 'Invalid session ID format',
    };
  }

  return { isValid: true };
}

/**
 * Validate language code
 */
export function validateLanguage(language: string): {
  isValid: boolean;
  error?: string;
} {
  const validLanguages = ['hi', 'en'];
  
  if (!validLanguages.includes(language)) {
    return {
      isValid: false,
      error: `Invalid language. Must be one of: ${validLanguages.join(', ')}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate URL format
 */
export function validateURL(url: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp: number): {
  isValid: boolean;
  error?: string;
} {
  if (isNaN(timestamp) || timestamp < 0) {
    return {
      isValid: false,
      error: 'Invalid timestamp',
    };
  }

  // Check if timestamp is in the future (with 1 minute tolerance)
  const now = Date.now();
  if (timestamp > now + 60000) {
    return {
      isValid: false,
      error: 'Timestamp cannot be in the future',
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  error?: string;
} {
  // Indian phone number: +91XXXXXXXXXX or 10 digits
  const pattern = /^(\+91)?[6-9]\d{9}$/;
  
  if (!pattern.test(phone.replace(/\s/g, ''))) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }

  return { isValid: true };
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(str: string): boolean {
  return !str || str.trim() === '';
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Truncate string to specified length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Escape HTML special characters
 */
export function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): {
  isSupported: boolean;
  missingFeatures: string[];
} {
  const missingFeatures: string[] = [];

  // Check IndexedDB
  if (!('indexedDB' in window)) {
    missingFeatures.push('IndexedDB');
  }

  // Check Service Worker
  if (!('serviceWorker' in navigator)) {
    missingFeatures.push('Service Worker');
  }

  // Check Web Speech API
  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    missingFeatures.push('Speech Recognition');
  }

  if (!('speechSynthesis' in window)) {
    missingFeatures.push('Speech Synthesis');
  }

  return {
    isSupported: missingFeatures.length === 0,
    missingFeatures,
  };
}
