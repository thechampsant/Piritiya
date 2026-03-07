import React from 'react';

/**
 * LangSheet - Language selection bottom sheet
 * Displays all 8 supported languages in a 2-column grid
 * Shows instant/slower badges and highlights current selection
 * Requirements: 31.1
 */
const LangSheet = ({ isOpen, currentLang, onSelect, onClose }) => {
  const languages = [
    { code: 'hi', scriptName: 'हिन्दी', romanName: 'Hindi', instant: true },
    { code: 'en', scriptName: 'English', romanName: 'English', instant: true },
    { code: 'bn', scriptName: 'বাংলা', romanName: 'Bengali', instant: false },
    { code: 'gu', scriptName: 'ગુજરાતી', romanName: 'Gujarati', instant: false },
    { code: 'kn', scriptName: 'ಕನ್ನಡ', romanName: 'Kannada', instant: false },
    { code: 'ml', scriptName: 'മലയാളം', romanName: 'Malayalam', instant: false },
    { code: 'ta', scriptName: 'தமிழ்', romanName: 'Tamil', instant: false },
    { code: 'te', scriptName: 'తెలుగు', romanName: 'Telugu', instant: false },
  ];

  if (!isOpen) return null;

  return (
    <div className="lang-sheet-backdrop" onClick={onClose}>
      <div className="lang-sheet" onClick={(e) => e.stopPropagation()}>
        <h2>Select Language</h2>
        <div className="lang-grid">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={currentLang === lang.code ? 'selected' : ''}
            >
              <div className="script-name">{lang.scriptName}</div>
              <div className="roman-name">{lang.romanName}</div>
              <span className="badge">{lang.instant ? 'Instant' : 'Slower'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LangSheet;
