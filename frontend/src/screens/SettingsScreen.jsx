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
import { dbRepository } from '../services/DBRepository';
import LangSheet from './components/LangSheet';

const CACHE_CLEARED_EVENT = 'piritiya-cache-cleared';

/**
 * SettingsScreen - Settings management with design system components
 * - Farmer ID management with edit capability, Log out
 * - Language selection via header button (LangSheet)
 * - Storage usage and app version display
 */
const SettingsScreen = ({ onNavigate }) => {
  const { state: appState, setFarmerId, setLanguage: setAppLanguage, clearQueryHistory } = useApp();
  const { language } = useLanguage();
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

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

  const handleClearCacheConfirm = () => {
    setShowClearCacheConfirm(false);
    setCacheSize(`${formatNumber(0, language)} MB`);
    setIsClearingCache(true);

    (async () => {
      try {
        await cacheManager.clearCache();
        await dbRepository.clearChatData();
        if (typeof clearQueryHistory === 'function') clearQueryHistory();
        if (typeof caches !== 'undefined') {
          try {
            const names = await caches.keys();
            await Promise.all(names.map((name) => caches.delete(name)));
          } catch (_) {}
        }
        window.dispatchEvent(new CustomEvent(CACHE_CLEARED_EVENT));
        await loadCacheSize();
      } catch (error) {
        console.error('Failed to clear cache:', error);
        await loadCacheSize();
      } finally {
        setIsClearingCache(false);
      }
    })();
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

      {/* Frosted header - same padding/height as other screens */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          padding: '14px 20px',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isClearingCache) setShowClearCacheConfirm(true);
            }}
            disabled={isClearingCache}
            style={{
              width: '100%',
              marginTop: spacing['4'],
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
              color: colors.text.primary,
              background: isClearingCache ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.04)',
              border: `1px solid ${colors.border.default}`,
              borderRadius: radii.lg,
              padding: `${spacing['3']} ${spacing['4']}`,
              cursor: isClearingCache ? 'wait' : 'pointer',
              minHeight: '44px',
              transition: 'all 0.2s ease',
              opacity: isClearingCache ? 0.8 : 1,
            }}
          >
            {isClearingCache
              ? (language === 'hi' ? 'साफ़ हो रहा है...' : 'Clearing...')
              : getTranslation('clearCache', language)}
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

      {/* Clear Cache confirmation dialog */}
      {showClearCacheConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-cache-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing['5'],
            background: 'rgba(0,0,0,0.4)',
          }}
          onClick={() => setShowClearCacheConfirm(false)}
        >
          <div
            style={{
              background: colors.surface?.primary ?? '#fff',
              borderRadius: radii.xl,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              maxWidth: '360px',
              width: '100%',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="clear-cache-dialog-title"
              style={{
                fontFamily: typography.fonts.serif,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
                color: colors.text.primary,
                margin: '0 0 12px 0',
              }}
            >
              {getTranslation('clearCacheConfirmTitle', language)}
            </h3>
            <p
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.sm,
                color: colors.text.secondary,
                lineHeight: 1.5,
                margin: '0 0 20px 0',
              }}
            >
              {getTranslation('clearCacheConfirmMessage', language)}
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setShowClearCacheConfirm(false)}
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.sm,
                  color: colors.text.secondary,
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 16px',
                  cursor: 'pointer',
                }}
              >
                {getTranslation('clearPastConversationsCancel', language)}
              </button>
              <button
                type="button"
                onClick={handleClearCacheConfirm}
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.medium,
                  color: '#fff',
                  background: colors.primary?.DEFAULT ?? '#16a34a',
                  border: 'none',
                  borderRadius: radii.md,
                  padding: '8px 16px',
                  cursor: 'pointer',
                }}
              >
                {getTranslation('clearCacheConfirmButton', language)}
              </button>
            </div>
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
