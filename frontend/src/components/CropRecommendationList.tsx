import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatNumber } from '../utils/i18n';
import type { Language } from '../types';

interface CropRecommendation {
  cropName: string;
  suitabilityScore: number; // 0-100
  reason: string;
  icon?: string;
}

interface CropRecommendationListProps {
  recommendations: CropRecommendation[];
  language: Language;
}

/**
 * CropRecommendationList - Displays crop recommendations with suitability scores
 * Requirements: 11.2
 */
const CropRecommendationList: React.FC<CropRecommendationListProps> = ({
  recommendations,
  language,
}) => {
  const { t } = useLanguage();

  // Get color based on suitability score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-sky-blue';
    if (score >= 40) return 'text-yellow-400';
    return 'text-alert';
  };

  // Get background color based on suitability score
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-400/10';
    if (score >= 60) return 'bg-sky-blue/10';
    if (score >= 40) return 'bg-yellow-400/10';
    return 'bg-alert/10';
  };

  // Default crop icons
  const defaultIcons = ['🌾', '🌽', '🥔', '🥕', '🌱', '🍅', '🥬', '🫘'];

  return (
    <div className="bg-cream/5 border border-gold/20 rounded-lg p-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-cream mb-4">
        {t('cropRecommendations')}
      </h3>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <p className="text-cream/60 text-center py-4">
          {language === 'hi' ? 'कोई सिफारिश उपलब्ध नहीं है' : 'No recommendations available'}
        </p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`${getScoreBgColor(rec.suitabilityScore)} border border-gold/15 rounded-lg p-4 transition-all hover:border-gold/30`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 text-3xl">
                  {rec.icon || defaultIcons[index % defaultIcons.length]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Crop Name and Score */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-cream font-semibold text-base truncate">
                      {rec.cropName}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`${getScoreColor(rec.suitabilityScore)} font-bold text-lg`}>
                        {formatNumber(Math.round(rec.suitabilityScore), language)}
                      </span>
                      <span className="text-cream/50 text-sm">%</span>
                    </div>
                  </div>

                  {/* Reason */}
                  <p className="text-cream/70 text-sm leading-relaxed">
                    {rec.reason}
                  </p>

                  {/* Score Bar */}
                  <div className="mt-3 w-full h-1.5 bg-cream/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBgColor(rec.suitabilityScore).replace('/10', '/40')} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, rec.suitabilityScore))}%` }}
                      role="progressbar"
                      aria-valuenow={rec.suitabilityScore}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${rec.cropName} suitability: ${rec.suitabilityScore}%`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropRecommendationList;
