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
import { Check } from '@ds/icons';
import { getTranslation, formatNumber } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cacheManager } from '../services/CacheManager';
import { dbRepository } from '../services/DBRepository';

// Language configuration
const LANGUAGES = [
  { code: 'hi', script: 'हिंदी', roman: 'Hindi', instant: true },
  { code: 'en', script: 'English', roman: 'English', instant: true },
  { code: 'bn', script: 'বাংলা', roman: 'Bengali', instant: false },
  { code: 'gu', script: 'ગુજરાતી', roman: 'Gujarati', instant: false },
  { code: 'kn', script: 'ಕನ್ನಡ', roman: 'Kannada', instant: false },
  { code: 'ml', script: 'മലയാളം', roman: 'Malayalam', instant: false },
  { code: 'ta', script: 'தமிழ்', roman: 'Tamil', instant: false },
  { code: 'te', script: 'తెలుగు', roman: 'Telugu', instant: false },
];

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
  const { state: appState, setFarmerId, toggleVoice, setLanguage: setAppLanguage } = useApp();
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

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: spacing.screenPadding,
          paddingBottom: '100px', // Space for bottom navigation and footer
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >
        {/* Header */}
        <h1
          style={{
            fontFamily: typography.fonts.serif,
            fontSize: typography.size['3xl'],
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
            marginBottom: spacing['8'],
          }}
        >
          {getTranslation('settings', language)}
        </h1>

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
            <input
              type="text"
              value={farmerIdInput}
              onChange={(e) => handleFarmerIdChange(e.target.value)}
              onBlur={handleFarmerIdSave}
              placeholder={language === 'hi' ? 'आईडी दर्ज करें' : 'Enter ID'}
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.base,
                color: colors.text.primary,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                textAlign: 'right',
                minHeight: '44px',
                padding: spacing['2'],
              }}
            />
          </SettingRow>
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

        {/* Footer with badges */}
        <div
          style={{
            marginTop: spacing['12'],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing['4'],
          }}
        >
          <TeamBadge />
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

      {/* Language Selection Sheet */}
      {showLangSheet && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: colors.bg.overlay,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setShowLangSheet(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '390px',
              animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <FrostedCard>
              <div
                style={{
                  padding: spacing['6'],
                  maxHeight: '70vh',
                  overflowY: 'auto',
                }}
              >
                <h3
                  style={{
                    fontFamily: typography.fonts.serif,
                    fontSize: typography.size.xl,
                    fontWeight: typography.weight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing['6'],
                  }}
                >
                  {language === 'hi' ? 'भाषा चुनें' : 'Select Language'}
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: spacing['3'],
                  }}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        await setAppLanguage(lang.code);
                        setShowLangSheet(false);
                        // Show warning toast for batch languages
                        if (!lang.instant) {
                          // TODO: Show toast notification
                          console.log('Batch language selected - slower processing');
                        }
                      }}
                      style={{
                        fontFamily: typography.fonts.sans,
                        background: colors.bg.surface,
                        border: `2px solid ${
                          language === lang.code ? colors.green.default : colors.border.light
                        }`,
                        borderRadius: radii.lg,
                        padding: spacing['4'],
                        cursor: 'pointer',
                        minHeight: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (language !== lang.code) {
                          e.target.style.borderColor = colors.border.default;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== lang.code) {
                          e.target.style.borderColor = colors.border.light;
                        }
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: typography.size.lg,
                            fontWeight: typography.weight.semibold,
                            color: colors.text.primary,
                            marginBottom: spacing['1'],
                          }}
                        >
                          {lang.script}
                        </div>
                        <div
                          style={{
                            fontSize: typography.size.sm,
                            color: colors.text.secondary,
                          }}
                        >
                          {lang.roman}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing['2'],
                        }}
                      >
                        <span
                          style={{
                            fontSize: typography.size.xs,
                            fontWeight: typography.weight.medium,
                            color: lang.instant ? colors.green.default : colors.text.tertiary,
                            background: lang.instant
                              ? colors.green.subtle
                              : colors.bg.card,
                            padding: `${spacing['1']} ${spacing['2']}`,
                            borderRadius: radii.full,
                          }}
                        >
                          {lang.instant
                            ? language === 'hi'
                              ? 'तुरंत'
                              : 'Instant'
                            : language === 'hi'
                            ? 'धीमा'
                            : 'Slower'}
                        </span>
                        {language === lang.code && (
                          <Check size={16} color={colors.green.default} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </FrostedCard>
          </div>
        </div>
      )}

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
