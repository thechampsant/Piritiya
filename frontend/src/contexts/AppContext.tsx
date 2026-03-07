import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { dbRepository } from '../services/DBRepository';
import { apiClient } from '../services/APIClient';
import { useOfflineSync } from '../hooks/useOfflineSync';
import type { Language, Settings } from '../types';
import { DEFAULT_LANGUAGE, DEFAULT_VOICE_ENABLED } from '../utils/constants';

/**
 * AppContext - Global application state provider
 * 
 * Manages:
 * - Farmer ID
 * - Language preference
 * - Online/offline status
 * - Voice enabled state
 * - PWA installation status
 * 
 * Requirements: 5.2, 10.1, 18.1, 18.3
 */

interface AppState {
  farmerId: string;
  language: Language;
  isOnline: boolean;
  voiceEnabled: boolean;
  /** When true (default), use AWS voice when online; when false, use browser voice only. */
  useAwsVoice: boolean;
  isInstalled: boolean;
  /** null = not checked yet, true/false = backend health check result */
  backendAvailable: boolean | null;
}

interface AppContextValue {
  state: AppState;
  setFarmerId: (id: string) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  toggleVoice: () => Promise<void>;
  setUseAwsVoice: (value: boolean) => Promise<void>;
  retryBackendCheck: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>({
    farmerId: '',
    language: DEFAULT_LANGUAGE,
    isOnline: true,
    voiceEnabled: DEFAULT_VOICE_ENABLED,
    useAwsVoice: true,
    isInstalled: false,
    backendAvailable: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Use offline sync hook for online status
  const { isOnline } = useOfflineSync();

  /**
   * Load settings from IndexedDB on mount
   * Requirement 5.2, 10.1, 18.1
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Initialize database
        await dbRepository.init();

        // Load app settings: '' = logged out (onboarding), 'default' = skipped onboarding
        const loggedOut = await dbRepository.getSetting('');
        const defaultSettings = await dbRepository.getSetting('default');
        const settings = loggedOut ?? defaultSettings;

        if (settings) {
          setState((prev) => ({
            ...prev,
            farmerId: settings.farmerId,
            language: settings.language,
            voiceEnabled: settings.voiceInputEnabled && settings.voiceOutputEnabled,
            useAwsVoice: settings.useAwsVoice !== false,
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * Update online status from useOfflineSync hook
   */
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isOnline,
    }));
  }, [isOnline]);

  /**
   * Health check backend once when app becomes ready (after settings load)
   */
  useEffect(() => {
    if (!isLoading && isOnline) {
      apiClient
        .testConnection()
        .then((ok) => {
          setState((prev) => ({ ...prev, backendAvailable: ok }));
        })
        .catch(() => {
          setState((prev) => ({ ...prev, backendAvailable: false }));
        });
    }
  }, [isLoading, isOnline]);

  /**
   * Check if app is installed (PWA)
   */
  useEffect(() => {
    const checkInstallation = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setState((prev) => ({
        ...prev,
        isInstalled: isStandalone || isIOSStandalone,
      }));
    };

    checkInstallation();
  }, []);

  /**
   * Set farmer ID and persist to IndexedDB
   * Requirement 5.2, 18.3
   */
  const setFarmerId = useCallback(async (id: string) => {
    try {
      setState((prev) => ({
        ...prev,
        farmerId: id,
      }));

      // Save to IndexedDB
      const settings: Settings = {
        farmerId: id,
        language: state.language,
        voiceInputEnabled: state.voiceEnabled,
        voiceOutputEnabled: state.voiceEnabled,
        useAwsVoice: state.useAwsVoice,
        lastUpdated: Date.now(),
      };
      
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to save farmer ID:', error);
      throw error;
    }
  }, [state.language, state.voiceEnabled, state.useAwsVoice]);

  /**
   * Set language and persist to IndexedDB
   * Requirement 10.1, 18.3
   */
  const setLanguage = useCallback(async (lang: Language) => {
    try {
      setState((prev) => ({
        ...prev,
        language: lang,
      }));

      // Save to IndexedDB
      const settings: Settings = {
        farmerId: state.farmerId || 'default',
        language: lang,
        voiceInputEnabled: state.voiceEnabled,
        voiceOutputEnabled: state.voiceEnabled,
        useAwsVoice: state.useAwsVoice,
        lastUpdated: Date.now(),
      };
      
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to save language:', error);
      throw error;
    }
  }, [state.farmerId, state.voiceEnabled, state.useAwsVoice]);

  /**
   * Toggle voice enabled state and persist to IndexedDB
   * Requirement 18.3
   */
  const toggleVoice = useCallback(async () => {
    try {
      const newVoiceEnabled = !state.voiceEnabled;
      
      setState((prev) => ({
        ...prev,
        voiceEnabled: newVoiceEnabled,
      }));

      // Save to IndexedDB
      const settings: Settings = {
        farmerId: state.farmerId || 'default',
        language: state.language,
        voiceInputEnabled: newVoiceEnabled,
        voiceOutputEnabled: newVoiceEnabled,
        useAwsVoice: state.useAwsVoice,
        lastUpdated: Date.now(),
      };
      
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to toggle voice:', error);
      throw error;
    }
  }, [state.farmerId, state.language, state.voiceEnabled, state.useAwsVoice]);

  /**
   * Set "use AWS voice when online" and persist.
   */
  const setUseAwsVoice = useCallback(async (value: boolean) => {
    try {
      setState((prev) => ({ ...prev, useAwsVoice: value }));

      const settings: Settings = {
        farmerId: state.farmerId || 'default',
        language: state.language,
        voiceInputEnabled: state.voiceEnabled,
        voiceOutputEnabled: state.voiceEnabled,
        useAwsVoice: value,
        lastUpdated: Date.now(),
      };
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to save useAwsVoice:', error);
      throw error;
    }
  }, [state.farmerId, state.language, state.voiceEnabled]);

  /**
   * Retry backend health check (e.g. from banner).
   */
  const retryBackendCheck = useCallback(() => {
    setState((prev) => ({ ...prev, backendAvailable: null }));
    if (isOnline) {
      apiClient
        .testConnection()
        .then((ok) => setState((prev) => ({ ...prev, backendAvailable: ok })))
        .catch(() => setState((prev) => ({ ...prev, backendAvailable: false })));
    }
  }, [isOnline]);

  const value: AppContextValue = {
    state,
    setFarmerId,
    setLanguage,
    toggleVoice,
    setUseAwsVoice,
    retryBackendCheck,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Custom hook to use AppContext
 */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
