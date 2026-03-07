import React, { useState, useEffect } from 'react';
import {
  AmbientBg,
  SettingSection,
  SettingRow,
  LangToggle,
  ToggleSwitch,
  TeamBadge,
  AWSBadge,
  FrostedCard,
} from '@ds/components';
import { colors, spacing, typography, radii, shadows, animation } from '@ds/tokens';
import { getTranslation, formatNumber } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cacheManager } from '../services/CacheManager';
import { dbRepository } from '../services/DBRepository';
import LangSheet from './components/LangSheet';

/**
 * SettingsScreen - Settings management with design system components
 * 
 * Features:
 * - Farmer ID management with edit capability
 * - Language selection via LangToggle
 * - Voice input/output toggles
 * - Storage usage and app version display
 * - Destructive actions (Clear Cache, Clear All Data, Reset App)
 * - Confirmation modal with blurred backdrop
 * 
 * Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 29.10
 */
const SettingsScreen = ({ onNavigate }) => {
  const { state: appState, setFarmerId, toggleVoice, setLanguage: setAppLanguage, setUseAwsVoice } = useApp();
  const { language } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [farmerIdInput, setFarmerIdInput] = useState(appState.farmerId || '');
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(appState.voiceEnabled);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(appState.voiceEnabled);
  const [showLangSheet, setShowLangSheet] = useState(false);

  // Load cache size on mount
  useEffect(() => {
    const loadCacheSize = async () => {
      try {
        const sizeMB = await cacheManager.getCacheSizeMB();
        setCacheSize(`${formatNumber(sizeMB.toFixed(1), language)} MB`);
      } catch (error) {
        console.error('Failed to load cache size:', error);
        setCacheSize('0 MB');
      }
    };

    loadCacheSize();
  }, [language]);

  // Sync farmer ID input with context
  useEffect(() => {
    setFarmerIdInput(appState.farmerId || '');
  }, [appState.farmerId]);

  // Sync voice settings with context
  useEffect(() => {
    setVoiceInputEnabled(appState.voiceEnabled);
    setVoiceOutputEnabled(appState.voiceEnabled);
  }, [appState.voiceEnabled]);

  // Handle farmer ID change
  const handleFarmerIdChange = async (value) => {
    setFarmerIdInput(value);
    // Save on blur or after a delay
  };

  // Handle farmer ID save (on blur)
  const handleFarmerIdSave = async () => {
    if (farmerIdInput !== appState.farmerId) {
      try {
        await setFarmerId(farmerIdInput);
      } catch (error) {
        console.error('Failed to save farmer ID:', error);
      }
    }
  };

  // Handle voice input toggle
  const handleVoiceInputToggle = async (value) => {
    setVoiceInputEnabled(value);
    if (value !== appState.voiceEnabled) {
      await toggleVoice();
    }
  };

  // Handle voice output toggle
  const handleVoiceOutputToggle = async (value) => {
    setVoiceOutputEnabled(value);
    if (value !== appState.voiceEnabled) {
      await toggleVoice();
    }
  };

  // Handle clear cache
  const handleClearCache = async () => {
    try {
      await cacheManager.clearCache();
      // Reload cache size
      const sizeMB = await cacheManager.getCacheSizeMB();
      setCacheSize(`${formatNumber(sizeMB.toFixed(1), language)} MB`);
      setShowConfirmModal(false);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  // Handle clear all data
  const handleClearAllData = async () => {
    try {
      await dbRepository.clearAllData();
      setShowConfirmModal(false);
      // Reload the app
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear all data:', error);
    }
  };

  // Handle reset app
  const handleResetApp = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setShowConfirmModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset app:', error);
    }
  };

  // Confirm destructive action
  const confirmDestructiveAction = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  // Execute confirmed action
  const executeConfirmedAction = () => {
    if (confirmAction === 'clearCache') {
      handleClearCache();
    } else if (confirmAction === 'clearAllData') {
      handleClearAllData();
    } else if (confirmAction === 'resetApp') {
      handleResetApp();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      {/* Background gradient */}
      <AmbientBg />

      {/* Frosted header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '0 20px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label={language === 'hi' ? 'वापस जाएं' : 'Go back'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.text.primary}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2
            style={{
              fontFamily: typography.fonts.serif,
              fontSize: '20px',
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
            }}
          >
            {getTranslation('settings', language)}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowLangSheet(true)}
          style={{
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '100px',
            padding: '4px 9px',
            fontSize: '11px',
            fontWeight: '500',
            color: colors.text.primary,
            cursor: 'pointer',
            fontFamily: typography.fonts.sans,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          aria-haspopup="dialog"
          aria-expanded={showLangSheet}
        >
          {language === 'hi' ? 'हिन्दी' : 'English'}
          <span style={{ color: 'rgba(20,30,16,0.4)' }}>▾</span>
        </button>
      </div>

      {/* Main content - extra bottom padding so footer isn't cut off by fixed nav */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: spacing.screenPadding,
          paddingBottom: '160px',
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >

        {/* Account Section */}
        <SettingSection>
          <h2
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              color: colors.text.secondary,
              marginBottom: spacing['4'],
              textTransform: 'uppercase',
              letterSpacing: typography.tracking.wide,
            }}
          >
            {language === 'hi' ? 'खाता' : 'Account'}
          </h2>
          <SettingRow label={getTranslation('farmerId', language)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <input
                type="text"
                value={farmerIdInput}
                onChange={(e) => handleFarmerIdChange(e.target.value)}
                placeholder={language === 'hi' ? 'आईडी दर्ज करें' : 'Enter ID'}
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.base,
                  color: colors.text.primary,
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: radii.md,
                  outline: 'none',
                  padding: '10px 12px',
                  minHeight: '40px',
                }}
              />
              <button
                type="button"
                onClick={handleFarmerIdSave}
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.semibold,
                  color: 'white',
                  background: colors.green.default,
                  border: 'none',
                  borderRadius: radii.md,
                  padding: '10px 16px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {language === 'hi' ? 'सहेजें' : 'Save'}
              </button>
            </div>
          </SettingRow>

          {/* Log out - clears farmer ID and redirects to onboarding */}
          <button
            type="button"
            onClick={async () => {
              try {
                await setFarmerId('');
                // App will show onboarding when farmerId is empty (no need to navigate)
              } catch (err) {
                console.error('Failed to log out:', err);
              }
            }}
            style={{
              width: '100%',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
              color: colors.text.primary,
              background: 'transparent',
              border: `1px solid ${colors.border.default}`,
              borderRadius: radii.lg,
              padding: `${spacing['3']} ${spacing['4']}`,
              marginTop: spacing['2'],
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
            }}
          >
            {language === 'hi' ? 'लॉग आउट' : 'Log out'}
          </button>
        </SettingSection>

        {/* Preferences Section */}
        <SettingSection>
          <h2
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              color: colors.text.secondary,
              marginBottom: spacing['4'],
              textTransform: 'uppercase',
              letterSpacing: typography.tracking.wide,
            }}
          >
            {language === 'hi' ? 'प्राथमिकताएं' : 'Preferences'}
          </h2>
          
          <SettingRow label={getTranslation('language', language)}>
            <LangToggle
              lang={language}
              onPress={() => setShowLangSheet(true)}
            />
          </SettingRow>

          <SettingRow label={getTranslation('voiceInput', language)}>
            <ToggleSwitch
              value={voiceInputEnabled}
              onChange={handleVoiceInputToggle}
            />
          </SettingRow>

          <SettingRow label={getTranslation('voiceOutput', language)}>
            <ToggleSwitch
              value={voiceOutputEnabled}
              onChange={handleVoiceOutputToggle}
            />
          </SettingRow>

          <SettingRow label={language === 'hi' ? 'ऑनलाइन होने पर AWS आवाज़ इस्तेमाल करें' : 'Use AWS voice when online'}>
            <ToggleSwitch
              value={appState.useAwsVoice}
              onChange={(value) => setUseAwsVoice(value)}
            />
          </SettingRow>
        </SettingSection>

        {/* Storage Section */}
        <SettingSection>
          <h2
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              color: colors.text.secondary,
              marginBottom: spacing['4'],
              textTransform: 'uppercase',
              letterSpacing: typography.tracking.wide,
            }}
          >
            {language === 'hi' ? 'स्टोरेज' : 'Storage'}
          </h2>
          
          <SettingRow label={language === 'hi' ? 'उपयोग किया गया' : 'Storage Used'}>
            <span
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.base,
                color: colors.text.secondary,
              }}
            >
              {cacheSize}
            </span>
          </SettingRow>

          <SettingRow label={getTranslation('appVersion', language)}>
            <span
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.base,
                color: colors.text.secondary,
              }}
            >
              1.0.0
            </span>
          </SettingRow>
        </SettingSection>

        {/* Danger Zone Section */}
        <SettingSection danger>
          <h2
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              color: colors.status.error,
              marginBottom: spacing['4'],
              textTransform: 'uppercase',
              letterSpacing: typography.tracking.wide,
            }}
          >
            {language === 'hi' ? 'खतरा क्षेत्र' : 'Danger Zone'}
          </h2>

          <button
            onClick={() => confirmDestructiveAction('clearCache')}
            style={{
              width: '100%',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
              color: colors.status.error,
              background: 'transparent',
              border: `1px solid ${colors.status.error}`,
              borderRadius: radii.lg,
              padding: `${spacing['3']} ${spacing['4']}`,
              marginBottom: spacing['3'],
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            {getTranslation('clearCache', language)}
          </button>

          <button
            onClick={() => confirmDestructiveAction('clearAllData')}
            style={{
              width: '100%',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
              color: colors.status.error,
              background: 'transparent',
              border: `1px solid ${colors.status.error}`,
              borderRadius: radii.lg,
              padding: `${spacing['3']} ${spacing['4']}`,
              marginBottom: spacing['3'],
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            {getTranslation('clearAllData', language)}
          </button>

          <button
            onClick={() => confirmDestructiveAction('resetApp')}
            style={{
              width: '100%',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
              color: colors.status.error,
              background: 'transparent',
              border: `1px solid ${colors.status.error}`,
              borderRadius: radii.lg,
              padding: `${spacing['3']} ${spacing['4']}`,
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            {language === 'hi' ? 'ऐप रीसेट करें' : 'Reset App'}
          </button>
        </SettingSection>

        {/* Footer with badges - extra margin so it scrolls fully above bottom nav */}
        <div
          style={{
            marginTop: spacing['12'],
            marginBottom: spacing['4'],
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            paddingTop: spacing['4'],
            paddingBottom: spacing['4'],
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <TeamBadge />
          <div style={{ width: '1px', height: '14px', background: 'rgba(0,0,0,0.1)' }} />
          <AWSBadge />
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: colors.bg.overlay,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: spacing.screenPadding,
          }}
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '360px',
            }}
          >
            <FrostedCard>
              <div
                style={{
                  padding: spacing['6'],
                }}
              >
                <h3
                  style={{
                    fontFamily: typography.fonts.serif,
                    fontSize: typography.size.xl,
                    fontWeight: typography.weight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing['4'],
                  }}
                >
                  {language === 'hi' ? 'पुष्टि करें' : 'Confirm Action'}
                </h3>
                <p
                  style={{
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    color: colors.text.secondary,
                    marginBottom: spacing['6'],
                    lineHeight: typography.leading.relaxed,
                  }}
                >
                  {confirmAction === 'clearCache' &&
                    (language === 'hi'
                      ? 'क्या आप वाकई कैश साफ़ करना चाहते हैं? यह ऑफ़लाइन डेटा को हटा देगा।'
                      : 'Are you sure you want to clear the cache? This will remove offline data.')}
                  {confirmAction === 'clearAllData' &&
                    (language === 'hi'
                      ? 'क्या आप वाकई सभी डेटा साफ़ करना चाहते हैं? यह सभी संदेश और सेटिंग्स को हटा देगा।'
                      : 'Are you sure you want to clear all data? This will remove all messages and settings.')}
                  {confirmAction === 'resetApp' &&
                    (language === 'hi'
                      ? 'क्या आप वाकई ऐप रीसेट करना चाहते हैं? यह सभी डेटा और सेटिंग्स को हटा देगा।'
                      : 'Are you sure you want to reset the app? This will remove all data and settings.')}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: spacing['3'],
                  }}
                >
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    style={{
                      flex: 1,
                      fontFamily: typography.fonts.sans,
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.medium,
                      color: colors.text.primary,
                      background: colors.bg.surface,
                      border: `1px solid ${colors.border.default}`,
                      borderRadius: radii.lg,
                      padding: `${spacing['3']} ${spacing['4']}`,
                      cursor: 'pointer',
                      minHeight: '44px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getTranslation('cancel', language)}
                  </button>
                  <button
                    onClick={executeConfirmedAction}
                    style={{
                      flex: 1,
                      fontFamily: typography.fonts.sans,
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.medium,
                      color: 'white',
                      background: colors.status.error,
                      border: 'none',
                      borderRadius: radii.lg,
                      padding: `${spacing['3']} ${spacing['4']}`,
                      cursor: 'pointer',
                      minHeight: '44px',
                      transition: 'all 0.2s ease',
                      boxShadow: shadows.md,
                    }}
                  >
                    {language === 'hi' ? 'हाँ, जारी रखें' : 'Yes, Continue'}
                  </button>
                </div>
              </div>
            </FrostedCard>
          </div>
        </div>
      )}

      {/* Language Selection Sheet - matches design with grid, checkmark, तुरंत/थोड़ा धीमा */}
      <LangSheet
        isOpen={showLangSheet}
        currentLang={language}
        onSelect={async (code) => {
          if (code === 'hi' || code === 'en') setAppLanguage(code);
          setShowLangSheet(false);
        }}
        onClose={() => setShowLangSheet(false)}
        language={language}
      />

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default SettingsScreen;
