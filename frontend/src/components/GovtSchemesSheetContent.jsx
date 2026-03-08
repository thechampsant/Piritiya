import React from 'react';
import { colors, spacing, typography, radii } from '@ds/tokens';
import AIResponseBubble from './AIResponseBubble';

const SCHEMES_FALLBACK_TEXT =
  'PM-KISAN, PMFBY, and KCC are available for UP farmers. Visit your nearest Krishi Kendra to apply.';
const LEARN_MORE_URL = 'https://upagriculture.com';

/**
 * True if the Bedrock response indicates the agent could not help with schemes
 * (e.g. "Sorry, I cannot help you with finding out what government schemes...").
 * In that case we show the fallback message + Learn More instead of the reply.
 */
export function isUnhelpfulSchemesResponse(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim().toLowerCase();
  return (
    (t.includes('sorry') && t.includes('cannot help')) ||
    /cannot help you with finding out what government schemes/i.test(text)
  );
}

/**
 * GovtSchemesSheetContent — Reusable content for Govt Schemes bottom sheet.
 * Renders: 3-card skeleton (loading), fallback + Learn More button (error), or AIResponseBubble (success).
 */
export default function GovtSchemesSheetContent({ loading, error, responseText, language }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 100,
              borderRadius: radii.lg || 12,
              background: 'rgba(0,0,0,0.06)',
              animation: 'advisorySkeletonPulse 1.2s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing['4'] }}>
        <p
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.sm,
            color: colors.text?.primary || '#1f2937',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {SCHEMES_FALLBACK_TEXT}
        </p>
        <a
          href={LEARN_MORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: colors.green?.default || '#0d5c0d',
            color: '#fff',
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.base,
            fontWeight: 600,
            borderRadius: radii.lg || 12,
            textDecoration: 'none',
            textAlign: 'center',
            minHeight: 44,
            lineHeight: '24px',
            boxSizing: 'border-box',
          }}
        >
          {language === 'hi' ? 'और जानें' : 'Learn More'}
        </a>
      </div>
    );
  }

  if (responseText) {
    return <AIResponseBubble text={responseText} />;
  }

  return null;
}
