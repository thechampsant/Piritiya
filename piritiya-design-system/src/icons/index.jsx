// ─── PIRITIYA ICON SYSTEM ─────────────────────────────────────────────────────
// Self-contained SVG icons — no lucide-react or other icon library needed.
// All icons use stroke-based rendering for consistency.
//
// Usage:
//   import { Mic, Send, Wheat } from './icons';
//   <Mic size={24} color="#138808" />
//
// Props:
//   size        number   — width & height in px (default: 16)
//   color       string   — stroke color (default: "currentColor")
//   style       object   — additional inline styles
//   strokeWidth number   — stroke width (default: 1.75)

import React from "react";

const Icon = ({ d, size = 16, color = "currentColor", style = {}, strokeWidth = 1.75 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {Array.isArray(d)
      ? d.map((path, i) => <path key={i} d={path} />)
      : <path d={d} />}
  </svg>
);

// ─── VOICE / INPUT ────────────────────────────────────────────────────────────
export const Mic    = (p) => <Icon {...p} d={["M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z","M19 10v2a7 7 0 0 1-14 0v-2","M12 19v3","M8 22h8"]} />;
export const Send   = (p) => <Icon {...p} d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />;
export const Type   = (p) => <Icon {...p} d={["M4 7V4h16v3","M9 20h6","M12 4v16"]} />;
export const Volume2= (p) => <Icon {...p} d={["M11 5L6 9H2v6h4l5 4V5z","M19.07 4.93a10 10 0 0 1 0 14.14","M15.54 8.46a5 5 0 0 1 0 7.07"]} />;

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
export const ChevronLeft  = (p) => <Icon {...p} d="M15 18l-6-6 6-6" />;
export const ChevronRight = (p) => <Icon {...p} d="M9 18l6-6-6-6" />;
export const ArrowRight   = (p) => <Icon {...p} d={["M5 12h14","M12 5l7 7-7 7"]} />;
export const X            = (p) => <Icon {...p} d={["M18 6L6 18","M6 6l12 12"]} />;
export const Search       = (p) => <Icon {...p} d={["M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z","M21 21l-4.35-4.35"]} />;
export const Settings     = (p) => <Icon {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]} />;
export const Compass      = (p) => <Icon {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"]} />;
export const BookOpen     = (p) => <Icon {...p} d={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} />;

// ─── STATUS / FEEDBACK ────────────────────────────────────────────────────────
export const WifiOff      = (p) => <Icon {...p} d={["M1 1l22 22","M16.72 11.06A10.94 10.94 0 0 1 19 12.55","M5 12.55a10.94 10.94 0 0 1 5.17-2.39","M10.71 5.05A16 16 0 0 1 22.56 9","M1.42 9a15.91 15.91 0 0 1 4.7-2.88","M8.53 16.11a6 6 0 0 1 6.95 0","M12 20h.01"]} />;
export const RefreshCw    = (p) => <Icon {...p} d={["M23 4v6h-6","M1 20v-6h6","M3.51 9a9 9 0 0 1 14.85-3.36L23 10","M1 14l4.64 4.36A9 9 0 0 0 20.49 15"]} />;
export const Clock        = (p) => <Icon {...p} d={["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z","M12 6v6l4 2"]} />;
export const AlertTriangle= (p) => <Icon {...p} d={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"]} />;
export const Archive      = (p) => <Icon {...p} d={["M21 8v13H3V8","M1 3h22v5H1z","M10 12h4"]} />;
export const RotateCcw    = (p) => <Icon {...p} d={["M1 4v6h6","M3.51 15a9 9 0 1 0 .49-4.49"]} />;
export const Check        = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
export const Sparkles     = (p) => <Icon {...p} d={["M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z","M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z","M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75z"]} />;

// ─── FARMING / CONTENT ───────────────────────────────────────────────────────
export const Wheat        = (p) => <Icon {...p} d={["M2 22L16 8","M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z","M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z","M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94z","M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4z"]} />;
export const Leaf         = (p) => <Icon {...p} d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 0 0 4 21C8 21 17 21 21 12.5 21 8.5 17 5 12 3 12 3 17 6 17 8z" />;
export const Sprout       = (p) => <Icon {...p} d={["M7 20h10","M10 20c5.5-2.5 4-6 4-6","M3.5 4S5.5 5 5 8s5 8 5 8"]} />;
export const CloudRain    = (p) => <Icon {...p} d={["M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25","M8 19v2","M8 13v2","M16 19v2","M16 13v2","M12 21v2","M12 15v2"]} />;
export const Bug          = (p) => <Icon {...p} d={["M8 2l1.88 1.88","M14.12 3.88 16 2","M9 7.13v-1a3.003 3.003 0 1 1 6 0v1","M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z","M12 20v-9","M6.53 9C4.6 8.8 3 7.1 3 5","M6 13H2","M3 21c0-3 1.5-6 3-8","M17.47 9c1.93-.2 3.53-1.9 3.53-4","M18 13h4","M21 21c0-3-1.5-6-3-8"]} />;
export const TrendingUp   = (p) => <Icon {...p} d={["M23 6l-9.5 9.5-5-5L1 18","M17 6h6v6"]} />;
export const FileText     = (p) => <Icon {...p} d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]} />;

// ─── BRAND ────────────────────────────────────────────────────────────────────
// Piritiya seedling brand mark
export const PiritiyaMark = ({ size = 28, color = "#138808" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Stem */}
    <line x1="16" y1="28" x2="16" y2="10" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    {/* Left leaf */}
    <path d="M16 18 Q10 14 8 8 Q13 9 16 14" fill={color} opacity="0.9" />
    {/* Right leaf */}
    <path d="M16 15 Q22 11 24 5 Q19 6 16 11" fill={color} opacity="0.9" />
    {/* Soil curve */}
    <path d="M8 28 Q16 24 24 28" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
  </svg>
);

// ProgrammingInsect team beetle mascot
export const Beetle = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="23" rx="8" ry="10" fill="#4ade80" opacity="0.9"/>
    <circle cx="20" cy="12" r="5" fill="#4ade80" opacity="0.9"/>
    <line x1="20" y1="13" x2="20" y2="33" stroke="#166534" strokeWidth="1.2" opacity="0.6"/>
    <circle cx="17" cy="20" r="1.5" fill="#166534" opacity="0.5"/>
    <circle cx="23" cy="20" r="1.5" fill="#166534" opacity="0.5"/>
    <circle cx="17" cy="26" r="1.5" fill="#166534" opacity="0.5"/>
    <circle cx="23" cy="26" r="1.5" fill="#166534" opacity="0.5"/>
    <path d="M17 8 Q13 3 10 2" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
    <path d="M23 8 Q27 3 30 2" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
    <path d="M12 20 Q7 18 5 16" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <path d="M12 24 Q7 24 4 22" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <path d="M12 28 Q7 30 5 33" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <path d="M28 20 Q33 18 35 16" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <path d="M28 24 Q33 24 36 22" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <path d="M28 28 Q33 30 35 33" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
    <circle cx="17.5" cy="11" r="1.2" fill="#0f1a14"/>
    <circle cx="22.5" cy="11" r="1.2" fill="#0f1a14"/>
  </svg>
);
