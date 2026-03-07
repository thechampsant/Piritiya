# Piritiya — Design System
**Team:** ProgrammingInsect | **Hackathon:** AWS Sponsored

---

## Quick Start in Kiro

```bash
# Install dependencies
npm install react react-dom

# Google Fonts — add to index.html <head>
# See googleFontsUrl in src/tokens/index.js for the full URL
```

### File Structure

```
src/
  tokens/
    index.js       ← All design tokens (colors, type, spacing, animation)
    i18n.js        ← 8 languages, translations, AWS capability flags
  icons/
    index.jsx      ← All SVG icons, PiritiyaMark, Beetle mascot
  components/
    index.jsx      ← All reusable UI components
  screens/
    OnboardScreen.jsx
    HomeScreen.jsx
    ChatScreen.jsx
    ExploreScreen.jsx
    SettingsScreen.jsx
```

### Imports

```js
// Tokens
import { colors, typography, spacing, radii, shadows, animation, zIndex } from './tokens';

// Translations
import { LANGUAGES, getTranslation, toLocalNum } from './tokens/i18n';

// Icons
import { Mic, Send, Wheat, Leaf, CloudRain, TrendingUp, Bug,
         WifiOff, RefreshCw, Clock, AlertTriangle, Settings,
         Compass, BookOpen, FileText, ArrowRight, ChevronLeft,
         ChevronRight, Check, X, Search, RotateCcw, Sparkles,
         PiritiyaMark, Beetle } from './icons';

// Components
import { VoiceOrb, ToggleSwitch, PillChip, FrostedCard, AmbientBg,
         SettingRow, SettingSection, LangToggle, StatusPill,
         SoilGauge, AWSBadge, TeamBadge, globalStyles } from './components';
```

---

## Colour System

### Base Palette

| Token | Value | Usage |
|-------|-------|-------|
| `colors.bg.base` | `#f5f0e8` | App background top (saffron-warm) |
| `colors.bg.mid` | `#eef4ee` | App background mid (green tint) |
| `colors.bg.surface` | `#f8f8f6` | App background bottom |
| `colors.bg.card` | `rgba(255,255,255,0.75)` | Card surfaces, frosted glass |
| `colors.bg.cardStrong` | `rgba(255,255,255,0.92)` | Modals, solid surfaces |
| `colors.text.primary` | `#1a2010` | All body text |
| `colors.text.secondary` | `rgba(20,30,16,0.6)` | Labels, subtitles |
| `colors.text.tertiary` | `rgba(20,30,16,0.4)` | Timestamps, hints |

### Indian Tricolour (Brand)

| Token | Value | Usage |
|-------|-------|-------|
| `colors.saffron.default` | `#FF9933` | Top ambient blob |
| `colors.green.default` | `#138808` | Primary actions, CTA buttons, nav active, toggles |
| `colors.navy.default` | `#000080` | Mic icon inside orb (Ashoka Chakra navy) |

### Semantic Status

| Token | Value | Usage |
|-------|-------|-------|
| `colors.status.success` | `#4ade80` | Soil optimal, success states |
| `colors.status.warning` | `#fbbf24` | Offline, batch language warning |
| `colors.status.error` | `#f87171` | Errors, failed sync, danger zone |
| `colors.status.info` | `#60a5fa` | Cache hit, info banners |
| `colors.status.pest` | `#a78bfa` | Pest category, session expired |
| `colors.status.tip` | `#34d399` | Soil tip category |

---

## Typography

### Fonts

```js
// Serif — display headings, editorial prompts, chat responses
fontFamily: typography.fonts.serif   // 'Lora', Georgia, serif

// Sans — all UI text, labels, buttons
fontFamily: typography.fonts.sans    // 'DM Sans', system-ui, sans-serif

// Indian scripts — auto-select via LANGUAGES array
fontFamily: typography.fonts.hi      // Noto Sans Devanagari
fontFamily: typography.fonts.bn      // Noto Sans Bengali
// ... etc for gu, kn, ml, ta, te
```

### Scale

| Token | Size | Usage |
|-------|------|-------|
| `typography.size.xs` | 10px | Timestamps, tags, badges |
| `typography.size.sm` | 11px | Secondary labels |
| `typography.size.base` | 13px | Body text, chips |
| `typography.size.md` | 14px | Settings labels |
| `typography.size.lg` | 15px | Chat messages |
| `typography.size.xl` | 16px | Input text, primary body |
| `typography.size["2xl"]` | 18px | Screen titles |
| `typography.size["3xl"]` | 22px | Explore title |
| `typography.size.hero` | 36px | Onboard headline |

---

## Components Reference

### `<VoiceOrb>`

The centrepiece voice input button.

```jsx
<VoiceOrb
  isListening={isListening}   // boolean
  onPress={handleToggle}      // function
  size={72}                   // number (px diameter)
/>
```

**Visual states:**
- Idle: tricolour gradient (saffron→white→green), slow pulse, single halo ring
- Listening: brightens, box shadow glows saffron+green, 3 ripple rings, mic fades out

### `<ToggleSwitch>`

```jsx
<ToggleSwitch
  value={voiceInEnabled}      // boolean
  onChange={setVoiceInEnabled} // (boolean) => void
/>
```

### `<PillChip>`

```jsx
<PillChip
  label="soil moisture"       // string
  active={false}              // boolean — green when active
  onPress={() => sendMsg()}   // function
/>
```

### `<FrostedCard>`

```jsx
<FrostedCard accentColor="#f87171">  {/* optional left border */}
  <p>Any content</p>
</FrostedCard>
```

### `<AmbientBg>`

Drop at the top of any screen div. Renders behind everything via `zIndex: 0`.

```jsx
<div style={{ position: "relative" }}>
  <AmbientBg />
  {/* screen content here */}
</div>
```

### `<SoilGauge>`

```jsx
<SoilGauge
  moisture={65}                      // 0–100
  status={2}                         // 0=dry 1=low 2=optimal 3=waterlogged
  label="Soil Moisture"
  statusLabels={["Too dry","Low","Optimal","Waterlogged"]}
/>
```

### `<LangToggle>`

```jsx
<LangToggle
  lang={lang}               // "hi" | "en" | "bn" | "gu" | "kn" | "ml" | "ta" | "te"
  onPress={() => setShowLangSheet(true)}
/>
```

### `<SettingSection>` + `<SettingRow>`

```jsx
<SettingSection>
  <SettingRow label="Voice Input">
    <ToggleSwitch value={val} onChange={setVal} />
  </SettingRow>
  <SettingRow label="Language">
    <LangToggle lang={lang} onPress={openSheet} />
  </SettingRow>
</SettingSection>

<SettingSection danger>
  <button>Clear All Data</button>
</SettingSection>
```

---

## Language System

### LANGUAGES Array

Each entry has:
```js
{
  code:          "hi-IN",    // AWS service code
  short:         "hi",       // app internal key
  script:        "हिन्दी",   // displayed in LangToggle + LangSheet
  roman:         "Hindi",    // secondary label in LangSheet
  instant:       true,       // false = batch delay warning shown
  polly:         true,       // AWS Polly TTS support
  transcribeRT:  true,       // AWS Transcribe real-time streaming support
}
```

### AWS Service Support

| Language | Transcribe RT | Transcribe Batch | Polly TTS |
|----------|:---:|:---:|:---:|
| Hindi `hi-IN` | ✅ | ✅ | ✅ Kajal (Neural) |
| English `en-IN` | ✅ | ✅ | ✅ Aditi (bilingual hi+en) |
| Bengali `bn-IN` | ❌ | ✅ | ❌ |
| Gujarati `gu-IN` | ❌ | ✅ | ❌ |
| Kannada `kn-IN` | ❌ | ✅ | ❌ |
| Malayalam `ml-IN` | ❌ | ✅ | ❌ |
| Tamil `ta-IN` | ❌ | ✅ | ❌ |
| Telugu `te-IN` | ❌ | ✅ | ❌ |

> **Note:** Non-hi/en languages need Google Cloud TTS or Azure Cognitive for voice output.

### Translation Hook

```js
import { getTranslation, toLocalNum } from './tokens/i18n';

const t = getTranslation(lang);   // falls back to English for unsupported langs
const display = toLocalNum(42, lang);  // "४२" in Hindi, "42" in others
```

---

## Screens & Navigation

### App State

```js
// Screen routing
const [screen, setScreen] = useState("onboard");
// "onboard" | "home" | "chat" | "explore" | "settings"

// Language
const [lang, setLang] = useState("hi");

// Voice
const [voiceInEnabled, setVoiceInEnabled] = useState(true);
const [voiceOutEnabled, setVoiceOutEnabled] = useState(true);
const [isListening, setIsListening] = useState(false);
const [isSpeaking, setIsSpeaking] = useState(false);
const [voiceError, setVoiceError] = useState(false);

// Connectivity
const [isOnline, setIsOnline] = useState(true);
const [isSyncing, setIsSyncing] = useState(false);
const [pendingCount, setPendingCount] = useState(0);
const [failedSyncCount, setFailedSyncCount] = useState(0);

// Session
const [farmerId, setFarmerId] = useState("");
const [sessionRestored, setSessionRestored] = useState(false);

// Chat
const [messages, setMessages] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [inputMode, setInputMode] = useState("voice"); // "voice" | "type"
const [inputText, setInputText] = useState("");
```

### Bottom Nav Items

```js
const navItems = [
  { id: "today",    icon: Wheat,    label: t.navToday,    screen: "home"     },
  { id: "explore",  icon: Compass,  label: t.navExplore,  screen: "explore"  },
  { id: "entries",  icon: BookOpen, label: t.navEntries,  screen: "entries"  },
  { id: "settings", icon: Settings, label: t.navSettings, screen: "settings" },
];
```

---

## Animation Reference

All keyframes are in `animation.keyframes`. Inject once at app root.

| Name | Usage |
|------|-------|
| `fadeUp` | Screen mounts, cards, toasts |
| `fadePulse` | "Listening…" text, syncing indicators |
| `blob1/2/3` | AmbientBg radial gradient movement |
| `orbIdle` | Voice orb slow scale pulse at rest |
| `orbBreath` | Voice orb breathing while listening |
| `orbIdleRing` | Outer halo ring scale+fade at rest |
| `orbRipple` | Ripple rings when actively listening |
| `slideUp` | LangSheet / bottom sheet entrance |
| `beetleWiggle` | ProgrammingInsect mascot rotation |

---

## App Shell

```jsx
// Minimum app wrapper — paste into App.jsx

import { googleFontsUrl, animation, colors, typography } from './tokens';
import { globalStyles } from './components';

export default function App() {
  return (
    <>
      <link rel="stylesheet" href={googleFontsUrl} />
      <style>{globalStyles}</style>
      <div style={{
        width: "100%", maxWidth: "390px", height: "100dvh",
        margin: "0 auto", position: "relative", overflow: "hidden",
        background: `linear-gradient(160deg, ${colors.bg.base} 0%, ${colors.bg.mid} 50%, ${colors.bg.surface} 100%)`,
        display: "flex", flexDirection: "column",
        fontFamily: typography.fonts.sans,
      }}>
        {/* Grain overlay */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.025, zIndex: 1, pointerEvents: "none",
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")"
        }} />

        {/* Route your screens here */}
      </div>
    </>
  );
}
```

---

## AWS Architecture Notes

| Service | Usage in Piritiya |
|---------|------------------|
| **Amazon Transcribe** | Voice-to-text. Real-time streaming for hi-IN + en-IN. Batch job for bn/gu/kn/ml/ta/te |
| **Amazon Polly** | Text-to-speech. Kajal (Neural) for Hindi, Aditi for English (bilingual) |
| **Amazon Translate** | Message translation — all 8 languages supported |
| **Amazon Bedrock / Claude** | LLM responses — crop/soil/market/weather queries |
| **Amazon S3** | Offline message queue persistence |
| **AWS Lambda** | API handler between frontend and Bedrock |
| **Amazon DynamoDB** | Farmer profiles, session history |

---

*Built by ProgrammingInsect · Powered by AWS*
