# Frontend Design Polish - Design Document

## Overview

This design document specifies the visual polish updates needed to align all frontend screens with the Piritiya design system. The design system is fully implemented at `piritiya-design-system/` with comprehensive tokens, components, icons, and animations. The frontend screens exist but require visual refinements to match the design system specifications.

### Goals

1. Apply consistent visual styling across all screens using design system tokens
2. Integrate design system components (VoiceOrb, FrostedCard, PillChip, etc.) with proper visual specifications
3. Implement smooth animations and transitions for enhanced user experience
4. Ensure proper spacing, typography, and color usage throughout
5. Add visual feedback for interactive elements (ripples, state changes, hover effects)
6. Polish micro-interactions and loading states

### Scope

This design covers visual updates to five main screens:
- OnboardScreen: First-time user onboarding
- HomeScreen: Voice-first home interface with VoiceOrb
- ChatScreen: Conversation view with message bubbles
- ExploreScreen: Content discovery with article cards
- SettingsScreen: Settings management interface

### Non-Goals

- Backend API changes
- New feature development
- Architectural refactoring
- Performance optimization (beyond visual rendering)

---

## Architecture

### Design System Integration

The design system follows a token-based architecture with three layers:

```
┌─────────────────────────────────────┐
│         Design Tokens               │
│  (colors, typography, spacing,      │
│   radii, shadows, animation)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Primitive Components           │
│  (VoiceOrb, PillChip, FrostedCard,  │
│   ToggleSwitch, etc.)               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│         Screen Components           │
│  (HomeScreen, ChatScreen, etc.)     │
└─────────────────────────────────────┘
```

### Visual Hierarchy

Each screen follows a consistent visual hierarchy:

1. **Background Layer** (z-index: 0): AmbientBg with animated gradient blobs
2. **Content Layer** (z-index: 1): Main screen content with proper spacing
3. **Overlay Layer** (z-index: 10): Input areas, fixed elements
4. **Modal Layer** (z-index: 1000): Modals, sheets, confirmations

### Animation Strategy

Animations are categorized by purpose:

- **Entrance animations**: `fadeUp` for screen mounts and card appearances
- **State transitions**: `fadePulse` for loading states
- **Interactive feedback**: `orbBreath`, `orbRipple` for voice input
- **Background ambience**: `blob1`, `blob2`, `blob3` for gradient movement
- **Micro-interactions**: Hover states, button presses, toggle switches

---

## Components and Interfaces

### 1. OnboardScreen Visual Updates

**Current State**: Basic onboarding with farmer ID input and language selection

**Design Updates**:

#### 1.1 Layout and Spacing
- Use `spacing.screenPadding` (16px) for horizontal margins
- Center content vertically with flexbox
- Add `spacing.xl` (32px) between major sections
- Ensure minimum touch target of 44px for all interactive elements

#### 1.2 Logo and Branding
```jsx
<PiritiyaMark 
  size={48}  // Increase from 36px for better visibility
  color={colors.green.default}  // #138808
/>
```

#### 1.3 Welcome Text Styling
```jsx
// Headline
fontFamily: typography.fonts.serif  // Lora
fontSize: typography.size.hero  // 36px
fontWeight: typography.weight.bold
color: colors.text.primary  // #1a2010
marginBottom: spacing['4']  // 16px

// Subtitle
fontFamily: typography.fonts.sans  // DM Sans
fontSize: typography.size.lg  // 15px
color: colors.text.secondary  // rgba(20,30,16,0.6)

```

#### 1.4 Farmer ID Input Field
```jsx
// Container
width: 100%
marginBottom: spacing.lg  // 24px

// Label
fontFamily: typography.fonts.sans
fontSize: typography.size.sm  // 11px
fontWeight: typography.weight.medium
color: colors.text.primary
marginBottom: spacing.xs  // 4px

// Input field
minHeight: 44px
padding: `${spacing.sm} ${spacing.md}`  // 8px 12px
fontFamily: typography.fonts.sans
fontSize: typography.size.md  // 14px
backgroundColor: rgba(255, 255, 255, 0.9)
border: 2px solid rgba(20, 30, 16, 0.1)
borderRadius: radii.md  // 8px
transition: border-color 0.2s ease

// Focus state
borderColor: colors.green.default  // #138808

// Error state
borderColor: colors.status.error  // #f87171
```

#### 1.5 Language Toggle Enhancement
- Use `<LangToggle>` component with proper styling
- Display current language with script and roman labels
- Add smooth transition on language change

#### 1.6 Get Started Button
```jsx
<PillChip
  label={language === 'hi' ? 'शुरू करें' : 'Get Started'}
  active={isValid}
  style={{
    width: '100%',
    minHeight: 44px,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
  }}
/>
```

#### 1.7 Footer Badges
```jsx
// Container
display: flex
flexDirection: column
alignItems: center
gap: spacing.md  // 12px
marginTop: spacing.xl  // 32px

// Badges
<TeamBadge />  // ProgrammingInsect branding
<AWSBadge />   // AWS Sponsored badge
```

#### 1.8 Entrance Animation
```jsx
// Apply to main content container
animation: `fadeUp ${animation.duration.base} ${animation.easing.default}`

// Keyframe (already in design system)
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 2. HomeScreen Visual Updates

**Current State**: Voice-first interface with VoiceOrb and quick actions

**Design Updates**:

#### 2.1 Status Pill Positioning
```jsx
// Container at top-right
position: absolute
top: spacing.screenPadding  // 16px
right: spacing.screenPadding
zIndex: 10

<StatusPill isOnline={appState.isOnline} />
```

#### 2.2 Greeting Text Enhancement
```jsx
// Headline
fontFamily: typography.fonts.serif  // Lora
fontSize: typography.size['3xl']  // 22px
fontWeight: typography.weight.semibold
color: colors.text.primary
marginBottom: spacing['2']  // 8px
textAlign: center

// Add subtle fade-in animation
animation: `fadeUp ${animation.duration.base} ${animation.easing.default}`
```

#### 2.3 VoiceOrb Visual Specifications

**Idle State**:
```jsx
<VoiceOrb
  size={72}
  isListening={false}
/>

// Visual properties (handled by component):
// - Tricolour gradient: saffron (#FF9933) → white → green (#138808)
// - Slow pulse animation (orbIdle keyframe)
// - Single halo ring with orbIdleRing animation
// - Navy mic icon (#000080) centered
// - Box shadow: shadows.md
```

**Listening State**:
```jsx
<VoiceOrb
  size={72}
  isListening={true}
/>

// Visual changes (handled by component):
// - Brightened gradient
// - Box shadow glows with saffron+green mix
// - 3 ripple rings with orbRipple animation
// - Mic icon fades out
// - Breathing animation (orbBreath keyframe)
```

#### 2.4 Listening Indicator
```jsx
// Text below VoiceOrb when listening
fontFamily: typography.fonts.sans
fontSize: typography.size.md  // 14px
color: colors.text.secondary
marginBottom: spacing['6']  // 24px
animation: `fadePulse ${animation.duration.slow} ease-in-out infinite`

@keyframes fadePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

#### 2.5 Rotating Editorial Prompts

**Visual Specifications**:
```jsx
// Container
maxWidth: 280px
textAlign: center
marginBottom: spacing['10']  // 40px

// Text
fontFamily: typography.fonts.sans
fontSize: typography.size.lg  // 15px
color: colors.text.secondary
lineHeight: typography.leading.relaxed

// Animation on change
animation: `fadeUp ${animation.duration.base} ${animation.easing.default}`
key={currentPromptIndex}  // Force re-mount for animation
```

**Rotation Logic**:
```jsx
// Rotate every 5.5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
  }, 5500);
  return () => clearInterval(interval);
}, [prompts.length]);
```

#### 2.6 Voice/Type Mode Switcher
```jsx
// Container
display: flex
gap: spacing['2']  // 8px
marginBottom: spacing['8']  // 32px

// PillChips
<PillChip
  label="Voice"
  active={isVoiceMode}
  onPress={() => setIsVoiceMode(true)}
/>
<PillChip
  label="Type"
  active={!isVoiceMode}
  onPress={() => setIsVoiceMode(false)}
/>

// Active state uses colors.green.default background
```

#### 2.7 Quick Actions Section

**Section Header**:
```jsx
fontFamily: typography.fonts.sans
fontSize: typography.size.sm  // 11px
fontWeight: typography.weight.medium
color: colors.text.secondary
marginBottom: spacing['4']  // 16px
textTransform: uppercase
letterSpacing: typography.tracking.wide
```

**Horizontal Scroll Container**:
```jsx
display: flex
gap: spacing['3']  // 12px
overflowX: auto
paddingBottom: spacing['2']  // 8px
scrollbarWidth: none  // Hide scrollbar
msOverflowStyle: none
WebkitOverflowScrolling: touch

// Hide webkit scrollbar
&::-webkit-scrollbar {
  display: none;
}
```

**Quick Action Chips**:
```jsx
<PillChip
  label={action.label}
  icon={action.icon}  // Wheat, Leaf, TrendingUp, CloudRain
  onPress={() => handleQuickAction(action.query)}
/>

// Each chip is flex: 0 0 auto to prevent shrinking
```

---

### 3. ChatScreen Visual Updates

**Current State**: Conversation view with message bubbles and input area

**Design Updates**:

#### 3.1 Message Bubble Styling

**User Messages** (right-aligned):
```jsx
// Container
display: flex
justifyContent: flex-end
marginBottom: spacing['4']  // 16px

// Bubble
maxWidth: 80%
background: colors.green.default  // #138808
color: white
padding: `${spacing['3']} ${spacing['4']}`  // 12px 16px
borderRadius: 20px 20px 4px 20px  // Rounded except bottom-right
fontFamily: typography.fonts.sans
fontSize: typography.size.base  // 13px
lineHeight: typography.leading.relaxed

// Timestamp
fontSize: typography.size.xs  // 10px
opacity: 0.8
marginTop: spacing['1']  // 4px
textAlign: right
```

**Bot Messages** (left-aligned):
```jsx
// Container
display: flex
justifyContent: flex-start
marginBottom: spacing['4']  // 16px

// Use FrostedCard component
<FrostedCard>
  // Message text
  fontFamily: typography.fonts.serif  // Lora
  fontSize: typography.size.base  // 13px
  lineHeight: typography.leading.relaxed
  color: colors.text.primary
  marginBottom: spacing['2']  // 8px
  
  // Status badges container
  display: flex
  alignItems: center
  gap: spacing['2']  // 8px
  fontSize: typography.size.xs  // 10px
  color: colors.text.secondary
</FrostedCard>
```

#### 3.2 Status Badges

**Offline Badge**:
```jsx
<WifiOff size={12} color={colors.text.secondary} />
<span>{t('offline')}</span>
```

**Cached Badge**:
```jsx
<Archive size={12} color={colors.text.secondary} />
<span>{language === 'hi' ? 'कैश' : 'Cached'}</span>
```

#### 3.3 Structured Data Visualization

**Soil Moisture Display**:
```jsx
<SoilGauge
  moisture={moistureLevel}  // 0-100
  status={status}  // 0=dry, 1=low, 2=optimal, 3=waterlogged
  label={language === 'hi' ? 'मिट्टी की नमी' : 'Soil Moisture'}
/>

// Rendered in FrostedCard with spacing['3'] margin-top
```

**Crop Recommendation Cards**:
```jsx
// Each recommendation in FrostedCard
<FrostedCard accentColor={colors.green.default}>
  // Crop name
  fontFamily: typography.fonts.serif
  fontSize: typography.size.lg
  fontWeight: typography.weight.semibold
  color: colors.text.primary
  
  // Details
  fontFamily: typography.fonts.sans
  fontSize: typography.size.sm
  color: colors.text.secondary
</FrostedCard>
```

**Market Price Table**:
```jsx
// Table in FrostedCard
<FrostedCard accentColor={colors.saffron.default}>
  // Header row
  fontFamily: typography.fonts.sans
  fontSize: typography.size.sm
  fontWeight: typography.weight.semibold
  color: colors.text.primary
  
  // Data rows
  fontSize: typography.size.base
  color: colors.text.primary
  borderBottom: 1px solid colors.border.light
</FrostedCard>
```

#### 3.4 Loading Indicator
```jsx
// Bot message with "Thinking..." text
<FrostedCard>
  <div style={{
    fontFamily: typography.fonts.serif,
    fontSize: typography.size.base,
    color: colors.text.secondary,
    animation: `fadePulse ${animation.duration.slow} ease-in-out infinite`,
  }}>
    {language === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
  </div>
</FrostedCard>
```

#### 3.5 Input Area (Fixed Bottom)

**Container**:
```jsx
position: fixed
bottom: 64px  // Above bottom navigation
left: 0
right: 0
maxWidth: 390px
margin: 0 auto
padding: spacing['4']  // 16px
background: rgba(255, 255, 255, 0.95)
backdropFilter: blur(24px)
borderTop: 1px solid colors.border.light
zIndex: 10
```

**Input Row**:
```jsx
display: flex
alignItems: center
gap: spacing['3']  // 12px

// VoiceOrb button
<VoiceOrb size={44} isListening={isListening} />

// Text input
flex: 1
minHeight: 44px
padding: `${spacing['2']} ${spacing['4']}`  // 8px 16px
borderRadius: 100px  // Fully rounded
border: 1px solid colors.border.light
background: white
fontFamily: typography.fonts.sans
fontSize: typography.size.base
color: colors.text.primary

// Send button
minWidth: 44px
minHeight: 44px
borderRadius: 50%
background: colors.green.default  // When enabled
color: white
display: flex
alignItems: center
justifyContent: center
transition: all 0.2s ease

// Disabled state
background: colors.bg.disabled
cursor: not-allowed
```

#### 3.6 Auto-scroll Behavior
```jsx
// Scroll to bottom when new messages arrive
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
}, [messages.length]);
```

---

### 4. ExploreScreen Visual Updates

**Current State**: Content discovery with category filters and article cards

**Design Updates**:

#### 4.1 Screen Header
```jsx
// Container
padding: spacing.screenPadding  // 16px
paddingBottom: spacing['6']  // 24px

// Title
fontFamily: typography.fonts.serif  // Lora
fontSize: typography.size['2xl']  // 18px
fontWeight: typography.weight.semibold
color: colors.text.primary
marginBottom: spacing['2']  // 8px

// Subtitle
fontFamily: typography.fonts.sans
fontSize: typography.size.base  // 13px
color: colors.text.secondary
```

#### 4.2 Category Filter Pills

**Container**:
```jsx
paddingLeft: spacing.screenPadding
paddingRight: spacing.screenPadding
marginBottom: spacing['6']  // 24px

// Horizontal scroll
display: flex
gap: spacing['2']  // 8px
overflowX: auto
paddingBottom: spacing['2']
scrollbarWidth: none
msOverflowStyle: none
WebkitOverflowScrolling: touch
```

**Category Pills**:
```jsx
<PillChip
  label={category.label}
  icon={category.icon}  // Wheat, Leaf, CloudRain, TrendingUp, Bug
  active={selectedCategory === category.id}
  onPress={() => handleCategoryClick(category.id)}
/>

// Active state: colors.green.default background (#138808)
// Icons change color based on active state
```

**Category Icons**:
- All: No icon
- Crops: `<Wheat size={16} />`
- Soil: `<Leaf size={16} />`
- Weather: `<CloudRain size={16} />`
- Market: `<TrendingUp size={16} />`
- Pests: `<Bug size={16} />`

#### 4.3 Article Cards

**Container**:
```jsx
// Scrollable list
flex: 1
overflowY: auto
paddingLeft: spacing.screenPadding
paddingRight: spacing.screenPadding

// Grid
display: flex
flexDirection: column
gap: spacing['4']  // 16px
paddingBottom: spacing['6']  // 24px
```

**Individual Article Card**:
```jsx
<FrostedCard
  accentColor={article.borderColor}  // Colored left border
  style={{
    padding: spacing.cardPadding,  // 16px
    cursor: 'pointer',
  }}
>
  // Title
  fontFamily: typography.fonts.serif  // Lora
  fontSize: typography.size.lg  // 15px
  fontWeight: typography.weight.medium
  color: colors.text.primary
  lineHeight: typography.leading.snug
  margin: 0
</FrostedCard>
```

**Border Colors by Category**:
- Crops: `colors.green.default` (#138808)
- Soil: `colors.status.success` (#4ade80)
- Weather: `colors.status.info` (#60a5fa)
- Market: `colors.saffron.default` (#FF9933)
- Pests: `colors.status.pest` (#a78bfa)

#### 4.4 Empty State

**Container**:
```jsx
display: flex
flexDirection: column
alignItems: center
justifyContent: center
height: 100%
textAlign: center
padding: spacing['8']  // 32px
```

**Search Icon**:
```jsx
<Search
  size={64}
  color={colors.text.tertiary}
  style={{
    marginBottom: spacing['6'],
    opacity: 0.3,
  }}
/>
```

**Empty State Text**:
```jsx
// Primary message
fontFamily: typography.fonts.sans
fontSize: typography.size.lg  // 15px
color: colors.text.secondary

// Secondary message
fontSize: typography.size.base  // 13px
color: colors.text.tertiary
marginTop: spacing['2']  // 8px
```

#### 4.5 Card Hover/Press Feedback
```jsx
// Add subtle scale and shadow on hover
transition: transform 0.2s ease, box-shadow 0.2s ease

&:hover {
  transform: translateY(-2px);
  boxShadow: shadows.lg;
}

&:active {
  transform: translateY(0);
}
```

---

### 5. SettingsScreen Visual Updates

**Current State**: Settings management with sections and rows

**Design Updates**:

#### 5.1 Screen Header
```jsx
// Title
fontFamily: typography.fonts.serif  // Lora
fontSize: typography.size['3xl']  // 22px
fontWeight: typography.weight.semibold
color: colors.text.primary
marginBottom: spacing['8']  // 32px
```

#### 5.2 Setting Sections

**Section Header**:
```jsx
fontFamily: typography.fonts.sans
fontSize: typography.size.sm  // 11px
fontWeight: typography.weight.medium
color: colors.text.secondary
marginBottom: spacing['4']  // 16px
textTransform: uppercase
letterSpacing: typography.tracking.wide
```

**Section Container**:
```jsx
<SettingSection>
  // Uses FrostedCard internally
  marginBottom: spacing['6']  // 24px
</SettingSection>

// Danger section
<SettingSection danger>
  // Red-tinted styling for destructive actions
</SettingSection>
```

#### 5.3 Setting Rows

**Row Structure**:
```jsx
<SettingRow label="Voice Input">
  <ToggleSwitch value={enabled} onChange={setEnabled} />
</SettingRow>

// Row styling (handled by component):
display: flex
justifyContent: space-between
alignItems: center
minHeight: 44px
padding: spacing['3']  // 12px
borderBottom: 1px solid colors.border.light

// Label
fontFamily: typography.fonts.sans
fontSize: typography.size.base  // 13px
color: colors.text.primary
```

#### 5.4 Farmer ID Input
```jsx
<input
  type="text"
  value={farmerIdInput}
  onChange={handleChange}
  onBlur={handleSave}
  style={{
    fontFamily: typography.fonts.sans,
    fontSize: typography.size.base,
    color: colors.text.primary,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    textAlign: 'right',
    minHeight: 44px,
    padding: spacing['2'],
  }}
/>
```

#### 5.5 Language Toggle
```jsx
<LangToggle
  lang={language}
  onPress={() => setShowLangSheet(true)}
/>

// Displays current language with flag/script
// Opens language selection sheet on press
```

#### 5.6 Toggle Switches
```jsx
<ToggleSwitch
  value={voiceInputEnabled}
  onChange={handleVoiceInputToggle}
/>

// Visual states (handled by component):
// - Off: gray background, white circle on left
// - On: green background (#138808), white circle on right
// - Smooth transition animation
```

#### 5.7 Storage Display
```jsx
<SettingRow label="Storage Used">
  <span style={{
    fontFamily: typography.fonts.sans,
    fontSize: typography.size.base,
    color: colors.text.secondary,
  }}>
    {cacheSize}  // e.g., "2.4 MB"
  </span>
</SettingRow>

<SettingRow label="App Version">
  <span style={{
    fontFamily: typography.fonts.sans,
    fontSize: typography.size.base,
    color: colors.text.secondary,
  }}>
    1.0.0
  </span>
</SettingRow>
```

#### 5.8 Danger Zone Buttons

**Button Styling**:
```jsx
width: 100%
fontFamily: typography.fonts.sans
fontSize: typography.size.base  // 13px
fontWeight: typography.weight.medium
color: colors.status.error  // #f87171
background: transparent
border: 1px solid colors.status.error
borderRadius: radii.lg  // 12px
padding: `${spacing['3']} ${spacing['4']}`  // 12px 16px
marginBottom: spacing['3']  // 12px
cursor: pointer
minHeight: 44px
transition: all 0.2s ease

// Hover state
&:hover {
  background: rgba(220, 38, 38, 0.1);
}
```

**Button Labels**:
- Clear Cache
- Clear All Data
- Reset App

#### 5.9 Confirmation Modal

**Backdrop**:
```jsx
position: fixed
inset: 0
background: rgba(0, 0, 0, 0.5)
backdropFilter: blur(8px)
display: flex
alignItems: center
justifyContent: center
zIndex: 1000
padding: spacing.screenPadding
animation: fadeIn 0.2s ease-out
```

**Modal Content**:
```jsx
<FrostedCard>
  <div style={{ padding: spacing['6'] }}>
    // Title
    fontFamily: typography.fonts.serif
    fontSize: typography.size.xl  // 16px
    fontWeight: typography.weight.semibold
    color: colors.text.primary
    marginBottom: spacing['4']
    
    // Message
    fontFamily: typography.fonts.sans
    fontSize: typography.size.base
    color: colors.text.secondary
    marginBottom: spacing['6']
    lineHeight: typography.leading.relaxed
    
    // Button row
    display: flex
    gap: spacing['3']
  </div>
</FrostedCard>
```

**Modal Buttons**:
```jsx
// Cancel button
flex: 1
background: colors.bg.surface
border: 1px solid colors.border.default
color: colors.text.primary

// Confirm button
flex: 1
background: colors.status.error
border: none
color: white
boxShadow: shadows.md
```

#### 5.10 Language Selection Sheet

**Sheet Container**:
```jsx
position: fixed
inset: 0
background: rgba(0, 0, 0, 0.5)
backdropFilter: blur(8px)
display: flex
alignItems: flex-end
justifyContent: center
zIndex: 1000
animation: fadeIn 0.2s ease-out

// Sheet slides up from bottom
<FrostedCard style={{
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)
}}>
```

**Language Grid**:
```jsx
display: grid
gridTemplateColumns: 1fr 1fr
gap: spacing['3']  // 12px
```

**Language Button**:
```jsx
fontFamily: typography.fonts.sans
background: colors.bg.surface
border: 2px solid colors.border.light  // or colors.green.default if selected
borderRadius: radii.lg  // 12px
padding: spacing['4']  // 16px
cursor: pointer
minHeight: 80px
display: flex
flexDirection: column
alignItems: flex-start
justifyContent: space-between
transition: all 0.2s ease

// Script (e.g., "हिन्दी")
fontSize: typography.size.lg  // 15px
fontWeight: typography.weight.semibold
color: colors.text.primary
marginBottom: spacing['1']

// Roman (e.g., "Hindi")
fontSize: typography.size.sm  // 11px
color: colors.text.secondary

// Badge (Instant/Slower)
fontSize: typography.size.xs  // 10px
fontWeight: typography.weight.medium
padding: `${spacing['1']} ${spacing['2']}`  // 4px 8px
borderRadius: radii.full
// Instant: green background, green text
// Slower: gray background, gray text

// Selected indicator
<Check size={16} color={colors.green.default} />
```

#### 5.11 Footer Badges
```jsx
// Container
marginTop: spacing['12']  // 48px
display: flex
flexDirection: column
alignItems: center
gap: spacing['4']  // 16px

<TeamBadge />
<AWSBadge />
```

---

### 6. Bottom Navigation Visual Updates

**Container**:
```jsx
position: fixed
bottom: 0
left: 0
right: 0
maxWidth: 390px
margin: 0 auto
height: 64px
background: rgba(255, 255, 255, 0.95)
backdropFilter: blur(24px)
borderTop: 1px solid colors.border.light
display: flex
justifyContent: space-around
alignItems: center
zIndex: 100
```

**Nav Item**:
```jsx
// Container
flex: 1
display: flex
flexDirection: column
alignItems: center
justifyContent: center
gap: spacing['1']  // 4px
cursor: pointer
minHeight: 44px
transition: all 0.2s ease

// Icon
size: 20
color: active ? colors.green.default : colors.text.secondary

// Label
fontFamily: typography.fonts.sans
fontSize: typography.size.xs  // 10px
color: active ? colors.green.default : colors.text.secondary
fontWeight: active ? typography.weight.semibold : typography.weight.normal

// Active indicator (optional dot)
width: 4px
height: 4px
borderRadius: 50%
background: colors.green.default
marginTop: spacing['1']
```

**Nav Items**:
- Home: `<Wheat />` icon
- Explore: `<Compass />` icon
- Entries: `<BookOpen />` icon
- Settings: `<Settings />` icon

---

## Data Models

### Visual State Models

#### VoiceOrbState
```typescript
interface VoiceOrbState {
  isListening: boolean;
  size: number;  // px diameter
  disabled: boolean;
}
```

#### MessageBubbleData
```typescript
interface MessageBubbleData {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  isOffline?: boolean;
  status?: 'sent' | 'pending' | 'failed';
  structuredData?: StructuredData;
}

interface StructuredData {
  type: 'soil' | 'crops' | 'market';
  data: any;
}
```

#### ArticleCardData
```typescript
interface ArticleCardData {
  id: string;
  title: string;
  category: 'crops' | 'soil' | 'weather' | 'market' | 'pests';
  query: string;
  borderColor: string;
}
```

#### SettingRowData
```typescript
interface SettingRowData {
  label: string;
  value: string | boolean;
  type: 'text' | 'toggle' | 'select' | 'display';
  onChange?: (value: any) => void;
}
```

### Animation State Models

#### AnimationConfig
```typescript
interface AnimationConfig {
  duration: string;  // e.g., "0.3s"
  easing: string;    // e.g., "cubic-bezier(0.32, 0.72, 0, 1)"
  delay?: string;
}
```

#### TransitionState
```typescript
interface TransitionState {
  isEntering: boolean;
  isExiting: boolean;
  isVisible: boolean;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all 120+ acceptance criteria, I identified several areas of redundancy:

**Redundancy Analysis:**
1. Requirements 1.1-1.5 (AmbientBg on each screen) can be combined into one property about all screens
2. Requirements 2.7 and 2.8 (typography tokens) are similar and can be combined
3. Requirements 6.4-6.9 (color token usage) can be consolidated into fewer properties
4. Requirements 7.1-7.10 (message styling) contain overlapping checks that can be combined
5. Requirements 12.2 and 12.5 are duplicates (spacing tokens)
6. Requirements 14.1-14.3 (icon imports) can be combined into one property

**Consolidation Strategy:**
- Combine screen-specific checks into properties that apply to all screens
- Merge token usage checks (colors, spacing, typography) into comprehensive properties
- Group related styling properties (e.g., all user message properties, all bot message properties)
- Keep example tests for specific visual states (VoiceOrb idle/listening, specific color values)

### Property 1: All Screens Render AmbientBg

*For any* screen component (HomeScreen, ChatScreen, OnboardScreen, ExploreScreen, SettingsScreen), rendering that screen should include an AmbientBg component in the component tree

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 9.1, 10.1**

### Property 2: All Headings Use Serif Font

*For any* heading element across all screens, the computed font-family should be Lora or the serif fallback

**Validates: Requirements 2.1**

### Property 3: All Bot Messages Use Serif Font

*For any* bot message in ChatScreen, the message text should use Lora font family

**Validates: Requirements 2.2, 7.8**

### Property 4: All UI Labels and Buttons Use Sans Font

*For any* UI label or button element across all screens, the computed font-family should be DM Sans or the sans-serif fallback

**Validates: Requirements 2.3**

### Property 5: All User Messages Use Sans Font

*For any* user message in ChatScreen, the message text should use DM Sans font family

**Validates: Requirements 2.4, 7.4**

### Property 6: Language-Appropriate Font Selection

*For any* language setting (hi, bn, gu, kn, ml, ta, te), when text is rendered in that language, the font-family should use the appropriate Noto Sans variant from typography.fonts

**Validates: Requirements 2.6**

### Property 7: All Font Sizes Use Typography Tokens

*For any* text element across all screens, the font-size value should match one of the typography.size token values (not a hardcoded pixel value)

**Validates: Requirements 2.7**

### Property 8: All Font Weights Use Typography Tokens

*For any* text element with explicit font-weight, the value should match one of the typography.weight token values

**Validates: Requirements 2.8**

### Property 9: Bot Messages Wrapped in FrostedCard

*For any* bot message in ChatScreen, the message should be wrapped in a FrostedCard component

**Validates: Requirements 3.1, 7.7**

### Property 10: Content Cards Use FrostedCard

*For any* content card in ExploreScreen, the card should use FrostedCard component

**Validates: Requirements 3.2**

### Property 11: Settings Sections Use FrostedCard

*For any* settings section in SettingsScreen, the section should use FrostedCard component

**Validates: Requirements 3.3, 10.4**

### Property 12: FrostedCard Accent Border

*For any* FrostedCard with an accentColor prop, the rendered component should have a left border with that color

**Validates: Requirements 3.6**

### Property 13: All Body Text Uses Primary Color Token

*For any* body text element across all screens, the color value should be colors.text.primary

**Validates: Requirements 6.4**

### Property 14: All Labels Use Secondary Color Token

*For any* label or subtitle element across all screens, the color value should be colors.text.secondary

**Validates: Requirements 6.5**

### Property 15: All Timestamps Use Tertiary Color Token

*For any* timestamp or hint element across all screens, the color value should be colors.text.tertiary

**Validates: Requirements 6.6**

### Property 16: All Primary Buttons Use Green Token

*For any* primary action button across all screens, the background-color should be colors.green.default (#138808)

**Validates: Requirements 6.7, 18.1**

### Property 17: All Accent Elements Use Saffron Token

*For any* accent element (top blob, accent borders, etc.), the color should be colors.saffron.default (#FF9933)

**Validates: Requirements 6.8**

### Property 18: Status Indicators Use Status Color Tokens

*For any* status indicator (success, warning, error, info), the color should use the corresponding colors.status token

**Validates: Requirements 6.9**

### Property 19: No Hardcoded Colors

*For any* element with a color, background-color, or border-color property, the value should reference a design token from the colors object (not a hardcoded hex, rgb, or named color)

**Validates: Requirements 6.10**

### Property 20: User Messages Right-Aligned

*For any* user message in ChatScreen, the message container should have justify-content: flex-end or text-align: right

**Validates: Requirements 7.1**

### Property 21: User Messages Green Background

*For any* user message in ChatScreen, the background-color should be colors.green.default (#138808)

**Validates: Requirements 7.2**

### Property 22: User Messages White Text

*For any* user message in ChatScreen, the text color should be white

**Validates: Requirements 7.3**

### Property 23: User Messages Rounded Corners

*For any* user message bubble in ChatScreen, the border-radius should be "20px 20px 4px 20px"

**Validates: Requirements 7.5**

### Property 24: Bot Messages Left-Aligned

*For any* bot message in ChatScreen, the message container should have justify-content: flex-start or text-align: left

**Validates: Requirements 7.6**

### Property 25: Bot Messages Primary Text Color

*For any* bot message in ChatScreen, the text color should be colors.text.primary

**Validates: Requirements 7.9**

### Property 26: Bot Messages Relaxed Line Height

*For any* bot message in ChatScreen, the line-height should be typography.leading.relaxed

**Validates: Requirements 7.10**

### Property 27: All Spacing Uses Tokens

*For any* element with margin or padding properties, the values should reference spacing tokens (not hardcoded pixel values)

**Validates: Requirements 12.1, 12.2, 12.5**

### Property 28: All Border Radius Uses Tokens

*For any* element with border-radius property, the value should reference radii tokens (not hardcoded pixel values)

**Validates: Requirements 12.3, 18.3**

### Property 29: All Box Shadows Use Tokens

*For any* element with box-shadow property, the value should reference shadows tokens (not hardcoded shadow values)

**Validates: Requirements 12.4**

### Property 30: All Icons From Design System

*For any* icon element across all screens, the icon should be imported from @ds/icons (not from external files or custom components)

**Validates: Requirements 14.1, 14.2, 14.3**

### Property 31: All Icons Receive Size and Color Props

*For any* icon component rendered, it should receive both size and color props

**Validates: Requirements 14.4**

### Property 32: Icon Colors Use Text Color Tokens

*For any* icon component rendered, the color prop should be one of colors.text.primary, colors.text.secondary, or colors.text.tertiary

**Validates: Requirements 14.5**

### Property 33: All Screen Containers Use Relative Positioning

*For any* screen container element, the position should be "relative"

**Validates: Requirements 15.6**

### Property 34: Active PillChip Green Background

*For any* PillChip component with active={true}, the background-color should be colors.green.default

**Validates: Requirements 9.3, 19.6**

### Property 35: Inactive PillChip Card Background

*For any* PillChip component with active={false}, the background-color should be colors.bg.card

**Validates: Requirements 19.7**

### Property 36: All Boolean Settings Use ToggleSwitch

*For any* boolean setting in SettingsScreen, the control should be a ToggleSwitch component

**Validates: Requirements 10.5**

### Property 37: Danger Sections Use Error Color

*For any* SettingSection with danger={true}, the accent color should be colors.status.error

**Validates: Requirements 10.7**

### Property 38: All Animation Durations Use Tokens

*For any* animation or transition with a duration property, the value should reference animation.duration tokens

**Validates: Requirements 11.9**

### Property 39: All Animation Easings Use Tokens

*For any* animation or transition with an easing/timing-function property, the value should reference animation.easing tokens

**Validates: Requirements 11.10**

### Property 40: All Primary Buttons White Text

*For any* primary action button, the text color should be white

**Validates: Requirements 18.2**

### Property 41: All Buttons Minimum Touch Target

*For any* button element, the minHeight should be at least 44px

**Validates: Requirements 18.4**

### Property 42: Icon-Only Buttons Minimum Width

*For any* button containing only an icon (no text), the minWidth should be at least 44px

**Validates: Requirements 18.5**

### Property 43: Disabled Buttons Use Disabled Background

*For any* button with disabled={true}, the background-color should be colors.bg.disabled

**Validates: Requirements 18.6**

### Property 44: Disabled Buttons Not-Allowed Cursor

*For any* button with disabled={true}, the cursor should be "not-allowed"

**Validates: Requirements 18.7**

### Property 45: All Buttons Have Transitions

*For any* button element, there should be a transition property defined for hover/active states

**Validates: Requirements 18.8**

### Property 46: Screen Mounts Apply FadeUp Animation

*For any* screen content container, when the screen mounts, the fadeUp animation should be applied

**Validates: Requirements 20.1, 20.6**

### Property 47: Content Titles Use Serif Font

*For any* content title in ExploreScreen, the font-family should be Lora

**Validates: Requirements 9.5**

### Property 48: Content Descriptions Use Sans Font

*For any* content description in ExploreScreen, the font-family should be DM Sans

**Validates: Requirements 9.6**

### Property 49: All Screens Use Spacing Tokens

*For any* screen component, all spacing (margins, padding, gaps) should use values from the spacing token object

**Validates: Requirements 8.7, 9.7, 10.8**

---

## Error Handling

### Visual Rendering Errors

**Missing Design Tokens**:
- If a design token is undefined, fall back to a sensible default
- Log a warning to the console indicating which token is missing
- Example: If `colors.green.default` is undefined, use `#138808` as fallback

**Component Rendering Failures**:
- Wrap design system components in error boundaries
- Display a fallback UI if a component fails to render
- Log the error with component name and props for debugging

**Animation Failures**:
- If CSS animations are not supported, gracefully degrade to static display
- Check for `window.CSS.supports('animation')` before applying animations
- Provide alternative visual feedback for state changes

### Font Loading Errors

**Google Fonts Unavailable**:
- If Google Fonts fail to load, fall back to system fonts
- Serif fallback: Georgia, Times New Roman, serif
- Sans fallback: system-ui, -apple-system, BlinkMacSystemFont, sans-serif

**Indian Language Fonts Missing**:
- If Noto Sans fonts fail to load, fall back to system fonts
- Ensure text remains readable even without custom fonts

### Color Contrast Issues

**Insufficient Contrast**:
- Ensure all text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- If a color combination fails contrast checks, adjust opacity or use alternative colors
- Test with automated tools during development

### Responsive Layout Issues

**Viewport Too Small**:
- If viewport width < 320px, display a message suggesting landscape mode
- Ensure all touch targets remain at least 44px even on small screens

**Viewport Too Large**:
- Maintain maxWidth of 390px for app container
- Center the app with margin: 0 auto

---

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests** focus on:
- Specific visual states (VoiceOrb idle vs listening)
- Exact color values (#138808, #FF9933, etc.)
- Specific component presence (AmbientBg on each screen)
- Animation keyframe definitions
- Edge cases (missing tokens, font loading failures)

**Property-Based Tests** focus on:
- Universal rules across all instances (all buttons use green, all headings use Lora)
- Token usage consistency (no hardcoded values)
- Component structure patterns (all bot messages in FrostedCard)
- Responsive behavior across viewport sizes
- Font selection based on language

### Property-Based Testing Configuration

**Library**: Use `@fast-check/jest` for React component property testing

**Test Configuration**:
```javascript
// Each property test should run minimum 100 iterations
fc.assert(
  fc.property(/* generators */, (/* inputs */) => {
    // Test logic
  }),
  { numRuns: 100 }
);
```

**Test Tagging**:
Each property test must include a comment referencing the design property:
```javascript
/**
 * Feature: frontend-design-polish
 * Property 19: No Hardcoded Colors
 * 
 * For any element with a color property, the value should reference
 * a design token from the colors object
 */
test('all colors use design tokens', () => {
  // Test implementation
});
```

### Unit Testing Strategy

**Component Visual Tests**:
```javascript
describe('VoiceOrb Visual States', () => {
  test('idle state displays tricolour gradient', () => {
    const { container } = render(<VoiceOrb isListening={false} />);
    const orb = container.querySelector('[data-testid="voice-orb"]');
    const gradient = window.getComputedStyle(orb).backgroundImage;
    expect(gradient).toContain('#FF9933'); // saffron
    expect(gradient).toContain('#138808'); // green
  });

  test('listening state shows three ripple rings', () => {
    const { container } = render(<VoiceOrb isListening={true} />);
    const rings = container.querySelectorAll('[data-testid="ripple-ring"]');
    expect(rings).toHaveLength(3);
  });
});
```

**Screen Component Tests**:
```javascript
describe('HomeScreen Visual Elements', () => {
  test('renders AmbientBg component', () => {
    const { container } = render(<HomeScreen />);
    expect(container.querySelector('[data-testid="ambient-bg"]')).toBeInTheDocument();
  });

  test('rotating prompts use Lora font', () => {
    const { getByText } = render(<HomeScreen />);
    const prompt = getByText(/Check soil moisture/i);
    expect(window.getComputedStyle(prompt).fontFamily).toContain('Lora');
  });
});
```

**Token Usage Tests**:
```javascript
describe('Design Token Compliance', () => {
  test('AmbientBg uses saffron token for top blob', () => {
    const { container } = render(<AmbientBg />);
    const topBlob = container.querySelector('[data-testid="blob-top"]');
    const bgColor = window.getComputedStyle(topBlob).backgroundColor;
    expect(bgColor).toBe('rgb(255, 153, 51)'); // #FF9933
  });

  test('FrostedCard uses backdrop-filter blur', () => {
    const { container } = render(<FrostedCard>Content</FrostedCard>);
    const card = container.firstChild;
    expect(window.getComputedStyle(card).backdropFilter).toContain('blur');
  });
});
```

### Property-Based Testing Strategy

**Generator Functions**:
```javascript
// Generate random screen components
const screenGen = fc.constantFrom(
  HomeScreen,
  ChatScreen,
  OnboardScreen,
  ExploreScreen,
  SettingsScreen
);

// Generate random messages
const messageGen = fc.record({
  id: fc.uuid(),
  sender: fc.constantFrom('user', 'bot'),
  text: fc.string({ minLength: 1, maxLength: 200 }),
  timestamp: fc.integer({ min: 0, max: Date.now() }),
});

// Generate random colors from design tokens
const colorTokenGen = fc.constantFrom(
  'colors.text.primary',
  'colors.text.secondary',
  'colors.text.tertiary',
  'colors.green.default',
  'colors.saffron.default'
);
```

**Property Test Examples**:
```javascript
/**
 * Feature: frontend-design-polish
 * Property 1: All Screens Render AmbientBg
 */
test('all screens render AmbientBg component', () => {
  fc.assert(
    fc.property(screenGen, (ScreenComponent) => {
      const { container } = render(<ScreenComponent />);
      const ambientBg = container.querySelector('[data-testid="ambient-bg"]');
      return ambientBg !== null;
    }),
    { numRuns: 100 }
  );
});

/**
 * Feature: frontend-design-polish
 * Property 21: User Messages Green Background
 */
test('all user messages have green background', () => {
  fc.assert(
    fc.property(
      fc.array(messageGen.filter(m => m.sender === 'user'), { minLength: 1, maxLength: 20 }),
      (messages) => {
        const { container } = render(<ChatScreen messages={messages} />);
        const userMessages = container.querySelectorAll('[data-sender="user"]');
        
        return Array.from(userMessages).every(msg => {
          const bgColor = window.getComputedStyle(msg).backgroundColor;
          return bgColor === 'rgb(19, 136, 8)'; // #138808
        });
      }
    ),
    { numRuns: 100 }
  );
});

/**
 * Feature: frontend-design-polish
 * Property 19: No Hardcoded Colors
 */
test('no elements use hardcoded colors', () => {
  fc.assert(
    fc.property(screenGen, (ScreenComponent) => {
      const { container } = render(<ScreenComponent />);
      const allElements = container.querySelectorAll('*');
      
      // Check inline styles for hardcoded colors
      return Array.from(allElements).every(el => {
        const style = el.getAttribute('style') || '';
        // Should not contain hex colors, rgb(), or named colors outside tokens
        return !style.match(/#[0-9a-fA-F]{3,6}(?![^(]*\))/) &&
               !style.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/) &&
               !style.match(/\b(red|blue|green|yellow|black|white|gray)\b/);
      });
    }),
    { numRuns: 100 }
  );
});

/**
 * Feature: frontend-design-polish
 * Property 27: All Spacing Uses Tokens
 */
test('all spacing uses design tokens', () => {
  fc.assert(
    fc.property(screenGen, (ScreenComponent) => {
      const { container } = render(<ScreenComponent />);
      const allElements = container.querySelectorAll('*');
      
      return Array.from(allElements).every(el => {
        const style = el.getAttribute('style') || '';
        // Check for hardcoded pixel values in margin/padding
        const hasHardcodedSpacing = style.match(/(?:margin|padding)[^:]*:\s*\d+px/);
        return !hasHardcodedSpacing;
      });
    }),
    { numRuns: 100 }
  );
});
```

### Visual Regression Testing

**Snapshot Tests**:
- Capture visual snapshots of each screen in different states
- Compare snapshots on each test run to detect unintended visual changes
- Use `jest-image-snapshot` or similar tools

**Example**:
```javascript
test('HomeScreen matches visual snapshot', () => {
  const { container } = render(<HomeScreen />);
  expect(container).toMatchImageSnapshot();
});

test('VoiceOrb listening state matches snapshot', () => {
  const { container } = render(<VoiceOrb isListening={true} />);
  expect(container).toMatchImageSnapshot();
});
```

### Integration Testing

**Screen Navigation**:
- Test that screen transitions apply fadeUp animation
- Verify bottom navigation updates active state correctly
- Ensure AmbientBg persists across screen changes

**Component Interaction**:
- Test VoiceOrb state changes (idle → listening → idle)
- Verify PillChip active state toggles correctly
- Test ToggleSwitch state changes in settings

### Accessibility Testing

**Color Contrast**:
- Verify all text meets WCAG AA standards
- Test with automated tools (axe-core, pa11y)

**Touch Targets**:
- Verify all interactive elements are at least 44x44px
- Test on actual mobile devices

**Screen Reader Support**:
- Ensure all interactive elements have proper aria-labels
- Test with VoiceOver (iOS) and TalkBack (Android)

### Performance Testing

**Animation Performance**:
- Measure frame rate during VoiceOrb animations
- Ensure 60fps for smooth animations
- Test on low-end devices

**Font Loading**:
- Measure time to first paint with web fonts
- Ensure fallback fonts display immediately
- Test with slow network conditions

### Test Coverage Goals

- **Unit Test Coverage**: 90%+ for component rendering and styling
- **Property Test Coverage**: 100% of correctness properties implemented
- **Visual Regression**: All screens and component states captured
- **Accessibility**: 100% WCAG AA compliance
- **Cross-Browser**: Test on Chrome, Safari, Firefox mobile browsers

---

## Implementation Notes

### Development Workflow

1. **Token Integration**: Start by ensuring all design tokens are properly imported
2. **Component Updates**: Update screens one at a time, starting with OnboardScreen
3. **Visual Verification**: Use Storybook or similar tool to verify visual changes
4. **Test Implementation**: Write tests alongside visual updates
5. **Accessibility Audit**: Run accessibility tests after each screen update
6. **Performance Check**: Measure animation performance on target devices

### Code Organization

**Import Structure**:
```javascript
// Design system imports at top
import { colors, typography, spacing, radii, shadows, animation } from '@ds/tokens';
import { VoiceOrb, FrostedCard, PillChip, AmbientBg, /* ... */ } from '@ds/components';
import { Wheat, Leaf, CloudRain, /* ... */ } from '@ds/icons';

// Local imports
import { useApp } from '../contexts/AppContext';
import { useChatContext } from '../contexts/ChatContext';
```

**Style Object Pattern**:
```javascript
// Define style objects using design tokens
const styles = {
  container: {
    padding: spacing.screenPadding,
    background: colors.bg.surface,
  },
  heading: {
    fontFamily: typography.fonts.serif,
    fontSize: typography.size['3xl'],
    color: colors.text.primary,
  },
  button: {
    background: colors.green.default,
    borderRadius: radii.lg,
    padding: `${spacing['3']} ${spacing['4']}`,
  },
};
```

### Browser Compatibility

**Target Browsers**:
- Chrome Mobile 90+
- Safari iOS 14+
- Firefox Mobile 90+

**Fallbacks**:
- `backdrop-filter`: Provide solid background fallback for older browsers
- `100dvh`: Fall back to `100vh` if not supported
- CSS animations: Provide static fallback if not supported

### Performance Considerations

**Animation Optimization**:
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left` (causes reflow)
- Use `will-change` sparingly for critical animations

**Font Loading**:
- Use `font-display: swap` for web fonts
- Preload critical fonts in HTML head
- Subset fonts to include only needed characters

**Image Optimization**:
- Use SVG for icons (already implemented in design system)
- Optimize grain overlay SVG for minimal file size

---

*This design document provides comprehensive specifications for updating the Piritiya frontend to match the design system. All visual elements, animations, and interactions are defined with precise token references and implementation guidance.*
