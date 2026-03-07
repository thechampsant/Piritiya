# Requirements Document

## Introduction

The Piritiya Chatbot Frontend is a Progressive Web App (PWA) designed for farmers in Uttar Pradesh, India. It provides a voice-first, offline-capable interface for accessing agricultural advice, soil moisture data, crop recommendations, and market prices. The application must work reliably on 2G networks and completely offline, with support for Hindi and English languages (with 6 additional languages supported). The target users are farmers with limited digital literacy, requiring a simple, accessible interface with large touch targets.

This specification includes integration with the piritiya-design-system, a comprehensive design system providing tokens, components, icons, and i18n utilities. The design system ensures visual consistency, accessibility compliance, and a cohesive user experience across all screens while maintaining the existing offline-first architecture and voice interaction capabilities.

## Glossary

- **PWA**: Progressive Web App - a web application that can be installed on a device and work offline
- **Service_Worker**: A script that runs in the background to enable offline functionality and caching
- **Web_Speech_API**: Browser API for speech recognition and synthesis
- **IndexedDB**: Browser database for storing structured data offline
- **Chatbot_Interface**: The main UI component for conversing with the AI assistant
- **Backend_API**: The FastAPI server that processes chat requests via AWS Bedrock Agent
- **Session**: A conversation context identified by a unique session_id
- **Farmer_ID**: Unique identifier for a farmer to retrieve personalized data
- **Offline_Mode**: Application state when no network connection is available
- **Voice_Input**: Speech-to-text functionality for user queries
- **Voice_Output**: Text-to-speech functionality for system responses
- **Language_Toggle**: UI control to switch between Hindi and English
- **Design_System**: The piritiya-design-system package located at ../piritiya-design-system/ containing tokens, components, icons, and i18n utilities
- **App_Shell**: The main application container with max-width 390px, centered layout, and bottom navigation
- **Screen_Component**: Top-level UI components representing distinct application views (Onboard, Home, Chat, Explore, Settings)
- **Design_Token**: Predefined values for colors, typography, spacing, radii, shadows, animation, and zIndex
- **Build_System**: Vite configuration and bundler for the Frontend_App
- **Service_Layer**: Existing APIClient, CacheManager, and DBRepository services
- **Context_Layer**: Existing AppContext, ChatContext, and LanguageContext providers
- **Hook_Layer**: Existing useChat, useVoiceInput, useVoiceOutput, and useOfflineSync hooks

## Requirements

### Requirement 1: Voice Input Capability

**User Story:** As a farmer with limited literacy, I want to speak my questions, so that I can interact with the chatbot without typing.

#### Acceptance Criteria

1. WHEN the user taps the microphone button, THE Chatbot_Interface SHALL activate Voice_Input
2. WHILE Voice_Input is active, THE Chatbot_Interface SHALL display a visual indicator
3. WHEN speech is detected, THE Web_Speech_API SHALL convert speech to text
4. WHEN speech recognition completes, THE Chatbot_Interface SHALL display the transcribed text
5. IF Web_Speech_API is unavailable, THEN THE Chatbot_Interface SHALL display a message indicating voice input is not supported
6. WHERE Hindi language is selected, THE Web_Speech_API SHALL recognize Hindi speech (hi-IN locale)
7. WHERE English language is selected, THE Web_Speech_API SHALL recognize English speech (en-IN locale)

### Requirement 2: Voice Output Capability

**User Story:** As a farmer with limited literacy, I want to hear responses spoken aloud, so that I can understand the advice without reading.

#### Acceptance Criteria

1. WHEN a chatbot response is received, THE Chatbot_Interface SHALL automatically trigger Voice_Output
2. WHILE Voice_Output is active, THE Chatbot_Interface SHALL display a visual indicator
3. THE Web_Speech_API SHALL synthesize speech from the response text
4. WHERE Hindi language is selected, THE Web_Speech_API SHALL speak in Hindi voice (hi-IN locale)
5. WHERE English language is selected, THE Web_Speech_API SHALL speak in English voice (en-IN locale)
6. WHEN the user taps a stop button, THE Chatbot_Interface SHALL cancel Voice_Output
7. IF Web_Speech_API is unavailable, THEN THE Chatbot_Interface SHALL display text-only responses

### Requirement 3: Text Chat Interface

**User Story:** As a farmer, I want to type my questions when voice is unavailable, so that I can still interact with the chatbot.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL display a text input field
2. WHEN the user types a message and submits, THE Chatbot_Interface SHALL send the message to Backend_API
3. THE Chatbot_Interface SHALL display user messages and bot responses in chronological order
4. THE Chatbot_Interface SHALL display a loading indicator while waiting for responses
5. THE Chatbot_Interface SHALL scroll to the latest message automatically
6. THE Chatbot_Interface SHALL support touch-friendly input with minimum 44px touch targets

### Requirement 4: Backend Communication

**User Story:** As a user, I want my questions answered by the AI assistant, so that I can receive agricultural advice.

#### Acceptance Criteria

1. WHEN a user message is submitted, THE Chatbot_Interface SHALL send a POST request to Backend_API /chat endpoint
2. THE Chatbot_Interface SHALL include the message text and Session identifier in the request
3. WHEN Backend_API returns a response, THE Chatbot_Interface SHALL display the response text
4. IF Backend_API returns an error, THEN THE Chatbot_Interface SHALL display an error message in the selected language
5. WHILE a request is pending, THE Chatbot_Interface SHALL prevent duplicate submissions
6. THE Chatbot_Interface SHALL set a request timeout of 30 seconds for 2G network compatibility

### Requirement 5: Farmer ID Management

**User Story:** As a farmer, I want to enter my Farmer ID once, so that I receive personalized advice without re-entering it.

#### Acceptance Criteria

1. WHEN the application first loads, THE Chatbot_Interface SHALL prompt for Farmer_ID
2. WHEN a valid Farmer_ID is entered, THE Chatbot_Interface SHALL store it in IndexedDB
3. THE Chatbot_Interface SHALL include the stored Farmer_ID in Backend_API requests
4. THE Chatbot_Interface SHALL provide a settings option to change Farmer_ID
5. WHEN Farmer_ID is changed, THE Chatbot_Interface SHALL clear the current Session

### Requirement 6: Session Management

**User Story:** As a user, I want my conversation to maintain context, so that the chatbot remembers our discussion.

#### Acceptance Criteria

1. WHEN the application starts, THE Chatbot_Interface SHALL generate a unique Session identifier
2. THE Chatbot_Interface SHALL include the Session identifier in all Backend_API requests
3. THE Chatbot_Interface SHALL store Session data in IndexedDB
4. WHEN the user starts a new conversation, THE Chatbot_Interface SHALL generate a new Session identifier
5. THE Chatbot_Interface SHALL restore the previous Session when the application reopens within 24 hours
6. WHEN a Session is older than 24 hours, THE Chatbot_Interface SHALL create a new Session

### Requirement 7: Offline Mode with Cached Responses

**User Story:** As a farmer in an area with poor connectivity, I want to access previously received advice offline, so that I can review information without internet.

#### Acceptance Criteria

1. WHEN Backend_API responses are received, THE Service_Worker SHALL cache them in IndexedDB
2. WHEN no network connection is available, THE Chatbot_Interface SHALL enter Offline_Mode
3. WHILE in Offline_Mode, THE Chatbot_Interface SHALL display an offline indicator
4. WHEN the user submits a query in Offline_Mode, THE Chatbot_Interface SHALL search cached responses for similar queries
5. IF a cached response is found, THEN THE Chatbot_Interface SHALL display it with an "offline" label
6. IF no cached response is found, THEN THE Chatbot_Interface SHALL display a message indicating the query requires internet
7. WHEN network connection is restored, THE Chatbot_Interface SHALL exit Offline_Mode and sync pending queries

### Requirement 8: Progressive Web App Installation

**User Story:** As a farmer, I want to install the app on my phone's home screen, so that I can access it like a native app.

#### Acceptance Criteria

1. THE PWA SHALL include a valid web app manifest file
2. THE PWA SHALL register a Service_Worker on first load
3. THE PWA SHALL meet all PWA installability criteria (HTTPS, manifest, service worker, icons)
4. WHEN installability criteria are met, THE PWA SHALL display an install prompt
5. WHEN the user installs the PWA, THE PWA SHALL be accessible from the device home screen
6. THE PWA SHALL function without browser UI chrome when launched from home screen
7. THE PWA SHALL include icons in sizes 192x192 and 512x512 pixels

### Requirement 9: Service Worker Caching Strategy

**User Story:** As a user with limited connectivity, I want the app to load quickly and work offline, so that I can access it anytime.

#### Acceptance Criteria

1. THE Service_Worker SHALL cache all static assets (HTML, CSS, JavaScript, images) on install
2. THE Service_Worker SHALL use a cache-first strategy for static assets
3. THE Service_Worker SHALL use a network-first strategy with cache fallback for API requests
4. THE Service_Worker SHALL cache Backend_API responses in IndexedDB
5. WHEN the Service_Worker updates, THE Service_Worker SHALL clear old caches and install new assets
6. THE Service_Worker SHALL limit cache size to 50MB maximum
7. WHEN cache size exceeds 50MB, THE Service_Worker SHALL remove oldest cached responses

### Requirement 10: Language Selection

**User Story:** As a farmer, I want to switch between Hindi and English, so that I can use the language I'm most comfortable with.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL display a Language_Toggle control
2. WHEN the user selects Hindi, THE Chatbot_Interface SHALL display all UI text in Hindi
3. WHEN the user selects English, THE Chatbot_Interface SHALL display all UI text in English
4. THE Chatbot_Interface SHALL store the language preference in IndexedDB
5. WHEN the application loads, THE Chatbot_Interface SHALL apply the stored language preference
6. WHEN language is changed, THE Chatbot_Interface SHALL update Voice_Input and Voice_Output locales accordingly
7. THE Chatbot_Interface SHALL default to Hindi if no preference is stored

### Requirement 11: Data Display Components

**User Story:** As a farmer, I want to see soil moisture, crop recommendations, and market prices in an easy-to-read format, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN soil moisture data is received, THE Chatbot_Interface SHALL display it with a visual gauge or percentage
2. WHEN crop recommendations are received, THE Chatbot_Interface SHALL display them as a list with icons
3. WHEN market prices are received, THE Chatbot_Interface SHALL display them in a table format with crop names and prices
4. THE Chatbot_Interface SHALL use large, readable fonts (minimum 16px for body text)
5. THE Chatbot_Interface SHALL use high-contrast colors for readability in bright sunlight
6. THE Chatbot_Interface SHALL display numerical data in the selected language's numeral system

### Requirement 12: Accessibility Compliance

**User Story:** As a user with visual or motor impairments, I want the app to be accessible, so that I can use it effectively.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL provide text alternatives for all non-text content
2. THE Chatbot_Interface SHALL support keyboard navigation for all interactive elements
3. THE Chatbot_Interface SHALL maintain a logical focus order
4. THE Chatbot_Interface SHALL use ARIA labels for screen reader compatibility
5. THE Chatbot_Interface SHALL provide minimum 44x44 pixel touch targets for all interactive elements
6. THE Chatbot_Interface SHALL maintain a minimum contrast ratio of 4.5:1 for normal text
7. THE Chatbot_Interface SHALL support browser zoom up to 200% without loss of functionality

### Requirement 13: Responsive Mobile-First Design

**User Story:** As a farmer using a smartphone, I want the app to work well on my small screen, so that I can use it comfortably.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL be optimized for viewport widths from 320px to 428px
2. THE Chatbot_Interface SHALL use a single-column layout on mobile devices
3. THE Chatbot_Interface SHALL adapt to larger screens (tablets, desktop) with responsive breakpoints
4. THE Chatbot_Interface SHALL use relative units (rem, em, %) for sizing
5. THE Chatbot_Interface SHALL prevent horizontal scrolling on all screen sizes
6. THE Chatbot_Interface SHALL position fixed elements (input bar, header) appropriately for mobile keyboards

### Requirement 14: Performance on Low-End Devices

**User Story:** As a farmer with a budget smartphone, I want the app to run smoothly, so that I can use it without frustration.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL achieve First Contentful Paint within 2 seconds on 3G networks
2. THE Chatbot_Interface SHALL achieve Time to Interactive within 5 seconds on 3G networks
3. THE Chatbot_Interface SHALL limit JavaScript bundle size to 200KB (gzipped)
4. THE Chatbot_Interface SHALL use code splitting to load features on demand
5. THE Chatbot_Interface SHALL optimize images to WebP format with fallbacks
6. THE Chatbot_Interface SHALL debounce user input events to reduce processing overhead
7. THE Chatbot_Interface SHALL use virtual scrolling for long message lists exceeding 50 messages

### Requirement 15: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when something goes wrong, so that I understand what happened and what to do next.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Chatbot_Interface SHALL display an error message in the selected language
2. WHEN Backend_API is unavailable, THE Chatbot_Interface SHALL suggest trying again later or using offline mode
3. WHEN Voice_Input fails, THE Chatbot_Interface SHALL prompt the user to try text input
4. WHEN an invalid Farmer_ID is entered, THE Chatbot_Interface SHALL display a validation error
5. THE Chatbot_Interface SHALL provide retry buttons for failed operations
6. THE Chatbot_Interface SHALL log errors to IndexedDB for debugging purposes
7. WHEN a critical error occurs, THE Chatbot_Interface SHALL provide a "Reset App" option to clear all data

### Requirement 16: Data Synchronization

**User Story:** As a user who works offline, I want my queries to be sent when I'm back online, so that I don't lose my questions.

#### Acceptance Criteria

1. WHEN a query is submitted in Offline_Mode, THE Chatbot_Interface SHALL queue it in IndexedDB
2. WHEN network connection is restored, THE Chatbot_Interface SHALL automatically send queued queries to Backend_API
3. THE Chatbot_Interface SHALL display a sync indicator while sending queued queries
4. WHEN queued queries are successfully sent, THE Chatbot_Interface SHALL remove them from the queue
5. IF a queued query fails after 3 retry attempts, THEN THE Chatbot_Interface SHALL mark it as failed and notify the user
6. THE Chatbot_Interface SHALL maintain query order when synchronizing

### Requirement 17: Quick Actions and Shortcuts

**User Story:** As a farmer, I want quick access to common queries, so that I can get information faster.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL display quick action buttons for common queries
2. THE Chatbot_Interface SHALL include quick actions for "Soil Moisture", "Crop Advice", "Market Prices", and "Weather"
3. WHEN a quick action is tapped, THE Chatbot_Interface SHALL send the corresponding query to Backend_API
4. THE Chatbot_Interface SHALL customize quick actions based on Farmer_ID and previous queries
5. THE Chatbot_Interface SHALL display quick actions in the selected language

### Requirement 18: Settings and Configuration

**User Story:** As a user, I want to customize app settings, so that I can adjust it to my preferences.

#### Acceptance Criteria

1. THE Chatbot_Interface SHALL provide a settings screen accessible from the main interface
2. THE Settings_Screen SHALL allow changing Farmer_ID
3. THE Settings_Screen SHALL allow toggling voice input/output on or off
4. THE Settings_Screen SHALL allow clearing cached data
5. THE Settings_Screen SHALL display app version and storage usage
6. THE Settings_Screen SHALL allow changing language preference
7. WHEN settings are changed, THE Chatbot_Interface SHALL store them in IndexedDB

### Requirement 19: Security and Privacy

**User Story:** As a farmer, I want my data to be secure, so that my personal information is protected.

#### Acceptance Criteria

1. THE PWA SHALL be served over HTTPS
2. THE Chatbot_Interface SHALL not store sensitive data in localStorage
3. THE Chatbot_Interface SHALL use secure communication with Backend_API
4. THE Chatbot_Interface SHALL not log personally identifiable information to browser console
5. THE Service_Worker SHALL validate cached data integrity before serving
6. THE Chatbot_Interface SHALL provide a "Clear All Data" option in settings
7. WHEN the user clears data, THE Chatbot_Interface SHALL remove all IndexedDB entries and cached responses


---

## Design System Integration Requirements

### Requirement 20: Build System Configuration for Design System

**User Story:** As a developer, I want the build system to resolve imports from the piritiya-design-system, so that Frontend components can use design system modules.

#### Acceptance Criteria

1. THE Build_System SHALL configure Vite to resolve imports from ../piritiya-design-system/src/ using an @ds alias
2. WHEN a component imports from @ds, THE Build_System SHALL successfully bundle the Design_System modules
3. THE Build_System SHALL maintain existing TypeScript compilation for .tsx files
4. THE Build_System SHALL support JSX compilation for Design_System .jsx files
5. THE Build_System SHALL update vite.config.ts with path alias configuration

### Requirement 21: Global Styles Integration from Design System

**User Story:** As a developer, I want global styles from the Design_System applied to the application, so that consistent styling is available throughout.

#### Acceptance Criteria

1. THE Frontend_App SHALL inject globalStyles from the Design_System into the document
2. THE Frontend_App SHALL load Google Fonts from the googleFontsUrl token
3. THE App_Shell SHALL apply the background gradient (#f5f0e8 → #eef4ee → #f8f8f6)
4. THE App_Shell SHALL set max-width to 390px and center the layout
5. THE App_Shell SHALL set height to 100dvh for full viewport coverage

### Requirement 22: Design Token Usage Throughout Application

**User Story:** As a developer, I want to use Design_Tokens consistently across all components, so that the UI maintains visual coherence.

#### Acceptance Criteria

1. THE Frontend_App SHALL use colors tokens for all color values instead of hardcoded hex values
2. THE Frontend_App SHALL use typography tokens for font families (DM Sans for body, Lora for headings)
3. THE Frontend_App SHALL use spacing tokens for margins and padding
4. THE Frontend_App SHALL use radii tokens for border radius (20px for cards, 100px for pills)
5. THE Frontend_App SHALL use shadows tokens for card elevation effects
6. THE Frontend_App SHALL use animation tokens for transitions and keyframes
7. THE Frontend_App SHALL use zIndex tokens for layering elements

### Requirement 23: Internationalization Integration with Design System

**User Story:** As a developer, I want to integrate Design_System i18n utilities with existing LanguageContext, so that language switching works seamlessly.

#### Acceptance Criteria

1. THE Frontend_App SHALL use getTranslation from Design_System for all translatable text
2. THE Frontend_App SHALL use toLocalNum from Design_System for number formatting
3. THE Frontend_App SHALL support all 8 languages from LANGUAGES constant (hi, en, bn, gu, kn, ml, ta, te)
4. WHEN LanguageContext language changes, THE Frontend_App SHALL re-render components with updated translations
5. THE Frontend_App SHALL maintain backward compatibility with existing utils/i18n.ts utilities

### Requirement 24: Icon System Integration from Design System

**User Story:** As a developer, I want to use Design_System icons throughout the application, so that visual elements are consistent and no emoji are used.

#### Acceptance Criteria

1. THE Frontend_App SHALL import icons from Design_System icons module
2. THE Frontend_App SHALL replace all emoji with appropriate Design_System icons
3. THE Frontend_App SHALL use PiritiyaMark for branding elements in headers
4. THE Frontend_App SHALL use Beetle icon where appropriate for the Piritiya brand
5. THE Frontend_App SHALL ensure all icons meet 44px minimum touch target size for accessibility

### Requirement 25: Onboard Screen with Design System Components

**User Story:** As a farmer, I want an onboarding screen to enter my farmer ID and select my language, so that I can start using the application.

#### Acceptance Criteria

1. THE Onboard_Screen SHALL display the PiritiyaMark logo at 36px size with #138808 color
2. THE Onboard_Screen SHALL provide an input field for farmer ID with minHeight 44px
3. THE Onboard_Screen SHALL include a LangToggle component for language selection
4. WHEN a valid farmer ID is entered, THE Onboard_Screen SHALL enable the "Get Started" button
5. WHEN the "Get Started" button is tapped, THE Onboard_Screen SHALL save farmer ID to AppContext and navigate to Home_Screen
6. THE Onboard_Screen SHALL display TeamBadge and AWSBadge at the bottom
7. THE Onboard_Screen SHALL validate farmer ID format using existing validation utilities

### Requirement 26: Home Screen with Voice-First Interface

**User Story:** As a farmer, I want a voice-first home screen with quick actions, so that I can easily start conversations or access common features.

#### Acceptance Criteria

1. THE Home_Screen SHALL display a VoiceOrb component at 72px size as the primary interaction element
2. THE Home_Screen SHALL show rotating editorial prompts that swap every 5.5s with fadeUp animation
3. THE Home_Screen SHALL display quick action buttons using PillChip components in a horizontal scroll row
4. WHEN VoiceOrb is tapped, THE Home_Screen SHALL activate voice input using useVoiceInput hook
5. WHEN a quick action is tapped, THE Home_Screen SHALL send the query as a chat message and navigate to Chat_Screen
6. THE Home_Screen SHALL display StatusPill showing online/offline status
7. THE Home_Screen SHALL use AmbientBg component behind all content
8. THE Home_Screen SHALL provide Voice/Type mode switcher using PillChip components

### Requirement 27: Chat Screen with Message Bubbles

**User Story:** As a farmer, I want to view my conversation history with distinct message bubbles, so that I can follow the dialogue clearly.

#### Acceptance Criteria

1. THE Chat_Screen SHALL display messages from ChatContext in a scrollable list
2. THE Chat_Screen SHALL render user messages right-aligned with #138808 background and white text
3. THE Chat_Screen SHALL render bot messages left-aligned using FrostedCard component
4. THE Chat_Screen SHALL use Lora serif font for bot message text
5. THE Chat_Screen SHALL display message timestamps using toLocalNum for formatting
6. WHEN new messages arrive, THE Chat_Screen SHALL auto-scroll to the latest message
7. THE Chat_Screen SHALL integrate with existing useChat hook for message management
8. THE Chat_Screen SHALL display SoilGauge, CropCard, and MarketCard for structured bot responses
9. THE Chat_Screen SHALL show Archive badge on cached responses and WifiOff badge on offline responses

### Requirement 28: Explore Screen for Content Discovery

**User Story:** As a farmer, I want to discover agricultural articles organized by category, so that I can learn about relevant farming topics.

#### Acceptance Criteria

1. THE Explore_Screen SHALL display article categories using PillChip components
2. THE Explore_Screen SHALL show featured articles in FrostedCard containers with colored left borders
3. THE Explore_Screen SHALL use appropriate icons (Wheat, Leaf, CloudRain, TrendingUp, Bug) for categories
4. WHEN a category is selected, THE Explore_Screen SHALL filter articles by that category using #138808 for active state
5. WHEN an article is tapped, THE Explore_Screen SHALL send it as a chat query and navigate to Chat_Screen
6. THE Explore_Screen SHALL display an empty state with Search icon when no articles match filters
7. THE Explore_Screen SHALL use Lora serif font for article titles

### Requirement 29: Settings Screen with Design System Components

**User Story:** As a farmer, I want to manage my settings including farmer ID, language, and voice preferences, so that I can customize my experience.

#### Acceptance Criteria

1. THE Settings_Screen SHALL display farmer ID using SettingRow component with text input
2. THE Settings_Screen SHALL provide language selection using LangToggle component
3. THE Settings_Screen SHALL include voice input toggle using ToggleSwitch component
4. THE Settings_Screen SHALL include voice output toggle using ToggleSwitch component
5. WHEN language is changed, THE Settings_Screen SHALL update LanguageContext
6. WHEN voice toggles are changed, THE Settings_Screen SHALL update AppContext preferences
7. THE Settings_Screen SHALL group related settings using SettingSection component
8. THE Settings_Screen SHALL display storage usage and app version (1.0.0)
9. THE Settings_Screen SHALL provide danger zone actions (Clear Cache, Clear All Data, Reset App) with red tint
10. THE Settings_Screen SHALL show confirmation modal with blurred backdrop for destructive actions
11. THE Settings_Screen SHALL display TeamBadge and AWSBadge in the footer

### Requirement 30: Bottom Navigation with Design System Icons

**User Story:** As a farmer, I want bottom navigation to switch between main screens, so that I can easily access different parts of the application.

#### Acceptance Criteria

1. THE App_Shell SHALL display bottom navigation with 4 tabs: Today (Wheat icon), Explore (Compass icon), Entries (BookOpen icon), Settings (Settings icon)
2. THE App_Shell SHALL use Design_System icons for all navigation items
3. WHEN a tab is tapped, THE App_Shell SHALL navigate to the corresponding Screen_Component
4. THE App_Shell SHALL highlight the active tab using primary action color (#138808)
5. THE App_Shell SHALL show inactive tabs with rgba(20,30,16,0.4) color
6. THE App_Shell SHALL ensure all tabs have minHeight 44px for accessibility
7. THE App_Shell SHALL hide bottom navigation on Onboard_Screen
8. THE App_Shell SHALL apply rgba(255,255,255,0.85) background with backdropFilter blur(24px)

### Requirement 31: Language Sheet Bottom Sheet

**User Story:** As a farmer, I want a bottom sheet for language selection, so that I can easily switch between all supported languages.

#### Acceptance Criteria

1. THE LangSheet SHALL display all 8 supported languages from LANGUAGES constant in a 2-column grid
2. THE LangSheet SHALL show script name (large) and roman name (small) for each language
3. THE LangSheet SHALL display "Instant" badge for hi/en and "Slower" badge for other languages
4. THE LangSheet SHALL highlight the currently selected language with green border and Check icon
5. WHEN a language is selected, THE LangSheet SHALL update LanguageContext and close
6. THE LangSheet SHALL animate in from bottom using slideUp animation (cubic-bezier(0.32,0.72,0,1))
7. THE LangSheet SHALL use blurred dark backdrop that dismisses the sheet when tapped
8. WHEN a batch language (non hi/en) is selected, THE LangSheet SHALL show a 4-second warning toast

### Requirement 32: VoiceOrb Component Integration

**User Story:** As a farmer, I want visual feedback when using voice input, so that I know the system is listening.

#### Acceptance Criteria

1. THE VoiceOrb SHALL display tricolour gradient (saffron top, white mid, green bottom) in idle state
2. THE VoiceOrb SHALL show navy #000080 mic icon at 80% opacity in idle state
3. THE VoiceOrb SHALL pulse with 4s slow animation in idle state
4. WHEN tapped, THE VoiceOrb SHALL animate ripple rings outward
5. WHEN listening, THE VoiceOrb SHALL fade out the mic icon
6. THE VoiceOrb SHALL display "Listening..." text below with pulse animation when active
7. WHEN voice is disabled in settings, THE VoiceOrb SHALL show error toast immediately on tap

### Requirement 33: Service Layer Integration with Design System

**User Story:** As a developer, I want Screen_Components to use existing Service_Layer, so that data fetching and caching remain consistent.

#### Acceptance Criteria

1. THE Screen_Components SHALL use APIClient for all API requests
2. THE Screen_Components SHALL use CacheManager for offline data access
3. THE Screen_Components SHALL use DBRepository for local data persistence
4. THE Screen_Components SHALL handle API errors using existing errorHandlers utilities
5. THE Screen_Components SHALL maintain offline-first behavior with useOfflineSync hook

### Requirement 34: Context Layer Integration with Design System

**User Story:** As a developer, I want Screen_Components to consume existing Context_Layer, so that state management remains centralized.

#### Acceptance Criteria

1. THE Screen_Components SHALL consume AppContext for global application state
2. THE Screen_Components SHALL consume ChatContext for conversation state
3. THE Screen_Components SHALL consume LanguageContext for language preferences
4. THE Screen_Components SHALL update contexts using provided setter functions
5. THE Screen_Components SHALL re-render when context values change

### Requirement 35: Voice Interaction Integration with Design System

**User Story:** As a farmer, I want voice input and output to work with new Screen_Components, so that I can interact hands-free.

#### Acceptance Criteria

1. THE Screen_Components SHALL use useVoiceInput hook for voice recognition
2. THE Screen_Components SHALL use useVoiceOutput hook for text-to-speech
3. THE Screen_Components SHALL use VoiceOrb component for visual voice feedback
4. WHEN voice input is active, THE Screen_Components SHALL display appropriate visual indicators
5. THE Screen_Components SHALL handle voice input errors gracefully using StatusPill component

### Requirement 36: Design System Accessibility Compliance

**User Story:** As a farmer with accessibility needs, I want all Design_System components to meet accessibility standards, so that I can use the application effectively.

#### Acceptance Criteria

1. THE Screen_Components SHALL ensure all tappable elements have minHeight 44px
2. THE Screen_Components SHALL use text color #1a2010 for sufficient contrast against light backgrounds
3. THE Screen_Components SHALL provide ARIA labels for icon-only buttons
4. THE Screen_Components SHALL support keyboard navigation for all interactive elements
5. THE Screen_Components SHALL announce screen changes to screen readers
6. THE Screen_Components SHALL maintain focus management during navigation

### Requirement 37: TypeScript Type Safety for Design System

**User Story:** As a developer, I want TypeScript types for Design_System components, so that I can catch errors at compile time.

#### Acceptance Criteria

1. THE Frontend_App SHALL create TypeScript declaration files (.d.ts) for Design_System JSX components
2. THE Frontend_App SHALL define prop types for all Screen_Components
3. THE Build_System SHALL report type errors for incorrect Design_System usage
4. THE Frontend_App SHALL maintain existing type definitions in types/index.ts
5. THE Frontend_App SHALL use strict TypeScript configuration

### Requirement 38: Existing Functionality Preservation During Integration

**User Story:** As a developer, I want all existing Frontend_App functionality to continue working after Design_System integration, so that no features are lost.

#### Acceptance Criteria

1. THE Frontend_App SHALL maintain all existing component functionality from components/ directory
2. THE Frontend_App SHALL preserve offline sync behavior using useOfflineSync hook
3. THE Frontend_App SHALL continue to support all existing API endpoints through APIClient
4. THE Frontend_App SHALL maintain session management using utils/session.ts
5. THE Frontend_App SHALL preserve validation logic from utils/validation.ts
6. THE Frontend_App SHALL keep performance monitoring from utils/performance.ts
7. THE Frontend_App SHALL maintain error handling from ErrorBoundary component

### Requirement 39: Screen Routing System with Design System

**User Story:** As a developer, I want a routing system for Screen_Components, so that navigation between screens is managed consistently.

#### Acceptance Criteria

1. THE App_Shell SHALL implement screen routing with states: "onboard", "home", "chat", "explore", "settings"
2. WHEN the application first loads, THE App_Shell SHALL display Onboard_Screen if no farmer ID exists in AppContext
3. WHEN farmer ID exists, THE App_Shell SHALL display Home_Screen on load
4. THE App_Shell SHALL maintain current screen state during re-renders
5. THE App_Shell SHALL support programmatic navigation from any Screen_Component
6. THE App_Shell SHALL preserve scroll position when navigating back to previous screens

### Requirement 40: Component Organization with Screens Directory

**User Story:** As a developer, I want Screen_Components organized in a dedicated directory, so that the codebase structure is clear.

#### Acceptance Criteria

1. THE Frontend_App SHALL create a screens/ directory at frontend/src/screens/
2. THE Frontend_App SHALL place OnboardScreen.jsx in screens/ directory
3. THE Frontend_App SHALL place HomeScreen.jsx in screens/ directory
4. THE Frontend_App SHALL place ChatScreen.jsx in screens/ directory
5. THE Frontend_App SHALL place ExploreScreen.jsx in screens/ directory
6. THE Frontend_App SHALL place SettingsScreen.jsx in screens/ directory
7. THE Frontend_App SHALL maintain existing components/ directory for reusable components
8. THE Frontend_App SHALL update import paths in App.tsx to reference screens/ directory
