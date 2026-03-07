/** @type {import('tailwindcss').Config} */
import { colors, typography, spacing, radii, shadows } from '../piritiya-design-system/src/tokens/index.js';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints
      screens: {
        'sm': '428px',  // iPhone 14 Pro Max width
        'md': '768px',  // Tablet
        'lg': '1024px', // Desktop
      },
      
      // Design System Colors
      colors: {
        // Background layers
        'bg-base': colors.bg.base,
        'bg-mid': colors.bg.mid,
        'bg-surface': colors.bg.surface,
        'bg-card': colors.bg.card,
        'bg-card-strong': colors.bg.cardStrong,
        'bg-overlay': colors.bg.overlay,
        
        // Text hierarchy
        'text-primary': colors.text.primary,
        'text-secondary': colors.text.secondary,
        'text-tertiary': colors.text.tertiary,
        'text-placeholder': colors.text.placeholder,
        'text-on-dark': colors.text.onDark,
        'text-on-green': colors.text.onGreen,
        
        // Indian Tricolour - primary brand palette
        'saffron': colors.saffron.default,
        'saffron-light': colors.saffron.light,
        'saffron-muted': colors.saffron.muted,
        'green': colors.green.default,
        'green-dark': colors.green.dark,
        'green-light': colors.green.light,
        'green-muted': colors.green.muted,
        'green-subtle': colors.green.subtle,
        'navy': colors.navy.default,
        'navy-light': colors.navy.light,
        'navy-muted': colors.navy.muted,
        
        // Semantic / status
        'status-success': colors.status.success,
        'status-warning': colors.status.warning,
        'status-error': colors.status.error,
        'status-info': colors.status.info,
        'status-pest': colors.status.pest,
        'status-tip': colors.status.tip,
        
        // Borders
        'border-light': colors.border.light,
        'border-default': colors.border.default,
        'border-strong': colors.border.strong,
        'border-focus': colors.border.focus,
        
        // Legacy colors (for backward compatibility)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        secondary: {
          50: '#fef3c7',
          100: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        'soil': '#2C1810',
        'soil-dark': '#2d2520',
        'clay': '#4A2C1A',
        'terracotta': '#C4572A',
        'terracotta-light': '#E07A52',
        'gold': '#D4A017',
        'gold-light': '#F0C040',
        'cream': '#FAF0E0',
        'field-green': '#3D6B47',
        'leaf-green': '#5A9468',
        'sky-blue': '#7BB8D4',
        'alert': '#E03030',
        'alert-bg': '#3D0F0F',
      },
      
      // Design System Typography
      fontFamily: {
        serif: typography.fonts.serif.split(',').map(f => f.trim()),
        sans: typography.fonts.sans.split(',').map(f => f.trim()),
        noto: typography.fonts.noto.split(',').map(f => f.trim()),
      },
      
      // Font sizes from design system
      fontSize: {
        'xs': typography.size.xs,
        'sm': typography.size.sm,
        'base': typography.size.base,
        'md': typography.size.md,
        'lg': typography.size.lg,
        'xl': typography.size.xl,
        '2xl': typography.size['2xl'],
        '3xl': typography.size['3xl'],
        '4xl': typography.size['4xl'],
        'hero': typography.size.hero,
      },
      
      // Font weights from design system
      fontWeight: {
        light: typography.weight.light,
        regular: typography.weight.regular,
        medium: typography.weight.medium,
        semibold: typography.weight.semibold,
      },
      
      // Line heights from design system
      lineHeight: {
        tight: typography.leading.tight,
        snug: typography.leading.snug,
        normal: typography.leading.normal,
        relaxed: typography.leading.relaxed,
      },
      
      // Letter spacing from design system
      letterSpacing: {
        tight: typography.tracking.tight,
        normal: typography.tracking.normal,
        wide: typography.tracking.wide,
        wider: typography.tracking.wider,
        widest: typography.tracking.widest,
      },
      
      // Design System Spacing
      spacing: {
        '0': spacing['0'],
        '1': spacing['1'],
        '2': spacing['2'],
        '3': spacing['3'],
        '4': spacing['4'],
        '5': spacing['5'],
        '6': spacing['6'],
        '7': spacing['7'],
        '8': spacing['8'],
        '9': spacing['9'],
        '10': spacing['10'],
        '11': '44px', // Minimum touch target size
        '12': spacing['12'],
        '16': spacing['16'],
        'screen-padding': spacing.screenPadding,
        'card-padding': spacing.cardPadding,
        'section-gap': spacing.sectionGap,
      },
      
      // Design System Border Radius
      borderRadius: {
        'sm': radii.sm,
        'md': radii.md,
        'lg': radii.lg,
        'xl': radii.xl,
        '2xl': radii['2xl'],
        '3xl': radii['3xl'],
        'full': radii.full,
        'round': radii.round,
      },
      
      // Design System Shadows
      boxShadow: {
        'sm': shadows.sm,
        'md': shadows.md,
        'lg': shadows.lg,
        'card': shadows.card,
      },
    },
  },
  plugins: [],
}
