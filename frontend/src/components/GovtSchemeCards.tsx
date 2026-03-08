import React from 'react';
import type { GovtScheme, Language } from '../types';

interface GovtSchemeCardsProps {
  schemes: GovtScheme[];
  language: Language;
  /** When API returns only plain text, display this instead of cards */
  responseText?: string;
}

function formatResponseLines(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed
    .split(/(?<=[।.])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * GovtSchemeCards - Displays government schemes as cards (benefit, eligibility, how to apply, deadline).
 */
const GovtSchemeCards: React.FC<GovtSchemeCardsProps> = ({
  schemes = [],
  language,
  responseText,
}) => {
  const hasResponseText = typeof responseText === 'string' && responseText.trim().length > 0;

  return (
    <div className="bg-cream/5 border border-gold/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl" aria-hidden>📋</span>
        <h3 className="text-lg font-semibold text-cream">
          {language === 'hi' ? 'सरकारी योजनाएं' : 'Government schemes'}
        </h3>
      </div>

      {hasResponseText && schemes.length === 0 ? (
        <div className="space-y-2">
          {formatResponseLines(responseText).map((line, i) => (
            <p key={i} className="text-cream/90 text-sm leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <p className="text-cream/60 text-center py-4">
          {language === 'hi' ? 'कोई योजना उपलब्ध नहीं है' : 'No schemes available'}
        </p>
      ) : (
        <div className="space-y-3">
          {schemes.map((scheme, index) => (
            <div
              key={`${scheme.name}-${index}`}
              className="bg-cream/5 border border-gold/15 rounded-lg p-4 transition-all hover:border-gold/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-2xl" aria-hidden>
                  {scheme.emoji || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-cream font-semibold text-base mb-2">
                    {scheme.name}
                  </h4>
                  <dl className="space-y-1.5 text-sm">
                    <div>
                      <dt className="text-cream/60 font-medium">
                        {language === 'hi' ? 'लाभ' : 'Benefit'}
                      </dt>
                      <dd className="text-cream/90">{scheme.benefit}</dd>
                    </div>
                    <div>
                      <dt className="text-cream/60 font-medium">
                        {language === 'hi' ? 'पात्रता' : 'Eligibility'}
                      </dt>
                      <dd className="text-cream/90">{scheme.eligibility}</dd>
                    </div>
                    <div>
                      <dt className="text-cream/60 font-medium">
                        {language === 'hi' ? 'आवेदन कैसे करें' : 'How to apply'}
                      </dt>
                      <dd className="text-cream/90">{scheme.how_to_apply}</dd>
                    </div>
                    <div>
                      <dt className="text-cream/60 font-medium">
                        {language === 'hi' ? 'अंतिम तारीख' : 'Deadline'}
                      </dt>
                      <dd className="text-cream/90">{scheme.deadline}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovtSchemeCards;
