# Implementation Plan: Frontend Design Polish

## Overview

This plan implements visual polish updates to align all Piritiya frontend screens with the design system specifications. The design system is fully implemented at `piritiya-design-system/` with tokens, components, icons, and animations. We'll update 5 screens (OnboardScreen, HomeScreen, ChatScreen, ExploreScreen, SettingsScreen) to use design system components and tokens consistently.

**Implementation Language**: JavaScript/JSX (React)

**Key Visual Updates**:
- Ambient gradient backgrounds with animated blobs on all screens
- Frosted glass effects using FrostedCard component
- VoiceOrb with tricolour gradient and ripple animations
- Typography compliance (Lora for headings, DM Sans for UI)
- Color palette compliance using design tokens
- Animation keyframes integration
- Spacing and layout consistency

## Tasks

- [x] 1. Set up design system integration and global styles
  - Import design tokens (colors, typography, spacing, radii, shadows, animation) at app root level
  - Inject animation keyframes into global styles
  - Add grain overlay effect at app shell level
  - Configure app container with maxWidth 390px and responsive layout
  - _Requirements: 11.1, 13.1-13.6, 15.1-15.4_

- [ ]* 1.1 Write property test for animation keyframes injection
  - **Property 38: All Animation Durations Use Tokens**
  - **Validates: Requirements 11.9**

- [ ]* 1.2 Write property test for design token imports
  - **Property 19: No Hardcoded Colors**
  - **Validates: Requirements 6.10**

- [x] 2. Update OnboardScreen visual styling
  - [x] 2.1 Add AmbientBg component to OnboardScreen
    - Render AmbientBg at z-index 0 behind content
    - Ensure animated gradient blobs display correctly
    - _Requirements: 1.1, 8.1_
  
  - [x] 2.2 Update welcome text typography
    - Apply Lora font to headline with typography.size.hero (36px)
    - Apply DM Sans to subtitle with typography.size.lg
    - Use colors.text.primary and colors.text.secondary
    - _Requirements: 2.1, 2.3, 8.2, 8.3_
  
  - [x] 2.3 Style farmer ID input field
    - Apply FrostedCard styling to input container
    - Use proper spacing tokens for padding and margins
    - Add focus state with colors.green.default border
    - Add error state with colors.status.error border
    - Ensure minHeight 44px for touch target
    - _Requirements: 8.4, 17.1-17.7_
  
  - [x] 2.4 Update Get Started button styling
    - Use PillChip component with colors.green.default background
    - Apply proper typography tokens for button text
    - Ensure minHeight 44px and full width
    - _Requirements: 8.6, 18.1-18.5_
  
  - [x] 2.5 Add fadeUp entrance animation
    - Apply fadeUp animation to main content container on mount
    - Use animation.duration.base and animation.easing.default
    - _Requirements: 8.5, 20.1_

- [ ]* 2.6 Write property test for OnboardScreen AmbientBg
  - **Property 1: All Screens Render AmbientBg**
  - **Validates: Requirements 1.1, 8.1**

- [ ]* 2.7 Write unit tests for OnboardScreen typography
  - Test headline uses Lora font
  - Test subtitle uses DM Sans font
  - Test font sizes match design tokens
  - _Requirements: 2.1, 2.3, 8.2, 8.3_

- [x] 3. Update HomeScreen visual styling
  - [x] 3.1 Add AmbientBg component to HomeScreen
    - Render AmbientBg at z-index 0 behind content
    - _Requirements: 1.2_
  
  - [x] 3.2 Update greeting text styling
    - Apply Lora font with typography.size['3xl'] (22px)
    - Use colors.text.primary
    - Add fadeUp animation on mount
    - _Requirements: 2.1_
  
  - [x] 3.3 Integrate VoiceOrb component with visual states
    - Render VoiceOrb with size 72px
    - Implement idle state (tricolour gradient, orbIdle animation, single halo ring)
    - Implement listening state (brightened gradient, 3 ripple rings, orbBreath animation)
    - Add listening indicator text with fadePulse animation
    - _Requirements: 4.1-4.8_
  
  - [x] 3.4 Implement rotating editorial prompts
    - Display prompts below VoiceOrb with maxWidth 280px
    - Use Lora font with typography.size.lg
    - Rotate prompts every 5.5 seconds
    - Apply fadeUp animation on each prompt change
    - Include at least 4 prompt variations
    - _Requirements: 5.1-5.8_
  
  - [x] 3.5 Style quick actions section
    - Create horizontal scrollable container with hidden scrollbars
    - Use PillChip components for quick action chips
    - Apply active state styling (colors.green.default background)
    - Use proper spacing tokens for gaps and padding
    - _Requirements: 19.1-19.8_
  
  - [x] 3.6 Add StatusPill component
    - Position at top-right with proper spacing
    - Display online/offline status with appropriate icons
    - _Requirements: 16.1-16.7_

- [ ]* 3.7 Write property test for VoiceOrb visual states
  - **Property 4: VoiceOrb Idle State**
  - **Property 5: VoiceOrb Listening State**
  - **Validates: Requirements 4.1-4.8**

- [ ]* 3.8 Write unit tests for rotating prompts
  - Test prompts rotate every 5.5 seconds
  - Test fadeUp animation applies on change
  - Test Lora font usage
  - _Requirements: 5.1-5.8_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update ChatScreen visual styling
  - [x] 5.1 Add AmbientBg component to ChatScreen
    - Render AmbientBg at z-index 0 behind content
    - _Requirements: 1.3_
  
  - [x] 5.2 Style user message bubbles
    - Align messages to the right (justify-content: flex-end)
    - Apply colors.green.default background (#138808)
    - Use white text color
    - Apply DM Sans font
    - Use border-radius "20px 20px 4px 20px"
    - Add timestamp with colors.text.tertiary
    - _Requirements: 7.1-7.5_
  
  - [x] 5.3 Style bot message bubbles
    - Align messages to the left (justify-content: flex-start)
    - Wrap in FrostedCard component
    - Apply Lora font
    - Use colors.text.primary color
    - Use typography.leading.relaxed line height
    - Add status badges (offline, cached) with proper icons
    - _Requirements: 7.6-7.10, 3.1_
  
  - [x] 5.4 Implement structured data visualizations
    - Integrate SoilGauge component in FrostedCard
    - Style crop recommendation cards with FrostedCard and colors.green.default accent
    - Style market price table in FrostedCard with colors.saffron.default accent
    - _Requirements: 3.1_
  
  - [x] 5.5 Add loading indicator
    - Display "Thinking..." text in FrostedCard
    - Apply fadePulse animation
    - Use Lora font and colors.text.secondary
    - _Requirements: 11.3_
  
  - [x] 5.6 Style input area
    - Position fixed at bottom with frosted glass effect
    - Style text input with rounded corners (100px border-radius)
    - Integrate VoiceOrb button (44px size)
    - Style send button with colors.green.default background
    - Ensure minHeight 44px for all touch targets
    - _Requirements: 17.1-17.8, 18.1-18.8_
  
  - [x] 5.7 Implement auto-scroll behavior
    - Scroll to bottom when new messages arrive
    - Use smooth scroll behavior
    - _Requirements: N/A (UX enhancement)_

- [ ]* 5.8 Write property test for message styling
  - **Property 20: User Messages Right-Aligned**
  - **Property 21: User Messages Green Background**
  - **Property 24: Bot Messages Left-Aligned**
  - **Validates: Requirements 7.1, 7.2, 7.6**

- [ ]* 5.9 Write unit tests for ChatScreen components
  - Test FrostedCard wraps bot messages
  - Test user message border-radius
  - Test status badges display correctly
  - _Requirements: 3.1, 7.5_

- [x] 6. Update ExploreScreen visual styling
  - [x] 6.1 Add AmbientBg component to ExploreScreen
    - Render AmbientBg at z-index 0 behind content
    - _Requirements: 1.4, 9.1_
  
  - [x] 6.2 Update screen header typography
    - Apply Lora font to title with typography.size['2xl']
    - Apply DM Sans to subtitle
    - Use proper color tokens
    - _Requirements: 2.1, 2.3_
  
  - [x] 6.3 Implement category filter pills
    - Create horizontal scrollable container with hidden scrollbars
    - Use PillChip components with category icons (Wheat, Leaf, CloudRain, TrendingUp, Bug)
    - Apply active state styling (colors.green.default background)
    - _Requirements: 9.2, 9.3_
  
  - [x] 6.4 Style article cards
    - Wrap each article in FrostedCard component
    - Apply colored left border based on category
    - Use Lora font for titles
    - Use DM Sans for descriptions
    - Add hover/press feedback with transform and shadow
    - _Requirements: 3.2, 9.4, 9.5, 9.6_
  
  - [x] 6.5 Implement empty state
    - Display Search icon with low opacity
    - Style empty state text with proper typography
    - Center content vertically
    - _Requirements: N/A (UX enhancement)_

- [ ]* 6.6 Write property test for ExploreScreen components
  - **Property 10: Content Cards Use FrostedCard**
  - **Property 47: Content Titles Use Serif Font**
  - **Validates: Requirements 3.2, 9.5**

- [ ]* 6.7 Write unit tests for category filters
  - Test PillChip active state styling
  - Test category icons display correctly
  - Test horizontal scroll behavior
  - _Requirements: 9.2, 9.3_

- [x] 7. Update SettingsScreen visual styling
  - [x] 7.1 Add AmbientBg component to SettingsScreen
    - Render AmbientBg at z-index 0 behind content
    - _Requirements: 1.5, 10.1_
  
  - [x] 7.2 Update screen header typography
    - Apply Lora font with typography.size['3xl'] (22px)
    - Use colors.text.primary
    - _Requirements: 2.1_
  
  - [x] 7.3 Implement settings sections with FrostedCard
    - Use SettingSection component (wraps FrostedCard)
    - Add section headers with proper typography
    - Apply danger styling for destructive actions
    - _Requirements: 10.2, 10.3, 10.4, 10.7_
  
  - [x] 7.4 Style setting rows
    - Use SettingRow component with proper layout
    - Integrate ToggleSwitch for boolean settings
    - Integrate LangToggle for language selection
    - Style farmer ID input field
    - Display storage and version info
    - _Requirements: 10.5, 10.6_
  
  - [x] 7.5 Style danger zone buttons
    - Apply colors.status.error for border and text
    - Ensure minHeight 44px
    - Add hover state with error background tint
    - _Requirements: 18.1-18.8_
  
  - [x] 7.6 Implement confirmation modal
    - Create modal with FrostedCard
    - Add backdrop with blur effect
    - Style modal buttons (cancel and confirm)
    - Add slideUp animation for modal entrance
    - _Requirements: N/A (UX enhancement)_
  
  - [x] 7.7 Implement language selection sheet
    - Create bottom sheet with FrostedCard
    - Display language grid (2 columns)
    - Style language buttons with selection indicator
    - Add badges for translation speed (Instant/Slower)
    - _Requirements: 10.6_

- [ ]* 7.8 Write property test for SettingsScreen components
  - **Property 11: Settings Sections Use FrostedCard**
  - **Property 36: All Boolean Settings Use ToggleSwitch**
  - **Validates: Requirements 10.4, 10.5**

- [ ]* 7.9 Write unit tests for settings interactions
  - Test ToggleSwitch state changes
  - Test LangToggle opens language sheet
  - Test danger buttons show confirmation modal
  - _Requirements: 10.5, 10.6_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement bottom navigation styling
  - [x] 9.1 Style navigation container
    - Position fixed at bottom with frosted glass effect
    - Set height to 64px
    - Apply proper border and backdrop-filter
    - _Requirements: 15.5_
  
  - [x] 9.2 Style navigation items
    - Use proper icons (Wheat, Compass, BookOpen, Settings)
    - Apply active state styling (colors.green.default)
    - Use DM Sans font for labels
    - Ensure minHeight 44px for touch targets
    - Add smooth transitions
    - _Requirements: 14.1-14.5, 18.4_

- [ ]* 9.3 Write property test for navigation icons
  - **Property 30: All Icons From Design System**
  - **Property 31: All Icons Receive Size and Color Props**
  - **Validates: Requirements 14.1, 14.4**

- [x] 10. Implement comprehensive design token compliance
  - [x] 10.1 Audit and replace hardcoded colors
    - Search for hex colors, rgb() values, and named colors
    - Replace with appropriate design tokens from colors object
    - _Requirements: 6.1-6.10_
  
  - [x] 10.2 Audit and replace hardcoded spacing
    - Search for hardcoded pixel values in margin/padding
    - Replace with spacing tokens
    - _Requirements: 12.1, 12.2, 12.5_
  
  - [x] 10.3 Audit and replace hardcoded border-radius
    - Search for hardcoded border-radius values
    - Replace with radii tokens
    - _Requirements: 12.3_
  
  - [x] 10.4 Audit and replace hardcoded box-shadow
    - Search for hardcoded box-shadow values
    - Replace with shadows tokens
    - _Requirements: 12.4_
  
  - [x] 10.5 Audit and replace hardcoded font sizes
    - Search for hardcoded font-size values
    - Replace with typography.size tokens
    - _Requirements: 2.7_
  
  - [x] 10.6 Audit and replace hardcoded font weights
    - Search for hardcoded font-weight values
    - Replace with typography.weight tokens
    - _Requirements: 2.8_

- [ ]* 10.7 Write property test for token compliance
  - **Property 19: No Hardcoded Colors**
  - **Property 27: All Spacing Uses Tokens**
  - **Property 28: All Border Radius Uses Tokens**
  - **Property 29: All Box Shadows Use Tokens**
  - **Validates: Requirements 6.10, 12.2, 12.3, 12.4**

- [x] 11. Implement screen transition animations
  - [x] 11.1 Add fadeUp animation to all screen mounts
    - Apply to HomeScreen content container
    - Apply to ChatScreen content container
    - Apply to OnboardScreen content container
    - Apply to ExploreScreen content container
    - Apply to SettingsScreen content container
    - _Requirements: 20.1-20.6_
  
  - [x] 11.2 Verify animation timing and easing
    - Ensure all animations use animation.duration tokens
    - Ensure all animations use animation.easing tokens
    - _Requirements: 11.9, 11.10_

- [ ]* 11.3 Write property test for screen animations
  - **Property 46: Screen Mounts Apply FadeUp Animation**
  - **Property 38: All Animation Durations Use Tokens**
  - **Property 39: All Animation Easings Use Tokens**
  - **Validates: Requirements 20.1, 11.9, 11.10**

- [x] 12. Final integration and polish
  - [x] 12.1 Verify all screens render correctly
    - Test navigation between all screens
    - Verify AmbientBg persists across screens
    - Check for visual glitches or layout issues
    - _Requirements: All_
  
  - [x] 12.2 Verify responsive layout
    - Test on 320px viewport (minimum)
    - Test on 390px viewport (target)
    - Verify maxWidth constraint works correctly
    - _Requirements: 15.1-15.7_
  
  - [x] 12.3 Verify accessibility compliance
    - Check color contrast ratios (WCAG AA)
    - Verify all touch targets are at least 44x44px
    - Test with screen reader (aria-labels)
    - _Requirements: 18.4, 18.5_
  
  - [x] 12.4 Performance verification
    - Measure animation frame rates (target 60fps)
    - Test font loading with slow network
    - Verify smooth scrolling on all screens
    - _Requirements: N/A (performance)_

- [ ]* 12.5 Write integration tests for screen navigation
  - Test navigation between all screens
  - Test AmbientBg persistence
  - Test bottom navigation active state updates
  - _Requirements: All screens_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All code should use design tokens from `piritiya-design-system/`
- Existing screen files are in `frontend/src/screens/`
- Design system components are imported from `@ds/components`
- Design system tokens are imported from `@ds/tokens`
- Design system icons are imported from `@ds/icons`
