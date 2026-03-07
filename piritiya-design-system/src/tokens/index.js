// ─── PIRITIYA DESIGN TOKENS ───────────────────────────────────────────────────
// Single source of truth for all design values.
// Import: import { colors, typography, spacing, animation, radii } from './tokens';

// ─── COLORS ───────────────────────────────────────────────────────────────────
export const colors = {

  // Background layers
  bg: {
    base:       "#f5f0e8",   // Warm white — saffron tint, used as app base top
    mid:        "#eef4ee",   // Green tint mid
    surface:    "#f8f8f6",   // Near white bottom
    card:       "rgba(255,255,255,0.75)",  // Frosted card surface
    cardStrong: "rgba(255,255,255,0.92)",  // Solid card / modal
    overlay:    "rgba(0,0,0,0.5)",         // Modal backdrop
  },

  // Text hierarchy
  text: {
    primary:    "#1a2010",              // Near-black with green undertone
    secondary:  "rgba(20,30,16,0.6)",   // Mid text — labels, captions
    tertiary:   "rgba(20,30,16,0.4)",   // Muted — timestamps, hints
    placeholder:"rgba(0,0,0,0.3)",      // Input placeholders
    onDark:     "#ffffff",              // Text on dark/coloured surfaces
    onGreen:    "#ffffff",              // Text on green buttons
  },

  // Indian Tricolour — primary brand palette
  saffron: {
    default:  "#FF9933",
    light:    "rgba(255,153,51,0.18)",  // Blob / ambient wash
    muted:    "rgba(255,153,51,0.08)",  // Surface tint
  },
  green: {
    default:  "#138808",                // India flag green — primary action
    dark:     "#0f6606",                // Pressed state
    light:    "rgba(19,136,8,0.14)",    // Blob / ambient wash
    muted:    "rgba(19,136,8,0.08)",    // Surface tint
    subtle:   "rgba(19,136,8,0.1)",     // Subtle highlight
  },
  navy: {
    default:  "#000080",                // Ashoka Chakra navy — mic icon, info
    light:    "rgba(0,0,128,0.07)",     // Surface tint
    muted:    "rgba(0,0,128,0.15)",     // Border
  },

  // Semantic / status
  status: {
    success:  "#4ade80",
    warning:  "#fbbf24",
    error:    "#f87171",
    info:     "#60a5fa",
    pest:     "#a78bfa",
    tip:      "#34d399",
  },

  // Borders
  border: {
    light:    "rgba(0,0,0,0.07)",
    default:  "rgba(0,0,0,0.1)",
    strong:   "rgba(0,0,0,0.16)",
    focus:    "#138808",
  },

  // Specific component colours
  orb: {
    idle:     "linear-gradient(180deg, rgba(255,153,51,0.75) 0%, rgba(255,255,255,0.85) 48%, rgba(19,136,8,0.7) 100%)",
    active:   "linear-gradient(180deg, rgba(255,153,51,0.95) 0%, rgba(255,255,255,0.95) 48%, rgba(19,136,8,0.9) 100%)",
    shadowIdle:   "0 0 0 1px rgba(255,153,51,0.2), 0 4px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5)",
    shadowActive: "0 0 0 2px rgba(255,153,51,0.4), 0 8px 40px rgba(255,153,51,0.3), 0 8px 40px rgba(19,136,8,0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
  },
};

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────────
export const typography = {
  fonts: {
    serif:  "'Lora', Georgia, serif",
    sans:   "'DM Sans', system-ui, -apple-system, sans-serif",
    // Indian script fonts (load via Google Fonts)
    noto:   "'Noto Sans', sans-serif",
    // Per-language
    hi:     "'Noto Sans Devanagari', sans-serif",
    bn:     "'Noto Sans Bengali', sans-serif",
    gu:     "'Noto Sans Gujarati', sans-serif",
    kn:     "'Noto Sans Kannada', sans-serif",
    ml:     "'Noto Sans Malayalam', sans-serif",
    ta:     "'Noto Sans Tamil', sans-serif",
    te:     "'Noto Sans Telugu', sans-serif",
  },

  // Font sizes
  size: {
    xs:   "10px",
    sm:   "11px",
    base: "13px",
    md:   "14px",
    lg:   "15px",
    xl:   "16px",
    "2xl":"18px",
    "3xl":"22px",
    "4xl":"28px",
    hero: "36px",
  },

  // Font weights
  weight: {
    light:   300,
    regular: 400,
    medium:  500,
    semibold:600,
  },

  // Line heights
  leading: {
    tight:  1.25,
    snug:   1.35,
    normal: 1.5,
    relaxed:1.65,
  },

  // Letter spacing
  tracking: {
    tight:  "-0.3px",
    normal: "0px",
    wide:   "0.5px",
    wider:  "0.8px",
    widest: "1.2px",
  },
};

// ─── SPACING ─────────────────────────────────────────────────────────────────
export const spacing = {
  "0":  "0px",
  "1":  "4px",
  "2":  "8px",
  "3":  "10px",
  "4":  "12px",
  "5":  "14px",
  "6":  "16px",
  "7":  "20px",
  "8":  "24px",
  "9":  "28px",
  "10": "32px",
  "12": "40px",
  "16": "56px",
  // Named aliases
  screenPadding: "20px",
  cardPadding:   "18px",
  sectionGap:    "10px",
};

// ─── BORDER RADII ────────────────────────────────────────────────────────────
export const radii = {
  sm:    "8px",
  md:    "12px",
  lg:    "16px",
  xl:    "18px",
  "2xl": "20px",
  "3xl": "24px",
  full:  "100px",   // Pills
  round: "50%",     // Circles
};

// ─── SHADOWS ─────────────────────────────────────────────────────────────────
export const shadows = {
  sm:   "0 1px 6px rgba(0,0,0,0.06)",
  md:   "0 2px 12px rgba(0,0,0,0.06)",
  lg:   "0 4px 24px rgba(0,0,0,0.08)",
  card: "0 2px 12px rgba(0,0,0,0.06)",
};

// ─── ANIMATION ───────────────────────────────────────────────────────────────
export const animation = {
  duration: {
    fast:   "0.15s",
    base:   "0.25s",
    slow:   "0.4s",
    slower: "0.7s",
  },
  easing: {
    default: "ease",
    spring:  "cubic-bezier(0.32, 0.72, 0, 1)",   // Bottom sheet slide
    bounce:  "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  // Keyframes (paste into global CSS / styled-components)
  keyframes: `
    @keyframes fadeUp    { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
    @keyframes fadePulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }
    @keyframes blob1     { 0%,100% { transform:translate(0,0) }     50% { transform:translate(15px,-20px) } }
    @keyframes blob2     { 0%,100% { transform:translate(0,0) }     50% { transform:translate(-20px,15px) } }
    @keyframes blob3     { 0%,100% { transform:translate(0,0) }     50% { transform:translate(-12px,22px) } }
    @keyframes orbIdle   { 0%,100% { transform:scale(1) }           50% { transform:scale(1.04) } }
    @keyframes orbBreath { 0%,100% { transform:scale(1) }           50% { transform:scale(1.08) } }
    @keyframes orbIdleRing { 0%,100% { transform:scale(1); opacity:0.5 } 50% { transform:scale(1.08); opacity:0.15 } }
    @keyframes orbRipple { 0% { transform:scale(0.85); opacity:0.6 } 100% { transform:scale(1.7); opacity:0 } }
    @keyframes slideUp   { from { transform:translateY(100%); opacity:0 } to { transform:translateY(0); opacity:1 } }
    @keyframes beetleWiggle { 0%,100% { transform:rotate(-8deg) } 25% { transform:rotate(8deg) } 50% { transform:rotate(-5deg) } 75% { transform:rotate(5deg) } }
  `,
};

// ─── BREAKPOINTS ─────────────────────────────────────────────────────────────
export const breakpoints = {
  mobile:  "390px",   // iPhone 14 Pro — primary target
  tablet:  "768px",
  desktop: "1024px",
};

// ─── Z-INDEX ─────────────────────────────────────────────────────────────────
export const zIndex = {
  bg:       0,
  content:  2,
  header:   3,
  input:    5,
  nav:      10,
  sheet:    50,
  modal:    60,
};

// ─── GOOGLE FONTS URL ────────────────────────────────────────────────────────
export const googleFontsUrl =
  "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&family=Noto+Sans+Devanagari:wght@400;500&family=Noto+Sans+Bengali:wght@400;500&family=Noto+Sans+Gujarati:wght@400;500&family=Noto+Sans+Kannada:wght@400;500&family=Noto+Sans+Malayalam:wght@400;500&family=Noto+Sans+Tamil:wght@400;500&family=Noto+Sans+Telugu:wght@400;500&display=swap";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
// CSS reset and base styles to be injected into the document
export const globalStyles = `
  /* Box sizing reset */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* Remove default margins */
  * {
    margin: 0;
    padding: 0;
  }

  /* Body defaults */
  body {
    font-family: ${typography.fonts.sans};
    font-size: ${typography.size.base};
    line-height: ${typography.leading.normal};
    color: ${colors.text.primary};
    background: ${colors.bg.base};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Headings use serif font */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${typography.fonts.serif};
    font-weight: ${typography.weight.semibold};
  }

  /* Animation keyframes */
  ${animation.keyframes}

  /* Utility classes for animations */
  .animate-fadeUp {
    animation: fadeUp ${animation.duration.slow} ${animation.easing.default};
  }

  .animate-slideUp {
    animation: slideUp ${animation.duration.slow} ${animation.easing.spring};
  }

  .animate-pulse {
    animation: fadePulse 4s ${animation.easing.default} infinite;
  }

  .animate-orbIdle {
    animation: orbIdle 4s ${animation.easing.default} infinite;
  }

  .animate-orbBreath {
    animation: orbBreath 2s ${animation.easing.default} infinite;
  }
`;
