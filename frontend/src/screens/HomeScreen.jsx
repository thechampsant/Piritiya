import React, { useState, useEffect, useContext } from 'react';
import { VoiceOrb, PillChip, StatusPill, AmbientBg } from '@ds/components';
import { colors, spacing, typography, animation } from '@ds/tokens';
import { Wheat, Leaf, TrendingUp, CloudRain } from '@ds/icons';
import { getTranslation } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useChatContext } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceInput } from '../hooks/useVoiceInput';

/**
 * HomeScreen - Voice-first home interface
 * Primary interaction point with VoiceOrb and quick actions
 * 
 * Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6
 */
const HomeScreen = ({ onNavigate }) => {
  const { state: appState } = useApp();
  const { sendMessage } = useChatContext();
  const { language, locale } = useLanguage();
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput(language);
  
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isVoiceMode, setIsVoiceMode] = useState(true);

  // Editorial prompts that rotate
  const prompts = [
    language === 'hi' ? 'मिट्टी की नमी की जाँच करें' : 'Check soil moisture',
    language === 'hi' ? 'फसल की सलाह प्राप्त करें' : 'Get crop advice',
    language === 'hi' ? 'बाजार के भाव देखें' : 'View market prices',
    language === 'hi' ? 'मौसम की जानकारी' : 'Weather information',
  ];

  // Rotate prompts every 5.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [prompts.length]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && transcript.trim() !== '') {
      handleQuerySubmit(transcript);
    }
  }, [transcript]);

  // Handle VoiceOrb click
  const handleVoiceOrbClick = () => {
    if (!appState.voiceEnabled) {
      // Show error - voice is disabled in settings
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

  // Handle query submission
  const handleQuerySubmit = async (query) => {
    try {
      await sendMessage(query);
      // Navigate to chat screen
      if (onNavigate) {
        onNavigate('chat');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle quick action click
  const handleQuickAction = async (actionQuery) => {
    await handleQuerySubmit(actionQuery);
  };

  // Quick actions configuration
  const quickActions = [
    {
      id: 'soil',
      label: getTranslation('soilMoisture', language),
      icon: <Leaf size={16} color={colors.text.primary} />,
      query: language === 'hi' ? 'मिट्टी की नमी की जाँच करें' : 'Check soil moisture',
    },
    {
      id: 'crops',
      label: getTranslation('cropRecommendations', language),
      icon: <Wheat size={16} color={colors.text.primary} />,
      query: language === 'hi' ? 'फसल की सलाह दें' : 'Get crop advice',
    },
    {
      id: 'market',
      label: getTranslation('marketPrices', language),
      icon: <TrendingUp size={16} color={colors.text.primary} />,
      query: language === 'hi' ? 'बाजार के भाव दिखाएं' : 'Show market prices',
    },
    {
      id: 'weather',
      label: language === 'hi' ? 'मौसम' : 'Weather',
      icon: <CloudRain size={16} color={colors.text.primary} />,
      query: language === 'hi' ? 'मौसम की जानकारी' : 'Weather information',
    },
  ];

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

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          padding: spacing.screenPadding,
          paddingBottom: '80px', // Space for bottom navigation
        }}
      >
        {/* Status pill at top */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: spacing['8'],
          }}
        >
          <StatusPill isOnline={appState.isOnline} />
        </div>

        {/* Greeting text */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: spacing['12'],
          }}
        >
          <h1
            style={{
              fontFamily: typography.fonts.serif,
              fontSize: typography.size['3xl'],
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
              marginBottom: spacing['2'],
            }}
          >
            {language === 'hi' ? 'नमस्ते' : 'Hello'}
            {appState.farmerId && `, ${appState.farmerId}`}
          </h1>
        </div>

        {/* VoiceOrb - primary interaction */}
        <div
          style={{
            marginBottom: spacing['8'],
          }}
        >
          <VoiceOrb
            size={72}
            isListening={isListening}
            onPress={handleVoiceOrbClick}
          />
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.md,
              color: colors.text.secondary,
              marginBottom: spacing['6'],
              animation: `fadePulse ${animation.duration.slow} ease-in-out infinite`,
            }}
          >
            {getTranslation('listening', language)}
          </div>
        )}

        {/* Rotating editorial prompts */}
        <div
          key={currentPromptIndex}
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.lg,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing['10'],
            maxWidth: '280px',
            animation: `fadeUp ${animation.duration.base} ${animation.easing.default}`,
          }}
        >
          {prompts[currentPromptIndex]}
        </div>

        {/* Voice/Type mode switcher */}
        <div
          style={{
            display: 'flex',
            gap: spacing['2'],
            marginBottom: spacing['8'],
          }}
        >
          <PillChip
            label={language === 'hi' ? 'आवाज़' : 'Voice'}
            active={isVoiceMode}
            onPress={() => setIsVoiceMode(true)}
          />
          <PillChip
            label={language === 'hi' ? 'टाइप' : 'Type'}
            active={!isVoiceMode}
            onPress={() => setIsVoiceMode(false)}
          />
        </div>

        {/* Quick action buttons */}
        <div
          style={{
            width: '100%',
            marginTop: 'auto',
          }}
        >
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
            {getTranslation('quickActions', language)}
          </h2>
          <div
            style={{
              display: 'flex',
              gap: spacing['3'],
              overflowX: 'auto',
              paddingBottom: spacing['2'],
              // Hide scrollbar but keep functionality
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {quickActions.map((action) => (
              <div
                key={action.id}
                style={{
                  flex: '0 0 auto',
                }}
              >
                <PillChip
                  label={action.label}
                  onPress={() => handleQuickAction(action.query)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add fadeUp animation keyframes */}
      <style>
        {`
          /* Hide scrollbar for quick actions */
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default HomeScreen;
