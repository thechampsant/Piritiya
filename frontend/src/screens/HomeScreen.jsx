import React, { useState, useEffect } from 'react';
import { VoiceOrb, AmbientBg, PillChip } from '@ds/components';
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
import VoiceFeedback from '../components/VoiceFeedback';
import LangSheet from './components/LangSheet';
import BottomSheet from '../components/BottomSheet';
import { playVoiceBeep } from '../utils/voiceSounds';

/**
 * HomeScreen - Voice-first home interface
 * Primary interaction point with VoiceOrb and quick actions
 *
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6
 */
const OPEN_SESSION_KEY = 'piritiya_open_session_id';

/** Topic emoji for conversation card: crop → 🌾, market → 💰, soil → 🌱, weather → ☁️, else 💬 */
function getTopicEmoji(text) {
  if (!text || typeof text !== 'string') return '💬';
  const t = text.toLowerCase().trim();
  // Hindi: फसल, बाजार, मिट्टी/भूजल, मौसम
  if (/\b(crop|crops|plant|planting|फसल|बोएं|बोई|फसलें)\b/.test(t) || /\b(wheat|rice|गेहूं|धान)\b/.test(t)) return '🌾';
  if (/\b(market|price|prices|भाव|बाजार|मंडी)\b/.test(t)) return '💰';
  if (/\b(soil|moisture|भूजल|मिट्टी|जल स्तर|groundwater)\b/.test(t)) return '🌱';
  if (/\b(weather|rain|मौसम|बारिश|बरसात)\b/.test(t)) return '☁️';
  return '💬';
}

/** First 5–6 words for response preview subtitle */
function getPreviewWords(str, maxWords = 6) {
  if (!str || typeof str !== 'string') return '';
  const words = str.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, maxWords).join(' ') + (words.length > maxWords ? '…' : '');
}

const HomeScreen = ({ onNavigate }) => {
  const { state: appState, setLanguage, getQueryHistory, clearQueryHistory } = useApp();
  const { sendMessage } = useChatContext();
  const { language } = useLanguage();
  const [queryHistory, setQueryHistory] = useState([]); // { text, timestamp }[]
  const [farmerName, setFarmerName] = useState(null); // from backend for greeting
  const [farmerLocation, setFarmerLocation] = useState(null); // { district, block } for header

  const formatHistoryDate = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
    const timeStr = d.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (isToday) return language === 'hi' ? `आज ${timeStr}` : `Today ${timeStr}`;
    if (isYesterday) return language === 'hi' ? `कल ${timeStr}` : `Yesterday ${timeStr}`;
    const dateStr = d.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    return `${dateStr}, ${timeStr}`;
  };
  const {
    isListening,
    isProcessing,
    transcript,
    error: voiceError,
    recordingStartedAt,
    frequencyData,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceInput(language, {
    useBackend: appState.isOnline && appState.useAwsVoice && (VOICE_LANGUAGE_CONFIG[language]?.transcribeRT ?? false),
  });

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [advisoryPanel, setAdvisoryPanel] = useState(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState(null);
  const [showAnswerReady, setShowAnswerReady] = useState(false);
  const [pressedCardIndex, setPressedCardIndex] = useState(null);

  const prompts = language === 'hi'
    ? [
        'इस मौसम में कौन सी फसल बोएं?',
        'आज बाजार के भाव क्या हैं?',
        'भूजल स्तर कम होने पर क्या करें?',
      ]
    : [
        'What crop should I plant this season on my land?',
        'What are the market prices today?',
        'What to do when groundwater levels are low?',
      ];

  /** Time-aware greeting with optional farmer name (e.g. "Good morning, राम प्रसाद".) */
  const getGreetingLabel = () => {
    const hour = new Date().getHours();
    let key = 'greetingMorning';
    if (hour >= 12 && hour < 17) key = 'greetingAfternoon';
    else if (hour >= 17) key = 'greetingEvening';
    const timeGreeting = getTranslation(key, language);
    const name = (farmerName || '').trim();
    if (name) return `${timeGreeting}, ${name}.`;
    return getTranslation('diveBackIn', language);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [prompts.length]);

  /** Load past conversations for the current farmer only; refresh when farmer or history changes. */
  useEffect(() => {
    try {
      setQueryHistory(typeof getQueryHistory === 'function' ? (getQueryHistory() ?? []) : []);
    } catch (_) {
      setQueryHistory([]);
    }
  }, [getQueryHistory, appState.farmerId]);

  /** Fetch farmer name and location for greeting and header when farmerId is set. */
  useEffect(() => {
    const id = (appState.farmerId || '').trim();
    if (!id) {
      setFarmerName(null);
      setFarmerLocation(null);
      return;
    }
    let cancelled = false;
    apiClient.getFarmer(id).then((farmer) => {
      if (cancelled) return;
      if (farmer?.farmer_name) setFarmerName(farmer.farmer_name);
      else setFarmerName(null);
      if (farmer?.location && (farmer.location.district || farmer.location.block)) {
        setFarmerLocation({ district: farmer.location.district || '', block: farmer.location.block || '' });
      } else {
        setFarmerLocation(null);
      }
    }).catch(() => {
      if (!cancelled) {
        setFarmerName(null);
        setFarmerLocation(null);
      }
    });
    return () => { cancelled = true; };
  }, [appState.farmerId]);

  const handleClearPastConversations = () => {
    clearQueryHistory?.();
    setQueryHistory([]);
    setShowClearHistoryConfirm(false);
  };

  // Answer ready: when transcript arrives, show "Answer ready", beep, vibrate, then submit and navigate after 1.5s
  useEffect(() => {
    if (!transcript || transcript.trim() === '') return;
    setShowAnswerReady(true);
    playVoiceBeep('complete');
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(100);
      } catch (_) {}
    }
    const t = setTimeout(() => {
      handleQuerySubmit(transcript);
      setShowAnswerReady(false);
    }, 1500);
    return () => clearTimeout(t);
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps -- handleQuerySubmit, onNavigate stable

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

  /** When user taps a past-conversation pill: open that conversation on Chat (don't send again). */
  const handlePastConversationPress = (item) => {
    if (item.sessionId) {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(OPEN_SESSION_KEY, item.sessionId);
      } catch (_) {}
      if (onNavigate) onNavigate('chat');
    } else {
      handleQuerySubmit(item.text);
    }
  };

  const handleQuickAction = async (action) => {
    if (advisoryLoading) return;
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
              trend: data.trend,
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
  ];

  const currentPromptText = prompts[currentPromptIndex];

  const showAdvisorySheet = !!(advisoryPanel || advisoryLoading || advisoryError);

  const closeAdvisorySheet = () => {
    setAdvisoryPanel(null);
    setAdvisoryError(null);
  };

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
        {/* Header row - same padding/height as other screens */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            minHeight: '56px',
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
              {farmerLocation && (farmerLocation.district || farmerLocation.block) ? (
                <span
                  style={{
                    fontFamily: typography.fonts.sans,
                    fontSize: '12px',
                    color: colors.text.secondary,
                  }}
                >
                  📍 {[farmerLocation.district, farmerLocation.block].filter(Boolean).join(', ')}
                </span>
              ) : (
                <>
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
                </>
              )}
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
              {getGreetingLabel()}
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
            <div
              key={action.id}
              role="button"
              tabIndex={0}
              onPointerDown={() => handleQuickAction(action)}
              onTouchEnd={(e) => { e.preventDefault(); handleQuickAction(action); }}
            >
              <PillChip
                label={action.label}
                onPress={() => handleQuickAction(action)}
              />
            </div>
          ))}
        </div>

        {/* Past conversations — full-width cards */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: `0 ${spacing['5']} 120px`,
            position: 'relative',
            zIndex: 2,
          }}
        >
          {queryHistory.length > 0 && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing['2'],
                  flexShrink: 0,
                }}
              >
                <p
                  style={{
                    fontFamily: typography.fonts.sans,
                    fontSize: typography.size.xs,
                    color: colors.text.tertiary || 'rgba(20,30,16,0.5)',
                    margin: 0,
                  }}
                >
                  {language === 'hi' ? 'पिछली बातचीत' : 'Past conversations'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowClearHistoryConfirm(true)}
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: colors.text.tertiary || 'rgba(20,30,16,0.5)',
                  }}
                  aria-label={getTranslation('clearPastConversationsButton', language)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {queryHistory.map((item, i) => {
                  const safeItem = item && typeof item === 'object' ? item : { text: '', timestamp: Date.now() };
                  const isPressed = pressedCardIndex === i;
                  const subtitle = safeItem.responsePreview
                    ? getPreviewWords(safeItem.responsePreview, 6)
                    : (language === 'hi' ? 'देखने के लिए टैप करें' : 'Tap to view');
                  return (
                    <button
                      key={`${i}-${safeItem.timestamp}-${(safeItem.text || '').slice(0, 15)}`}
                      type="button"
                      onClick={() => handlePastConversationPress(safeItem)}
                      onTouchStart={() => setPressedCardIndex(i)}
                      onTouchEnd={() => setPressedCardIndex(null)}
                      onMouseDown={() => setPressedCardIndex(i)}
                      onMouseUp={() => setPressedCardIndex(null)}
                      onMouseLeave={() => setPressedCardIndex(null)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 14px 14px 16px',
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: 'none',
                        borderLeft: isPressed ? `3px solid ${colors?.green?.default || '#16a34a'}` : '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                        transition: 'transform 0.1s ease, border-left-color 0.1s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: colors?.green?.default ? `${colors.green.default}20` : 'rgba(22,163,74,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          flexShrink: 0,
                        }}
                      >
                        {getTopicEmoji(safeItem.text)}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <span
                            style={{
                              fontFamily: typography?.fonts?.sans || 'system-ui, sans-serif',
                              fontWeight: 600,
                              fontSize: typography?.size?.sm || 14,
                              color: colors?.text?.primary || '#141e10',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {safeItem.text || ''}
                          </span>
                          <span
                            style={{
                              fontFamily: typography?.fonts?.sans || 'system-ui, sans-serif',
                              fontSize: '10px',
                              color: colors?.text?.tertiary || 'rgba(20,30,16,0.45)',
                              flexShrink: 0,
                            }}
                          >
                            {formatHistoryDate(typeof safeItem.timestamp === 'number' ? safeItem.timestamp : Date.now())}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: typography?.fonts?.sans || 'system-ui, sans-serif',
                            fontSize: typography?.size?.xs || 12,
                            color: colors?.text?.tertiary || 'rgba(20,30,16,0.55)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {subtitle}
                        </span>
                      </div>
                      <span
                        style={{
                          color: colors?.text?.tertiary || 'rgba(20,30,16,0.4)',
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                        aria-hidden
                      >
                        ›
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>

      {/* Voice-only input - fixed above bottom nav; no background (same as ChatScreen) */}
      <div
        style={{
          position: 'fixed',
          bottom: '82px',
          left: 0,
          right: 0,
          maxWidth: '390px',
          margin: '0 auto',
          padding: `${spacing['4']} 0 ${spacing['4']}`,
          background: 'transparent',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <VoiceOrb
          size={72}
          isListening={isListening}
          isProcessing={isProcessing}
          isError={!!voiceError}
          onPress={handleVoiceOrbClick}
          label={getTranslation('tapToSpeak', language)}
        />
        <VoiceFeedback
          phase={
            voiceError
              ? 'error'
              : showAnswerReady
                ? 'answerReady'
                : isProcessing
                  ? 'processing'
                  : isListening
                    ? 'recording'
                    : 'idle'
          }
          frequencyData={frequencyData}
          recordingStartedAt={recordingStartedAt}
          language={language}
        />
      </div>

      {/* Advisory data panel (soil / crop / market from REST API) */}
      <BottomSheet
        isOpen={showAdvisorySheet}
        onClose={closeAdvisorySheet}
        showDragHandle={false}
        header={
          <div
            style={{
              flexShrink: 0,
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
              onClick={closeAdvisorySheet}
              onPointerDown={(e) => { e.preventDefault(); closeAdvisorySheet(); }}
              onTouchEnd={(e) => { e.preventDefault(); closeAdvisorySheet(); }}
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
        }
      >
        <div style={{ padding: spacing['4'] }}>
          {advisoryLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ height: 16, borderRadius: 4, background: 'rgba(0,0,0,0.08)', width: '60%', animation: 'advisorySkeletonPulse 1.2s ease-in-out infinite' }} />
              <div style={{ height: 12, borderRadius: 4, background: 'rgba(0,0,0,0.06)', width: '90%' }} />
              <div style={{ height: 12, borderRadius: 4, background: 'rgba(0,0,0,0.06)', width: '75%' }} />
              <div style={{ height: 40, borderRadius: 8, background: 'rgba(0,0,0,0.06)', width: '100%' }} />
              <div style={{ height: 12, borderRadius: 4, background: 'rgba(0,0,0,0.06)', width: '50%' }} />
            </div>
          )}
          {advisoryError && !advisoryLoading && (
            <p style={{ fontFamily: typography.fonts.sans, color: colors.status?.error || '#dc2626' }}>
              {advisoryError}
            </p>
          )}
          {advisoryPanel && !advisoryLoading && advisoryPanel.type === 'soil' && (
            <SoilMoistureDisplay
              moistureLevel={advisoryPanel.data.moistureLevel}
              timestamp={advisoryPanel.data.timestamp}
              trend={advisoryPanel.data.trend}
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
      </BottomSheet>

      {showClearHistoryConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-history-dialog-title"
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
          onClick={() => setShowClearHistoryConfirm(false)}
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
              id="clear-history-dialog-title"
              style={{
                fontFamily: typography.fonts.serif,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.semibold,
                color: colors.text.primary,
                margin: '0 0 12px 0',
              }}
            >
              {getTranslation('clearPastConversationsTitle', language)}
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
              {getTranslation('clearPastConversationsMessage', language)}
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
                onClick={() => setShowClearHistoryConfirm(false)}
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
                onClick={handleClearPastConversations}
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
                {getTranslation('clearPastConversationsConfirm', language)}
              </button>
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
