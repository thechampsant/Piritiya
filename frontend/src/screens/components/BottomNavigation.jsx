import React from 'react';
import { Wheat, Compass, BookOpen, Settings } from '@ds/icons';
import { colors, spacing, typography } from '@ds/tokens';

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
  // Requirement 30.1: Display bottom navigation with 4 tabs
  // Requirement 30.2: Use Design_System icons (Wheat, Compass, BookOpen, Settings)
  const tabs = [
    { 
      id: 'home', 
      label: 'Today', 
      Icon: Wheat,
      ariaLabel: 'Navigate to Today screen'
    },
    { 
      id: 'explore', 
      label: 'Explore', 
      Icon: Compass,
      ariaLabel: 'Navigate to Explore screen'
    },
    { 
      id: 'chat', 
      label: 'Entries', 
      Icon: BookOpen,
      ariaLabel: 'Navigate to Entries screen'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      Icon: Settings,
      ariaLabel: 'Navigate to Settings screen'
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
        height: '64px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${colors.border.light}`,
        zIndex: 100,
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const { Icon } = tab;
        
        // Requirement 30.4: Highlight active tab using primary action color (#138808)
        // Requirement 30.5: Show inactive tabs with rgba(20,30,16,0.4) color
        const iconColor = isActive ? colors.green.default : colors.text.secondary;
        const textColor = isActive ? colors.green.default : colors.text.secondary;
        
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
              justifyContent: 'center',
              gap: spacing['1'],
              minHeight: '44px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
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
            {/* Requirement 30.2: Use Design_System icons */}
            <Icon size={20} color={iconColor} />
            <span
              style={{
                fontFamily: typography.fonts.sans,
                fontSize: typography.size.xs,
                fontWeight: isActive ? typography.weight.semibold : typography.weight.regular,
                color: textColor,
                transition: 'color 0.2s ease',
              }}
            >
              {tab.label}
            </span>
            {/* Active indicator dot */}
            {isActive && (
              <div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: colors.green.default,
                  marginTop: spacing['1'],
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
