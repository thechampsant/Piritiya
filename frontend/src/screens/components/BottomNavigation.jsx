import React from 'react';
import { Wheat, Compass, BookOpen, Settings } from '@ds/icons';
import { colors, typography } from '@ds/tokens';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * BottomNavigation - Bottom navigation bar
 * Provides navigation between main screens (Today, Explore, Entries, Settings)
 *
 * Requirements:
 * - 30.1: Display bottom navigation with 4 tabs
 * - 30.2: Use Design_System icons for all navigation items
 * - 30.3: Navigate to corresponding Screen_Component on tap
 * - 30.4: Highlight active tab using primary action color (#138808)
 * - 30.5: Show inactive tabs with rgba(20,30,16,0.4) color
 * - 30.6: Ensure all tabs have minHeight 44px for accessibility
 */
const BottomNavigation = ({ currentScreen, onNavigate }) => {
  const { language } = useLanguage();

  const tabs = [
    {
      id: 'home',
      label: language === 'hi' ? 'आज' : 'today',
      Icon: Wheat,
      ariaLabel: 'Navigate to Today screen',
    },
    {
      id: 'explore',
      label: language === 'hi' ? 'खोजें' : 'explore',
      Icon: Compass,
      ariaLabel: 'Navigate to Explore screen',
    },
    {
      id: 'chat',
      label: language === 'hi' ? 'रिकॉर्ड' : 'entries',
      Icon: BookOpen,
      ariaLabel: 'Navigate to Entries screen',
    },
    {
      id: 'settings',
      label: language === 'hi' ? 'सेटिंग' : 'settings',
      Icon: Settings,
      ariaLabel: 'Navigate to Settings screen',
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: '390px',
        margin: '0 auto',
        height: '82px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: '10px',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0,0,0,0.07)',
        zIndex: 100,
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const { Icon } = tab;
        const iconColor = isActive ? colors.green.default : 'rgba(20,30,16,0.4)';

        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            aria-label={tab.ariaLabel}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              minHeight: '44px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${colors.green.default}`;
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            <Icon size={22} color={iconColor} />
            <span
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: '10px',
                fontWeight: isActive ? typography.weight.semibold : typography.weight.medium,
                color: iconColor,
                letterSpacing: '0.3px',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}

      {/* iPhone home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '3px',
          background: '#111',
          borderRadius: '4px',
          opacity: 0.2,
          pointerEvents: 'none',
        }}
      />
    </nav>
  );
};

export default BottomNavigation;
