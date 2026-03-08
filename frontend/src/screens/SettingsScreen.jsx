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
import { apiClient } from '../services/APIClient';
import { SUPPORT_WHATSAPP_URL } from '../utils/constants';

const CACHE_CLEARED_EVENT = 'piritiya-cache-cleared';
const SECTION_HEADER_STYLE = {
  fontFamily: typography.fonts.sans,
  fontSize: typography.size.sm,
  fontWeight: typography.weight.medium,
  color: colors.text.secondary,
  marginBottom: spacing['4'],
  textTransform: 'uppercase',
  letterSpacing: typography.tracking.wide,
};
const ROW_MIN_HEIGHT = 48;

/** Hectares to bigha (UP approx). */
function haToBigha(hectares) {
  if (hectares == null || Number.isNaN(Number(hectares))) return null;
  return Number(hectares) * 6.17;
}

/**
 * SettingsScreen - Farmer-friendly settings with Profile, Preferences, Offline Mode, Help & Support, About.
 */
const SettingsScreen = ({ onNavigate }) => {
  const { state: appState, setFarmerId, setLanguage: setAppLanguage, clearQueryHistory } = useApp();
  const { language } = useLanguage();
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [farmer, setFarmer] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [offlineSave, setOfflineSave] = useState(() => {
    try {
      return localStorage.getItem('piritiya_offline_save') !== 'false';
    } catch {
      return true;
    }
  });
  const [notifyCrop, setNotifyCrop] = useState(() => {
    try {
      return localStorage.getItem('piritiya_notify_crop') !== 'false';
    } catch {
      return true;
    }
  });
  const [notifyMandi, setNotifyMandi] = useState(() => {
    try {
      return localStorage.getItem('piritiya_notify_mandi') !== 'false';
    } catch {
      return true;
    }
  });
  const [notifyWeather, setNotifyWeather] = useState(() => {
    try {
      return localStorage.getItem('piritiya_notify_weather') !== 'false';
    } catch {
      return true;
    }
  });

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

  useEffect(() => {
    const id = (appState.farmerId || '').trim();
    if (!id) {
      setFarmer(null);
      return;
    }
    let cancelled = false;
    apiClient.getFarmer(id).then((data) => {
      if (!cancelled) setFarmer(data || null);
    }).catch(() => { if (!cancelled) setFarmer(null); });
    return () => { cancelled = true; };
  }, [appState.farmerId]);

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

  const toggleOffline = () => {
    const next = !offlineSave;
    setOfflineSave(next);
    try {
      localStorage.setItem('piritiya_offline_save', next ? 'true' : 'false');
    } catch (_) {}
  };
  const toggleNotifyCrop = () => {
    const next = !notifyCrop;
    setNotifyCrop(next);
    try {
      localStorage.setItem('piritiya_notify_crop', next ? 'true' : 'false');
    } catch (_) {}
  };
  const toggleNotifyMandi = () => {
    const next = !notifyMandi;
    setNotifyMandi(next);
    try {
      localStorage.setItem('piritiya_notify_mandi', next ? 'true' : 'false');
    } catch (_) {}
  };
  const toggleNotifyWeather = () => {
    const next = !notifyWeather;
    setNotifyWeather(next);
    try {
      localStorage.setItem('piritiya_notify_weather', next ? 'true' : 'false');
    } catch (_) {}
  };

  const landHa = farmer?.land_details?.total_area_hectares;
  const landBigha = landHa != null ? haToBigha(landHa) : null;
  const landDisplay = landHa != null
    ? (landBigha != null ? `${Number(landHa)} ha (≈${landBigha.toFixed(1)} bigha)` : `${Number(landHa)} ha`)
    : '—';

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
      <AmbientBg />

      {/* Header - Settings only, no language pill */}
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

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          paddingBottom: '82px',
        }}
      >
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
          {/* ─── Profile ───────────────────────────────────────────────── */}
          <div style={{ marginBottom: spacing['8'] }}>
            <h2 style={SECTION_HEADER_STYLE}>{getTranslation('profile', language)}</h2>
            <SettingSection>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['1'] }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>{getTranslation('nameLabel', language)}</span>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.base, color: colors.text.primary }}>{farmer?.farmer_name || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>{getTranslation('district', language)}</span>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.base, color: colors.text.primary }}>{farmer?.location?.district || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>{getTranslation('block', language)}</span>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.base, color: colors.text.primary }}>{farmer?.location?.block || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>{getTranslation('landSize', language)}</span>
                    <span style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.base, color: colors.text.primary }}>{landDisplay}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditProfile(true)}
                  style={{
                    width: '100%',
                    marginTop: spacing['2'],
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                    color: colors.text.primary,
                    background: 'rgba(0,0,0,0.04)',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: radii.lg,
                    padding: `${spacing['3']} ${spacing['4']}`,
                    cursor: 'pointer',
                    minHeight: ROW_MIN_HEIGHT,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {getTranslation('editProfile', language)}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await setFarmerId('');
                    } catch (err) {
                      console.error('Failed to log out:', err);
                    }
                  }}
                  style={{
                    width: '100%',
                    marginTop: spacing['1'],
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    fontWeight: typography.weight.medium,
                    color: colors.text.primary,
                    background: 'transparent',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: radii.lg,
                    padding: `${spacing['3']} ${spacing['4']}`,
                    cursor: 'pointer',
                    minHeight: ROW_MIN_HEIGHT,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {getTranslation('logOut', language)}
                </button>
              </div>
            </SettingSection>
          </div>

          {/* ─── Preferences ───────────────────────────────────────────── */}
          <div style={{ marginBottom: spacing['8'] }}>
            <h2 style={SECTION_HEADER_STYLE}>{getTranslation('preferences', language)}</h2>
            <SettingSection>
              <div style={{ padding: '16px 20px' }}>
                <SettingRow label={getTranslation('language', language)}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setAppLanguage('hi')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: radii.full,
                        border: language === 'hi' ? `2px solid ${colors.primary?.DEFAULT ?? '#16a34a'}` : '1px solid rgba(0,0,0,0.12)',
                        background: language === 'hi' ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                        minHeight: ROW_MIN_HEIGHT,
                        fontFamily: typography.fonts.sans,
                        fontSize: typography.size.sm,
                        color: colors.text.primary,
                      }}
                    >
                      <span aria-hidden>🇮🇳</span>
                      {getTranslation('hindi', language)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppLanguage('en')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        borderRadius: radii.full,
                        border: language === 'en' ? `2px solid ${colors.primary?.DEFAULT ?? '#16a34a'}` : '1px solid rgba(0,0,0,0.12)',
                        background: language === 'en' ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                        minHeight: ROW_MIN_HEIGHT,
                        fontFamily: typography.fonts.sans,
                        fontSize: typography.size.sm,
                        color: colors.text.primary,
                      }}
                    >
                      <span aria-hidden>🇺🇸</span>
                      {getTranslation('english', language)}
                    </button>
                  </div>
                </SettingRow>
                <div style={{ borderTop: `1px solid ${colors.border.light}` }} />
                <SettingRow label={getTranslation('dailyCropAlerts', language)}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyCrop}
                    onClick={toggleNotifyCrop}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: notifyCrop ? (colors.primary?.DEFAULT ?? '#16a34a') : 'rgba(0,0,0,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: notifyCrop ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </SettingRow>
                <SettingRow label={getTranslation('mandiPriceUpdates', language)}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyMandi}
                    onClick={toggleNotifyMandi}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: notifyMandi ? (colors.primary?.DEFAULT ?? '#16a34a') : 'rgba(0,0,0,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: notifyMandi ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </SettingRow>
                <SettingRow label={getTranslation('weatherWarnings', language)}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyWeather}
                    onClick={toggleNotifyWeather}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: notifyWeather ? (colors.primary?.DEFAULT ?? '#16a34a') : 'rgba(0,0,0,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: notifyWeather ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </SettingRow>
              </div>
            </SettingSection>
          </div>

          {/* ─── Offline Mode ───────────────────────────────────────────── */}
          <div style={{ marginBottom: spacing['8'] }}>
            <h2 style={SECTION_HEADER_STYLE}>{getTranslation('offline_mode', language)}</h2>
            <SettingSection>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: ROW_MIN_HEIGHT }}>
                  <div>
                    <div style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.base, color: colors.text.primary, fontWeight: 500 }}>
                      {getTranslation('saveForOffline', language)}
                    </div>
                    <div style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary, marginTop: 2 }}>
                      {getTranslation('worksWithoutInternet', language)}
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={offlineSave}
                    onClick={toggleOffline}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: offlineSave ? (colors.primary?.DEFAULT ?? '#16a34a') : 'rgba(0,0,0,0.2)',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        left: offlineSave ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: '#fff',
                        transition: 'left 0.2s ease',
                      }}
                    />
                  </button>
                </div>
                <p style={{ fontFamily: typography.fonts.sans, fontSize: '11px', color: colors.text.secondary, marginTop: spacing['2'], marginBottom: 0 }}>
                  {getTranslation('storageUsed', language)}: {cacheSize}
                </p>
                <button
                  type="button"
                  onClick={() => !isClearingCache && setShowClearCacheConfirm(true)}
                  disabled={isClearingCache}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginTop: spacing['2'],
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.sm,
                    color: colors.text.secondary,
                    textDecoration: 'underline',
                    cursor: isClearingCache ? 'wait' : 'pointer',
                  }}
                >
                  {isClearingCache ? (language === 'hi' ? 'साफ़ हो रहा है...' : 'Clearing...') : getTranslation('clearCachedData', language)}
                </button>
              </div>
            </SettingSection>
          </div>

          {/* ─── Help & Support ─────────────────────────────────────────── */}
          <div style={{ marginBottom: spacing['8'] }}>
            <h2 style={SECTION_HEADER_STYLE}>{getTranslation('helpAndSupport', language)}</h2>
            <SettingSection>
              <div style={{ padding: 0 }}>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('onboard')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    minHeight: ROW_MIN_HEIGHT,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    color: colors.text.primary,
                    textAlign: 'left',
                  }}
                >
                  {getTranslation('howToUsePiritiya', language)}
                  <span style={{ color: colors.text.secondary }}>›</span>
                </button>
                <div style={{ borderTop: `1px solid ${colors.border.light}` }} />
                <button
                  type="button"
                  onClick={() => window.open(SUPPORT_WHATSAPP_URL, '_blank')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    minHeight: ROW_MIN_HEIGHT,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    color: colors.text.primary,
                    textAlign: 'left',
                  }}
                >
                  {getTranslation('contactSupport', language)}
                  <span style={{ color: colors.text.secondary }}>›</span>
                </button>
                <div style={{ borderTop: `1px solid ${colors.border.light}` }} />
                <button
                  type="button"
                  onClick={() => { setFeedbackSent(false); setFeedbackText(''); setShowFeedback(true); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 20px',
                    minHeight: ROW_MIN_HEIGHT,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.base,
                    color: colors.text.primary,
                    textAlign: 'left',
                  }}
                >
                  {getTranslation('sendFeedback', language)}
                  <span style={{ color: colors.text.secondary }}>›</span>
                </button>
              </div>
            </SettingSection>
          </div>

          {/* ─── About ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: spacing['8'] }}>
            <h2 style={SECTION_HEADER_STYLE}>{getTranslation('about', language)}</h2>
            <SettingSection>
              <div style={{ padding: '20px' }}>
                <p style={{ fontFamily: typography.fonts.sans, fontSize: '12px', color: colors.text.secondary, margin: 0 }}>
                  App Version 1.0.0
                </p>
                <p style={{ fontFamily: typography.fonts.sans, fontSize: '11px', color: colors.text.secondary, marginTop: spacing['3'], marginBottom: 0 }}>
                  {getTranslation('farmerId', language)}: {appState.farmerId || '—'}
                </p>
              </div>
            </SettingSection>
          </div>
        </div>

        {/* Footer */}
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

      {/* Clear Cache confirmation */}
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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

      {/* Edit Profile modal */}
      {showEditProfile && (
        <EditProfileModal
          language={language}
          farmer={farmer}
          farmerId={appState.farmerId}
          onClose={() => setShowEditProfile(false)}
          onSaved={() => {
            setShowEditProfile(false);
            const id = (appState.farmerId || '').trim();
            if (id) apiClient.getFarmer(id).then(setFarmer);
          }}
        />
      )}

      {/* Feedback modal */}
      {showFeedback && (
        <div
          role="dialog"
          aria-modal="true"
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
          onClick={() => setShowFeedback(false)}
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
            {feedbackSent ? (
              <>
                <p style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.base, color: colors.text.primary, margin: 0 }}>
                  {getTranslation('feedbackThankYou', language)}
                </p>
                <button
                  type="button"
                  onClick={() => setShowFeedback(false)}
                  style={{
                    marginTop: spacing['4'],
                    padding: '8px 16px',
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.sm,
                    color: '#fff',
                    background: colors.primary?.DEFAULT ?? '#16a34a',
                    border: 'none',
                    borderRadius: radii.md,
                    cursor: 'pointer',
                  }}
                >
                  {getTranslation('save', language)}
                </button>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: typography.fonts.serif, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '0 0 12px 0' }}>
                  {getTranslation('sendFeedback', language)}
                </h3>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={getTranslation('feedbackPlaceholder', language)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 12,
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.sm,
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: radii.md,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button
                    type="button"
                    onClick={() => setShowFeedback(false)}
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
                    {getTranslation('cancel', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedbackSent(true);
                      // Optional: POST to backend /feedback if available
                    }}
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
                    {getTranslation('save', language)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        `}
      </style>
    </div>
  );
};

/**
 * Edit Profile modal: name, district, block, land (hectares). Submits via apiClient.updateFarmer.
 */
function EditProfileModal({ language, farmer, farmerId, onClose, onSaved }) {
  const [name, setName] = useState(farmer?.farmer_name ?? '');
  const [district, setDistrict] = useState(farmer?.location?.district ?? '');
  const [block, setBlock] = useState(farmer?.location?.block ?? '');
  const [landHa, setLandHa] = useState(farmer?.land_details?.total_area_hectares != null ? String(farmer.land_details.total_area_hectares) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setName(farmer?.farmer_name ?? '');
    setDistrict(farmer?.location?.district ?? '');
    setBlock(farmer?.location?.block ?? '');
    setLandHa(farmer?.land_details?.total_area_hectares != null ? String(farmer.land_details.total_area_hectares) : '');
  }, [farmer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {};
      if (name.trim() !== '') payload.farmer_name = name.trim();
      if (district.trim() !== '' || block.trim() !== '') {
        payload.location = { district: district.trim() || undefined, block: block.trim() || undefined };
      }
      const ha = landHa.trim() ? parseFloat(landHa) : undefined;
      if (ha != null && !Number.isNaN(ha)) {
        payload.land_details = { total_area_hectares: ha };
      }
      if (Object.keys(payload).length > 0 && farmerId) {
        await apiClient.updateFarmer(farmerId, payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
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
      onClick={onClose}
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
        <h3 id="edit-profile-title" style={{ fontFamily: typography.fonts.serif, fontSize: typography.size.lg, fontWeight: typography.weight.semibold, color: colors.text.primary, margin: '0 0 16px 0' }}>
          {getTranslation('editProfile', language)}
        </h3>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: 8, fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>
            {getTranslation('nameLabel', language)}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, fontFamily: typography.fonts.sans, fontSize: typography.size.base, border: `1px solid ${colors.border.default}`, borderRadius: radii.md, boxSizing: 'border-box' }}
          />
          <label style={{ display: 'block', marginBottom: 8, fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>
            {getTranslation('district', language)}
          </label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, fontFamily: typography.fonts.sans, fontSize: typography.size.base, border: `1px solid ${colors.border.default}`, borderRadius: radii.md, boxSizing: 'border-box' }}
          />
          <label style={{ display: 'block', marginBottom: 8, fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>
            {getTranslation('block', language)}
          </label>
          <input
            type="text"
            value={block}
            onChange={(e) => setBlock(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 12, fontFamily: typography.fonts.sans, fontSize: typography.size.base, border: `1px solid ${colors.border.default}`, borderRadius: radii.md, boxSizing: 'border-box' }}
          />
          <label style={{ display: 'block', marginBottom: 8, fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary }}>
            {getTranslation('landSize', language)} (ha)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={landHa}
            onChange={(e) => setLandHa(e.target.value)}
            style={{ width: '100%', padding: 10, marginBottom: 16, fontFamily: typography.fonts.sans, fontSize: typography.size.base, border: `1px solid ${colors.border.default}`, borderRadius: radii.md, boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: '#b91c1c', fontSize: typography.size.sm, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, color: colors.text.secondary, background: 'transparent', border: 'none', padding: '8px 16px', cursor: 'pointer' }}>
              {getTranslation('cancel', language)}
            </button>
            <button type="submit" disabled={saving} style={{ fontFamily: typography.fonts.sans, fontSize: typography.size.sm, fontWeight: typography.weight.medium, color: '#fff', background: colors.primary?.DEFAULT ?? '#16a34a', border: 'none', borderRadius: radii.md, padding: '8px 16px', cursor: saving ? 'wait' : 'pointer' }}>
              {saving ? (language === 'hi' ? 'सहेज रहा है...' : 'Saving...') : getTranslation('save', language)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsScreen;
