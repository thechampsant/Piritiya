import React, { useRef, useEffect, useState } from 'react';
import { FrostedCard, SoilGauge, StatusPill, VoiceOrb, AmbientBg } from '@ds/components';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';
import { Send, WifiOff, Archive } from '@ds/icons';
import { getTranslation } from '../utils/i18n';
import { useChatContext } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApp } from '../contexts/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import SoilMoistureDisplay from '../components/SoilMoistureDisplay';
import CropRecommendationList from '../components/CropRecommendationList';
import MarketPriceTable from '../components/MarketPriceTable';

/**
 * ChatScreen - Conversation view with message bubbles
 * 
 * Features:
 * - User messages: right-aligned, #138808 background, white text
 * - Bot messages: left-aligned, FrostedCard, Lora serif font
 * - Status badges for offline/cached messages
 * - Structured data visualization (SoilGauge, CropCard, MarketCard)
 * - Auto-scroll to latest message
 * - Text input with Send button
 * - Voice input via VoiceOrb
 * - Integration with ChatContext
 * 
 * Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9
 */
const ChatScreen = () => {
  const { state: chatState, sendMessage } = useChatContext();
  const { language, formatTime } = useLanguage();
  const { state: appState } = useApp();
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput(language);
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { messages, isLoading } = chatState;

  // Helper to get translation
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

  /**
   * Handle voice transcript
   */
  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      handleSendMessage(transcript);
    }
  }, [transcript]);

  /**
   * Handle VoiceOrb click
   */
  const handleVoiceOrbClick = () => {
    if (!appState.voiceEnabled) {
      console.warn('Voice input is disabled in settings');
      return;
    }

    if (!isSupported) {
      console.warn('Voice input is not supported in this browser');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Handle send message
   */
  const handleSendMessage = async (text) => {
    const messageText = text || inputText;
    if (!messageText.trim() || isLoading) {
      return;
    }

    try {
      await sendMessage(messageText.trim());
      setInputText('');
      
      // Focus back on input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  /**
   * Handle input key press (Enter to send)
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Parse structured data from bot messages
   * This is a simplified parser - in production, the backend would send structured data
   */
  const parseStructuredData = (text) => {
    // Check for soil moisture data patterns
    const soilMatch = text.match(/moisture.*?(\d+)%/i);
    if (soilMatch) {
      return {
        type: 'soil',
        data: {
          moistureLevel: parseInt(soilMatch[1]),
          timestamp: Date.now(),
        },
      };
    }

    // Check for crop recommendations
    if (text.toLowerCase().includes('crop') && text.toLowerCase().includes('recommend')) {
      return {
        type: 'crops',
        data: {
          recommendations: [], // Would be populated from backend
        },
      };
    }

    // Check for market prices
    if (text.toLowerCase().includes('market') || text.toLowerCase().includes('price')) {
      return {
        type: 'market',
        data: {
          prices: [], // Would be populated from backend
        },
      };
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
      // User message: right-aligned, #138808 background
      return (
        <div
          key={message.id}
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: spacing['4'],
          }}
        >
          <div
            style={{
              maxWidth: '80%',
              background: colors.green.default, // #138808
              color: 'white',
              padding: `${spacing['3']} ${spacing['4']}`,
              borderRadius: '20px 20px 4px 20px',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              lineHeight: typography.leading.relaxed,
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
    } else {
      // Bot message: left-aligned, FrostedCard, Lora font
      return (
        <div
          key={message.id}
          style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: spacing['4'],
          }}
        >
          <div style={{ maxWidth: '85%' }}>
            <FrostedCard>
              <div
                style={{
                  fontFamily: typography.fonts.serif, // Lora
                  fontSize: typography.size.base,
                  lineHeight: typography.leading.relaxed,
                  color: colors.text.primary,
                  marginBottom: spacing['2'],
                }}
              >
                {message.text}
              </div>

              {/* Status badges for offline/cached messages */}
              {/* Requirement 27.9: Show Archive badge on cached, WifiOff on offline */}
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
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['1'],
                    }}
                  >
                    <WifiOff size={12} color={colors.text.secondary} />
                    <span>{t('offline')}</span>
                  </div>
                )}
                {message.status === 'sent' && !message.isOffline && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['1'],
                    }}
                  >
                    <Archive size={12} color={colors.text.secondary} />
                    <span>{language === 'hi' ? 'कैश' : 'Cached'}</span>
                  </div>
                )}
                <span>{formatTime(message.timestamp)}</span>
              </div>
            </FrostedCard>

            {/* Structured data visualization */}
            {/* Requirement 27.8: Display SoilGauge, CropCard, MarketCard */}
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
    }
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
      {/* Background gradient */}
      <AmbientBg />

      {/* Messages container */}
      {/* Requirement 27.1: Display messages in scrollable list */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          overflowY: 'auto',
          padding: spacing.screenPadding,
          paddingBottom: spacing['20'], // Extra space for input area
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >
        {messages.map(renderMessage)}
        
        {/* Loading indicator */}
        {isLoading && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: spacing['4'],
            }}
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

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - fixed at bottom */}
      {/* Requirement 27.7: Text input field with Send button and VoiceOrb */}
      <div
        style={{
          position: 'fixed',
          bottom: '64px', // Above bottom navigation
          left: 0,
          right: 0,
          maxWidth: '390px',
          margin: '0 auto',
          padding: spacing['4'],
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          borderTop: `1px solid ${colors.border.light}`,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing['3'],
          }}
        >
          {/* Voice input button */}
          <button
            onClick={handleVoiceOrbClick}
            disabled={!appState.voiceEnabled || !isSupported}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: appState.voiceEnabled && isSupported ? 'pointer' : 'not-allowed',
              opacity: appState.voiceEnabled && isSupported ? 1 : 0.5,
            }}
            aria-label={isListening ? (language === 'hi' ? 'सुनना बंद करें' : 'Stop listening') : (language === 'hi' ? 'सुनना शुरू करें' : 'Start listening')}
          >
            <VoiceOrb
              size={44}
              isListening={isListening}
              onPress={handleVoiceOrbClick}
            />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('type_message')}
            disabled={isLoading}
            style={{
              flex: 1,
              minHeight: '44px',
              padding: `${spacing['2']} ${spacing['4']}`,
              borderRadius: '100px',
              border: `1px solid ${colors.border.light}`,
              background: 'white',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.base,
              color: colors.text.primary,
              outline: 'none',
            }}
            aria-label={t('message_input')}
          />

          {/* Send button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            style={{
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              border: 'none',
              background: inputText.trim() && !isLoading ? colors.green.default : colors.bg.disabled,
              color: 'white',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            aria-label={t('send_message')}
          >
            <Send size={20} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
