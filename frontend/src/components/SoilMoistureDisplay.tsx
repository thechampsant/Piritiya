import React from 'react';
import { colors, spacing, radii, typography } from '@ds/tokens';
import { getTranslation } from '../utils/i18n';
import { formatNumber, formatDateTime } from '../utils/i18n';
import type { Language } from '../types';

interface SoilMoistureDisplayProps {
  moistureLevel: number; // Percentage (0-100)
  timestamp: number;
  language: Language;
  trend?: string;
}

const STATUS_STYLES: Record<string, { labelKey: string; color: string; bgColor: string; borderColor: string }> = {
  critical: { labelKey: 'critical', color: '#dc2626', bgColor: 'rgba(220,38,38,0.15)', borderColor: 'rgba(220,38,38,0.4)' },
  low: { labelKey: 'low', color: '#ca8a04', bgColor: 'rgba(202,138,4,0.15)', borderColor: 'rgba(202,138,4,0.4)' },
  moderate: { labelKey: 'moderate', color: '#0284c7', bgColor: 'rgba(2,132,199,0.15)', borderColor: 'rgba(2,132,199,0.4)' },
  good: { labelKey: 'good', color: '#16a34a', bgColor: 'rgba(22,163,74,0.15)', borderColor: 'rgba(22,163,74,0.4)' },
};

/**
 * SoilMoistureDisplay - Displays soil moisture level with visual gauge
 * Uses inline styles / design tokens for reliable rendering in bottom sheet.
 */
const SoilMoistureDisplay: React.FC<SoilMoistureDisplayProps> = ({
  moistureLevel,
  timestamp,
  language,
  trend,
}) => {
  const getStatus = () => {
    if (moistureLevel < 20) return STATUS_STYLES.critical;
    if (moistureLevel < 40) return STATUS_STYLES.low;
    if (moistureLevel < 70) return STATUS_STYLES.moderate;
    return STATUS_STYLES.good;
  };

  const status = getStatus();
  const label = getTranslation(status.labelKey as 'critical' | 'low' | 'moderate' | 'good', language);

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.03)',
        border: `1px solid ${status.borderColor}`,
        borderRadius: radii.lg,
        padding: spacing['4'],
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing['4'],
        }}
      >
        <h3
          style={{
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.lg,
            fontWeight: 600,
            color: colors.text?.primary ?? '#1a2010',
          }}
        >
          {getTranslation('soilMoisture', language)}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 12px',
              background: status.bgColor,
              color: status.color,
              borderRadius: '100px',
              fontFamily: typography.fonts.sans,
              fontSize: typography.size.sm,
              fontWeight: 600,
            }}
          >
            {label}
          </span>
          {trend && (
            <span
              style={{
                padding: '4px 10px',
                background: 'rgba(0,0,0,0.06)',
                color: colors.text?.secondary ?? 'rgba(20,30,16,0.6)',
                borderRadius: '100px',
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.xs,
              }}
            >
              {trend}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: spacing['4'] }}>
        <div
          style={{
            textAlign: 'center',
            marginBottom: spacing['3'],
          }}
        >
          <span
            style={{
              fontFamily: typography.fonts.sans,
              fontSize: '28px',
              fontWeight: 700,
              color: status.color,
            }}
          >
            {formatNumber(Math.round(moistureLevel), language)}%
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '16px',
            background: 'rgba(0,0,0,0.08)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${Math.min(100, Math.max(0, moistureLevel))}%`,
              background: status.bgColor,
              borderRadius: '8px',
              transition: 'width 0.5s ease',
            }}
            role="progressbar"
            aria-valuenow={moistureLevel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Soil moisture: ${moistureLevel}%`}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: spacing['2'],
            fontFamily: typography.fonts.sans,
            fontSize: typography.size.xs,
            color: colors.text?.tertiary ?? 'rgba(20,30,16,0.4)',
          }}
        >
          <span>{formatNumber(0, language)}%</span>
          <span>{formatNumber(50, language)}%</span>
          <span>{formatNumber(100, language)}%</span>
        </div>
      </div>

      <div
        style={{
          fontFamily: typography.fonts.sans,
          fontSize: typography.size.sm,
          color: colors.text?.tertiary ?? 'rgba(20,30,16,0.5)',
          textAlign: 'center',
        }}
      >
        {formatDateTime(timestamp, language)}
      </div>
    </div>
  );
};

export default SoilMoistureDisplay;
