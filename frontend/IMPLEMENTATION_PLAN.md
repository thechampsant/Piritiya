# Piritiya Frontend - Hybrid Implementation Plan

## Strategy: Mock UI + Spec Architecture

We're taking a hybrid approach that combines:
- ✅ Beautiful UI design from the mock
- ✅ Robust services and architecture from the spec
- ✅ All requirements from the spec document

## Phase 1: Core Integration (Tasks 8-13)

### Task 8: Voice Input Hook ✅ (Use mock's voice UI)
- [x] Create `useVoiceInput` hook with Web Speech API
- [x] Integrate with mock's microphone button
- [x] Add wave ring animations from mock
- [x] Support Hindi (hi-IN) and English (en-IN)

### Task 9: Voice Output Hook ✅ (Use mock's speaking indicator)
- [x] Create `useVoiceOutput` hook with Speech Synthesis
- [x] Auto-play bot responses
- [x] Show "बोल रहा हूँ..." indicator from mock
- [x] Support both languages

### Task 10: Offline Sync Hook ✅ (Enhance mock's offline badge)
- [x] Create `useOfflineSync` hook
- [x] Monitor online/offline status
- [x] Show sync indicator when pending queries exist
- [x] Auto-sync on reconnection

### Task 11: Chat Hook ✅ (Power mock's chat interface)
- [x] Create `useChat` hook
- [x] Load messages from IndexedDB
- [x] Queue messages when offline
- [x] Cache responses
- [x] Integrate with mock's message display

### Task 12: Checkpoint
- [ ] Test all hooks work together
- [ ] Verify offline functionality

### Task 13: Context Providers ✅ (Wrap mock app)
- [x] AppContext (farmerId, language, online status)
- [x] ChatContext (messages, session, pending queries)
- [x] LanguageContext (translations, locale)

## Phase 2: Component Conversion (Tasks 14-19)

### Task 14-18: Convert Mock Components to TypeScript
- [x] **HomeTab** → ChatInterface component
  - Integrate useChat, useVoiceInput, useVoiceOutput
  - Connect to APIClient for real data
  - Add error handling
  
- [x] **MoistureGauge** → SoilMoistureDisplay component
  - Use real data from APIClient.getSoilMoisture()
  - Add loading states
  
- [x] **CropsTab** → CropRecommendationList component
  - Use real data from APIClient.getCropAdvice()
  - Add sustainability scores
  
- [x] **MarketTab** → MarketPriceTable component
  - Use real data from APIClient.getMarketPrices()
  - Format with i18n utilities
  
- [x] **Quick Actions** → QuickActions component
  - Use constants.QUICK_ACTIONS
  - Emit queries to chat

### Task 19: Settings Screen (NEW - Not in mock)
- [ ] Create SettingsScreen component
- [ ] Add to tab bar or header menu
- [ ] Farmer ID input with validation
- [ ] Language toggle
- [ ] Voice input/output toggles
- [ ] Clear cache button
- [ ] Clear all data button
- [ ] Show app version and cache size

## Phase 3: PWA & Offline Features (Tasks 22-23)

### Task 22: Service Worker ✅ (Already configured)
- [x] Workbox configuration in vite.config.ts
- [x] Precaching strategy
- [x] Network-first for API
- [x] Cache-first for static assets

### Task 23: PWA Manifest ✅ (Already configured)
- [x] manifest.webmanifest generated
- [x] Icons configured
- [x] Standalone display mode
- [ ] Add actual icon files (192x192, 512x512)

## Phase 4: Polish & Requirements (Tasks 24-26)

### Task 24: Tailwind Styling ✅ (Mock already styled)
- [x] Mobile-first breakpoints
- [x] High contrast colors
- [x] Minimum font sizes
- [x] Touch target sizes
- [ ] Verify all components meet accessibility standards

### Task 25: Accessibility Enhancements
- [ ] Add ARIA labels to all interactive elements
- [ ] Ensure keyboard navigation works
- [ ] Add focus indicators
- [ ] Test with screen readers
- [ ] Verify 4.5:1 contrast ratios

### Task 26: Error Handling
- [ ] Add error boundaries
- [ ] Show user-friendly error messages
- [ ] Add retry buttons
- [ ] Log errors to IndexedDB
- [ ] Handle network errors gracefully

## Phase 5: Testing & Optimization (Tasks 28-32)

### Task 28: Performance Optimization
- [ ] Code splitting (React.lazy)
- [ ] Virtual scrolling for 50+ messages
- [ ] Debounce input handlers
- [ ] Optimize bundle size
- [ ] Lighthouse audit (target: 90+)

### Task 29: Integration & Wiring
- [ ] Connect all components
- [ ] Test complete flows
- [ ] Verify offline sync works
- [ ] Test voice input/output
- [ ] Test session management

### Task 30: Environment Configuration
- [x] .env.example created
- [ ] Production environment variables
- [ ] API endpoint configuration

### Task 31: Testing & Validation
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Manual testing checklist
- [ ] Accessibility audit
- [ ] Performance audit

### Task 32: Final Checkpoint
- [ ] All tests passing
- [ ] All requirements met
- [ ] Production build successful
- [ ] PWA installable
- [ ] Offline mode working

## Mock UI Components Mapping

| Mock Component | Our Component | Status | Notes |
|---------------|---------------|--------|-------|
| HomeTab | ChatInterface | 🔄 Convert | Add error handling, real data |
| MoistureGauge | SoilMoistureDisplay | 🔄 Convert | Connect to APIClient |
| CropsTab | CropRecommendationList | 🔄 Convert | Use real crop data |
| SchemesTab | SchemesDisplay | ✅ Keep | Static data, works as-is |
| MarketTab | MarketPriceTable | 🔄 Convert | Connect to APIClient |
| TabBar | Navigation | ✅ Keep | Add settings icon |
| WaveRings | VoiceAnimation | ✅ Keep | Beautiful animation |
| Quick Questions | QuickActions | 🔄 Convert | Use constants |

## Requirements Coverage Checklist

### Voice Features (Requirements 1-2)
- [x] Voice input with microphone button
- [x] Voice output with auto-play
- [x] Hindi and English support
- [x] Visual indicators (wave rings, speaking)
- [ ] Error handling for unsupported browsers

### Chat Interface (Requirements 3-4)
- [x] Message display with timestamps
- [x] Text input field
- [x] Send button
- [ ] Loading indicator
- [ ] Error messages with retry

### Farmer Identity (Requirement 5)
- [ ] Farmer ID input in settings
- [ ] Validation (UP-DISTRICT-BLOCK-XXXXX)
- [ ] Persistence in IndexedDB
- [ ] Session reset on ID change

### Session Management (Requirement 6)
- [x] UUID v4 session IDs
- [x] 24-hour timeout
- [x] Session restoration
- [ ] New session on expiry

### Offline Mode (Requirement 7)
- [x] IndexedDB storage
- [x] Offline indicator
- [x] Query queuing
- [x] Auto-sync on reconnection
- [ ] Cached response display

### PWA (Requirement 8)
- [x] Service worker
- [x] Manifest
- [ ] Install prompt
- [ ] Offline functionality

### Caching (Requirement 9)
- [x] 50MB limit
- [x] Automatic pruning
- [x] Network-first strategy
- [ ] Cache statistics display

### Language (Requirement 10)
- [x] Hindi/English toggle
- [x] UI translations
- [x] Devanagari numerals
- [x] Voice locale switching

### Data Visualization (Requirement 11)
- [x] Soil moisture gauge
- [x] Crop recommendations
- [x] Market prices
- [ ] Localized formatting

### Accessibility (Requirement 12)
- [x] 44px touch targets
- [x] 16px minimum font
- [x] High contrast colors
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Screen reader support

### Responsive Design (Requirement 13)
- [x] Mobile-first
- [x] 428px breakpoint
- [x] Portrait orientation
- [ ] Zoom to 200%

### Performance (Requirement 14)
- [x] Bundle < 200KB gzipped
- [ ] FCP < 2s on 3G
- [ ] TTI < 5s on 3G
- [ ] Virtual scrolling

### Error Handling (Requirement 15)
- [ ] Network error messages
- [ ] Voice error fallbacks
- [ ] Retry buttons
- [ ] Error logging

### Offline Sync (Requirement 16)
- [x] Query queuing
- [x] Order preservation
- [x] Sync on reconnection
- [ ] Sync indicator

### Quick Actions (Requirement 17)
- [x] Predefined queries
- [x] Localized labels
- [ ] Query submission

### Settings (Requirement 18)
- [ ] Farmer ID input
- [ ] Language selection
- [ ] Voice toggles
- [ ] Clear cache
- [ ] Clear all data

### Security (Requirement 19)
- [x] Input sanitization
- [x] No PII in logs
- [ ] HTTPS only
- [ ] Secure storage

## Next Steps

1. **Immediate**: Convert mock components to TypeScript
2. **Then**: Implement missing hooks (voice, offline sync, chat)
3. **Then**: Add settings screen
4. **Then**: Connect real data from backend
5. **Finally**: Test, optimize, and deploy

## Success Criteria

- ✅ Beautiful UI from mock preserved
- ✅ All spec requirements met
- ✅ Offline-first functionality working
- ✅ Voice input/output working
- ✅ Real backend data integration
- ✅ PWA installable
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performant (Lighthouse 90+)
- ✅ Production-ready

---

**Status**: Phase 1 in progress  
**Completion**: 6/32 tasks (19%)  
**Target**: Full integration with mock UI + all spec requirements
