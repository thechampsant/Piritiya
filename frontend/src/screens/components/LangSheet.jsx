import React from 'react';
import { colors, spacing, typography, radii } from '@ds/tokens';
import { Check } from '@ds/icons';

/**
 * LangSheet - Language selection bottom sheet
 * Matches design: 2-column grid, selected card (green bg + border + checkmark),
 * "तुरंत" (fast) / "थोड़ा धीमा" (a bit slow) performance chips
 */
const LANGUAGES = [
  { code: 'hi', scriptName: 'हिन्दी', romanName: 'Hindi', instant: true },
  { code: 'en', scriptName: 'English', romanName: 'English', instant: true },
  { code: 'bn', scriptName: 'বাংলা', romanName: 'Bengali', instant: false },
  { code: 'gu', scriptName: 'ગુજરાતી', romanName: 'Gujarati', instant: false },
  { code: 'kn', scriptName: 'ಕನ್ನಡ', romanName: 'Kannada', instant: false },
  { code: 'ml', scriptName: 'മലയാളം', romanName: 'Malayalam', instant: false },
  { code: 'ta', scriptName: 'தமிழ்', romanName: 'Tamil', instant: false },
  { code: 'te', scriptName: 'తెలుగు', romanName: 'Telugu', instant: false },
];

const LangSheet = ({ isOpen, currentLang, onSelect, onClose, language = 'en' }) => {
  if (!isOpen) return null;

  const title = language === 'hi' ? 'चुनें' : 'Choose';
  const fastLabel = language === 'hi' ? 'तुरंत' : 'Instant';
  const slowLabel = language === 'hi' ? 'थोड़ा धीमा' : 'A bit slow';

  return (
    <>
      <div
        className="lang-sheet-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease',
        }}
        aria-hidden="true"
      />
      <div
        className="lang-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          margin: '0 auto',
          maxWidth: '390px',
          background: '#f5f5f5',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '12px 16px 24px',
          maxHeight: '52vh',
          overflowY: 'auto',
          zIndex: 9999,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          animation: 'slideUp 0.3s ease',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drag handle */}
        <div
          style={{
            width: '36px',
            height: '4px',
            background: 'rgba(0,0,0,0.15)',
            borderRadius: '2px',
            margin: '0 auto 12px',
          }}
        />
        <h2
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: '16px',
            fontWeight: typography.weight.semibold,
            color: colors.text.primary,
            marginBottom: '10px',
          }}
        >
          {title}
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
          }}
        >
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelect(lang.code)}
                style={{
                  position: 'relative',
                  padding: '10px 10px',
                  textAlign: 'left',
                  background: isSelected ? 'rgba(19,136,8,0.12)' : 'rgba(255,255,255,0.95)',
                  border: `1.5px solid ${isSelected ? colors.green.default : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: radii.md,
                  cursor: 'pointer',
                  minHeight: '56px',
                  boxShadow: isSelected ? '0 1px 4px rgba(19,136,8,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: colors.green.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={10} color="white" />
                  </div>
                )}
                <div
                  style={{
                    fontFamily: typography.fonts.sans,
                    fontSize: '14px',
                    fontWeight: typography.weight.semibold,
                    color: colors.text.primary,
                    marginBottom: '1px',
                  }}
                >
                  {lang.scriptName}
                </div>
                <div
                  style={{
                    fontFamily: typography.fonts.sans,
                    fontSize: '12px',
                    color: colors.text.secondary,
                    marginBottom: '4px',
                  }}
                >
                  {lang.romanName}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 6px',
                    borderRadius: '100px',
                    fontSize: '10px',
                    fontWeight: 500,
                    fontFamily: typography.fonts.sans,
                    background: lang.instant ? 'rgba(19,136,8,0.12)' : 'rgba(0,0,0,0.06)',
                    color: lang.instant ? colors.green.default : colors.text.secondary,
                  }}
                >
                  {lang.instant ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      {fastLabel}
                    </>
                  ) : (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {slowLabel}
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
};

export default LangSheet;
