# Implementation Plan: Piritiya Chatbot Frontend

## Overview

This plan implements a Progressive Web App (PWA) for farmers in Uttar Pradesh with voice-first, offline-capable access to agricultural advice. The implementation uses React 18+ with TypeScript, Tailwind CSS, IndexedDB for offline storage, and Workbox for service worker management. The architecture follows a mobile-first, accessible design optimized for low-bandwidth networks and budget smartphones.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize React project with Vite or Next.js 14+
  - Configure TypeScript with strict mode
  - Set up Tailwind CSS with custom mobile-first configuration
  - Install core dependencies: idb, workbox-precaching, workbox-routing, workbox-strategies
  - Configure build tools for PWA (vite-plugin-pwa or next-pwa)
  - Set up testing framework (Vitest or Jest) with React Testing Library
  - Install fast-check for property-based testing
  - Create directory structure (components, contexts, hooks, services, utils, types)
  - _Requirements: 8.1, 14.1_

- [x] 2. Core type definitions and constants
  - [x] 2.1 Create TypeScript interfaces for all data models
    - Define Message, Session, Settings, CachedResponse, PendingQuery models
    - Define API request/response types (ChatRequest, ChatResponse, etc.)
    - Define state models (AppState, ChatState, VoiceState)
    - Define component prop interfaces
    - _Requirements: 4.1, 4.2, 5.2, 6.1, 7.1_
  
  - [x] 2.2 Create constants file
    - Define API endpoints and base URL
    - Define cache size limits (50MB)
    - Define session timeout (24 hours)
    - Define retry configuration (3 attempts, exponential backoff)
    - Define supported languages and locales
    - _Requirements: 9.6, 6.5, 10.1_


- [x] 3. IndexedDB repository implementation
  - [x] 3.1 Create DBRepository class with idb library
    - Initialize IndexedDB with schema (messages, sessions, settings, cachedResponses, pendingQueries)
    - Implement saveMessage, getMessagesBySession methods
    - Implement saveSession, getSession methods
    - Implement saveSetting, getSetting methods
    - Implement cache methods (cacheResponse, findCachedResponse)
    - Implement pending query methods (addPendingQuery, getPendingQueries, removePendingQuery)
    - Implement clearAllData method
    - _Requirements: 7.1, 6.3, 9.4, 16.1, 19.7_
  
  - [ ]* 3.2 Write property test for IndexedDB repository
    - **Property 9: Farmer ID Persistence**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 3.3 Write property test for session persistence
    - **Property 13: Session Persistence**
    - **Validates: Requirements 6.3**
  
  - [ ]* 3.4 Write unit tests for DBRepository
    - Test database initialization and schema creation
    - Test CRUD operations for all entity types
    - Test error handling for quota exceeded
    - Test clearAllData removes all entries
    - _Requirements: 7.1, 6.3, 19.7_

- [x] 4. Cache manager implementation
  - [x] 4.1 Create CacheManager class
    - Implement cacheAPIResponse method with size tracking
    - Implement getCachedResponse method
    - Implement findSimilarCachedResponse with fuzzy matching
    - Implement pruneOldCache method (remove oldest 20% when limit exceeded)
    - Implement getCacheSize method
    - _Requirements: 7.1, 9.6, 9.7_
  
  - [ ]* 4.2 Write property test for cache size limit
    - **Property 22: Cache Size Limit Enforcement**
    - **Validates: Requirements 9.6, 9.7**
  
  - [ ]* 4.3 Write unit tests for CacheManager
    - Test cache storage and retrieval
    - Test pruning when size exceeds 50MB
    - Test similar query matching
    - _Requirements: 9.6, 9.7_

- [x] 5. API client implementation
  - [x] 5.1 Create APIClient class with fetch wrapper
    - Implement fetchWithRetry method (3 retries, exponential backoff)
    - Implement sendChatMessage method with timeout (30s)
    - Implement getFarmers, getSoilMoisture, getCropAdvice, getMarketPrices, getAdvice methods
    - Add request/response interceptors for farmer_id and session_id
    - Handle network errors and timeouts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3, 6.2_
  
  - [ ]* 5.2 Write property test for API request structure
    - **Property 7: API Request Structure**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ]* 5.3 Write property test for session identifier inclusion
    - **Property 12: Session Identifier Inclusion**
    - **Validates: Requirements 6.2**
  
  - [ ]* 5.4 Write property test for HTTPS communication
    - **Property 51: HTTPS Communication**
    - **Validates: Requirements 19.3**
  
  - [ ]* 5.5 Write unit tests for APIClient
    - Test successful API calls with mocked responses (MSW)
    - Test retry logic on network failures
    - Test timeout handling
    - Test error response handling
    - _Requirements: 4.3, 4.4, 15.1_


- [x] 6. Utility functions and helpers
  - [x] 6.1 Create session management utilities
    - Implement generateSessionId function (UUID v4)
    - Implement isSessionExpired function (24-hour check)
    - Implement getOrCreateSession function
    - _Requirements: 6.1, 6.4, 6.5, 6.6_
  
  - [x] 6.2 Create i18n utilities
    - Create translation dictionaries for Hindi and English
    - Implement getTranslation function
    - Implement formatNumber function (Devanagari/Arabic numerals)
    - _Requirements: 10.1, 10.2, 10.3, 11.6_
  
  - [x] 6.3 Create validation utilities
    - Implement validateFarmerId function
    - Implement sanitizeInput function
    - Implement validateCacheSize function
    - _Requirements: 5.1, 19.1_
  
  - [ ]* 6.4 Write property test for unique session generation
    - **Property 11: Unique Session Generation**
    - **Validates: Requirements 6.1, 6.4**
  
  - [ ]* 6.5 Write property test for session restoration
    - **Property 14: Session Restoration Within 24 Hours**
    - **Validates: Requirements 6.5, 6.6**
  
  - [ ]* 6.6 Write property test for numeral system localization
    - **Property 29: Numeral System Localization**
    - **Validates: Requirements 11.6**
  
  - [ ]* 6.7 Write unit tests for utility functions
    - Test session ID uniqueness
    - Test session expiration logic
    - Test translation lookups
    - Test number formatting for both locales
    - _Requirements: 6.1, 6.5, 10.2, 11.6_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Voice input hook implementation
  - [x] 8.1 Create useVoiceInput custom hook
    - Initialize Web Speech API SpeechRecognition
    - Implement startListening and stopListening functions
    - Handle browser compatibility detection
    - Handle recognition results and errors
    - Manage listening state and transcript state
    - Configure locale based on language parameter (hi-IN or en-IN)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 8.2 Write property test for voice input activation
    - **Property 1: Voice Input Activation**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 8.3 Write property test for speech recognition locale
    - **Property 2: Speech Recognition Locale Configuration**
    - **Validates: Requirements 1.6, 1.7, 2.4, 2.5**
  
  - [ ]* 8.4 Write unit tests for useVoiceInput
    - Test browser compatibility detection
    - Test permission denial handling
    - Test no speech detected handling
    - Test successful transcription
    - Test locale configuration for Hindi and English
    - _Requirements: 1.1, 1.6, 15.2_

- [x] 9. Voice output hook implementation
  - [x] 9.1 Create useVoiceOutput custom hook
    - Initialize Web Speech API SpeechSynthesis
    - Implement speak and stop functions
    - Handle browser compatibility detection
    - Manage speaking state
    - Configure locale based on language parameter (hi-IN or en-IN)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 9.2 Write property test for voice output auto-trigger
    - **Property 3: Voice Output Auto-Trigger**
    - **Validates: Requirements 2.1, 2.3**
  
  - [ ]* 9.3 Write property test for voice output cancellation
    - **Property 4: Voice Output Cancellation**
    - **Validates: Requirements 2.6**
  
  - [ ]* 9.4 Write unit tests for useVoiceOutput
    - Test browser compatibility detection
    - Test speak function with different locales
    - Test stop function cancels synthesis
    - Test auto-play behavior
    - _Requirements: 2.1, 2.6, 15.2_


- [x] 10. Offline sync hook implementation
  - [x] 10.1 Create useOfflineSync custom hook
    - Monitor online/offline status with navigator.onLine
    - Implement syncNow function to process pending queries
    - Track pending query count from IndexedDB
    - Manage syncing state
    - Auto-sync on network reconnection
    - _Requirements: 7.2, 7.3, 7.7, 16.2, 16.3_
  
  - [ ]* 10.2 Write property test for offline mode activation
    - **Property 16: Offline Mode Activation**
    - **Validates: Requirements 7.2, 7.3**
  
  - [ ]* 10.3 Write property test for network reconnection sync
    - **Property 18: Network Reconnection Sync**
    - **Validates: Requirements 7.7, 16.2**
  
  - [ ]* 10.4 Write property test for query order preservation
    - **Property 45: Query Order Preservation**
    - **Validates: Requirements 16.6**
  
  - [ ]* 10.5 Write unit tests for useOfflineSync
    - Test online/offline detection
    - Test auto-sync on reconnection
    - Test pending query processing in order
    - Test sync indicator display
    - _Requirements: 7.2, 7.7, 16.2, 16.3, 16.6_

- [x] 11. Chat hook implementation
  - [x] 11.1 Create useChat custom hook
    - Load messages from IndexedDB on mount
    - Implement sendMessage function with online/offline handling
    - Queue messages in IndexedDB when offline
    - Cache responses after successful API calls
    - Manage loading and error states
    - Handle duplicate submission prevention
    - _Requirements: 3.1, 3.2, 4.1, 4.5, 7.1, 7.4, 7.5, 16.1_
  
  - [ ]* 11.2 Write property test for duplicate submission prevention
    - **Property 8: Duplicate Submission Prevention**
    - **Validates: Requirements 4.5**
  
  - [ ]* 11.3 Write property test for response caching
    - **Property 15: Response Caching**
    - **Validates: Requirements 7.1, 9.4**
  
  - [ ]* 11.4 Write property test for offline query caching
    - **Property 17: Offline Query Caching**
    - **Validates: Requirements 7.4, 7.5**
  
  - [ ]* 11.5 Write property test for offline query queuing
    - **Property 42: Offline Query Queuing**
    - **Validates: Requirements 16.1**
  
  - [ ]* 11.6 Write property test for successful query dequeuing
    - **Property 44: Successful Query Dequeuing**
    - **Validates: Requirements 16.4**
  
  - [ ]* 11.7 Write unit tests for useChat
    - Test message loading from IndexedDB
    - Test online message submission
    - Test offline message queuing
    - Test response caching
    - Test duplicate submission prevention
    - _Requirements: 3.1, 4.1, 4.5, 7.1, 7.4, 16.1_

- [x] 12. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 13. Context providers implementation
  - [x] 13.1 Create AppContext provider
    - Implement AppState with farmerId, language, isOnline, voiceEnabled, isInstalled
    - Load settings from IndexedDB on mount
    - Implement setFarmerId, setLanguage, toggleVoice actions
    - Persist settings changes to IndexedDB
    - _Requirements: 5.2, 10.1, 18.1, 18.3_
  
  - [x] 13.2 Create ChatContext provider
    - Implement ChatState with sessionId, messages, isLoading, error, pendingQueries
    - Implement sendMessage action using useChat hook
    - Implement startNewSession action
    - Implement syncPendingQueries action
    - _Requirements: 3.1, 6.1, 16.2_
  
  - [x] 13.3 Create LanguageContext provider
    - Wrap i18n utilities for component access
    - Provide translation function and current language
    - Update on language change from AppContext
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 13.4 Write property test for language UI update
    - **Property 23: Language UI Update**
    - **Validates: Requirements 10.2, 10.3**
  
  - [ ]* 13.5 Write property test for language preference persistence
    - **Property 24: Language Preference Persistence**
    - **Validates: Requirements 10.4, 10.5**
  
  - [ ]* 13.6 Write property test for voice locale update
    - **Property 25: Voice Locale Update on Language Change**
    - **Validates: Requirements 10.6**
  
  - [ ]* 13.7 Write property test for session reset on farmer ID change
    - **Property 10: Session Reset on Farmer ID Change**
    - **Validates: Requirements 5.5**
  
  - [ ]* 13.8 Write property test for settings persistence
    - **Property 48: Settings Persistence**
    - **Validates: Requirements 18.3, 18.6, 18.7**
  
  - [ ]* 13.9 Write unit tests for context providers
    - Test AppContext state updates and persistence
    - Test ChatContext message handling
    - Test LanguageContext translation updates
    - Test farmer ID change triggers session reset
    - _Requirements: 5.2, 5.5, 10.1, 18.3_

- [x] 14. VoiceInput component implementation
  - [x] 14.1 Create VoiceInput component
    - Use useVoiceInput hook with language prop
    - Render microphone button with 44x44px minimum size
    - Display visual indicator during recording (animated icon)
    - Show error messages for unsupported browsers or permission denial
    - Emit transcript to parent via onTranscript callback
    - Handle touch interactions with proper feedback
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.6, 12.5_
  
  - [ ]* 14.2 Write property test for touch target size
    - **Property 6: Touch Target Minimum Size**
    - **Validates: Requirements 3.6, 12.5**
  
  - [ ]* 14.3 Write property test for text alternatives
    - **Property 30: Text Alternatives for Non-Text Content**
    - **Validates: Requirements 12.1, 12.4**
  
  - [ ]* 14.4 Write unit tests for VoiceInput
    - Test microphone button renders
    - Test visual indicator appears when listening
    - Test transcript emission to parent
    - Test error handling display
    - Test accessibility attributes (ARIA labels)
    - _Requirements: 1.1, 1.2, 1.4, 12.1_


- [x] 15. VoiceOutput component implementation
  - [x] 15.1 Create VoiceOutput component
    - Use useVoiceOutput hook with language prop
    - Auto-play when autoPlay prop is true
    - Display visual indicator during playback (animated icon)
    - Render stop button with 44x44px minimum size
    - Handle synthesis errors gracefully
    - Emit onComplete callback when finished
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 3.6, 12.5_
  
  - [ ]* 15.2 Write unit tests for VoiceOutput
    - Test auto-play behavior
    - Test stop button functionality
    - Test visual indicator during playback
    - Test error handling
    - Test accessibility attributes
    - _Requirements: 2.1, 2.3, 2.6, 12.1_

- [x] 16. MessageList component implementation
  - [x] 16.1 Create MessageList component
    - Render message bubbles with sender-based styling
    - Display timestamps in localized format
    - Implement virtual scrolling for 50+ messages (react-window or react-virtuoso)
    - Auto-scroll to latest message on new message
    - Show offline and sync status indicators on messages
    - Apply minimum 16px font size
    - Ensure 4.5:1 contrast ratio for text
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 7.6, 11.4, 11.5, 14.7_
  
  - [ ]* 16.2 Write property test for message chronological ordering
    - **Property 5: Message Chronological Ordering**
    - **Validates: Requirements 3.3**
  
  - [ ]* 16.3 Write property test for minimum font size
    - **Property 27: Minimum Font Size**
    - **Validates: Requirements 11.4**
  
  - [ ]* 16.4 Write property test for color contrast ratio
    - **Property 28: Color Contrast Ratio**
    - **Validates: Requirements 11.5, 12.6**
  
  - [ ]* 16.5 Write property test for virtual scrolling
    - **Property 39: Virtual Scrolling for Long Lists**
    - **Validates: Requirements 14.7**
  
  - [ ]* 16.6 Write unit tests for MessageList
    - Test message rendering with different senders
    - Test timestamp display
    - Test virtual scrolling activation with 50+ messages
    - Test auto-scroll behavior
    - Test offline/sync indicators
    - _Requirements: 3.1, 3.3, 7.6, 14.7_

- [x] 17. QuickActions component implementation
  - [x] 17.1 Create QuickActions component
    - Render action buttons with icons and labels
    - Apply 44x44px minimum touch target size
    - Display labels in current language (Hindi or English)
    - Emit query on button click via onActionClick callback
    - Implement horizontal scrolling for multiple actions
    - Style with high contrast for outdoor visibility
    - _Requirements: 3.6, 12.5, 17.1, 17.2, 17.3, 17.5_
  
  - [ ]* 17.2 Write property test for quick action query submission
    - **Property 46: Quick Action Query Submission**
    - **Validates: Requirements 17.3**
  
  - [ ]* 17.3 Write property test for quick action localization
    - **Property 47: Quick Action Localization**
    - **Validates: Requirements 17.5**
  
  - [ ]* 17.4 Write unit tests for QuickActions
    - Test button rendering with correct labels
    - Test query emission on click
    - Test localization for Hindi and English
    - Test touch target sizes
    - Test horizontal scrolling
    - _Requirements: 17.1, 17.3, 17.5, 3.6_


- [x] 18. ChatInterface component implementation
  - [x] 18.1 Create ChatInterface component
    - Integrate MessageList, VoiceInput, VoiceOutput, QuickActions components
    - Implement text input field with send button
    - Display loading indicator during API calls
    - Display offline indicator when not connected
    - Handle message submission from text input or voice
    - Coordinate voice output for bot responses
    - Show error messages with retry buttons
    - Apply mobile-first responsive layout
    - _Requirements: 3.1, 3.2, 3.5, 4.1, 7.3, 15.3, 15.5_
  
  - [ ]* 18.2 Write property test for error recovery UI
    - **Property 40: Error Recovery UI**
    - **Validates: Requirements 15.5**
  
  - [ ]* 18.3 Write unit tests for ChatInterface
    - Test component integration
    - Test message submission via text input
    - Test message submission via voice
    - Test loading indicator display
    - Test offline indicator display
    - Test error message with retry button
    - _Requirements: 3.1, 4.1, 7.3, 15.5_

- [x] 19. SettingsScreen component implementation
  - [x] 19.1 Create SettingsScreen component
    - Render farmer ID input field with validation
    - Render language selection (Hindi/English radio buttons)
    - Render voice toggle switches (input and output)
    - Render "Clear Cache" button
    - Render "Clear All Data" button with confirmation
    - Display app version and cache size
    - Persist all changes to IndexedDB via AppContext
    - _Requirements: 5.1, 10.1, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_
  
  - [ ]* 19.2 Write property test for cache clearing
    - **Property 49: Cache Clearing**
    - **Validates: Requirements 18.4**
  
  - [ ]* 19.3 Write property test for complete data clearing
    - **Property 53: Complete Data Clearing**
    - **Validates: Requirements 19.7**
  
  - [ ]* 19.4 Write unit tests for SettingsScreen
    - Test farmer ID input and validation
    - Test language selection updates
    - Test voice toggle functionality
    - Test cache clearing
    - Test complete data clearing with confirmation
    - Test settings persistence
    - _Requirements: 5.1, 10.1, 18.3, 18.4, 19.7_

- [x] 20. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Data visualization components
  - [x] 21.1 Create SoilMoistureDisplay component
    - Render gauge or percentage display for moisture level
    - Show status indicator (low/optimal/high) with color coding
    - Display timestamp in localized format
    - Apply 4.5:1 contrast ratio
    - _Requirements: 11.1, 11.5_
  
  - [x] 21.2 Create CropRecommendationList component
    - Render crop recommendations with icons
    - Display suitability scores and reasons
    - Apply list styling with proper spacing
    - _Requirements: 11.2_
  
  - [x] 21.3 Create MarketPriceTable component
    - Render market prices in table format
    - Display crop name, price, market, and date
    - Format numbers according to selected language
    - Apply responsive table styling
    - _Requirements: 11.3, 11.6_
  
  - [ ]* 21.4 Write property test for data visualization format
    - **Property 26: Data Visualization Format**
    - **Validates: Requirements 11.1, 11.2, 11.3**
  
  - [ ]* 21.5 Write unit tests for data visualization components
    - Test SoilMoistureDisplay with different values
    - Test CropRecommendationList rendering
    - Test MarketPriceTable with localized numbers
    - _Requirements: 11.1, 11.2, 11.3, 11.6_


- [x] 22. Service worker implementation
  - [x] 22.1 Create service worker with Workbox
    - Configure precaching for static assets (HTML, CSS, JS, images)
    - Implement cache-first strategy for static assets
    - Implement network-first strategy for API requests with cache fallback
    - Configure cache expiration (30 days for static, 24 hours for API)
    - Set maximum cache entries (100 for static, 50 for API)
    - Handle service worker registration in main app
    - _Requirements: 8.2, 9.1, 9.2, 9.3, 9.5_
  
  - [ ]* 22.2 Write property test for service worker registration
    - **Property 19: Service Worker Registration**
    - **Validates: Requirements 8.2**
  
  - [ ]* 22.3 Write property test for static asset caching
    - **Property 20: Static Asset Caching**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ]* 22.4 Write property test for API network-first strategy
    - **Property 21: API Network-First Strategy**
    - **Validates: Requirements 9.3**
  
  - [ ]* 22.5 Write property test for cache integrity validation
    - **Property 52: Cache Integrity Validation**
    - **Validates: Requirements 19.5**
  
  - [ ]* 22.6 Write integration tests for service worker
    - Test service worker registration on first load
    - Test static asset caching with cache-first
    - Test API caching with network-first fallback
    - Test cache expiration policies
    - _Requirements: 8.2, 9.1, 9.3, 9.5_

- [x] 23. PWA manifest and configuration
  - [x] 23.1 Create manifest.json
    - Define app name, short_name, description
    - Set start_url to "/"
    - Set display to "standalone"
    - Configure theme_color and background_color
    - Set orientation to "portrait"
    - Add icons in multiple sizes (192x192, 512x512) with maskable variants
    - Set lang to "hi" (default Hindi)
    - _Requirements: 8.1, 8.3, 8.4_
  
  - [x] 23.2 Create app icons
    - Generate icons in required sizes (192x192, 512x512)
    - Create maskable icon variants for adaptive icons
    - Optimize icons for file size
    - _Requirements: 8.3_
  
  - [x] 23.3 Configure PWA meta tags
    - Add viewport meta tag with proper scaling
    - Add theme-color meta tag
    - Add apple-touch-icon links
    - Add manifest link
    - _Requirements: 8.1, 13.1_
  
  - [ ]* 23.4 Write unit tests for PWA configuration
    - Test manifest.json structure
    - Test icon availability
    - Test meta tags presence
    - _Requirements: 8.1, 8.3_

- [x] 24. Tailwind CSS configuration and styling
  - [x] 24.1 Configure Tailwind CSS
    - Set up mobile-first breakpoints (sm: 428px, md: 768px, lg: 1024px)
    - Configure custom colors with high contrast ratios
    - Set default font sizes (base: 16px minimum)
    - Configure spacing scale for touch targets
    - Enable dark mode support (optional)
    - _Requirements: 11.4, 11.5, 12.6, 13.1, 13.3_
  
  - [x] 24.2 Create global styles
    - Apply base styles for body, headings, links
    - Define utility classes for common patterns
    - Set up focus styles for keyboard navigation
    - Apply smooth scrolling behavior
    - _Requirements: 12.2, 12.3_
  
  - [x] 24.3 Create component-specific styles
    - Style message bubbles with proper contrast
    - Style buttons with 44x44px minimum size
    - Style input fields with clear focus indicators
    - Style loading and error states
    - _Requirements: 3.6, 11.5, 12.2, 12.5_
  
  - [ ]* 24.4 Write property test for responsive viewport optimization
    - **Property 33: Responsive Viewport Optimization**
    - **Validates: Requirements 13.1, 13.2, 13.5**
  
  - [ ]* 24.5 Write property test for responsive breakpoints
    - **Property 34: Responsive Breakpoints**
    - **Validates: Requirements 13.3**
  
  - [ ]* 24.6 Write property test for relative unit usage
    - **Property 35: Relative Unit Usage**
    - **Validates: Requirements 13.4**


- [x] 25. Accessibility implementation
  - [x] 25.1 Add ARIA labels and roles
    - Add aria-label to all icon buttons
    - Add role attributes to custom components
    - Add aria-live regions for dynamic content (messages, errors)
    - Add aria-busy for loading states
    - _Requirements: 12.1, 12.4_
  
  - [x] 25.2 Implement keyboard navigation
    - Ensure all interactive elements are keyboard accessible
    - Set logical tab order with tabIndex
    - Add keyboard shortcuts for common actions (Ctrl+Enter to send)
    - Implement focus trap for modals
    - _Requirements: 12.2, 12.3_
  
  - [x] 25.3 Add focus indicators
    - Style focus states with visible outlines
    - Ensure focus indicators have sufficient contrast
    - Test focus order follows logical flow
    - _Requirements: 12.2, 12.3_
  
  - [ ]* 25.4 Write property test for keyboard navigation support
    - **Property 31: Keyboard Navigation Support**
    - **Validates: Requirements 12.2, 12.3**
  
  - [ ]* 25.5 Write property test for zoom compatibility
    - **Property 32: Zoom Compatibility**
    - **Validates: Requirements 12.7**
  
  - [ ]* 25.6 Write accessibility tests with axe-core
    - Run automated accessibility tests on all components
    - Test keyboard navigation flows
    - Test screen reader compatibility (manual)
    - Test color contrast ratios
    - _Requirements: 12.1, 12.2, 12.3, 12.6, 12.7_

- [x] 26. Error handling implementation
  - [x] 26.1 Create error handler classes
    - Implement NetworkErrorHandler with offline detection
    - Implement APIErrorHandler with localized messages
    - Implement VoiceErrorHandler with fallback suggestions
    - Implement DataErrorHandler with quota management
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [x] 26.2 Integrate error handlers in components
    - Add error boundaries for React component errors
    - Display user-friendly error messages in selected language
    - Provide retry buttons for recoverable errors
    - Log errors to IndexedDB without PII
    - _Requirements: 15.1, 15.3, 15.5, 15.6, 19.4_
  
  - [ ]* 26.3 Write property test for error logging
    - **Property 41: Error Logging**
    - **Validates: Requirements 15.6, 19.4**
  
  - [ ]* 26.4 Write property test for secure storage practice
    - **Property 50: Secure Storage Practice**
    - **Validates: Requirements 19.2**
  
  - [ ]* 26.5 Write unit tests for error handlers
    - Test network error handling and offline mode
    - Test API error localization
    - Test voice error fallback
    - Test data error quota management
    - Test error logging without PII
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6, 19.4_

- [x] 27. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 28. Performance optimization
  - [x] 28.1 Implement code splitting
    - Split routes with React.lazy and Suspense
    - Split heavy components (SettingsScreen, data visualizations)
    - Configure dynamic imports for non-critical features
    - _Requirements: 14.4_
  
  - [x] 28.2 Optimize images and assets
    - Convert images to WebP format with fallbacks
    - Implement lazy loading for images
    - Compress and minify all assets
    - _Requirements: 14.5_
  
  - [x] 28.3 Implement input debouncing
    - Debounce text input handlers (300ms)
    - Debounce scroll handlers (150ms)
    - Throttle resize handlers
    - _Requirements: 14.6_
  
  - [x] 28.4 Configure build optimization
    - Enable tree shaking in build config
    - Configure bundle splitting for vendor code
    - Set bundle size budget (200KB gzipped for main bundle)
    - Enable compression (gzip/brotli)
    - _Requirements: 14.1, 14.2, 14.3_
  
  - [ ]* 28.5 Write property test for code splitting
    - **Property 36: Code Splitting Implementation**
    - **Validates: Requirements 14.4**
  
  - [ ]* 28.6 Write property test for image optimization
    - **Property 37: Image Optimization**
    - **Validates: Requirements 14.5**
  
  - [ ]* 28.7 Write property test for input event debouncing
    - **Property 38: Input Event Debouncing**
    - **Validates: Requirements 14.6**
  
  - [ ]* 28.8 Run performance tests
    - Test with Lighthouse CI (target: 90+ performance score)
    - Test FCP < 2s on throttled 3G
    - Test TTI < 5s on throttled 3G
    - Test bundle size < 200KB gzipped
    - Test with 50+ messages for virtual scrolling
    - _Requirements: 14.1, 14.2, 14.3, 14.7_

- [x] 29. Integration and wiring
  - [x] 29.1 Create main App component
    - Set up React Router (if using multiple routes)
    - Wrap app with context providers (AppContext, ChatContext, LanguageContext)
    - Implement app shell with header and navigation
    - Handle initial app load and session restoration
    - Register service worker on mount
    - _Requirements: 6.3, 6.5, 8.2_
  
  - [x] 29.2 Wire ChatInterface with all dependencies
    - Connect ChatInterface to ChatContext
    - Connect VoiceInput/VoiceOutput to LanguageContext
    - Connect QuickActions to predefined actions
    - Connect error handlers to all components
    - _Requirements: 3.1, 10.1, 17.1_
  
  - [x] 29.3 Implement app initialization flow
    - Check for existing farmer ID in IndexedDB
    - Restore or create new session based on last activity
    - Load cached messages for current session
    - Initialize online/offline listeners
    - Check for service worker updates
    - _Requirements: 5.2, 6.3, 6.5, 7.2, 8.2_
  
  - [ ]* 29.4 Write integration tests
    - Test complete offline sync flow (queue → reconnect → sync)
    - Test complete voice flow (input → API → output)
    - Test session management flow (create → restore → expire)
    - Test language switching flow (change → UI update → persist)
    - _Requirements: 7.7, 1.1, 2.1, 6.5, 10.2_


- [x] 30. Environment configuration and deployment setup
  - [x] 30.1 Create environment configuration
    - Set up .env files for development and production
    - Configure API base URL as environment variable
    - Configure build-time constants
    - Add .env.example for documentation
    - _Requirements: 4.1, 19.3_
  
  - [x] 30.2 Configure build scripts
    - Add build script for production
    - Add dev script for local development
    - Add preview script for testing production build
    - Add test scripts (unit, property, integration)
    - _Requirements: 14.1_
  
  - [x] 30.3 Create deployment documentation
    - Document build process
    - Document environment variables
    - Document deployment steps for static hosting
    - Document PWA installation testing
    - _Requirements: 8.1_

- [x] 31. Testing and validation
  - [x] 31.1 Run complete test suite
    - Run all unit tests with coverage report (target: 80%+)
    - Run all property-based tests (53 properties)
    - Run integration tests
    - Fix any failing tests
    - _Requirements: All_
  
  - [x] 31.2 Manual testing checklist
    - Test PWA installation on Android device
    - Test voice input in Hindi and English
    - Test voice output in Hindi and English
    - Test offline mode (airplane mode)
    - Test sync after reconnection
    - Test on slow 3G network (Chrome DevTools throttling)
    - Test with 50+ messages for virtual scrolling
    - Test keyboard navigation
    - Test with screen reader (optional but recommended)
    - Test zoom to 200%
    - _Requirements: 1.1, 2.1, 7.2, 7.7, 12.2, 12.7, 14.1, 14.7_
  
  - [x] 31.3 Accessibility audit
    - Run axe-core automated tests
    - Verify all interactive elements have 44x44px touch targets
    - Verify all text has 4.5:1 contrast ratio
    - Verify all images have alt text
    - Verify keyboard navigation works for all features
    - _Requirements: 12.1, 12.2, 12.5, 12.6_
  
  - [x] 31.4 Performance audit
    - Run Lighthouse audit (target: 90+ performance, 100 accessibility, 100 PWA)
    - Verify bundle size < 200KB gzipped
    - Verify FCP < 2s on 3G
    - Verify TTI < 5s on 3G
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 32. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 33. Configure build system for design system integration
  - [x] 33.1 Update Vite configuration with @ds alias
    - Add path alias resolving @ds to ../piritiya-design-system/src
    - Configure manual chunks for design-system bundle
    - Ensure JSX compilation for design system .jsx files
    - _Requirements: 20.1, 20.2, 20.3_
  
  - [x] 33.2 Create TypeScript declarations for design system
    - Create src/types/design-system.d.ts with component type definitions
    - Declare modules for @ds/components, @ds/tokens, @ds/icons, @ds/i18n
    - Define prop interfaces for all design system components
    - _Requirements: 37.1, 37.2_
  
  - [ ]* 33.3 Write unit tests for build configuration
    - Test @ds alias resolution
    - Test design system imports compile correctly
    - _Requirements: 20.1_

- [x] 34. Integrate global styles and design tokens
  - [x] 34.1 Inject global styles from design system
    - Import and inject global.css from @ds/tokens in main entry point
    - Import Google Fonts (DM Sans, Lora) via design system
    - Verify font loading and fallback behavior
    - _Requirements: 21.1, 21.2_
  
  - [x] 34.2 Update Tailwind configuration with design tokens
    - Extend Tailwind config with design system color palette
    - Configure typography with DM Sans (body) and Lora (headings)
    - Add custom spacing, border radius, and shadow utilities
    - _Requirements: 22.1, 22.2, 22.3_
  
  - [ ]* 34.3 Write unit tests for token integration
    - Test design tokens are accessible in components
    - Test font loading completes successfully
    - _Requirements: 21.1, 22.1_

- [x] 35. Create screens directory structure
  - [x] 35.1 Create screens/ directory with screen components
    - Create screens/OnboardScreen.jsx
    - Create screens/HomeScreen.jsx
    - Create screens/ChatScreen.jsx
    - Create screens/ExploreScreen.jsx
    - Create screens/SettingsScreen.jsx
    - _Requirements: 40.1, 40.2_
  
  - [x] 35.2 Create shared screen components
    - Create screens/components/BottomNavigation.jsx
    - Create screens/components/LangSheet.jsx
    - _Requirements: 30.1, 31.1_

- [x] 36. Implement OnboardScreen with design system
  - [x] 36.1 Build OnboardScreen component
    - Use AmbientBg for gradient background
    - Display PiritiyaMark logo and welcome text
    - Implement farmer ID input field with validation
    - Use PillChip for "Get Started" button (enabled only when valid)
    - Integrate with AppContext for farmer ID persistence
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_
  
  - [ ]* 36.2 Write property test for farmer ID validation
    - **Property 74: Farmer ID Validation Enables Button**
    - **Validates: Requirements 25.4**
  
  - [ ]* 36.3 Write unit tests for OnboardScreen
    - Test farmer ID input validation
    - Test button enable/disable logic
    - Test navigation to HomeScreen on submit
    - _Requirements: 25.4, 25.5_

- [x] 37. Implement HomeScreen with voice-first interface
  - [x] 37.1 Build HomeScreen component
    - Use AmbientBg for gradient background
    - Integrate VoiceOrb component for voice input
    - Display greeting text with farmer name
    - Render quick action PillChips (Weather, Soil, Crops, Market)
    - Wire VoiceOrb to useVoiceInput hook
    - Wire quick actions to ChatContext.sendMessage
    - Navigate to ChatScreen on query submission
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6_
  
  - [ ]* 37.2 Write property test for query submission navigation
    - **Property 66: Query Submission Navigation**
    - **Validates: Requirements 26.5, 28.5**
  
  - [ ]* 37.3 Write property test for voice input visual indicators
    - **Property 76: Voice Input Visual Indicators**
    - **Validates: Requirements 35.4**
  
  - [ ]* 37.4 Write unit tests for HomeScreen
    - Test VoiceOrb integration with useVoiceInput
    - Test quick action button clicks
    - Test navigation to ChatScreen
    - _Requirements: 26.4, 26.5_

- [ ] 38. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 39. Implement ChatScreen with message bubbles
  - [x] 39.1 Build ChatScreen component
    - Render message list with user messages (right-aligned, #138808 background)
    - Render bot messages in FrostedCard (left-aligned, Lora font)
    - Display StatusPill badges for offline/cached messages
    - Integrate SoilGauge, CropCard, MarketCard for structured data
    - Implement auto-scroll to latest message
    - Add text input field with Send icon button
    - Integrate VoiceOrb for voice input
    - Wire to ChatContext for messages and sendMessage
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9_
  
  - [ ]* 39.2 Write property test for message rendering by sender
    - **Property 58: Message Rendering by Sender Type**
    - **Validates: Requirements 27.2, 27.3, 27.4**
  
  - [ ]* 39.3 Write property test for message list display
    - **Property 59: Message List Display**
    - **Validates: Requirements 27.1**
  
  - [ ]* 39.4 Write property test for auto-scroll on new messages
    - **Property 60: Auto-Scroll on New Messages**
    - **Validates: Requirements 27.6**
  
  - [ ]* 39.5 Write property test for structured data display
    - **Property 61: Structured Data Display**
    - **Validates: Requirements 27.8**
  
  - [ ]* 39.6 Write property test for message status badges
    - **Property 62: Message Status Badges**
    - **Validates: Requirements 27.9**
  
  - [ ]* 39.7 Write property test for number localization
    - **Property 54: Number Localization**
    - **Validates: Requirements 23.2, 27.5**
  
  - [ ]* 39.8 Write unit tests for ChatScreen
    - Test message rendering for user and bot
    - Test status badge display
    - Test structured data visualization
    - Test auto-scroll behavior
    - Test voice and text input integration
    - _Requirements: 27.1, 27.2, 27.6, 27.8, 27.9_

- [x] 40. Implement ExploreScreen for content discovery
  - [x] 40.1 Build ExploreScreen component
    - Display category filter PillChips (All, Crops, Soil, Weather, Market, Pests)
    - Map category icons (Wheat, Leaf, CloudRain, TrendingUp, Bug)
    - Render articles in FrostedCard with colored left border
    - Display article titles in Lora serif font
    - Implement category filtering logic
    - Navigate to ChatScreen on article tap with query submission
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7_
  
  - [ ]* 40.2 Write property test for article rendering
    - **Property 63: Article Rendering**
    - **Validates: Requirements 28.2, 28.7**
  
  - [ ]* 40.3 Write property test for category icon mapping
    - **Property 64: Category Icon Mapping**
    - **Validates: Requirements 28.3**
  
  - [ ]* 40.4 Write property test for category filtering
    - **Property 65: Category Filtering**
    - **Validates: Requirements 28.4**
  
  - [ ]* 40.5 Write unit tests for ExploreScreen
    - Test category filter rendering
    - Test article list rendering
    - Test category filtering logic
    - Test navigation on article tap
    - _Requirements: 28.2, 28.4, 28.5_

- [x] 41. Implement SettingsScreen with design system components
  - [x] 41.1 Build SettingsScreen component
    - Use SettingSection and SettingRow components
    - Display farmer ID with edit capability
    - Integrate LangToggle for language selection
    - Use ToggleSwitch for voice input/output preferences
    - Add destructive action buttons (Clear Cache, Clear All Data, Reset App)
    - Show confirmation modal with blurred backdrop for destructive actions
    - Display app version and cache size
    - Wire to AppContext for settings persistence
    - _Requirements: 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 29.10_
  
  - [ ]* 41.2 Write property test for voice toggle context update
    - **Property 72: Voice Toggle Context Update**
    - **Validates: Requirements 29.6**
  
  - [ ]* 41.3 Write property test for destructive action confirmation
    - **Property 73: Destructive Action Confirmation**
    - **Validates: Requirements 29.10**
  
  - [ ]* 41.4 Write unit tests for SettingsScreen
    - Test farmer ID editing
    - Test language selection
    - Test voice toggle functionality
    - Test destructive action confirmation flow
    - Test settings persistence
    - _Requirements: 29.3, 29.6, 29.10_

- [ ] 42. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 43. Implement BottomNavigation component
  - [x] 43.1 Build BottomNavigation component
    - Create navigation tabs (Home, Chat, Explore, Settings)
    - Use design system icons (Compass, BookOpen, Search, Settings)
    - Highlight active tab with #138808 color
    - Show inactive tabs with rgba(20,30,16,0.4) color
    - Ensure 44x44px minimum touch targets
    - Wire to routing system for navigation
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6_
  
  - [ ]* 43.2 Write property test for tab navigation and highlighting
    - **Property 57: Tab Navigation and Highlighting**
    - **Validates: Requirements 30.3, 30.4, 30.5**
  
  - [ ]* 43.3 Write property test for interactive element touch targets
    - **Property 56: Interactive Element Touch Targets**
    - **Validates: Requirements 24.5, 30.6, 36.1**
  
  - [ ]* 43.4 Write unit tests for BottomNavigation
    - Test tab rendering with icons
    - Test active tab highlighting
    - Test navigation on tab click
    - Test touch target sizes
    - _Requirements: 30.2, 30.3, 30.5_

- [ ] 44. Implement LangSheet bottom sheet component
  - [ ] 44.1 Build LangSheet component
    - Display all 8 supported languages (hi, en, bn, gu, kn, ml, ta, te)
    - Show script name (large) and roman name (small) for each language
    - Display "Instant" badge for Hindi and English
    - Display "Slower" badge for other languages
    - Highlight selected language with green border and Check icon
    - Show 4-second warning toast for non-instant language selection
    - Update LanguageContext on selection and close sheet
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8_
  
  - [ ]* 44.2 Write property test for language badge display
    - **Property 67: Language Badge Display**
    - **Validates: Requirements 31.3**
  
  - [ ]* 44.3 Write property test for language selection highlighting
    - **Property 68: Language Selection Highlighting**
    - **Validates: Requirements 31.4**
  
  - [ ]* 44.4 Write property test for language selection updates context
    - **Property 69: Language Selection Updates Context**
    - **Validates: Requirements 31.5**
  
  - [ ]* 44.5 Write property test for batch language warning
    - **Property 70: Batch Language Warning**
    - **Validates: Requirements 31.8**
  
  - [ ]* 44.6 Write property test for language name display
    - **Property 71: Language Name Display**
    - **Validates: Requirements 31.2**
  
  - [ ]* 44.7 Write unit tests for LangSheet
    - Test language list rendering
    - Test badge display logic
    - Test selection highlighting
    - Test context update on selection
    - Test warning toast for non-instant languages
    - _Requirements: 31.2, 31.3, 31.4, 31.5, 31.8_

- [x] 45. Implement screen routing system
  - [x] 45.1 Update App component with routing
    - Set up React Router with routes for all screens
    - Configure default route to OnboardScreen (if no farmer ID) or HomeScreen
    - Implement route guards for farmer ID requirement
    - Add BottomNavigation to app shell
    - Preserve scroll position on navigation
    - Manage focus during navigation for accessibility
    - _Requirements: 39.1, 39.2, 39.3, 39.4_
  
  - [ ]* 45.2 Write property test for routing state preservation
    - **Property 83: Routing State Preservation**
    - **Validates: Requirements 39.4**
  
  - [ ]* 45.3 Write property test for focus management during navigation
    - **Property 82: Focus Management During Navigation**
    - **Validates: Requirements 36.6**
  
  - [ ]* 45.4 Write property test for screen change announcements
    - **Property 81: Screen Change Announcements**
    - **Validates: Requirements 36.5**
  
  - [ ]* 45.5 Write unit tests for routing
    - Test route navigation between screens
    - Test route guards for farmer ID
    - Test scroll position preservation
    - Test focus management
    - _Requirements: 39.1, 39.2, 39.3_

- [ ] 46. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 47. Wire screens with existing contexts
  - [ ] 47.1 Integrate AppContext with screens
    - Wire OnboardScreen to AppContext.setFarmerId
    - Wire SettingsScreen to AppContext for all settings
    - Wire all screens to AppContext.language for i18n
    - Wire all screens to AppContext.voiceEnabled for voice features
    - _Requirements: 34.1, 34.2, 34.3_
  
  - [ ] 47.2 Integrate ChatContext with screens
    - Wire HomeScreen to ChatContext.sendMessage
    - Wire ChatScreen to ChatContext for messages and sendMessage
    - Wire ExploreScreen to ChatContext.sendMessage
    - _Requirements: 34.1, 34.2_
  
  - [ ] 47.3 Integrate LanguageContext with screens
    - Wire all screens to LanguageContext for translations
    - Wire LangSheet to LanguageContext for language selection
    - Ensure UI updates on language change
    - _Requirements: 23.3, 23.4, 34.1, 34.2_
  
  - [ ]* 47.4 Write property test for context re-rendering
    - **Property 75: Context Re-rendering**
    - **Validates: Requirements 34.4**
  
  - [ ]* 47.5 Write property test for language switching updates UI
    - **Property 55: Language Switching Updates UI**
    - **Validates: Requirements 23.3, 23.4, 29.5**
  
  - [ ]* 47.6 Write integration tests for context wiring
    - Test AppContext updates propagate to screens
    - Test ChatContext message flow
    - Test LanguageContext translation updates
    - _Requirements: 34.1, 34.2, 34.4_

- [ ] 48. Wire screens with existing hooks
  - [ ] 48.1 Integrate voice hooks with screens
    - Wire HomeScreen VoiceOrb to useVoiceInput
    - Wire ChatScreen VoiceOrb to useVoiceInput
    - Wire ChatScreen bot responses to useVoiceOutput
    - Handle voice errors with StatusPill display
    - _Requirements: 35.1, 35.2, 35.3, 35.4, 35.5_
  
  - [ ] 48.2 Integrate offline sync hook with screens
    - Wire ChatScreen to useOfflineSync for sync status
    - Display sync indicator in ChatScreen
    - Wire SettingsScreen to useOfflineSync for pending query count
    - _Requirements: 33.1, 33.2_
  
  - [ ] 48.3 Integrate chat hook with screens
    - Wire ChatScreen to useChat for message handling
    - Wire HomeScreen to useChat for quick actions
    - Wire ExploreScreen to useChat for article queries
    - _Requirements: 33.1, 33.2_
  
  - [ ]* 48.4 Write property test for voice error handling
    - **Property 77: Voice Error Handling**
    - **Validates: Requirements 35.5**
  
  - [ ]* 48.5 Write integration tests for hook wiring
    - Test voice input flow in screens
    - Test offline sync status display
    - Test chat message flow
    - _Requirements: 35.1, 35.2, 33.1_

- [ ] 49. Wire screens with existing services
  - [ ] 49.1 Verify service layer integration
    - Confirm APIClient is used by ChatContext
    - Confirm CacheManager is used by ChatContext
    - Confirm DBRepository is used by all contexts
    - Ensure no direct service calls from screens
    - _Requirements: 33.1, 33.2, 33.3_
  
  - [ ]* 49.2 Write integration tests for service layer
    - Test API calls flow through contexts to screens
    - Test cache operations work with new screens
    - Test IndexedDB operations work with new screens
    - _Requirements: 33.1, 33.2_

- [ ] 50. Implement design system accessibility compliance
  - [ ] 50.1 Add accessibility attributes to screen components
    - Add ARIA labels to all icon-only buttons
    - Add ARIA live regions for dynamic content
    - Add role attributes to custom components
    - Ensure keyboard navigation support for all interactive elements
    - _Requirements: 36.1, 36.2, 36.3, 36.4, 36.5, 36.6_
  
  - [ ] 50.2 Verify color contrast compliance
    - Ensure text on light backgrounds uses #1a2010
    - Verify all text meets 4.5:1 contrast ratio
    - Test with contrast checking tools
    - _Requirements: 36.2_
  
  - [ ]* 50.3 Write property test for text contrast on light backgrounds
    - **Property 78: Text Contrast on Light Backgrounds**
    - **Validates: Requirements 36.2**
  
  - [ ]* 50.4 Write property test for icon button ARIA labels
    - **Property 79: Icon Button ARIA Labels**
    - **Validates: Requirements 36.3**
  
  - [ ]* 50.5 Write property test for keyboard navigation support
    - **Property 80: Keyboard Navigation Support**
    - **Validates: Requirements 36.4**
  
  - [ ]* 50.6 Write accessibility tests for screens
    - Run axe-core tests on all screens
    - Test keyboard navigation flows
    - Test ARIA attribute presence
    - Test color contrast ratios
    - _Requirements: 36.1, 36.2, 36.3, 36.4_

- [ ] 51. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 52. Test design system integration with existing functionality
  - [ ] 52.1 Verify offline functionality preservation
    - Test offline message queuing works with ChatScreen
    - Test cache fallback works with new screens
    - Test sync indicator displays correctly
    - _Requirements: 38.1, 38.2_
  
  - [ ] 52.2 Verify voice functionality preservation
    - Test voice input works in HomeScreen and ChatScreen
    - Test voice output works for bot responses
    - Test voice locale switching works
    - _Requirements: 38.1, 38.2_
  
  - [ ] 52.3 Verify session management preservation
    - Test session persistence works with new screens
    - Test session restoration on app reload
    - Test farmer ID change triggers session reset
    - _Requirements: 38.1, 38.2_
  
  - [ ] 52.4 Verify i18n functionality preservation
    - Test language switching updates all screens
    - Test number localization in ChatScreen
    - Test translation coverage for all screens
    - _Requirements: 38.1, 38.2_
  
  - [ ]* 52.5 Write integration tests for existing functionality
    - Test complete offline sync flow with new screens
    - Test complete voice flow with new screens
    - Test session management flow with new screens
    - Test language switching flow with new screens
    - _Requirements: 38.1, 38.2_

- [ ] 53. Performance verification with design system
  - [ ] 53.1 Verify bundle size with design system
    - Check design-system chunk size
    - Ensure total bundle size remains < 200KB gzipped
    - Verify code splitting works correctly
    - _Requirements: 38.3_
  
  - [ ] 53.2 Verify performance metrics with design system
    - Test FCP < 2s on throttled 3G
    - Test TTI < 5s on throttled 3G
    - Run Lighthouse audit (target: 90+ performance)
    - _Requirements: 38.3_
  
  - [ ]* 53.3 Run performance tests
    - Test with Lighthouse CI
    - Test bundle size analysis
    - Test load time on throttled network
    - _Requirements: 38.3_

- [ ] 54. Final integration testing and validation
  - [ ] 54.1 Manual testing with design system
    - Test all screens on mobile device
    - Test navigation flow between screens
    - Test voice input in HomeScreen and ChatScreen
    - Test language switching across screens
    - Test offline mode with new screens
    - Test quick actions and article navigation
    - _Requirements: 38.1, 38.2_
  
  - [ ] 54.2 Accessibility audit with design system
    - Run axe-core on all new screens
    - Verify touch target sizes (44x44px minimum)
    - Verify keyboard navigation works
    - Test with screen reader (optional)
    - _Requirements: 36.1, 36.3, 36.4_
  
  - [ ] 54.3 Cross-browser testing
    - Test on Chrome Android
    - Test on Safari iOS
    - Test on Firefox Android
    - Verify design system components render correctly
    - _Requirements: 38.1_

- [ ] 55. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate interactions between multiple components
- Manual testing is required for voice features, PWA installation, and screen reader compatibility
- The implementation uses TypeScript with React 18+, Tailwind CSS, IndexedDB (idb), and Workbox
- All code should follow accessibility best practices (WCAG 2.1 AA)
- All user-facing text should support Hindi and English localization
- Performance targets: FCP < 2s, TTI < 5s, bundle < 200KB gzipped on 3G networks
