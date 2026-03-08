import type { Language } from '../types';

/**
 * Error handler utilities for the Piritiya app
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.6, 19.4
 */

export interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'network' | 'api' | 'voice' | 'data' | 'unknown';
  message: string;
  stack?: string;
  // No PII stored (Requirement 19.4)
}

/**
 * NetworkErrorHandler - Handles network-related errors
 * Requirement 15.1
 */
export class NetworkErrorHandler {
  /**
   * Check if device is offline
   */
  static isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Get user-friendly error message for network errors
   */
  static getMessage(language: Language): string {
    if (this.isOffline()) {
      return language === 'hi'
        ? 'आप ऑफ़लाइन हैं। कृपया अपना इंटरनेट कनेक्शन जांचें।'
        : 'You are offline. Please check your internet connection.';
    }
    return language === 'hi'
      ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।'
      : 'Network error. Please try again.';
  }

  /**
   * Handle network error
   */
  static handle(error: Error, language: Language): string {
    console.error('Network error:', error);
    return this.getMessage(language);
  }
}

/**
 * APIErrorHandler - Handles API-related errors
 * Requirement 15.1, 15.3
 */
export class APIErrorHandler {
  /**
   * Get localized error message based on status code
   */
  static getMessage(statusCode: number, language: Language): string {
    const messages: Record<number, { en: string; hi: string }> = {
      400: {
        en: 'Invalid request. Please try again.',
        hi: 'अमान्य अनुरोध। कृपया पुनः प्रयास करें।',
      },
      401: {
        en: 'Authentication failed. Please check your farmer ID.',
        hi: 'प्रमाणीकरण विफल। कृपया अपनी किसान आईडी जांचें।',
      },
      403: {
        en: 'Access denied. Please contact support.',
        hi: 'पहुंच अस्वीकृत। कृपया सहायता से संपर्क करें।',
      },
      404: {
        en: 'Resource not found.',
        hi: 'संसाधन नहीं मिला।',
      },
      429: {
        en: 'Too many requests. Please wait and try again.',
        hi: 'बहुत सारे अनुरोध। कृपया प्रतीक्षा करें और पुनः प्रयास करें।',
      },
      500: {
        en: 'Server error. Please try again later.',
        hi: 'सर्वर त्रुटि। कृपया बाद में पुनः प्रयास करें।',
      },
      503: {
        en: 'Service unavailable. Please try again later.',
        hi: 'सेवा अनुपलब्ध। कृपया बाद में पुनः प्रयास करें।',
      },
    };

    const message = messages[statusCode];
    if (message) {
      return message[language];
    }

    // Default error message
    return language === 'hi'
      ? 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
      : 'Something went wrong. Please try again.';
  }

  /**
   * Handle API error
   */
  static handle(error: any, language: Language): string {
    console.error('API error:', error);

    // Check if it's a response error with status code
    if (error.response && error.response.status) {
      return this.getMessage(error.response.status, language);
    }

    // Check if it's a timeout error
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return language === 'hi'
        ? 'अनुरोध समय समाप्त हो गया। कृपया पुनः प्रयास करें।'
        : 'Request timed out. Please try again.';
    }

    // Default error message
    return language === 'hi'
      ? 'API त्रुटि। कृपया पुनः प्रयास करें।'
      : 'API error. Please try again.';
  }
}

/**
 * VoiceErrorHandler - Handles voice-related errors
 * Requirement 15.2
 */
export class VoiceErrorHandler {
  /**
   * Get localized error message for voice errors
   */
  static getMessage(errorType: string, language: Language): string {
    const messages: Record<string, { en: string; hi: string }> = {
      'not-supported': {
        en: 'Voice feature is not supported on this device. Please use text input.',
        hi: 'इस डिवाइस पर आवाज़ सुविधा समर्थित नहीं है। कृपया टेक्स्ट इनपुट का उपयोग करें।',
      },
      'permission-denied': {
        en: 'Microphone permission denied. Please enable microphone access in settings.',
        hi: 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया सेटिंग्स में माइक्रोफ़ोन एक्सेस सक्षम करें।',
      },
      'no-speech': {
        en: 'No speech detected. Please try again.',
        hi: 'कोई आवाज़ नहीं सुनाई दी। कृपया पुनः प्रयास करें।',
      },
      'network': {
        en: 'Voice recognition requires internet connection.',
        hi: 'आवाज़ पहचान के लिए इंटरनेट कनेक्शन आवश्यक है।',
      },
      'aborted': {
        en: 'Voice input was cancelled.',
        hi: 'आवाज़ इनपुट रद्द कर दिया गया।',
      },
    };

    const message = messages[errorType];
    if (message) {
      return message[language];
    }

    // Default error message with fallback suggestion
    return language === 'hi'
      ? 'आवाज़ त्रुटि। कृपया टेक्स्ट इनपुट का उपयोग करें।'
      : 'Voice error. Please use text input.';
  }

  /**
   * Handle voice error
   */
  static handle(error: any, language: Language): string {
    console.error('Voice error:', error);

    // Determine error type
    let errorType = 'unknown';
    if (error.error) {
      errorType = error.error;
    } else if (error.message?.includes('not supported')) {
      errorType = 'not-supported';
    } else if (error.message?.includes('permission')) {
      errorType = 'permission-denied';
    }

    return this.getMessage(errorType, language);
  }
}

/**
 * DataErrorHandler - Handles data storage errors
 * Requirement 15.4
 */
export class DataErrorHandler {
  /**
   * Check if quota is exceeded
   */
  static isQuotaExceeded(error: any): boolean {
    return (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    );
  }

  /**
   * Get localized error message for data errors
   */
  static getMessage(errorType: string, language: Language): string {
    const messages: Record<string, { en: string; hi: string }> = {
      'quota-exceeded': {
        en: 'Storage limit reached. Please clear cache in settings.',
        hi: 'संग्रहण सीमा पूर्ण। कृपया सेटिंग्स में कैश साफ़ करें।',
      },
      'not-found': {
        en: 'Data not found.',
        hi: 'डेटा नहीं मिला।',
      },
      'access-denied': {
        en: 'Cannot access storage. Please check browser settings.',
        hi: 'संग्रहण तक पहुंच नहीं हो सकती। कृपया ब्राउज़र सेटिंग्स जांचें।',
      },
    };

    const message = messages[errorType];
    if (message) {
      return message[language];
    }

    return language === 'hi'
      ? 'डेटा त्रुटि। कृपया पुनः प्रयास करें।'
      : 'Data error. Please try again.';
  }

  /**
   * Handle data error
   */
  static handle(error: any, language: Language): string {
    console.error('Data error:', error);

    if (this.isQuotaExceeded(error)) {
      return this.getMessage('quota-exceeded', language);
    }

    if (error.name === 'NotFoundError') {
      return this.getMessage('not-found', language);
    }

    return this.getMessage('unknown', language);
  }
}

/**
 * ErrorLogger - Logs errors to IndexedDB without PII
 * Requirement 15.6, 19.4
 */
export class ErrorLogger {
  private static readonly MAX_LOGS = 100;
  private static logs: ErrorLog[] = [];

  /**
   * Log an error (without PII)
   */
  static log(
    type: ErrorLog['type'],
    error: Error | string,
    additionalInfo?: Record<string, any>
  ): void {
    const errorLog: ErrorLog = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
    };

    // Add to in-memory logs
    this.logs.push(errorLog);

    // Keep only last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error(`[${type}]`, error, additionalInfo);
    }

    // In production, you could send logs to a monitoring service
    // but ensure no PII is included
  }

  /**
   * Get recent error logs
   */
  static getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get logs by type
   */
  static getLogsByType(type: ErrorLog['type']): ErrorLog[] {
    return this.logs.filter((log) => log.type === type);
  }
}

/**
 * Generic error handler that routes to specific handlers
 */
export function handleError(
  error: any,
  language: Language,
  context?: string
): string {
  // Log the error
  ErrorLogger.log('unknown', error, { context });

  // Route to specific handler based on error type
  if (error.name === 'NetworkError' || !navigator.onLine) {
    return NetworkErrorHandler.handle(error, language);
  }

  if (error.response || error.status) {
    return APIErrorHandler.handle(error, language);
  }

  if (context === 'voice' || error.error) {
    return VoiceErrorHandler.handle(error, language);
  }

  if (error instanceof DOMException) {
    return DataErrorHandler.handle(error, language);
  }

  // Default error message
  return language === 'hi'
    ? 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।'
    : 'Something went wrong. Please try again.';
}
