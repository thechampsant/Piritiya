import React, { useState, useEffect } from 'react';
import { colors, spacing, typography } from '@ds/tokens';
import { getTranslation } from '../utils/i18n';

const BAR_COUNT = 12;
const MAX_BAR_HEIGHT = 28;
const GREEN = '#138808';

/**
 * VoiceFeedback — status text, waveform, recording timer, bouncing dots.
 * Used below VoiceOrb on Home and Chat screens.
 *
 * Props:
 *   phase       'idle' | 'recording' | 'processing' | 'transcribing' | 'thinking' | 'error' | 'answerReady'
 *   frequencyData  number[] (length 12) for waveform bars; empty when not recording
 *   recordingStartedAt  number | null — timestamp when recording started (for timer)
 *   language    'hi' | 'en'
 */
export function VoiceFeedback({ phase, frequencyData = [], recordingStartedAt, language }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (phase !== 'recording' || !recordingStartedAt) {
      setElapsed(0);
      return;
    }
    const tick = () => {
      setElapsed(Math.floor((Date.now() - recordingStartedAt) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, recordingStartedAt]);

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const showWaveform = phase === 'recording' && Array.isArray(frequencyData) && frequencyData.length > 0;
  const showTimer = phase === 'recording' && recordingStartedAt != null;
  const showProcessingDots = phase === 'processing' || phase === 'transcribing' || phase === 'thinking';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        minHeight: showWaveform ? 56 : undefined,
      }}
    >
      {/* Waveform — green bars (freeze then fade when switching to processing is handled by parent hiding or phase) */}
      {showWaveform && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '4px',
            height: MAX_BAR_HEIGHT,
          }}
        >
          {(frequencyData.slice(0, BAR_COUNT) || []).map((val, i) => {
            const normalized = Math.min(255, Math.max(0, val));
            const scale = normalized / 255;
            const h = Math.max(4, scale * MAX_BAR_HEIGHT);
            return (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: `${MAX_BAR_HEIGHT}px`,
                  borderRadius: '3px',
                  backgroundColor: 'rgba(19,136,8,0.25)',
                  transformOrigin: 'bottom',
                  transform: `scaleY(${h / MAX_BAR_HEIGHT})`,
                  transition: 'transform 0.08s ease-out',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Recording timer */}
      {showTimer && (
        <span
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.sm,
            color: colors.text.tertiary || 'rgba(20,30,16,0.5)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatTimer(elapsed)}
        </span>
      )}

      {/* Status text when recording: "Listening..." first 2s, then "Keep speaking..." + timer */}
      {phase === 'recording' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.md,
              color: colors.text.secondary,
            }}
          >
            {elapsed < 2
              ? getTranslation('listening', language)
              : getTranslation('keepSpeaking', language)}
          </span>
          <span
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.sm,
              color: colors.text.tertiary || 'rgba(0,0,0,0.45)',
            }}
          >
            {getTranslation('tapToStopAndSend', language)}
          </span>
        </div>
      )}

      {showProcessingDots && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.md,
              color: colors.text.secondary,
            }}
          >
            {getTranslation('processing', language)}
          </span>
          <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: colors.green?.default || GREEN,
                  animation: `voiceBounce 0.6s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </span>
        </div>
      )}

      {phase === 'error' && (
        <span
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.md,
            color: colors.status?.error || '#dc2626',
          }}
        >
          {getTranslation('tryAgain', language)}
        </span>
      )}

      {phase === 'answerReady' && (
        <span
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.md,
            color: colors.green?.default || GREEN,
            fontWeight: 500,
          }}
        >
          {getTranslation('answerReady', language)}
        </span>
      )}

      <style>{`
        @keyframes voiceBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default VoiceFeedback;
