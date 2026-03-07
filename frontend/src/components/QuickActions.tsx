import React from 'react';
import type { Language } from '../types';
import { QUICK_ACTIONS } from '../utils/constants';

interface QuickActionsProps {
  language: Language;
  onActionClick: (query: string) => void;
}

/**
 * QuickActions component displays action buttons for common farmer queries.
 * 
 * Features:
 * - Renders action buttons with icons and localized labels
 * - 44x44px minimum touch target size for accessibility
 * - Horizontal scrolling for multiple actions
 * - High contrast styling for outdoor visibility
 * - Emits query on button click via onActionClick callback
 * 
 * Requirements: 3.6, 12.5, 17.1, 17.2, 17.3, 17.5
 */
export const QuickActions: React.FC<QuickActionsProps> = ({ language, onActionClick }) => {
  return (
    <div className="quick-actions-container">
      <div className="quick-actions-label">
        {language === 'hi' ? 'जल्दी पूछें' : 'Quick Questions'}
      </div>
      <div className="quick-actions-scroll">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.query)}
            className="quick-action-button"
            aria-label={language === 'hi' ? action.labelHi : action.labelEn}
          >
            <span className="quick-action-icon" aria-hidden="true">
              {action.icon}
            </span>
            <span className="quick-action-label">
              {language === 'hi' ? action.labelHi : action.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
