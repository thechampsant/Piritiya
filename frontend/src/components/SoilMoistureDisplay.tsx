import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatNumber, formatDateTime } from '../utils/i18n';
import type { Language } from '../types';

interface SoilMoistureDisplayProps {
  moistureLevel: number; // Percentage (0-100)
  timestamp: number;
  language: Language;
}

/**
 * SoilMoistureDisplay - Displays soil moisture level with visual gauge
 * Requirements: 11.1, 11.5
 */
const SoilMoistureDisplay: React.FC<SoilMoistureDisplayProps> = ({
  moistureLevel,
  timestamp,
  language,
}) => {
  const { t } = useLanguage();

  // Determine status based on moisture level
  const getStatus = () => {
    if (moistureLevel < 20) return { label: t('critical'), color: 'text-alert', bgColor: 'bg-alert/20', borderColor: 'border-alert/40' };
    if (moistureLevel < 40) return { label: t('low'), color: 'text-yellow-400', bgColor: 'bg-yellow-400/20', borderColor: 'border-yellow-400/40' };
    if (moistureLevel < 70) return { label: t('moderate'), color: 'text-sky-blue', bgColor: 'bg-sky-blue/20', borderColor: 'border-sky-blue/40' };
    return { label: t('good'), color: 'text-green-400', bgColor: 'bg-green-400/20', borderColor: 'border-green-400/40' };
  };

  const status = getStatus();

  return (
    <div className={`bg-cream/5 border ${status.borderColor} rounded-lg p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-cream">
          {t('soilMoisture')}
        </h3>
        <span className={`px-3 py-1 ${status.bgColor} ${status.color} rounded-full text-sm font-semibold`}>
          {status.label}
        </span>
      </div>

      {/* Gauge Display */}
      <div className="mb-4">
        {/* Percentage */}
        <div className="text-center mb-3">
          <span className={`text-4xl font-bold ${status.color}`}>
            {formatNumber(Math.round(moistureLevel), language)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-cream/10 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${status.bgColor.replace('/20', '/40')} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, moistureLevel))}%` }}
            role="progressbar"
            aria-valuenow={moistureLevel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t('soilMoisture')}: ${moistureLevel}%`}
          />
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between mt-2 text-xs text-cream/50">
          <span>{formatNumber(0, language)}%</span>
          <span>{formatNumber(50, language)}%</span>
          <span>{formatNumber(100, language)}%</span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="text-sm text-cream/60 text-center">
        {formatDateTime(timestamp, language)}
      </div>
    </div>
  );
};

export default SoilMoistureDisplay;
