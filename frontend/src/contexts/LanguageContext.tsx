import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useApp } from './AppContext';
import { getTranslation, formatNumber, formatCurrency, formatDate, formatTime, formatDateTime, getRelativeTime } from '../utils/i18n';
import type { Language } from '../types';

/**
 * LanguageContext - i18n wrapper for component access
 * 
 * Provides:
 * - Translation function (t)
 * - Current language
 * - Formatting utilities (numbers, currency, dates)
 * 
 * Updates automatically when language changes in AppContext
 * 
 * Requirements: 10.1, 10.2, 10.3
 */

interface LanguageContextValue {
  language: Language;
  t: (key: string) => string;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | number) => string;
  formatTime: (date: Date | number) => string;
  formatDateTime: (date: Date | number) => string;
  getRelativeTime: (timestamp: number) => string;
  locale: string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Get language from AppContext
  const { state } = useApp();
  const { language } = state;

  /**
   * Translation function wrapper
   * Requirement 10.2: Provide translation function
   */
  const t = useMemo(
    () => (key: string) => {
      try {
        return getTranslation(key as any, language);
      } catch (error) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    },
    [language]
  );

  /**
   * Format number according to current language
   * Requirement 10.3: Format numbers in language-specific numeral system
   */
  const formatNumberLocalized = useMemo(
    () => (num: number) => formatNumber(num, language),
    [language]
  );

  /**
   * Format currency according to current language
   */
  const formatCurrencyLocalized = useMemo(
    () => (amount: number) => formatCurrency(amount, language),
    [language]
  );

  /**
   * Format date according to current language
   */
  const formatDateLocalized = useMemo(
    () => (date: Date | number) => formatDate(date, language),
    [language]
  );

  /**
   * Format time according to current language
   */
  const formatTimeLocalized = useMemo(
    () => (date: Date | number) => formatTime(date, language),
    [language]
  );

  /**
   * Format date and time according to current language
   */
  const formatDateTimeLocalized = useMemo(
    () => (date: Date | number) => formatDateTime(date, language),
    [language]
  );

  /**
   * Get relative time string according to current language
   */
  const getRelativeTimeLocalized = useMemo(
    () => (timestamp: number) => getRelativeTime(timestamp, language),
    [language]
  );

  /**
   * Get locale string for Web APIs (e.g., hi-IN, en-IN)
   */
  const locale = useMemo(() => {
    return language === 'hi' ? 'hi-IN' : 'en-IN';
  }, [language]);

  const value: LanguageContextValue = {
    language,
    t,
    formatNumber: formatNumberLocalized,
    formatCurrency: formatCurrencyLocalized,
    formatDate: formatDateLocalized,
    formatTime: formatTimeLocalized,
    formatDateTime: formatDateTimeLocalized,
    getRelativeTime: getRelativeTimeLocalized,
    locale,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Custom hook to use LanguageContext
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
