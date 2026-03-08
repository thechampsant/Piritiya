import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { dbRepository } from '../services/DBRepository';
import { cacheManager } from '../services/CacheManager';
import { validateFarmerId } from '../utils/validation';
import { formatNumber } from '../utils/i18n';
import type { Language } from '../types';

interface SettingsScreenProps {
  onClose?: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const { state: appState, setFarmerId, setLanguage, toggleVoice } = useApp();
  const { t } = useLanguage();

  // Local state for form inputs
  const [localFarmerId, setLocalFarmerId] = useState(appState.farmerId || '');
  const [farmerIdError, setFarmerIdError] = useState('');
  const [cacheSize, setCacheSize] = useState(0);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load cache size on mount
  useEffect(() => {
    loadCacheSize();
  }, []);

  const loadCacheSize = async () => {
    try {
      const sizeMB = await cacheManager.getCacheSizeMB();
      setCacheSize(sizeMB);
    } catch (error) {
      console.error('Failed to load cache size:', error);
    }
  };

  // Handle farmer ID change
  const handleFarmerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFarmerId(value);
    setFarmerIdError('');
  };

  // Handle farmer ID save
  const handleFarmerIdSave = () => {
    if (!localFarmerId.trim()) {
      setFarmerIdError(t('farmerIdInvalid'));
      return;
    }

    if (!validateFarmerId(localFarmerId)) {
      setFarmerIdError(t('farmerIdInvalid'));
      return;
    }

    setFarmerId(localFarmerId);
    showSuccess();
  };

  // Handle language change
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    showSuccess();
  };

  // Handle voice toggle (both input and output together)
  const handleVoiceToggle = () => {
    toggleVoice();
    showSuccess();
  };

  // Handle clear cache
  const handleClearCache = async () => {
    try {
      await cacheManager.clearCache();
      setCacheSize(0);
      setShowClearCacheConfirm(false);
      setSuccessMessage(t('cacheCleared'));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  // Handle clear all data
  const handleClearAllData = async () => {
    try {
      await dbRepository.clearAllData();
      setCacheSize(0);
      setShowClearDataConfirm(false);
      setSuccessMessage(t('dataCleared'));
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reload the page after clearing data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  };

  // Show success message
  const showSuccess = () => {
    setSuccessMessage(t('save'));
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Format cache size for display
  const formatCacheSize = () => {
    if (cacheSize < 0.01) return '0 KB';
    if (cacheSize < 1) return `${formatNumber(Math.round(cacheSize * 1024), appState.language)} KB`;
    return `${formatNumber(Math.round(cacheSize * 10) / 10, appState.language)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-soil-dark to-soil">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-soil-dark/95 backdrop-blur-sm border-b border-gold/25">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold text-cream">
            {t('settings')}
          </h1>
          {onClose && (
            <button
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream hover:text-gold transition-colors"
              aria-label={t('cancel')}
            >
              <span className="text-2xl">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div 
          className="mx-4 mt-4 p-3 bg-green-500/20 border border-green-500/40 rounded-lg"
          role="status"
          aria-live="polite"
        >
          <p className="text-green-400 text-sm text-center">
            {successMessage}
          </p>
        </div>
      )}

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Farmer ID Section */}
        <section className="bg-cream/5 border border-gold/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-cream mb-4">
            {t('farmerId')}
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              value={localFarmerId}
              onChange={handleFarmerIdChange}
              placeholder={t('farmerIdPlaceholder')}
              className="w-full px-4 py-3 bg-cream/10 border border-gold/25 rounded-lg text-cream placeholder-cream/40 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 text-base"
              aria-label={t('farmerId')}
              aria-invalid={!!farmerIdError}
              aria-describedby={farmerIdError ? 'farmer-id-error' : undefined}
            />
            {farmerIdError && (
              <p id="farmer-id-error" className="text-alert text-sm" role="alert">
                {farmerIdError}
              </p>
            )}
            <button
              onClick={handleFarmerIdSave}
              className="w-full min-h-[44px] px-4 py-3 bg-gradient-to-br from-terracotta-light to-terracotta hover:from-terracotta hover:to-clay rounded-lg text-cream font-semibold transition-all shadow-lg"
            >
              {t('save')}
            </button>
          </div>
        </section>

        {/* Language Section */}
        <section className="bg-cream/5 border border-gold/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-cream mb-4">
            {t('language')}
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-cream/5 border border-gold/15 rounded-lg cursor-pointer hover:bg-cream/10 transition-colors min-h-[44px]">
              <input
                type="radio"
                name="language"
                value="en"
                checked={appState.language === 'en'}
                onChange={() => handleLanguageChange('en')}
                className="w-5 h-5 text-terracotta focus:ring-2 focus:ring-gold/50"
              />
              <span className="text-cream text-base flex-1">
                {t('english')}
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 bg-cream/5 border border-gold/15 rounded-lg cursor-pointer hover:bg-cream/10 transition-colors min-h-[44px]">
              <input
                type="radio"
                name="language"
                value="hi"
                checked={appState.language === 'hi'}
                onChange={() => handleLanguageChange('hi')}
                className="w-5 h-5 text-terracotta focus:ring-2 focus:ring-gold/50"
              />
              <span className="text-cream text-base flex-1">
                {t('hindi')}
              </span>
            </label>
          </div>
        </section>

        {/* Voice Settings Section */}
        <section className="bg-cream/5 border border-gold/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-cream mb-4">
            {t('voiceSettings')}
          </h2>
          <div className="space-y-3">
            {/* Voice Input Toggle */}
            <div className="flex items-center justify-between p-3 bg-cream/5 border border-gold/15 rounded-lg min-h-[44px]">
              <span className="text-cream text-base">
                {t('voiceInput')}
              </span>
              <button
                onClick={handleVoiceToggle}
                role="switch"
                aria-checked={appState.voiceEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  appState.voiceEnabled ? 'bg-terracotta' : 'bg-cream/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-cream transition-transform ${
                    appState.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Voice Output Toggle */}
            <div className="flex items-center justify-between p-3 bg-cream/5 border border-gold/15 rounded-lg min-h-[44px]">
              <span className="text-cream text-base">
                {t('voiceOutput')}
              </span>
              <button
                onClick={handleVoiceToggle}
                role="switch"
                aria-checked={appState.voiceEnabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gold/50 ${
                  appState.voiceEnabled ? 'bg-terracotta' : 'bg-cream/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-cream transition-transform ${
                    appState.voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="bg-cream/5 border border-gold/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-cream mb-4">
            {t('dataManagement')}
          </h2>
          <div className="space-y-3">
            {/* Clear Cache */}
            {!showClearCacheConfirm ? (
              <button
                onClick={() => setShowClearCacheConfirm(true)}
                className="w-full min-h-[44px] px-4 py-3 bg-cream/10 border border-gold/25 hover:bg-cream/15 rounded-lg text-cream font-semibold transition-all"
              >
                {t('clearCache')}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-cream/70 text-sm">
                  {t('confirmClearCache')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearCache}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-alert/20 border border-alert/40 hover:bg-alert/30 rounded-lg text-alert font-semibold transition-all"
                  >
                    {t('clearCache')}
                  </button>
                  <button
                    onClick={() => setShowClearCacheConfirm(false)}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-cream/10 border border-gold/25 hover:bg-cream/15 rounded-lg text-cream font-semibold transition-all"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Clear All Data */}
            {!showClearDataConfirm ? (
              <button
                onClick={() => setShowClearDataConfirm(true)}
                className="w-full min-h-[44px] px-4 py-3 bg-alert/10 border border-alert/30 hover:bg-alert/20 rounded-lg text-alert font-semibold transition-all"
              >
                {t('clearAllData')}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-alert text-sm font-semibold">
                  {t('confirmClearAllData')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAllData}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-alert/30 border border-alert/50 hover:bg-alert/40 rounded-lg text-cream font-semibold transition-all"
                  >
                    {t('clearAllData')}
                  </button>
                  <button
                    onClick={() => setShowClearDataConfirm(false)}
                    className="flex-1 min-h-[44px] px-4 py-2 bg-cream/10 border border-gold/25 hover:bg-cream/15 rounded-lg text-cream font-semibold transition-all"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* App Information Section */}
        <section className="bg-cream/5 border border-gold/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-cream mb-4">
            {t('appInfo')}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-cream/70 text-sm">
                {t('appVersion')}
              </span>
              <span className="text-cream text-sm font-semibold">
                1.0.0
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-cream/70 text-sm">
                {t('cacheSize')}
              </span>
              <span className="text-cream text-sm font-semibold">
                {formatCacheSize()}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsScreen;
