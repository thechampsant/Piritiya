// ─── PIRITIYA UI COMPONENTS ───────────────────────────────────────────────────
// All shared components used across screens.
// Each component is self-contained with inline styles using design tokens.
//
// Usage:
//   import { VoiceOrb, ToggleSwitch, PillChip, AmbientBg } from './components';

import React from "react";
import { colors, radii, shadows, typography, spacing, animation } from "../tokens";
import { Mic, Check, Clock, WifiOff } from "../icons";
import { LANGUAGES } from "../tokens/i18n";

// ─── AMBIENT BACKGROUND ───────────────────────────────────────────────────────
// Soft radial gradient blobs. Renders behind all screen content (zIndex: 0).
// The blobs animate continuously using blob1/blob2/blob3 keyframes.
export const AmbientBg = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
    <div style={{ position:"absolute", width:"260px", height:"260px", borderRadius:"50%",
      background:"radial-gradient(circle, rgba(255,153,51,0.18) 0%, transparent 70%)",
      filter:"blur(50px)", top:"-60px", left:"-60px", animation:"blob1 9s ease-in-out infinite" }} />
    <div style={{ position:"absolute", width:"240px", height:"240px", borderRadius:"50%",
      background:"radial-gradient(circle, rgba(19,136,8,0.14) 0%, transparent 70%)",
      filter:"blur(45px)", bottom:"5%", right:"-50px", animation:"blob2 11s ease-in-out infinite" }} />
    <div style={{ position:"absolute", width:"200px", height:"200px", borderRadius:"50%",
      background:"radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)",
      filter:"blur(35px)", top:"40%", left:"20%", animation:"blob3 7s ease-in-out infinite" }} />
  </div>
);

// ─── VOICE ORB ────────────────────────────────────────────────────────────────
// The central voice input button. Renders the tricolour orb with ripple rings
// when listening and idle pulse when not.
//
// Props:
//   isListening  boolean  — active recording state
//   onPress      function — tap handler
//   size         number   — orb diameter in px (default: 72)
export const VoiceOrb = ({ isListening = false, onPress, size = 72 }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {/* Ripple rings — listening state */}
    {isListening && [1, 2, 3].map(i => (
      <div key={i} style={{
        position: "absolute",
        width: `${size + i * 28}px`, height: `${size + i * 28}px`,
        borderRadius: "50%",
        border: "1px solid rgba(255,153,51,0.25)",
        animation: `orbRipple 2s ease-out ${i * 0.5}s infinite`,
        pointerEvents: "none",
      }} />
    ))}
    {/* Idle ring */}
    {!isListening && (
      <div style={{
        position: "absolute",
        width: `${size + 24}px`, height: `${size + 24}px`,
        borderRadius: "50%",
        border: "1px solid rgba(255,153,51,0.15)",
        animation: "orbIdleRing 3s ease-in-out infinite",
        pointerEvents: "none",
      }} />
    )}
    {/* Orb button */}
    <button
      onClick={onPress}
      style={{
        width: `${size}px`, height: `${size}px`,
        borderRadius: "50%", border: "none",
        cursor: "pointer", position: "relative", overflow: "hidden",
        background: isListening ? colors.orb.active : colors.orb.idle,
        boxShadow: isListening ? colors.orb.shadowActive : colors.orb.shadowIdle,
        animation: isListening ? "orbBreath 1.6s ease-in-out infinite" : "orbIdle 4s ease-in-out infinite",
        transition: "box-shadow 0.4s ease, background 0.4s ease",
      }}
    >
      {/* Inner highlight shimmer */}
      <div style={{
        position: "absolute", top: "12px", left: "16px",
        width: "22px", height: "12px", borderRadius: "50%",
        background: "rgba(255,255,255,0.35)",
        filter: "blur(4px)",
        transform: "rotate(-20deg)",
      }} />
      {/* Mic icon — Ashoka Chakra navy, fades on listen */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: isListening ? 0 : 0.8,
        transition: "opacity 0.3s ease",
      }}>
        <Mic size={Math.round(size * 0.36)} color="#000080" />
      </div>
    </button>
  </div>
);

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────
// iOS-style toggle for boolean settings.
//
// Props:
//   value    boolean  — current state
//   onChange function — called with new boolean value
export const ToggleSwitch = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: "44px", height: "26px", borderRadius: "13px",
      background: value ? colors.green.default : "rgba(0,0,0,0.12)",
      border: "none", padding: 0,
      cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0,
    }}
  >
    <div style={{
      position: "absolute", top: "3px", left: value ? "20px" : "3px",
      width: "18px", height: "18px", borderRadius: "50%",
      background: "white",
      transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    }} />
  </button>
);

// ─── PILL CHIP ────────────────────────────────────────────────────────────────
// Frosted pill button for quick actions and filter tabs.
//
// Props:
//   label    string   — display text
//   active   boolean  — highlighted state (optional)
//   onPress  function — tap handler
export const PillChip = ({ label, active = false, onPress }) => (
  <button
    onClick={onPress}
    style={{
      flexShrink: 0, padding: "10px 16px",
      background: active ? colors.green.default : colors.bg.card,
      backdropFilter: "blur(8px)",
      border: `1px solid ${active ? "transparent" : colors.border.default}`,
      borderRadius: radii.full,
      color: active ? "white" : colors.text.primary,
      fontSize: typography.size.base,
      cursor: "pointer",
      whiteSpace: "nowrap", minHeight: "44px",
      boxShadow: shadows.sm,
      transition: "all 0.2s",
    }}
  >{label}</button>
);

// ─── FROSTED CARD ─────────────────────────────────────────────────────────────
// Base card surface. Wrap any content.
//
// Props:
//   children   ReactNode
//   style      object     — override styles
//   accentColor string    — left border accent (optional)
export const FrostedCard = ({ children, style = {}, accentColor }) => (
  <div style={{
    background: colors.bg.card,
    backdropFilter: "blur(12px)",
    borderRadius: radii["2xl"],
    padding: spacing.cardPadding,
    border: `1px solid ${colors.border.light}`,
    boxShadow: shadows.card,
    borderLeft: accentColor ? `3px solid ${accentColor}` : undefined,
    ...style,
  }}>
    {children}
  </div>
);

// ─── SETTING ROW ─────────────────────────────────────────────────────────────
// A single row inside a settings section with label on left, control on right.
//
// Props:
//   label    string    — row label
//   children ReactNode — right-side control (toggle, value, etc.)
export const SettingRow = ({ label, children }) => (
  <div style={{
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px", minHeight: "54px", gap: "12px",
  }}>
    <span style={{ color: colors.text.primary, fontSize: typography.size.md }}>{label}</span>
    {children}
  </div>
);

// ─── SETTING SECTION ─────────────────────────────────────────────────────────
// Groups SettingRows with a frosted card surface.
//
// Props:
//   children ReactNode
//   danger   boolean   — red-tinted danger zone style
export const SettingSection = ({ children, danger = false }) => (
  <div style={{
    background: danger ? "rgba(248,113,113,0.05)" : colors.bg.card,
    borderRadius: radii.lg,
    border: `1px solid ${danger ? "rgba(248,113,113,0.15)" : colors.border.light}`,
    overflow: "hidden",
  }}>
    {children}
  </div>
);

// ─── LANG TOGGLE ─────────────────────────────────────────────────────────────
// Small pill showing current language script. Opens LangSheet on press.
//
// Props:
//   lang        string   — current language code e.g. "hi"
//   onPress     function — opens the language bottom sheet
export const LangToggle = ({ lang = "hi", onPress }) => {
  const current = LANGUAGES.find(l => l.short === lang) || LANGUAGES[0];
  return (
    <button onClick={onPress} style={{
      background: "rgba(0,0,0,0.06)", border: `1px solid ${colors.border.default}`,
      borderRadius: radii.full, padding: "5px 12px", cursor: "pointer",
      display: "flex", alignItems: "center", gap: "6px", minHeight: "36px",
      transition: "background 0.2s",
    }}>
      <span style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: 500 }}>
        {current.script}
      </span>
      <span style={{ color: colors.text.tertiary, fontSize: typography.size.xs }}>▾</span>
    </button>
  );
};

// ─── STATUS PILL ─────────────────────────────────────────────────────────────
// Online / Offline status indicator. Tap to toggle (demo only).
//
// Props:
//   isOnline  boolean
//   onPress   function
export const StatusPill = ({ isOnline, onPress }) => (
  <button onClick={onPress} style={{
    display: "flex", alignItems: "center", gap: "5px",
    background: "rgba(0,0,0,0.06)", border: `1px solid ${colors.border.default}`,
    borderRadius: radii.full, padding: "4px 10px",
    cursor: "pointer", minHeight: "32px",
  }}>
    {!isOnline && <WifiOff size={11} color={colors.status.warning} />}
    <div style={{
      width: "6px", height: "6px", borderRadius: "50%",
      background: isOnline ? colors.green.default : colors.status.warning,
    }} />
    <span style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>
      {isOnline ? "Online" : "Offline"}
    </span>
  </button>
);

// ─── SOIL GAUGE ───────────────────────────────────────────────────────────────
// Semicircle gauge for soil moisture. Used inside chat bot responses.
//
// Props:
//   moisture  number    — 0–100
//   status    number    — 0=dry, 1=low, 2=optimal, 3=waterlogged
//   label     string    — "Soil Moisture" or localised equivalent
//   statusLabels string[] — ["Too dry","Low","Optimal","Waterlogged"] or localised
export const SoilGauge = ({ moisture = 65, status = 2, label = "Soil Moisture", statusLabels }) => {
  const angle = (moisture / 100) * 180 - 90;
  const statusColors = [colors.status.error, colors.status.warning, colors.status.success, colors.status.info];
  const color = statusColors[status];
  const labels = statusLabels || ["Too dry", "Low", "Optimal", "Waterlogged"];
  return (
    <FrostedCard>
      <p style={{ color: colors.text.secondary, fontSize: typography.size.xs, letterSpacing: typography.tracking.widest, textTransform: "uppercase", marginBottom: "14px" }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative", width: "80px", height: "50px" }}>
          <svg viewBox="0 0 80 50" width="80" height="50">
            <path d="M 8 46 A 32 32 0 0 1 72 46" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="6" strokeLinecap="round" />
            <path d="M 8 46 A 32 32 0 0 1 72 46" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${moisture * 1.005} 100.5`} style={{ transition: "all 1s ease" }} />
            <line x1="40" y1="46"
              x2={40 + 28 * Math.cos((angle * Math.PI) / 180)}
              y2={46 + 28 * Math.sin((angle * Math.PI) / 180)}
              stroke={colors.text.primary} strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 1s ease" }} />
            <circle cx="40" cy="46" r="4" fill={colors.text.primary} />
          </svg>
        </div>
        <div>
          <p style={{ color: colors.text.primary, fontSize: "32px", fontFamily: typography.fonts.serif, fontWeight: 600, lineHeight: 1 }}>{moisture}%</p>
          <p style={{ color, fontSize: typography.size.sm, marginTop: "4px" }}>{labels[status]}</p>
        </div>
      </div>
    </FrostedCard>
  );
};

// ─── AWS BADGE ────────────────────────────────────────────────────────────────
// "Powered by AWS" badge for onboarding and settings footer.
export const AWSBadge = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <span style={{ color: "rgba(0,0,0,0.3)", fontSize: typography.size.xs, letterSpacing: typography.tracking.wider, textTransform: "uppercase" }}>Powered by</span>
    <svg width="28" height="17" viewBox="0 0 57 34" fill="none" opacity="0.6">
      <path d="M16.6 12.3c0 .8.1 1.4.2 1.9.2.4.4.9.7 1.4.1.2.2.4.2.5 0 .2-.1.4-.4.6l-1.3.9c-.2.1-.4.2-.5.2-.2 0-.4-.1-.6-.3-.3-.3-.5-.6-.7-1-.2-.4-.4-.8-.6-1.3-1.5 1.8-3.4 2.7-5.7 2.7-1.6 0-2.9-.5-3.8-1.4-.9-.9-1.4-2.2-1.4-3.7 0-1.6.6-2.9 1.7-3.9 1.1-.9 2.6-1.4 4.4-1.4.6 0 1.2.1 1.9.2.7.1 1.4.3 2.1.5V8c0-1.4-.3-2.4-.9-3-.6-.6-1.6-.9-3-.9-.6 0-1.3.1-2 .3-.7.2-1.3.4-2 .7-.3.1-.5.2-.6.2-.2 0-.2-.2-.2-.4V3.7c0-.3 0-.5.1-.6.1-.1.3-.3.6-.4.7-.3 1.5-.6 2.4-.8.9-.2 1.9-.3 2.9-.3 2.2 0 3.8.5 4.9 1.5 1 1 1.5 2.5 1.5 4.5v5.7h.1zm-7.9 3c.6 0 1.2-.1 1.9-.4.6-.2 1.2-.7 1.6-1.3.3-.4.5-.8.6-1.3.1-.5.2-1.1.2-1.8v-.9c-.5-.1-1.1-.2-1.7-.3-.6-.1-1.2-.1-1.7-.1-1.2 0-2.1.2-2.7.7-.6.5-.9 1.2-.9 2.1 0 .9.2 1.5.7 1.9.4.4 1.1.6 2 .6zm14.6 2c-.3 0-.5-.1-.6-.2-.1-.1-.3-.4-.4-.8L18.5 2.6c-.1-.4-.2-.7-.2-.9 0-.3.2-.5.5-.5h2c.3 0 .5.1.6.2.1.1.3.4.4.8l3 11.8 2.8-11.8c.1-.4.2-.7.4-.8.2-.1.4-.2.7-.2h1.6c.3 0 .5.1.7.2.2.1.3.4.4.8l2.8 11.9L36.3 2.2c.1-.4.3-.7.4-.8.2-.1.4-.2.6-.2H40c.3 0 .5.2.5.5 0 .1 0 .2-.1.4 0 .1-.1.3-.1.5L36 17.3c-.1.4-.3.7-.4.8-.2.1-.4.2-.6.2h-1.7c-.3 0-.5-.1-.7-.2-.2-.1-.3-.4-.4-.8l-2.8-11.6-2.7 11.6c-.1.4-.3.7-.4.8-.2.1-.4.2-.7.2h-1.5zm22.1.5c-1 0-2-.1-2.9-.4-.9-.3-1.7-.6-2.2-1-.3-.2-.5-.4-.5-.6-.1-.2-.1-.4-.1-.6V14c0-.3.1-.4.3-.4.1 0 .3.1.5.2.6.3 1.3.6 2 .8.8.2 1.5.3 2.3.3 1.2 0 2.2-.2 2.8-.6.7-.4 1-.9 1-1.6 0-.5-.2-.9-.5-1.2-.3-.3-1-.6-2-1l-2.8-.9c-1.4-.4-2.4-1.1-3.1-1.9-.7-.8-1-1.8-1-2.8 0-.8.2-1.5.6-2.2.4-.6.9-1.2 1.5-1.6.6-.4 1.3-.8 2.1-1 .8-.2 1.7-.3 2.6-.3.5 0 .9 0 1.4.1.5.1.9.2 1.3.3.4.1.8.2 1.1.4.3.1.6.3.7.4.2.1.3.3.4.4.1.2.1.4.1.6v1c0 .3-.1.5-.3.5-.1 0-.3-.1-.6-.2-.9-.4-2-.6-3.2-.6-1.1 0-1.9.2-2.5.5-.6.3-.9.8-.9 1.5 0 .5.2.9.5 1.2.4.3 1.1.7 2.2 1l2.8.9c1.4.4 2.4 1.1 3 1.9.6.8.9 1.7.9 2.7 0 .8-.2 1.6-.5 2.2-.4.7-.9 1.3-1.5 1.7-.7.5-1.4.8-2.3 1.1-.9.3-1.9.4-3 .4z" fill="#232f3e"/>
      <path d="M50.9 27.4C45 31.5 36.5 33.7 29.1 33.7c-10.5 0-20-3.9-27.1-10.3-.6-.5-.1-1.2.6-.8 7.7 4.5 17.2 7.2 27.1 7.2 6.6 0 13.9-1.4 20.6-4.2 1-.5 1.8.7.6 1.8z" fill="#FF9900"/>
      <path d="M53.3 24.6c-.8-1-5.1-.5-7-.2-.6.1-.7-.4-.2-.8 3.5-2.4 9.2-1.7 9.8-.9.7.8-.2 6.5-3.4 9.2-.5.4-1 .2-.8-.4.8-1.8 2.4-5.9 1.6-6.9z" fill="#FF9900"/>
    </svg>
  </div>
);

// ─── TEAM BADGE ───────────────────────────────────────────────────────────────
// ProgrammingInsect team branding with animated beetle.
//
// Props:
//   compact  boolean — smaller size for tight spaces (settings footer)
export const TeamBadge = ({ compact = false }) => {
  // Inline beetle SVG to avoid circular dependency
  const BeetleIcon = ({ size }) => (
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
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? "6px" : "8px" }}>
      <div style={{ animation: "beetleWiggle 3s ease-in-out infinite" }}>
        <BeetleIcon size={compact ? 18 : 22} />
      </div>
      <span style={{
        color: "rgba(0,0,0,0.4)",
        fontSize: compact ? typography.size.xs : "10px",
        letterSpacing: typography.tracking.wide,
        fontFamily: typography.fonts.sans,
        fontWeight: 500,
      }}>ProgrammingInsect</span>
    </div>
  );
};

// ─── GLOBAL STYLES STRING ────────────────────────────────────────────────────
// Inject into a <style> tag or CSS-in-JS global styles.
export const globalStyles = `
  ${animation.keyframes}
  input::placeholder { color: rgba(0,0,0,0.3); }
  ::-webkit-scrollbar { display: none; }
  button { font-family: '${typography.fonts.sans}'; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
`;
