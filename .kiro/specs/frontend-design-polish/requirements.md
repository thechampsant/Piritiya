# Requirements Document

## Introduction

This document specifies requirements for updating the Piritiya frontend screens to match the design system visual specifications. The design system is fully implemented with tokens, components, icons, and animations, but the current frontend screens do not match the intended visual design. This update will ensure visual consistency, proper use of design tokens, and implementation of key visual elements like ambient backgrounds, frosted glass effects, rotating prompts, and the voice orb with ripple animations.

## Glossary

- **Frontend_App**: The React-based Piritiya mobile web application
- **Design_System**: The complete design system implementation in piritiya-design-system/ directory
- **AmbientBg**: Component that renders animated gradient blobs as background
- **VoiceOrb**: Primary voice input component with tricolour gradient and ripple animations
- **FrostedCard**: Card component with backdrop-filter blur and semi-transparent background
- **Tricolour_Gradient**: Indian flag-inspired gradient (saffron #FF9933, white, green #138808)
- **HomeScreen**: Main landing screen with voice orb and rotating prompts
- **ChatScreen**: Conversation view with message bubbles
- **OnboardScreen**: Initial onboarding flow
- **ExploreScreen**: Content discovery screen with category filters
- **SettingsScreen**: Application settings interface
- **Lora_Font**: Serif font family used for headings and bot messages
- **DM_Sans_Font**: Sans-serif font family used for UI text and labels
- **Rotating_Prompts**: Editorial prompts that cycle every 5.5 seconds on HomeScreen
- **Ripple_Animation**: Concentric ring animations on VoiceOrb during listening state

## Requirements

### Requirement 1: Ambient Background Implementation

**User Story:** As a user, I want to see beautiful animated gradient backgrounds on all screens, so that the app feels polished and visually engaging

#### Acceptance Criteria

1. THE Frontend_App SHALL render AmbientBg component on HomeScreen
2. THE Frontend_App SHALL render AmbientBg component on ChatScreen
3. THE Frontend_App SHALL render AmbientBg component on OnboardScreen
4. THE Frontend_App SHALL render AmbientBg component on ExploreScreen
5. THE Frontend_App SHALL render AmbientBg component on SettingsScreen
6. WHEN AmbientBg is rendered, THE Frontend_App SHALL display animated gradient blobs using blob1, blob2, and blob3 keyframe animations
7. THE AmbientBg SHALL use saffron (#FF9933) for the top blob
8. THE AmbientBg SHALL use green (#138808) for the bottom blob
9. THE AmbientBg SHALL position itself at zIndex 0 behind all screen content

### Requirement 2: Typography System Compliance

**User Story:** As a user, I want text to be displayed with the correct fonts and sizes, so that the app matches the design specifications

#### Acceptance Criteria

1. THE Frontend_App SHALL use Lora_Font for all screen headings
2. THE Frontend_App SHALL use Lora_Font for all bot message text in ChatScreen
3. THE Frontend_App SHALL use DM_Sans_Font for all UI labels and buttons
4. THE Frontend_App SHALL use DM_Sans_Font for all user message text in ChatScreen
5. THE Frontend_App SHALL load Google Fonts via the googleFontsUrl from design tokens
6. WHEN displaying Indian language text, THE Frontend_App SHALL use the appropriate Noto Sans font family from typography.fonts
7. THE Frontend_App SHALL use typography.size tokens for all font sizes
8. THE Frontend_App SHALL use typography.weight tokens for all font weights

### Requirement 3: Frosted Glass Effects

**User Story:** As a user, I want to see frosted glass effects on cards and surfaces, so that the UI has depth and visual polish

#### Acceptance Criteria

1. WHEN displaying bot messages in ChatScreen, THE Frontend_App SHALL use FrostedCard component
2. WHEN displaying content cards in ExploreScreen, THE Frontend_App SHALL use FrostedCard component
3. WHEN displaying settings sections in SettingsScreen, THE Frontend_App SHALL use FrostedCard component
4. THE FrostedCard SHALL apply backdrop-filter blur effect
5. THE FrostedCard SHALL use colors.bg.card (rgba(255,255,255,0.75)) as background
6. WHEN an accent color is provided, THE FrostedCard SHALL display a left border with that color

### Requirement 4: VoiceOrb Visual States

**User Story:** As a user, I want the voice orb to provide clear visual feedback, so that I know when the app is listening to me

#### Acceptance Criteria

1. WHEN VoiceOrb is in idle state, THE Frontend_App SHALL display Tricolour_Gradient (saffron to white to green)
2. WHEN VoiceOrb is in idle state, THE Frontend_App SHALL animate with orbIdle keyframe (slow pulse)
3. WHEN VoiceOrb is in idle state, THE Frontend_App SHALL display one halo ring with orbIdleRing animation
4. WHEN VoiceOrb is in listening state, THE Frontend_App SHALL brighten the gradient
5. WHEN VoiceOrb is in listening state, THE Frontend_App SHALL apply box shadow with saffron and green glow
6. WHEN VoiceOrb is in listening state, THE Frontend_App SHALL display three ripple rings with orbRipple animation
7. WHEN VoiceOrb is in listening state, THE Frontend_App SHALL animate with orbBreath keyframe
8. WHEN VoiceOrb transitions to listening state, THE Frontend_App SHALL fade out the microphone icon

### Requirement 5: HomeScreen Rotating Prompts

**User Story:** As a user, I want to see rotating editorial prompts on the home screen, so that I discover different ways to use the app

#### Acceptance Criteria

1. THE HomeScreen SHALL display Rotating_Prompts below the VoiceOrb
2. THE HomeScreen SHALL cycle through prompts every 5.5 seconds
3. WHEN a prompt changes, THE HomeScreen SHALL animate the new prompt with fadeUp animation
4. THE Rotating_Prompts SHALL use Lora_Font
5. THE Rotating_Prompts SHALL use typography.size.lg font size
6. THE Rotating_Prompts SHALL use colors.text.secondary color
7. THE Rotating_Prompts SHALL be center-aligned with maxWidth of 280px
8. THE HomeScreen SHALL include at least 4 different prompt variations

### Requirement 6: Color Palette Compliance

**User Story:** As a developer, I want all colors to use design tokens, so that the visual design is consistent and maintainable

#### Acceptance Criteria

1. THE Frontend_App SHALL use colors.bg.base for app background top gradient
2. THE Frontend_App SHALL use colors.bg.mid for app background middle gradient
3. THE Frontend_App SHALL use colors.bg.surface for app background bottom gradient
4. THE Frontend_App SHALL use colors.text.primary for all body text
5. THE Frontend_App SHALL use colors.text.secondary for labels and subtitles
6. THE Frontend_App SHALL use colors.text.tertiary for timestamps and hints
7. THE Frontend_App SHALL use colors.green.default (#138808) for primary action buttons
8. THE Frontend_App SHALL use colors.saffron.default (#FF9933) for accent elements
9. THE Frontend_App SHALL use colors.status tokens for success, warning, error, and info states
10. THE Frontend_App SHALL NOT use hardcoded color values outside of design tokens

### Requirement 7: ChatScreen Message Styling

**User Story:** As a user, I want chat messages to be visually distinct and easy to read, so that I can follow the conversation

#### Acceptance Criteria

1. WHEN displaying user messages, THE ChatScreen SHALL align them to the right
2. WHEN displaying user messages, THE ChatScreen SHALL use colors.green.default (#138808) background
3. WHEN displaying user messages, THE ChatScreen SHALL use white text color
4. WHEN displaying user messages, THE ChatScreen SHALL use DM_Sans_Font
5. WHEN displaying user messages, THE ChatScreen SHALL use rounded corners (20px 20px 4px 20px)
6. WHEN displaying bot messages, THE ChatScreen SHALL align them to the left
7. WHEN displaying bot messages, THE ChatScreen SHALL wrap them in FrostedCard component
8. WHEN displaying bot messages, THE ChatScreen SHALL use Lora_Font
9. WHEN displaying bot messages, THE ChatScreen SHALL use colors.text.primary color
10. WHEN displaying bot messages, THE ChatScreen SHALL use typography.leading.relaxed line height

### Requirement 8: OnboardScreen Visual Polish

**User Story:** As a new user, I want the onboarding experience to be visually appealing, so that I feel confident using the app

#### Acceptance Criteria

1. THE OnboardScreen SHALL render AmbientBg component
2. THE OnboardScreen SHALL use Lora_Font for the main headline
3. THE OnboardScreen SHALL use typography.size.hero (36px) for the headline
4. THE OnboardScreen SHALL use FrostedCard for onboarding step content
5. THE OnboardScreen SHALL use fadeUp animation when transitioning between steps
6. THE OnboardScreen SHALL use colors.green.default for the primary CTA button
7. THE OnboardScreen SHALL use proper spacing tokens from spacing object

### Requirement 9: ExploreScreen Category Filters

**User Story:** As a user, I want to filter explore content by category, so that I can find relevant information quickly

#### Acceptance Criteria

1. THE ExploreScreen SHALL render AmbientBg component
2. THE ExploreScreen SHALL display category filter chips using PillChip component
3. WHEN a category filter is active, THE PillChip SHALL use colors.green.default background
4. THE ExploreScreen SHALL use FrostedCard for content items
5. THE ExploreScreen SHALL use Lora_Font for content titles
6. THE ExploreScreen SHALL use DM_Sans_Font for content descriptions
7. THE ExploreScreen SHALL use proper spacing tokens for layout

### Requirement 10: SettingsScreen Frosted Cards

**User Story:** As a user, I want settings to be organized in clear sections, so that I can easily configure the app

#### Acceptance Criteria

1. THE SettingsScreen SHALL render AmbientBg component
2. THE SettingsScreen SHALL use SettingSection component for grouping settings
3. THE SettingsScreen SHALL use SettingRow component for individual settings
4. THE SettingsScreen SHALL use FrostedCard for settings sections
5. THE SettingsScreen SHALL use ToggleSwitch component for boolean settings
6. THE SettingsScreen SHALL use LangToggle component for language selection
7. WHEN a settings section is marked as danger, THE SettingsScreen SHALL apply colors.status.error accent
8. THE SettingsScreen SHALL use proper spacing tokens for layout

### Requirement 11: Animation Keyframes Integration

**User Story:** As a developer, I want all animations to use design system keyframes, so that motion is consistent across the app

#### Acceptance Criteria

1. THE Frontend_App SHALL inject animation.keyframes at app root level
2. THE Frontend_App SHALL use fadeUp animation for screen mounts and card entrances
3. THE Frontend_App SHALL use fadePulse animation for "Listening..." text
4. THE Frontend_App SHALL use blob1, blob2, blob3 animations in AmbientBg
5. THE Frontend_App SHALL use orbIdle animation for VoiceOrb idle state
6. THE Frontend_App SHALL use orbBreath animation for VoiceOrb listening state
7. THE Frontend_App SHALL use orbIdleRing animation for VoiceOrb halo ring
8. THE Frontend_App SHALL use orbRipple animation for VoiceOrb ripple rings
9. THE Frontend_App SHALL use animation.duration tokens for timing
10. THE Frontend_App SHALL use animation.easing tokens for easing functions

### Requirement 12: Spacing and Layout Consistency

**User Story:** As a developer, I want all spacing to use design tokens, so that layout is consistent and maintainable

#### Acceptance Criteria

1. THE Frontend_App SHALL use spacing.screenPadding for screen-level padding
2. THE Frontend_App SHALL use spacing tokens (spacing['2'], spacing['4'], etc.) for all margins and padding
3. THE Frontend_App SHALL use radii tokens for all border-radius values
4. THE Frontend_App SHALL use shadows tokens for all box-shadow values
5. THE Frontend_App SHALL NOT use hardcoded spacing values outside of design tokens

### Requirement 13: Grain Overlay Effect

**User Story:** As a user, I want to see a subtle texture overlay, so that the app has a premium feel

#### Acceptance Criteria

1. THE Frontend_App SHALL render a grain overlay at the app shell level
2. THE grain overlay SHALL use SVG noise filter
3. THE grain overlay SHALL have opacity of 0.025
4. THE grain overlay SHALL be positioned at zIndex 1
5. THE grain overlay SHALL have pointerEvents set to none
6. THE grain overlay SHALL cover the entire viewport (position absolute, inset 0)

### Requirement 14: Icon System Compliance

**User Story:** As a developer, I want all icons to use the design system icon components, so that icons are consistent

#### Acceptance Criteria

1. THE Frontend_App SHALL import icons from @ds/icons
2. THE Frontend_App SHALL use inline SVG icons from the design system
3. THE Frontend_App SHALL NOT use separate icon component files outside the design system
4. WHEN rendering icons, THE Frontend_App SHALL pass size and color props
5. THE Frontend_App SHALL use colors.text.primary, colors.text.secondary, or colors.text.tertiary for icon colors

### Requirement 15: Responsive Layout for Mobile

**User Story:** As a mobile user, I want the app to fit my screen properly, so that I can use it comfortably

#### Acceptance Criteria

1. THE Frontend_App SHALL set maxWidth to 390px for the app container
2. THE Frontend_App SHALL use 100dvh for full viewport height
3. THE Frontend_App SHALL center the app container with margin auto
4. THE Frontend_App SHALL set overflow hidden on the app container
5. THE Frontend_App SHALL account for bottom navigation height (64px) in screen padding
6. THE Frontend_App SHALL use position relative for screen containers
7. THE Frontend_App SHALL use position absolute for AmbientBg to fill screen

### Requirement 16: Status Indicators Visual Design

**User Story:** As a user, I want to see clear status indicators, so that I know the app's connectivity state

#### Acceptance Criteria

1. THE Frontend_App SHALL use StatusPill component for online/offline status
2. WHEN offline, THE StatusPill SHALL display WifiOff icon
3. WHEN offline, THE StatusPill SHALL use colors.status.warning background
4. WHEN syncing, THE StatusPill SHALL display RefreshCw icon with rotation animation
5. THE StatusPill SHALL use FrostedCard styling
6. THE StatusPill SHALL use typography.size.xs for text
7. THE StatusPill SHALL be positioned at the top-right of screens

### Requirement 17: Input Field Styling

**User Story:** As a user, I want input fields to match the design system, so that the UI is cohesive

#### Acceptance Criteria

1. WHEN displaying text input in ChatScreen, THE Frontend_App SHALL use rounded corners (100px border-radius)
2. THE text input SHALL use colors.border.light for border color
3. THE text input SHALL use white background
4. THE text input SHALL use DM_Sans_Font
5. THE text input SHALL use typography.size.base font size
6. THE text input SHALL use proper spacing tokens for padding
7. THE text input SHALL have minHeight of 44px for touch targets
8. THE text input container SHALL use frosted glass effect (backdrop-filter blur)

### Requirement 18: Button Styling Consistency

**User Story:** As a user, I want buttons to have consistent styling, so that I know what is clickable

#### Acceptance Criteria

1. THE Frontend_App SHALL use colors.green.default for primary action buttons
2. THE Frontend_App SHALL use white text color on primary buttons
3. THE Frontend_App SHALL use proper border-radius from radii tokens
4. THE Frontend_App SHALL use minHeight of 44px for touch targets
5. THE Frontend_App SHALL use minWidth of 44px for icon-only buttons
6. WHEN a button is disabled, THE Frontend_App SHALL use colors.bg.disabled background
7. WHEN a button is disabled, THE Frontend_App SHALL set cursor to not-allowed
8. THE Frontend_App SHALL use transition for button hover/active states

### Requirement 19: Quick Actions Visual Design

**User Story:** As a user, I want quick action chips to be visually appealing, so that I'm encouraged to use them

#### Acceptance Criteria

1. THE HomeScreen SHALL display quick actions using PillChip component
2. THE quick actions SHALL be arranged in a horizontal scrollable container
3. THE scrollable container SHALL hide scrollbars while maintaining scroll functionality
4. THE PillChip SHALL use DM_Sans_Font
5. THE PillChip SHALL use typography.size.base font size
6. WHEN a PillChip is active, THE PillChip SHALL use colors.green.default background
7. WHEN a PillChip is inactive, THE PillChip SHALL use colors.bg.card background
8. THE PillChip SHALL use proper spacing tokens for padding

### Requirement 20: Screen Transition Animations

**User Story:** As a user, I want smooth transitions between screens, so that navigation feels fluid

#### Acceptance Criteria

1. WHEN a screen mounts, THE Frontend_App SHALL apply fadeUp animation
2. THE fadeUp animation SHALL use animation.duration.base timing
3. THE fadeUp animation SHALL use animation.easing.default easing function
4. THE fadeUp animation SHALL translate from 10px below to 0
5. THE fadeUp animation SHALL fade from opacity 0 to 1
6. THE Frontend_App SHALL apply fadeUp to screen content containers
