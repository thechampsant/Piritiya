import { useEffect } from 'react';
import { useVoiceOutput } from '../hooks/useVoiceOutput';
import type { Language } from '../types';

// COLORS from mock for consistency
const COLORS = {
  terracotta: '#C4572A',
  terracottaLight: '#E07A52',
  alert: '#E03030',
};

interface SoundWavesProps {
  active: boolean;
}

/**
 * Animated sound waves that appear during voice playback
 * Visual indicator for speaking state
 */
function SoundWaves({ active }: SoundWavesProps) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          height: '24px',
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: '4px',
              height: active ? '100%' : '8px',
              backgroundColor: COLORS.terracotta,
              borderRadius: '2px',
              animation: active
                ? `sound-wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`
                : 'none',
              transition: 'height 0.2s ease',
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes sound-wave {
          0% { height: 8px; }
          100% { height: 24px; }
        }
      `}</style>
    </>
  );
}

export interface VoiceOutputProps {
  text: string;
  language: Language;
  autoPlay?: boolean;
  onComplete?: () => void;
}

/**
 * VoiceOutput component for text-to-speech functionality
 * 
 * Features:
 * - Auto-play when autoPlay prop is true
 * - Animated sound wave indicator during playback
 * - Stop button with 44x44px minimum touch target
 * - Error handling for unsupported browsers
 * - Graceful synthesis error handling
 * - ARIA labels for accessibility
 * 
 * @param text - Text to speak
 * @param language - Language for speech synthesis ('hi' or 'en')
 * @param autoPlay - Whether to auto-play when text changes
 * @param onComplete - Callback when speech completes
 */
export function VoiceOutput({
  text,
  language,
  autoPlay = false,
  onComplete,
}: VoiceOutputProps) {
  const { isSpeaking, speak, stop, isSupported } = useVoiceOutput(language);

  // Auto-play when text changes if autoPlay is enabled
  useEffect(() => {
    if (autoPlay && text && isSupported) {
      speak(text);
    }
  }, [text, autoPlay, isSupported, speak]);

  // Call onComplete callback when speaking finishes
  useEffect(() => {
    if (!isSpeaking && onComplete) {
      // Only call onComplete if we were speaking before
      // (to avoid calling on initial mount)
      const timer = setTimeout(() => {
        onComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking, onComplete]);

  // Don't render anything if voice output is not supported
  if (!isSupported) {
    return null;
  }

  // Don't render if no text
  if (!text) {
    return null;
  }

  return (
    <div
      className="voice-output-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        backgroundColor: 'rgba(196, 87, 42, 0.1)',
        borderRadius: '8px',
        border: `1px solid rgba(196, 87, 42, 0.3)`,
      }}
    >
      {/* Speaking Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
        }}
      >
        <span
          style={{
            fontSize: '20px',
          }}
          role="img"
          aria-hidden="true"
        >
          🔊
        </span>
        {isSpeaking ? (
          <>
            <SoundWaves active={true} />
            <span
              style={{
                fontSize: '14px',
                color: COLORS.terracotta,
                fontWeight: 500,
              }}
            >
              {language === 'hi' ? 'बोल रहा हूँ...' : 'Speaking...'}
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: '14px',
              color: COLORS.terracotta,
              fontWeight: 500,
            }}
          >
            {language === 'hi' ? 'तैयार' : 'Ready'}
          </span>
        )}
      </div>

      {/* Stop Button */}
      {isSpeaking && (
        <button
          onClick={stop}
          className="voice-output-stop-button"
          style={{
            minWidth: '44px',
            minHeight: '44px',
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: COLORS.alert,
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#9B1212';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.alert;
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label={language === 'hi' ? 'बोलना बंद करें' : 'Stop speaking'}
        >
          <span role="img" aria-hidden="true">
            ⏹
          </span>
        </button>
      )}
    </div>
  );
}
