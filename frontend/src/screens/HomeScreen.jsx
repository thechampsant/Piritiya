import React, { useState, useEffect } from 'react';
import { VoiceOrb, PillChip, AmbientBg } from '@ds/components';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';
import { PiritiyaMark } from '@ds/icons';
import { getTranslation } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useChatContext } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { apiClient } from '../services/APIClient';
import { VOICE_LANGUAGE_CONFIG } from '../utils/constants';
import SoilMoistureDisplay from '../components/SoilMoistureDisplay';
import CropRecommendationList from '../components/CropRecommendationList';
import MarketPriceTable from '../components/MarketPriceTable';
import LangSheet from './components/LangSheet';

/**
 * HomeScreen - Voice-first home interface
 * Primary interaction point with VoiceOrb and quick actions
 *
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6
 */
const HomeScreen = ({ onNavigate }) => {
  const { state: appState, setLanguage } = useApp();
  const { sendMessage } = useChatContext();
  const { language } = useLanguage();
  const { isListening, transcript, error: voiceError, startListening, stopListening, isSupported } = useVoiceInput(language, {
    useBackend: appState.isOnline && appState.useAwsVoice && (VOICE_LANGUAGE_CONFIG[language]?.transcribeRT ?? false),
  });

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [advisoryPanel, setAdvisoryPanel] = useState(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState(null);

  const prompts = language === 'hi'
    ? [
        'आज खरीफ फसल के लिए सही मिट्टी की नमी क्या होनी चाहिए?',
        'इस मौसम में कौन सी फसल बोएं?',
        'आज बाजार के भाव क्या हैं?',
        'भूजल स्तर कम होने पर क्या करें?',
      ]
    : [
        'What should soil moisture be for Kharif crops today?',
        'Which crop is best to plant this season?',
        'what are the market prices today?',
        'What to do when groundwater levels are low?',
      ];
  const diveBackLabel = language === 'hi' ? 'वापस आइए।' : 'dive back in.';

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [prompts.length]);

  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      handleQuerySubmit(transcript);
    }
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps -- handleQuerySubmit is stable

  const handleVoiceOrbClick = () => {
    if (!appState.voiceEnabled || !isSupported) return;
    if (isListening) stopListening();
    else startListening();
  };

  const handleQuerySubmit = async (query) => {
    try {
      await sendMessage(query);
      if (onNavigate) onNavigate('chat');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleQuickAction = async (action) => {
    const canFetch =
      appState.isOnline &&
      (action.id === 'soil' || action.id === 'crop' || action.id === 'crops' || action.id === 'market');
    let showPanel = false;
    if (canFetch) {
      setAdvisoryLoading(true);
      setAdvisoryError(null);
      try {
        if (action.id === 'soil') {
          const data = await apiClient.getSoilMoisture();
          setAdvisoryPanel({
            type: 'soil',
            data: {
              moistureLevel: data.moisture_index ?? 0,
              timestamp: data.measurement_date ? new Date(data.measurement_date).getTime() : Date.now(),
            },
          });
          showPanel = true;
        } else if (action.id === 'crops' || action.id === 'crop') {
          const data = await apiClient.getCropAdvice();
          setAdvisoryPanel({
            type: 'crop',
            data: { recommendations: data.recommended_crops || [] },
          });
          showPanel = true;
        } else if (action.id === 'market') {
          const data = await apiClient.getMarketPrices();
          setAdvisoryPanel({
            type: 'market',
            data: { prices: data.prices || [] },
          });
          showPanel = true;
        }
      } catch (err) {
        setAdvisoryError(err?.message || 'Request failed');
        showPanel = true;
      } finally {
        setAdvisoryLoading(false);
      }
    }
    try {
      await sendMessage(action.query);
      if (!showPanel && onNavigate) onNavigate('chat');
    } catch (error) {
      console.error('Failed to send message:', error);
      if (onNavigate) onNavigate('chat');
    }
  };

  const quickActions = [
    {
      id: 'soil',
      label: language === 'hi' ? 'मिट्टी की नमी' : 'soil moisture',
      query: language === 'hi' ? 'मिट्टी की नमी की जाँच करें' : 'Check soil moisture',
    },
    {
      id: 'crops',
      label: language === 'hi' ? 'फसल सलाह' : 'crop advice',
      query: language === 'hi' ? 'फसल की सलाह दें' : 'Get crop advice',
    },
    {
      id: 'market',
      label: language === 'hi' ? 'बाज़ार भाव' : 'market prices',
      query: language === 'hi' ? 'बाजार के भाव दिखाएं' : 'Show market prices',
    },
    {
      id: 'weather',
      label: language === 'hi' ? 'मौसम' : 'weather',
      query: language === 'hi' ? 'मौसम की जानकारी' : 'Weather information',
    },
  ];

  const currentPromptText = prompts[currentPromptIndex];

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#F8F9F7',
      }}
    >
      <AmbientBg />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          paddingBottom: '82px',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing['4']} 20px ${spacing['3']}`,
            flexShrink: 0,
            position: 'relative',
            zIndex: 5,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['2'] }}>
            <PiritiyaMark size={22} color={colors.green.default} />
            <span
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: '17px',
                color: '#374151',
                fontWeight: typography.weight.semibold,
              }}
            >
              {language === 'hi' ? 'पिरितिया' : 'Piritiya'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: appState.isOnline ? 'rgba(19,136,8,0.28)' : 'rgba(234,179,8,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {appState.isOnline && (
                  <div
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: colors.green.default,
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: '12px',
                  color: appState.isOnline ? '#15803d' : colors.text.secondary,
                }}
              >
                {appState.isOnline ? (language === 'hi' ? 'ऑनलाइन' : 'online') : (language === 'hi' ? 'ऑफ़लाइन' : 'offline')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowLangSheet(true)}
              style={{
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: radii.full,
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: typography.weight.medium,
                color: colors.text.primary,
                cursor: 'pointer',
                fontFamily: typography.fonts.sans,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
              aria-haspopup="dialog"
              aria-expanded={showLangSheet}
            >
              {language === 'hi' ? 'हिन्दी' : 'English'}
              <span style={{ color: 'rgba(20,30,16,0.4)' }}>▾</span>
            </button>
          </div>
        </div>

        {/* Main content: welcome line + question row (arrow left of question) */}
        <div
          style={{
            padding: `0 20px ${spacing['4']}`,
            flexShrink: 0,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            key={currentPromptIndex}
            style={{ animation: `fadeUp ${animation.duration.base} ${animation.easing.default}` }}
          >
            <p
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.sm,
                color: colors.text.secondary,
                marginBottom: '10px',
              }}
            >
              {diveBackLabel}
            </p>
            {/* Arrow button to the left of the question, same row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: spacing['4'],
              }}
            >
              <button
                type="button"
                onClick={() => handleQuerySubmit(currentPromptText)}
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(19,136,8,0.18)',
                  border: 'none',
                  borderRadius: '50%',
                  color: '#0f6606',
                  cursor: 'pointer',
                  fontFamily: typography.fonts.sans,
                  boxShadow: '0 2px 8px rgba(19,136,8,0.2)',
                }}
                aria-label={language === 'hi' ? 'पूछें' : 'Ask'}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <p
                style={{
                  flex: 1,
                  fontFamily: typography.fonts.serif,
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#1f2937',
                  lineHeight: 1.35,
                  margin: 0,
                  paddingTop: '8px',
                }}
              >
                {prompts[currentPromptIndex]}
              </p>
            </div>
          </div>
        </div>

        {/* Quick action chips - evenly spaced, centrally grouped */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            padding: `0 20px ${spacing['5']}`,
            flexShrink: 0,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {quickActions.map((action) => (
            <div key={action.id}>
              <PillChip
                label={action.label}
                onPress={() => handleQuickAction(action)}
              />
            </div>
          ))}
        </div>

        {/* Orb section: Voice | Mic | Type in one row (flanking layout) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            {/* Voice pill - left of orb */}
            <button
              onClick={() => setIsVoiceMode(true)}
              style={{
                padding: '10px 18px',
                background: isVoiceMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.05)',
                borderRadius: radii.full,
                fontSize: '13px',
                fontWeight: isVoiceMode ? typography.weight.semibold : typography.weight.regular,
                color: isVoiceMode ? '#1f2937' : 'rgba(20,30,16,0.45)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: typography.fonts.sans,
                boxShadow: isVoiceMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              {language === 'hi' ? 'आवाज़' : 'voice'}
            </button>

            <VoiceOrb size={72} isListening={isListening} onPress={handleVoiceOrbClick} />

            {/* Type pill - right of orb */}
            <button
              onClick={() => setIsVoiceMode(false)}
              style={{
                padding: '10px 18px',
                background: !isVoiceMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.05)',
                borderRadius: radii.full,
                fontSize: '13px',
                fontWeight: !isVoiceMode ? typography.weight.semibold : typography.weight.regular,
                color: !isVoiceMode ? '#1f2937' : 'rgba(20,30,16,0.45)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: typography.fonts.sans,
                boxShadow: !isVoiceMode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>T</span>
              {language === 'hi' ? 'टाइप' : 'type'}
            </button>
          </div>

          {isListening && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.md,
                  color: colors.text.secondary,
                  animation: `fadePulse ${animation.duration.slow} ease-in-out infinite`,
                }}
              >
                {getTranslation('listening', language)}
              </div>
              <div
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.sm,
                  color: colors.text.tertiary || 'rgba(0,0,0,0.45)',
                }}
              >
                {getTranslation('tapToStopAndSend', language)}
              </div>
            </div>
          )}
          {voiceError && !isListening && (
            <div
              style={{
                marginTop: spacing['2'],
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.sm,
                color: colors.status?.error || '#dc2626',
              }}
            >
              {getTranslation('voiceError', language)}
            </div>
          )}
        </div>
      </div>

      {/* Advisory data panel (soil / crop / market from REST API) */}
      {(advisoryPanel || advisoryLoading || advisoryError) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => {
            setAdvisoryPanel(null);
            setAdvisoryError(null);
          }}
        >
          <div
            style={{
              background: '#fff',
              borderTopLeftRadius: radii.xl,
              borderTopRightRadius: radii.xl,
              maxHeight: '70vh',
              width: '100%',
              maxWidth: 420,
              overflow: 'auto',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: spacing['4'],
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: typography.fonts.sans,
                  fontWeight: 600,
                  fontSize: typography.size.lg,
                  color: '#1f2937',
                }}
              >
                {advisoryPanel?.type === 'soil'
                  ? (language === 'hi' ? 'मिट्टी की नमी' : 'Soil moisture')
                  : advisoryPanel?.type === 'crop'
                    ? (language === 'hi' ? 'फसल सलाह' : 'Crop advice')
                    : advisoryPanel?.type === 'market'
                      ? (language === 'hi' ? 'बाज़ार भाव' : 'Market prices')
                      : (language === 'hi' ? 'जानकारी' : 'Advisory')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAdvisoryPanel(null);
                  setAdvisoryError(null);
                }}
                style={{
                  padding: '8px 16px',
                  fontFamily: typography.fonts.sans,
                  fontSize: 14,
                  color: '#6b7280',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
            <div style={{ padding: spacing['4'] }}>
              {advisoryLoading && (
                <p style={{ fontFamily: typography.fonts.sans, color: '#6b7280' }}>
                  {language === 'hi' ? 'लोड हो रहा है…' : 'Loading…'}
                </p>
              )}
              {advisoryError && (
                <p style={{ fontFamily: typography.fonts.sans, color: colors.status?.error || '#dc2626' }}>
                  {advisoryError}
                </p>
              )}
              {advisoryPanel && !advisoryLoading && advisoryPanel.type === 'soil' && (
                <SoilMoistureDisplay
                  moistureLevel={advisoryPanel.data.moistureLevel}
                  timestamp={advisoryPanel.data.timestamp}
                  language={language}
                />
              )}
              {advisoryPanel && !advisoryLoading && (advisoryPanel.type === 'crop' || advisoryPanel.type === 'crops') && (
                <CropRecommendationList
                  recommendations={advisoryPanel.data.recommendations}
                  language={language}
                />
              )}
              {advisoryPanel && !advisoryLoading && advisoryPanel.type === 'market' && (
                <MarketPriceTable
                  prices={advisoryPanel.data.prices}
                  language={language}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <LangSheet
        isOpen={showLangSheet}
        currentLang={language}
        onSelect={async (code) => {
          if (code === 'hi' || code === 'en') await setLanguage(code);
          setShowLangSheet(false);
        }}
        onClose={() => setShowLangSheet(false)}
        language={language}
      />

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default HomeScreen;
