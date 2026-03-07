// TypeScript declarations for piritiya-design-system
// This file provides type definitions for the JSX components and modules
// exported from the design system located at ../piritiya-design-system/src

import { ReactNode, CSSProperties } from 'react';

// ─── COMPONENTS MODULE ────────────────────────────────────────────────────────
declare module '@ds/components' {
  // Ambient Background
  export const AmbientBg: React.FC;

  // Voice Orb
  export const VoiceOrb: React.FC<{
    isListening?: boolean;
    onPress?: () => void;
    size?: number;
  }>;

  // Toggle Switch
  export const ToggleSwitch: React.FC<{
    value: boolean;
    onChange: (value: boolean) => void;
  }>;

  // Pill Chip
  export const PillChip: React.FC<{
    label: string;
    active?: boolean;
    onPress?: () => void;
  }>;

  // Frosted Card
  export const FrostedCard: React.FC<{
    children: ReactNode;
    style?: CSSProperties;
    accentColor?: string;
  }>;

  // Setting Row
  export const SettingRow: React.FC<{
    label: string;
    children: ReactNode;
  }>;

  // Setting Section
  export const SettingSection: React.FC<{
    children: ReactNode;
    danger?: boolean;
  }>;

  // Language Toggle
  export const LangToggle: React.FC<{
    lang?: string;
    onPress?: () => void;
  }>;

  // Status Pill
  export const StatusPill: React.FC<{
    isOnline: boolean;
    onPress?: () => void;
  }>;

  // Soil Gauge
  export const SoilGauge: React.FC<{
    moisture?: number;
    status?: number;
    label?: string;
    statusLabels?: string[];
  }>;

  // AWS Badge
  export const AWSBadge: React.FC;

  // Team Badge
  export const TeamBadge: React.FC<{
    compact?: boolean;
  }>;

  // Global Styles
  export const globalStyles: string;
}

// ─── TOKENS MODULE ────────────────────────────────────────────────────────────
declare module '@ds/tokens' {
  export const colors: {
    bg: {
      base: string;
      mid: string;
      surface: string;
      card: string;
      cardStrong: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      placeholder: string;
      onDark: string;
      onGreen: string;
    };
    saffron: {
      default: string;
      light: string;
      muted: string;
    };
    green: {
      default: string;
      dark: string;
      light: string;
      muted: string;
      subtle: string;
    };
    navy: {
      default: string;
      light: string;
      muted: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
      pest: string;
      tip: string;
    };
    border: {
      light: string;
      default: string;
      strong: string;
      focus: string;
    };
    orb: {
      idle: string;
      active: string;
      shadowIdle: string;
      shadowActive: string;
    };
  };

  export const typography: {
    fonts: {
      serif: string;
      sans: string;
      noto: string;
      hi: string;
      bn: string;
      gu: string;
      kn: string;
      ml: string;
      ta: string;
      te: string;
    };
    size: {
      xs: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      hero: string;
    };
    weight: {
      light: number;
      regular: number;
      medium: number;
      semibold: number;
    };
    leading: {
      tight: number;
      snug: number;
      normal: number;
      relaxed: number;
    };
    tracking: {
      tight: string;
      normal: string;
      wide: string;
      wider: string;
      widest: string;
    };
  };

  export const spacing: {
    '0': string;
    '1': string;
    '2': string;
    '3': string;
    '4': string;
    '5': string;
    '6': string;
    '7': string;
    '8': string;
    '9': string;
    '10': string;
    '12': string;
    '16': string;
    screenPadding: string;
    cardPadding: string;
    sectionGap: string;
  };

  export const radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
    round: string;
  };

  export const shadows: {
    sm: string;
    md: string;
    lg: string;
    card: string;
  };

  export const animation: {
    duration: {
      fast: string;
      base: string;
      slow: string;
      slower: string;
    };
    easing: {
      default: string;
      spring: string;
      bounce: string;
    };
    keyframes: string;
  };

  export const breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };

  export const zIndex: {
    bg: number;
    content: number;
    header: number;
    input: number;
    nav: number;
    sheet: number;
    modal: number;
  };

  export const googleFontsUrl: string;
  export const globalStyles: string;
}

// ─── ICONS MODULE ─────────────────────────────────────────────────────────────
declare module '@ds/icons' {
  interface IconProps {
    size?: number;
    color?: string;
    style?: CSSProperties;
    strokeWidth?: number;
  }

  // Voice / Input
  export const Mic: React.FC<IconProps>;
  export const Send: React.FC<IconProps>;
  export const Type: React.FC<IconProps>;
  export const Volume2: React.FC<IconProps>;

  // Navigation
  export const ChevronLeft: React.FC<IconProps>;
  export const ChevronRight: React.FC<IconProps>;
  export const ArrowRight: React.FC<IconProps>;
  export const X: React.FC<IconProps>;
  export const Search: React.FC<IconProps>;
  export const Settings: React.FC<IconProps>;
  export const Compass: React.FC<IconProps>;
  export const BookOpen: React.FC<IconProps>;

  // Status / Feedback
  export const WifiOff: React.FC<IconProps>;
  export const RefreshCw: React.FC<IconProps>;
  export const Clock: React.FC<IconProps>;
  export const AlertTriangle: React.FC<IconProps>;
  export const Archive: React.FC<IconProps>;
  export const RotateCcw: React.FC<IconProps>;
  export const Check: React.FC<IconProps>;
  export const Sparkles: React.FC<IconProps>;

  // Farming / Content
  export const Wheat: React.FC<IconProps>;
  export const Leaf: React.FC<IconProps>;
  export const Sprout: React.FC<IconProps>;
  export const CloudRain: React.FC<IconProps>;
  export const Bug: React.FC<IconProps>;
  export const TrendingUp: React.FC<IconProps>;
  export const FileText: React.FC<IconProps>;

  // Brand
  export const PiritiyaMark: React.FC<{
    size?: number;
    color?: string;
  }>;

  export const Beetle: React.FC<{
    size?: number;
  }>;
}

// ─── I18N MODULE ──────────────────────────────────────────────────────────────
declare module '@ds/i18n' {
  export interface Language {
    code: string;
    short: string;
    script: string;
    roman: string;
    instant: boolean;
    polly: boolean;
    transcribeRT: boolean;
  }

  export const LANGUAGES: Language[];

  export function getTranslation(lang: string): {
    appName: string;
    onboardTitle: string;
    onboardSub: string;
    onboardPlaceholder: string;
    onboardBtn: string;
    onboardSkip: string;
    onboardError: string;
    placeholder: string;
    voiceLabel: string;
    typeLabel: string;
    send: string;
    listening: string;
    speaking: string;
    online: string;
    offline: string;
    syncing: string;
    pendingBadge: (n: number) => string;
    failedSync: string;
    batchDelay: string;
    sessionRestored: string;
    sessionExpired: string;
    voiceUnsupportedFallback: string;
    voiceErrorRetry: string;
    quickActions: string[];
    navToday: string;
    navExplore: string;
    navEntries: string;
    navSettings: string;
    settingsTitle: string;
    settingsFarmerID: string;
    settingsSave: string;
    settingsLang: string;
    settingsVoiceIn: string;
    settingsVoiceOut: string;
    settingsStorage: string;
    settingsVersion: string;
    settingsClearCache: string;
    settingsClearAll: string;
    resetApp: string;
    settingsConfirmClear: string;
    confirmYes: string;
    confirmNo: string;
    soilMoisture: string;
    cropRec: string;
    marketPrices: string;
    perKg: string;
    exploreTitle: string;
    exploreSubtitle: string;
    exploreAlertLabel: string;
    exploreTrendingLabel: string;
    exploreTipLabel: string;
    exploreMinRead: string;
    exploreReadMore: string;
    exploreCategories: string[];
    newChat: string;
    loading: string;
    diveBack: string;
    soilStatus: string[];
    online_status: string;
  };

  export function toLocalNum(n: number, lang: string): string;
}
