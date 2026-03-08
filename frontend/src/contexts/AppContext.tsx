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
 * - Farmer ID: set at onboarding (Start); used for all API calls until the user logs out. On logout it is cleared; on next login the user selects same or different farmer from the dropdown.
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

const QUERY_HISTORY_KEY_PREFIX = 'piritiya_query_history_';
const QUERY_HISTORY_MAX = 20;

/** Storage key for a farmer's query history so each farmer has their own past conversations. */
function getQueryHistoryKey(farmerId: string | undefined): string {
  const id = (farmerId != null && typeof farmerId === 'string') ? farmerId.trim() : '';
  return `${QUERY_HISTORY_KEY_PREFIX}${id || 'default'}`;
}

export interface QueryHistoryItem {
  text: string;
  timestamp: number;
  sessionId?: string;
  /** First few words of AI response for card subtitle; when missing, timestamp is shown. */
  responsePreview?: string;
}

interface AppContextValue {
  state: AppState;
  setFarmerId: (id: string) => Promise<void>;
  setLanguage: (lang: Language) => Promise<void>;
  toggleVoice: () => Promise<void>;
  setUseAwsVoice: (value: boolean) => Promise<void>;
  retryBackendCheck: () => void;
  addQueryToHistory: (text: string, sessionId?: string) => void;
  updateLastQueryPreview: (sessionId: string, responseText: string) => void;
  getQueryHistory: () => QueryHistoryItem[];
  clearQueryHistory: () => void;
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

  const CURRENT_FARMER_KEY = 'piritiya_current_farmer_id';

  /**
   * Load settings from IndexedDB on mount; current farmer ID from localStorage so it persists across refresh.
   * Requirement 5.2, 10.1, 18.1
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await dbRepository.init();

        // Prefer current farmer from localStorage (set when user selects from onboarding dropdown)
        const storedFarmerId = typeof localStorage !== 'undefined' ? localStorage.getItem(CURRENT_FARMER_KEY) : null;
        const farmerIdToLoad = (storedFarmerId && storedFarmerId.trim() !== '') ? storedFarmerId.trim() : null;

        if (farmerIdToLoad) {
          const settings = await dbRepository.getSetting(farmerIdToLoad);
          if (settings) {
            setState((prev) => ({
              ...prev,
              farmerId: settings.farmerId,
              language: settings.language,
              voiceEnabled: settings.voiceInputEnabled && settings.voiceOutputEnabled,
              useAwsVoice: settings.useAwsVoice !== false,
            }));
          } else {
            setState((prev) => ({ ...prev, farmerId: farmerIdToLoad }));
          }
        } else {
          const loggedOut = await dbRepository.getSetting('');
          const defaultSettings = await dbRepository.getSetting('default');
          const settings = loggedOut ?? defaultSettings;
          if (settings) {
            setState((prev) => ({
              ...prev,
              farmerId: settings.farmerId ?? '',
              language: settings.language,
              voiceEnabled: settings.voiceInputEnabled && settings.voiceOutputEnabled,
              useAwsVoice: settings.useAwsVoice !== false,
            }));
          }
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
   * Pre-fetch soil, crop, market, govt data on app open when farmer is set and online (silent background).
   */
  useEffect(() => {
    if (state.farmerId && state.isOnline) {
      apiClient.prefetchAll(state.farmerId).catch(() => {});
    }
  }, [state.farmerId, state.isOnline]);

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
   * Set farmer ID and persist to IndexedDB and localStorage so it loads correctly after refresh.
   * Requirement 5.2, 18.3
   */
  const setFarmerId = useCallback(async (id: string) => {
    try {
      setState((prev) => ({
        ...prev,
        farmerId: id,
      }));

      if (typeof localStorage !== 'undefined') {
        if (id && id.trim() !== '') {
          localStorage.setItem(CURRENT_FARMER_KEY, id.trim());
        } else {
          localStorage.removeItem(CURRENT_FARMER_KEY);
        }
      }

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

  const getQueryHistory = useCallback((): QueryHistoryItem[] => {
    try {
      if (typeof localStorage === 'undefined') return [];
      const key = getQueryHistoryKey(state?.farmerId);
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: unknown) => {
        if (item && typeof item === 'object' && item !== null && 'text' in item && typeof (item as QueryHistoryItem).text === 'string') {
          const obj = item as QueryHistoryItem;
          return {
            text: obj.text,
            timestamp: typeof obj.timestamp === 'number' ? obj.timestamp : Date.now(),
            sessionId: typeof (obj as QueryHistoryItem).sessionId === 'string' ? (obj as QueryHistoryItem).sessionId : undefined,
            responsePreview: typeof (obj as QueryHistoryItem).responsePreview === 'string' ? (obj as QueryHistoryItem).responsePreview : undefined,
          };
        }
        return { text: String(item), timestamp: Date.now() };
      });
    } catch {
      return [];
    }
  }, [state?.farmerId]);

  const addQueryToHistory = useCallback((text: string, sessionId?: string) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    try {
      if (typeof localStorage === 'undefined') return;
      const key = getQueryHistoryKey(state?.farmerId);
      const prev = getQueryHistory();
      const entry: QueryHistoryItem = { text: trimmed, timestamp: Date.now(), sessionId };
      const next = [entry, ...prev.filter((item) => item.text !== trimmed)].slice(0, QUERY_HISTORY_MAX);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [state.farmerId, getQueryHistory]);

  const clearQueryHistory = useCallback(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(getQueryHistoryKey(state?.farmerId));
      }
    } catch {
      // ignore
    }
  }, [state?.farmerId]);

  /** Set response preview (first 5–6 words) on the most recent history item for this session. */
  const updateLastQueryPreview = useCallback((sessionId: string, responseText: string) => {
    try {
      if (typeof localStorage === 'undefined' || !responseText?.trim()) return;
      const key = getQueryHistoryKey(state?.farmerId);
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const words = responseText.trim().split(/\s+/).filter(Boolean);
      const preview = words.slice(0, 6).join(' ') + (words.length > 6 ? '…' : '');
      const idx = parsed.findIndex((item: QueryHistoryItem) => item.sessionId === sessionId && !item.responsePreview);
      if (idx === -1) return;
      const updated = [...parsed];
      updated[idx] = { ...updated[idx], responsePreview: preview };
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }, [state?.farmerId]);

  const value: AppContextValue = {
    state,
    setFarmerId,
    setLanguage,
    toggleVoice,
    setUseAwsVoice,
    retryBackendCheck,
    addQueryToHistory,
    updateLastQueryPreview,
    getQueryHistory,
    clearQueryHistory,
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
