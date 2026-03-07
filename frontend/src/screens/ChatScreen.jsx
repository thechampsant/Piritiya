import React, { useRef, useEffect, useState } from 'react';
import { FrostedCard, AmbientBg } from '@ds/components';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';
import { Send, WifiOff, Archive, Mic, PiritiyaMark } from '@ds/icons';
import { getTranslation } from '../utils/i18n';
import { useChatContext } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VOICE_LANGUAGE_CONFIG } from '../utils/constants';
import SoilMoistureDisplay from '../components/SoilMoistureDisplay';
import CropRecommendationList from '../components/CropRecommendationList';
import MarketPriceTable from '../components/MarketPriceTable';
import LangSheet from './components/LangSheet';

/**
 * ChatScreen - Conversation view with message bubbles
 *
 * Features:
 * - Frosted header with back/close navigation
 * - User messages: right-aligned, #138808 background, white text
 * - Bot messages: left-aligned, FrostedCard, Lora serif font
 * - Status badges for offline/cached messages
 * - Structured data visualization (SoilGauge, CropCard, MarketCard)
 * - Auto-scroll to latest message
 * - Text input with mic inside and Send button
 * - Voice input via Web Speech API
 *
 * Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9
 */
const ChatScreen = ({ onNavigate }) => {
  const { state: chatState, sendMessage, startNewSession } = useChatContext();
  const { language, formatTime } = useLanguage();
  const { state: appState, setLanguage } = useApp();
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput(language, {
    useBackend: appState.isOnline && appState.useAwsVoice && (VOICE_LANGUAGE_CONFIG[language]?.transcribeRT ?? false),
  });

  const [inputText, setInputText] = useState('');
  const [showLangSheet, setShowLangSheet] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, isLoading } = chatState;

  const t = (key) => getTranslation(key, language);

  /**
   * Auto-scroll to latest message
   * Requirement 27.6: Auto-scroll when new messages arrive
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  const handleVoiceOrbClick = () => {
    if (!appState.voiceEnabled || !isSupported) return;
    if (isListening) stopListening();
    else startListening();
  };

  const handleSendMessage = async (text) => {
    const messageText = text || inputText;
    if (!messageText.trim() || isLoading) return;

    try {
      await sendMessage(messageText.trim());
      setInputText('');
      if (inputRef.current) inputRef.current.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const parseStructuredData = (text) => {
    const soilMatch = text.match(/moisture.*?(\d+)%/i);
    if (soilMatch) {
      return { type: 'soil', data: { moistureLevel: parseInt(soilMatch[1]), timestamp: Date.now() } };
    }
    if (text.toLowerCase().includes('crop') && text.toLowerCase().includes('recommend')) {
      return { type: 'crops', data: { recommendations: [] } };
    }
    if (text.toLowerCase().includes('market') || text.toLowerCase().includes('price')) {
      return { type: 'market', data: { prices: [] } };
    }
    return null;
  };

  /**
   * Render a single message
   * Requirements: 27.2, 27.3, 27.4, 27.5, 27.9
   */
  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    const structuredData = !isUser ? parseStructuredData(message.text) : null;

    if (isUser) {
      return (
        <div
          key={message.id}
          style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: spacing['4'] }}
        >
          <div
            style={{
              maxWidth: '72%',
              background: colors.green.default,
              color: 'white',
              padding: '12px 16px',
              borderRadius: '20px 20px 4px 20px',
              fontFamily: typography.fonts.sans,
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            <div>{message.text}</div>
            <div
              style={{
                fontSize: typography.size.xs,
                opacity: 0.8,
                marginTop: spacing['1'],
                textAlign: 'right',
              }}
            >
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: spacing['4'] }}
      >
        <div style={{ maxWidth: '78%' }}>
          <FrostedCard>
            <div
              style={{
                fontFamily: typography.fonts.serif,
                fontSize: '14px',
                lineHeight: 1.6,
                color: colors.text.primary,
                marginBottom: spacing['2'],
              }}
            >
              {message.text}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing['2'],
                fontSize: typography.size.xs,
                color: colors.text.secondary,
              }}
            >
              {message.isOffline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing['1'] }}>
                  <WifiOff size={12} color={colors.text.secondary} />
                  <span>{t('offline')}</span>
                </div>
              )}
              {message.status === 'sent' && !message.isOffline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing['1'] }}>
                  <Archive size={12} color={colors.text.secondary} />
                  <span>{language === 'hi' ? 'कैश' : 'Cached'}</span>
                </div>
              )}
              <span>{formatTime(message.timestamp)}</span>
            </div>
          </FrostedCard>

          {structuredData && (
            <div style={{ marginTop: spacing['3'] }}>
              {structuredData.type === 'soil' && (
                <SoilMoistureDisplay
                  moistureLevel={structuredData.data.moistureLevel}
                  timestamp={structuredData.data.timestamp}
                  language={language}
                />
              )}
              {structuredData.type === 'crops' && structuredData.data.recommendations.length > 0 && (
                <CropRecommendationList
                  recommendations={structuredData.data.recommendations}
                  language={language}
                />
              )}
              {structuredData.type === 'market' && structuredData.data.prices.length > 0 && (
                <MarketPriceTable
                  prices={structuredData.data.prices}
                  language={language}
                />
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AmbientBg />

      {/* Frosted header */}
      <div
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0,
          zIndex: 10,
          position: 'relative',
          padding: '0 16px 12px',
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
          <PiritiyaMark size={18} color={colors.green.default} />
          <span
            style={{
              fontFamily: typography.fonts.serif,
              fontSize: '15px',
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
            }}
          >
            {language === 'hi' ? 'पिरितिया' : 'Piritiya'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <button
            onClick={() => startNewSession && startNewSession()}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '100px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '500',
              color: colors.text.primary,
              cursor: 'pointer',
              fontFamily: typography.fonts.sans,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {language === 'hi' ? 'नई चैट' : 'New Chat'}
          </button>
          <button
            onClick={() => onNavigate && onNavigate('home')}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label={language === 'hi' ? 'बंद करें' : 'Close'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.text.primary}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages container */}
      {/* Requirement 27.1: Display messages in scrollable list */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          padding: spacing.screenPadding,
          paddingBottom: '160px',
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              padding: spacing['6'],
            }}
          >
            <p
              style={{
                fontFamily: typography.fonts.serif,
                fontStyle: 'italic',
                fontSize: typography.size.lg,
                color: colors.text.secondary,
                textAlign: 'center',
              }}
            >
              {language === 'hi' ? 'अपना पहला सवाल पूछें...' : 'ask your first question...'}
            </p>
          </div>
        )}
        {messages.map(renderMessage)}

        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: spacing['4'] }}
          >
            <FrostedCard>
              <div
                style={{
                  fontFamily: typography.fonts.serif,
                  fontSize: typography.size.base,
                  color: colors.text.secondary,
                  animation: `fadePulse ${animation.duration.slow} ease-in-out infinite`,
                }}
              >
                {language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
              </div>
            </FrostedCard>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area - fixed above bottom navigation */}
      {/* Requirement 27.7: Text input field with Send button and voice input */}
      <div
        style={{
          position: 'fixed',
          bottom: '82px',
          left: 0,
          right: 0,
          maxWidth: '390px',
          margin: '0 auto',
          padding: '10px 16px 12px',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Input pill with mic icon inside */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: radii.full,
              padding: '10px 16px',
              minHeight: '44px',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={t('type_message')}
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontFamily: typography.fonts.sans,
                fontSize: '14px',
                color: colors.text.primary,
              }}
              aria-label={t('message_input')}
            />
            <button
              onClick={handleVoiceOrbClick}
              disabled={!appState.voiceEnabled || !isSupported}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: appState.voiceEnabled && isSupported ? 'pointer' : 'not-allowed',
                opacity: appState.voiceEnabled && isSupported ? (isListening ? 1 : 0.5) : 0.3,
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={
                isListening
                  ? (language === 'hi' ? 'सुनना बंद करें' : 'Stop listening')
                  : (language === 'hi' ? 'सुनना शुरू करें' : 'Start listening')
              }
            >
              <Mic size={18} color={isListening ? colors.green.default : 'rgba(0,0,0,0.35)'} />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              background: inputText.trim() && !isLoading ? colors.green.default : 'rgba(0,0,0,0.12)',
              color: 'white',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: inputText.trim() && !isLoading ? '0 2px 12px rgba(19,136,8,0.3)' : 'none',
              flexShrink: 0,
            }}
            aria-label={t('send_message')}
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default ChatScreen;
