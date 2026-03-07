import React, { useState } from 'react';
import { PiritiyaMark } from '@ds/icons';
import { AmbientBg, TeamBadge, AWSBadge } from '@ds/components';
import { colors, spacing, typography, radii } from '@ds/tokens';
import { getTranslation } from '../utils/i18n';
import { useApp } from '../contexts/AppContext';
import { useLanguage } from '../contexts/LanguageContext';
import { validateFarmerId } from '../utils/validation';
import LangSheet from './components/LangSheet';

/**
 * OnboardScreen - First-time user onboarding
 * Collects farmer ID and language preference
 *
 * Requirements: 25.1, 25.2, 25.3, 25.4, 25.5
 */
const OnboardScreen = ({ onComplete }) => {
  const { setFarmerId, setLanguage } = useApp();
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLangSheet, setShowLangSheet] = useState(false);

  const validation = validateFarmerId(inputValue);
  const isValid = validation.isValid && inputValue.trim() !== '';

  const handleInputChange = (e) => {
    const raw = e.target.value;
    // Allow KSN-YYYY-NNN or UP-... format; uppercase for display when typing UP/letters
    const value = raw.startsWith('KSN-') ? raw : raw.toUpperCase();
    setInputValue(value);
    setError('');
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError(validation.error || getTranslation('farmerIdInvalid', language));
      return;
    }
    try {
      setIsSubmitting(true);
      await setFarmerId(inputValue);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Failed to save farmer ID:', err);
      setError(
        language === 'hi'
          ? 'सहेजने में विफल। पुनः प्रयास करें।'
          : 'Failed to save. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValid && !isSubmitting) handleSubmit();
  };

  return (
    <div
      style={{
        position: 'relative',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #F9F8F4 0%, #F0F2ED 50%, #E8EBE6 100%)',
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
          padding: `${spacing['8']} ${spacing['7']} ${spacing['8']}`,
          animation: 'fadeUp 0.6s ease',
        }}
      >
        {/* Logo top-left */}
        <div style={{ marginBottom: spacing['7'] }}>
          <PiritiyaMark size={28} color={colors.green.default} />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Greeting - large, bold sans-serif, dark grey/black per design */}
          <h1
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: '42px',
              fontWeight: 700,
              color: '#1f2937',
              lineHeight: 1.15,
              marginBottom: spacing['3'],
              whiteSpace: 'pre-line',
            }}
          >
            {language === 'hi' ? 'नमस्ते,\nकिसान भाई।' : 'Hello,\nFarmer.'}
          </h1>

          {/* Label - Enter your Farmer ID */}
          <p
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.md,
              color: colors.text.secondary,
              marginBottom: spacing['6'],
            }}
          >
            {language === 'hi' ? 'अपनी किसान आईडी डालें' : 'Enter your Farmer ID'}
          </p>

          {/* Farmer ID input */}
          <div style={{ marginBottom: spacing['4'] }}>
            <input
              id="farmerId"
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={language === 'hi' ? 'जैसे: KSN-2024-001' : 'e.g.: KSN-2024-001'}
              aria-label={getTranslation('farmerId', language)}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'farmerId-error' : undefined}
              style={{
                width: '100%',
                minHeight: '52px',
                padding: '14px 16px',
                fontFamily: typography.fonts.sans,
                fontSize: '15px',
                color: colors.text.primary,
                backgroundColor: '#ffffff',
                border: `1px solid ${error ? colors.status.error : 'rgba(0,0,0,0.12)'}`,
                borderRadius: radii.lg,
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = colors.green.default;
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = 'rgba(0,0,0,0.12)';
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
          </div>

          {/* Primary button - vibrant green, Start */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            style={{
              width: '100%',
              padding: '16px',
              background: isValid && !isSubmitting ? '#15803d' : 'rgba(0,0,0,0.12)',
              border: 'none',
              borderRadius: radii.xl,
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: typography.fonts.sans,
              boxShadow: isValid && !isSubmitting ? '0 2px 8px rgba(21,128,61,0.35)' : 'none',
              marginBottom: spacing['4'],
              cursor: isValid && !isSubmitting ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            {isSubmitting
              ? (language === 'hi' ? 'लोड हो रहा है...' : 'Loading...')
              : (language === 'hi' ? 'शुरू करें' : 'Start')}
          </button>

          {/* Not now - medium grey link */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={async () => {
                try {
                  await setFarmerId('default');
                  if (onComplete) onComplete();
                } catch (err) {
                  console.error('Failed to skip onboarding:', err);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.md,
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              {language === 'hi' ? 'अभी नहीं' : 'Not now'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing['3'],
            paddingTop: spacing['4'],
          }}
        >
          {/* Language pill - opens language sheet with all options */}
          <button
            type="button"
            onClick={() => setShowLangSheet(true)}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: radii.full,
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: colors.text.primary,
              cursor: 'pointer',
              fontFamily: typography.fonts.sans,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
            aria-haspopup="dialog"
            aria-expanded={showLangSheet}
          >
            {language === 'hi' ? 'हिन्दी' : 'English'}
            <span style={{ color: colors.text.tertiary, fontSize: '10px' }}>▾</span>
          </button>

          {/* Divider */}
          <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.07)' }} />

          {/* Badges inline */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
            }}
          >
            <TeamBadge />
            <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.1)' }} />
            <AWSBadge />
          </div>
        </div>
      </div>

      {/* Language selection sheet - same grid as in Settings */}
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

export default OnboardScreen;
