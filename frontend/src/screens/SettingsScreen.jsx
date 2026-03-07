import React, { useState, useEffect } from 'react';
import {
  AmbientBg,
  SettingSection,
  SettingRow,
  TeamBadge,
  AWSBadge,
} from '@ds/components';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';
import { getTranslation, formatNumber } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cacheManager } from '../services/CacheManager';
import LangSheet from './components/LangSheet';

/**
 * SettingsScreen - Settings management with design system components
 * - Farmer ID management with edit capability, Log out
 * - Language selection via header button (LangSheet)
 * - Storage usage and app version display
 */
const SettingsScreen = ({ onNavigate }) => {
  const { state: appState, setFarmerId, setLanguage: setAppLanguage } = useApp();
  const { language } = useLanguage();
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [showLangSheet, setShowLangSheet] = useState(false);

  const loadCacheSize = async () => {
    try {
      const sizeMB = await cacheManager.getCacheSizeMB();
      setCacheSize(`${formatNumber(sizeMB.toFixed(1), language)} MB`);
    } catch (error) {
      console.error('Failed to load cache size:', error);
      setCacheSize('0 MB');
    }
  };

  useEffect(() => {
    loadCacheSize();
  }, [language]);

  const handleClearCache = async () => {
    try {
      await cacheManager.clearCache();
      await loadCacheSize();
    } catch (error) {
      console.error('Failed to clear cache:', error);
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

      {/* Main content: flex so footer stays at bottom, with padding so footer is above bottom nav */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          paddingBottom: '82px', /* match BottomNavigation height so footer is visible above nav */
        }}
      >
        {/* Scrollable content: generous padding so sections are clearly inset */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            paddingTop: spacing.screenPadding,
            paddingBottom: spacing['6'],
            paddingLeft: '28px',
            paddingRight: '28px',
            minWidth: 0,
            animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
          }}
        >
          {/* Account Section */}
          <SettingSection>
            <div style={{ padding: '24px 20px' }}>
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
                <span
                  style={{
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    color: colors.text.primary,
                  }}
                >
                  {appState.farmerId || '—'}
                </span>
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
            </div>
        </SettingSection>

        {/* Storage Section */}
        <div style={{ marginTop: spacing['8'] }}>
        <SettingSection>
          <div style={{ padding: '24px 20px' }}>
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

          <button
            type="button"
            onClick={handleClearCache}
            style={{
              width: '100%',
              marginTop: spacing['4'],
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
              color: colors.text.primary,
              background: 'rgba(0,0,0,0.04)',
              border: `1px solid ${colors.border.default}`,
              borderRadius: radii.lg,
              padding: `${spacing['3']} ${spacing['4']}`,
              cursor: 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
            }}
          >
            {getTranslation('clearCache', language)}
          </button>
          </div>
        </SettingSection>
        </div>
        </div>

        {/* Footer at bottom: ProgrammingInsect | POWERED BY aws */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: `${spacing['4']} ${spacing.screenPadding} 24px`,
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            background: 'rgba(255,255,255,0.7)',
          }}
        >
          <TeamBadge />
          <div style={{ width: '1px', height: '14px', background: 'rgba(0,0,0,0.1)' }} />
          <AWSBadge />
        </div>
      </div>

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
