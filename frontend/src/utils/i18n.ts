import type { Language } from '../types';

/**
 * Translation dictionaries for Hindi and English
 */
const translations = {
  // App UI
  appName: {
    en: 'Piritiya',
    hi: 'पिरितिया',
  },
  appTagline: {
    en: 'Agricultural Advisory System',
    hi: 'कृषि सलाहकार प्रणाली',
  },
  welcome: {
    en: 'Welcome',
    hi: 'स्वागत है',
  },
  welcomeSubtitle: {
    en: 'Welcome to Piritiya',
    hi: 'पिरितिया में आपका स्वागत है',
  },
  getStarted: {
    en: 'Get Started',
    hi: 'शुरू करें',
  },
  farmerIdLabel: {
    en: 'Farmer ID',
    hi: 'किसान आईडी',
  },
  farmerIdFormat: {
    en: 'Example: UP-LKO-MLH-00001',
    hi: 'उदाहरण: UP-LKO-MLH-00001',
  },
  selectLanguage: {
    en: 'Select Language',
    hi: 'भाषा चुनें',
  },

  // Chat Interface
  chatPlaceholder: {
    en: 'Type your message or use voice...',
    hi: 'अपना संदेश टाइप करें या आवाज़ का उपयोग करें...',
  },
  type_message: {
    en: 'Type your message...',
    hi: 'अपना संदेश टाइप करें...',
  },
  message_input: {
    en: 'Message input',
    hi: 'संदेश इनपुट',
  },
  send_message: {
    en: 'Send message',
    hi: 'संदेश भेजें',
  },
  sendButton: {
    en: 'Send',
    hi: 'भेजें',
  },
  listening: {
    en: 'Listening...',
    hi: 'सुन रहा हूँ...',
  },
  speaking: {
    en: 'Speaking...',
    hi: 'बोल रहा हूँ...',
  },
  offline_mode: {
    en: 'Offline Mode',
    hi: 'ऑफ़लाइन मोड',
  },
  error_occurred: {
    en: 'Error Occurred',
    hi: 'त्रुटि हुई',
  },
  request_failed: {
    en: 'Request failed. Please try again.',
    hi: 'अनुरोध विफल रहा। कृपया पुनः प्रयास करें।',
  },
  retry: {
    en: 'Retry',
    hi: 'पुनः प्रयास करें',
  },

  // Quick Actions
  quickActions: {
    en: 'Quick Actions',
    hi: 'त्वरित कार्य',
  },

  // Settings
  settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
  },
  farmerId: {
    en: 'Farmer ID',
    hi: 'किसान आईडी',
  },
  farmerIdPlaceholder: {
    en: 'Enter your farmer ID',
    hi: 'अपनी किसान आईडी दर्ज करें',
  },
  farmerIdInvalid: {
    en: 'Please enter a valid farmer ID',
    hi: 'कृपया एक मान्य किसान आईडी दर्ज करें',
  },
  language: {
    en: 'Language',
    hi: 'भाषा',
  },
  english: {
    en: 'English',
    hi: 'अंग्रेज़ी',
  },
  hindi: {
    en: 'Hindi',
    hi: 'हिंदी',
  },
  voiceSettings: {
    en: 'Voice Settings',
    hi: 'आवाज़ सेटिंग्स',
  },
  voiceInput: {
    en: 'Voice Input',
    hi: 'आवाज़ इनपुट',
  },
  voiceOutput: {
    en: 'Voice Output',
    hi: 'आवाज़ आउटपुट',
  },
  dataManagement: {
    en: 'Data Management',
    hi: 'डेटा प्रबंधन',
  },
  clearCache: {
    en: 'Clear Cache',
    hi: 'कैश साफ़ करें',
  },
  clearAllData: {
    en: 'Clear All Data',
    hi: 'सभी डेटा साफ़ करें',
  },
  appInfo: {
    en: 'App Information',
    hi: 'ऐप जानकारी',
  },
  appVersion: {
    en: 'App Version',
    hi: 'ऐप संस्करण',
  },
  cacheSize: {
    en: 'Cache Size',
    hi: 'कैश आकार',
  },
  save: {
    en: 'Save',
    hi: 'सहेजें',
  },
  cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
  },
  cacheCleared: {
    en: 'Cache cleared successfully',
    hi: 'कैश सफलतापूर्वक साफ़ हो गया',
  },
  dataCleared: {
    en: 'All data cleared successfully',
    hi: 'सभी डेटा सफलतापूर्वक साफ़ हो गया',
  },

  // Status Messages
  online: {
    en: 'Online',
    hi: 'ऑनलाइन',
  },
  offline: {
    en: 'Offline',
    hi: 'ऑफ़लाइन',
  },
  syncing: {
    en: 'Syncing...',
    hi: 'सिंक हो रहा है...',
  },
  loading: {
    en: 'Loading...',
    hi: 'लोड हो रहा है...',
  },

  // Confirmation
  confirmClearCache: {
    en: 'Are you sure you want to clear the cache?',
    hi: 'क्या आप वाकई कैश साफ़ करना चाहते हैं?',
  },
  confirmClearAllData: {
    en: 'Are you sure you want to clear all data? This cannot be undone.',
    hi: 'क्या आप वाकई सभी डेटा साफ़ करना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।',
  },

  // Data Labels
  soilMoisture: {
    en: 'Soil Moisture',
    hi: 'मिट्टी की नमी',
  },
  groundwaterStatus: {
    en: 'Groundwater Status',
    hi: 'भूजल स्थिति',
  },
  cropRecommendations: {
    en: 'Crop Recommendations',
    hi: 'फसल सिफारिशें',
  },
  marketPrices: {
    en: 'Market Prices',
    hi: 'बाजार भाव',
  },

  // Groundwater Status
  critical: {
    en: 'Critical',
    hi: 'गंभीर',
  },
  low: {
    en: 'Low',
    hi: 'कम',
  },
  moderate: {
    en: 'Moderate',
    hi: 'मध्यम',
  },
  good: {
    en: 'Good',
    hi: 'अच्छा',
  },

  // Units
  meters: {
    en: 'meters',
    hi: 'मीटर',
  },
  days: {
    en: 'days',
    hi: 'दिन',
  },
  quintals: {
    en: 'quintals',
    hi: 'क्विंटल',
  },
  rupees: {
    en: 'rupees',
    hi: 'रुपये',
  },
} as const;

type TranslationKey = keyof typeof translations;

/**
 * Get translation for a key in the specified language
 */
export function getTranslation(key: TranslationKey, language: Language): string {
  return translations[key][language] || translations[key].en;
}

/**
 * Format number according to language (Devanagari or Arabic numerals)
 */
export function formatNumber(num: number, language: Language): string {
  if (language === 'hi') {
    // Convert to Devanagari numerals
    const devanagariNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return num
      .toString()
      .split('')
      .map((digit) => {
        const d = parseInt(digit, 10);
        return isNaN(d) ? digit : devanagariNumerals[d];
      })
      .join('');
  }
  return num.toString();
}

/**
 * Format currency according to language
 */
export function formatCurrency(amount: number, language: Language): string {
  const formatted = formatNumber(amount, language);
  const symbol = language === 'hi' ? '₹' : '₹';
  return `${symbol}${formatted}`;
}

/**
 * Format date according to language
 */
export function formatDate(date: Date | number, language: Language): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time according to language
 */
export function formatTime(date: Date | number, language: Language): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const locale = language === 'hi' ? 'hi-IN' : 'en-IN';
  
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date and time according to language
 */
export function formatDateTime(date: Date | number, language: Language): string {
  return `${formatDate(date, language)} ${formatTime(date, language)}`;
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(timestamp: number, language: Language): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (language === 'hi') {
    if (days > 0) return `${formatNumber(days, 'hi')} दिन पहले`;
    if (hours > 0) return `${formatNumber(hours, 'hi')} घंटे पहले`;
    if (minutes > 0) return `${formatNumber(minutes, 'hi')} मिनट पहले`;
    return 'अभी';
  } else {
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }
}

/**
 * Get all available translation keys
 */
export function getTranslationKeys(): TranslationKey[] {
  return Object.keys(translations) as TranslationKey[];
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string): key is TranslationKey {
  return key in translations;
}
