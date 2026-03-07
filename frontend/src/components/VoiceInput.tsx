import { useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import type { Language } from '../types';

// COLORS from mock for consistency
const COLORS = {
  terracotta: '#C4572A',
  terracottaLight: '#E07A52',
  alert: '#E03030',
};

interface WaveRingsProps {
  active: boolean;
}

/**
 * Animated wave rings that appear during voice recording
 * Reused from mock/piritiya-mobile.jsx
 */
function WaveRings({ active }: WaveRingsProps) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `2px solid ${COLORS.terracotta}`,
              opacity: active ? 0 : 0,
              animation: active
                ? `wave ${1.4 + i * 0.3}s ease-out ${i * 0.2}s infinite`
                : 'none',
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes wave {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(224,48,48,0.5), 0 8px 32px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 0 16px rgba(224,48,48,0), 0 8px 32px rgba(0,0,0,0.5); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
      `}</style>
    </>
  );
}

export interface VoiceInputProps {
  language: Language;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/**
 * VoiceInput component for speech-to-text functionality
 * 
 * Features:
 * - 88x88px microphone button (exceeds 44px minimum touch target)
 * - Animated wave rings during recording
 * - Visual feedback for recording state
 * - Error handling for unsupported browsers and permission denial
 * - Touch-friendly interactions
 * - ARIA labels for accessibility
 * 
 * @param language - Language for speech recognition ('hi' or 'en')
 * @param onTranscript - Callback when transcript is ready
 * @param disabled - Whether the input is disabled
 */
export function VoiceInput({ language, onTranscript, disabled = false }: VoiceInputProps) {
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  } = useVoiceInput(language);

  // Emit transcript to parent when it changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const handleMicClick = () => {
    if (disabled) return;
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Show error message for unsupported browsers
  if (!isSupported) {
    return (
      <div className="voice-input-container" style={{ textAlign: 'center' }}>
        <div
          className="voice-input-error"
          style={{
            color: COLORS.alert,
            fontSize: '14px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(224, 48, 48, 0.1)',
            border: `1px solid rgba(224, 48, 48, 0.3)`,
          }}
          role="alert"
        >
          ⚠️ Voice input is not supported in this browser
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input-container" style={{ textAlign: 'center' }}>
      {/* Microphone Button with Wave Rings */}
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100px',
          height: '100px',
        }}
      >
        <WaveRings active={isListening} />
        <button
          onClick={handleMicClick}
          disabled={disabled}
          className="voice-input-button"
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? `radial-gradient(circle, ${COLORS.alert}, #9B1212)`
              : `radial-gradient(circle, ${COLORS.terracottaLight}, ${COLORS.terracotta})`,
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            zIndex: 2,
            boxShadow: isListening
              ? '0 0 0 0 rgba(224,48,48,0.5), 0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.5)',
            animation: isListening
              ? 'pulse-glow 1.2s ease infinite, breathe 1.4s ease infinite'
              : 'none',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: disabled ? 0.5 : 1,
          }}
          aria-label={
            isListening
              ? 'Stop recording voice input'
              : 'Start recording voice input'
          }
          aria-pressed={isListening}
        >
          <span style={{ fontSize: '36px' }} role="img" aria-hidden="true">
            {isListening ? '⏹' : '🎙️'}
          </span>
        </button>
      </div>

      {/* Error Messages */}
      {error && (
        <div
          className="voice-input-error"
          style={{
            marginTop: '16px',
            color: COLORS.alert,
            fontSize: '14px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(224, 48, 48, 0.1)',
            border: `1px solid rgba(224, 48, 48, 0.3)`,
          }}
          role="alert"
        >
          {error.message}
        </div>
      )}
    </div>
  );
}
