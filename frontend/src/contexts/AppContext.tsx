import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { dbRepository } from '../services/DBRepository';
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
  isInstalled: boolean;
}

interface AppContextValue {
  state: AppState;
  setFarmerId: (id: string) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  toggleVoice: () => Promise<void>;
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
    isInstalled: false,
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

        // For now, we'll check if there's a default settings entry
        // We'll use a special farmerId 'default' for app-level settings
        let settings = await dbRepository.getSetting('default');
        
        if (settings) {
          setState((prev) => ({
            ...prev,
            farmerId: settings.farmerId,
            language: settings.language,
            voiceEnabled: settings.voiceInputEnabled && settings.voiceOutputEnabled,
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
        lastUpdated: Date.now(),
      };
      
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to save farmer ID:', error);
      throw error;
    }
  }, [state.language, state.voiceEnabled]);

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
        lastUpdated: Date.now(),
      };
      
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to save language:', error);
      throw error;
    }
  }, [state.farmerId, state.voiceEnabled]);

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
        lastUpdated: Date.now(),
      };
      
      await dbRepository.saveSetting(settings);
    } catch (error) {
      console.error('Failed to toggle voice:', error);
      throw error;
    }
  }, [state.farmerId, state.language, state.voiceEnabled]);

  const value: AppContextValue = {
    state,
    setFarmerId,
    setLanguage,
    toggleVoice,
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
