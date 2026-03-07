import React, { useState, useContext } from 'react';
import { PiritiyaMark } from '@ds/icons';
import { LangToggle, PillChip, AmbientBg, TeamBadge, AWSBadge } from '@ds/components';
import { colors, spacing, typography, radii, animation } from '@ds/tokens';
import { getTranslation } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { validateFarmerId } from '../utils/validation';

/**
 * OnboardScreen - First-time user onboarding
 * Collects farmer ID and language preference
 * 
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5
 */
const OnboardScreen = ({ onComplete }) => {
  const { setFarmerId } = useApp();
  const { language } = useLanguage();
  const { setLanguage } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate farmer ID in real-time
  const validation = validateFarmerId(inputValue);
  const isValid = validation.isValid && inputValue.trim() !== '';

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    setError('');
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError(validation.error || 'Please enter a valid farmer ID');
      return;
    }

    try {
      setIsSubmitting(true);
      await setFarmerId(inputValue);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to save farmer ID:', err);
      setError('Failed to save farmer ID. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValid && !isSubmitting) {
      handleSubmit();
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

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          padding: `${spacing['10']} ${spacing.screenPadding}`,
          animation: `fadeUp ${animation.duration.slow} ${animation.easing.default}`,
        }}
      >
        {/* Top section with logo and form */}
        <div
          style={{
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: spacing['10'] }}>
            <PiritiyaMark size={48} color={colors.green.default} />
          </div>

          {/* Welcome text */}
          <h1
            style={{
              fontFamily: typography.fonts.serif,
              fontSize: typography.size.hero,
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
              textAlign: 'center',
              marginBottom: spacing['4'],
            }}
          >
            {language === 'hi' ? 'स्वागत है' : 'Welcome'}
          </h1>

          <p
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.lg,
              color: colors.text.secondary,
              textAlign: 'center',
              marginBottom: spacing['10'],
            }}
          >
            {language === 'hi' ? 'पिरितिया में आपका स्वागत है' : 'Welcome to Piritiya'}
          </p>

          {/* Farmer ID input */}
          <div style={{ width: '100%', marginBottom: spacing['8'] }}>
            <label
              htmlFor="farmerId"
              style={{
                display: 'block',
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                color: colors.text.primary,
                marginBottom: spacing['1'],
              }}
            >
              {getTranslation('farmerId', language)}
            </label>
            <input
              id="farmerId"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={getTranslation('farmerIdPlaceholder', language)}
              aria-label={getTranslation('farmerId', language)}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'farmerId-error' : undefined}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: `${spacing['2']} ${spacing['4']}`,
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.md,
                color: colors.text.primary,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: `2px solid ${error ? colors.status.error : colors.border.light}`,
                borderRadius: radii.md,
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = colors.green.default;
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = colors.border.light;
                }
              }}
            />
            {error && (
              <p
                id="farmerId-error"
                role="alert"
                style={{
                  fontFamily: typography.fonts.sans,
                  fontSize: typography.size.sm,
                  color: colors.status.error,
                  marginTop: spacing['1'],
                }}
              >
                {error}
              </p>
            )}
            <p
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.xs,
                color: colors.text.secondary,
                marginTop: spacing['1'],
              }}
            >
              {language === 'hi' ? 'उदाहरण: UP-LKO-MLH-00001' : 'Example: UP-LKO-MLH-00001'}
            </p>
          </div>

          {/* Language toggle */}
          <div style={{ width: '100%', marginBottom: spacing['10'] }}>
            <label
              style={{
                display: 'block',
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.medium,
                color: colors.text.primary,
                marginBottom: spacing['1'],
              }}
            >
              {getTranslation('language', language)}
            </label>
            <LangToggle
              currentLang={language}
              onSelect={setLanguage}
            />
          </div>

          {/* Get Started button */}
          <div style={{ width: '100%' }}>
            <PillChip
              label={language === 'hi' ? 'शुरू करें' : 'Get Started'}
              onPress={handleSubmit}
              active={isValid && !isSubmitting}
              style={{
                width: '100%',
                minHeight: '44px',
                fontSize: typography.size.md,
                fontWeight: typography.weight.semibold,
                opacity: isValid && !isSubmitting ? 1 : 0.5,
                cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
              }}
            />
          </div>
        </div>

        {/* Bottom badges */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing['4'],
            marginTop: spacing['10'],
          }}
        >
          <TeamBadge />
          <AWSBadge />
        </div>
      </div>
    </div>
  );
};

export default OnboardScreen;
