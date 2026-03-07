# Piritiya - AI-Powered Agricultural Advisory Platform

## Executive Summary

Piritiya is a voice-first, offline-capable Progressive Web Application (PWA) designed to combat groundwater depletion in Uttar Pradesh, India. The platform leverages NASA-ISRO NISAR satellite data (100m resolution) to provide farmers with real-time soil moisture insights, water-efficient crop recommendations, and market intelligence through a conversational AI interface powered by AWS Bedrock.

## Technical Architecture

### Frontend Stack

**Core Technologies:**
- **React 19** - Modern UI framework with concurrent features
- **TypeScript 5.9** - Type-safe development
- **Vite 7.3** - Lightning-fast build tool with HMR
- **Tailwind CSS 3.4** - Utility-first styling framework

**Progressive Web App (PWA):**
- **Service Workers** - Workbox 7.0 for offline caching strategies
- **IndexedDB** - Client-side database via `idb` library for persistent storage
- **Manifest** - Installable app with standalone display mode
- **Cache Strategies:**
  - Network-first for API requests (24hr expiration)
  - Cache-first for static assets (30-day expiration)
  - Runtime caching for AWS API Gateway endpoints

**Voice Interface:**
- **Web Speech API** - Native browser speech recognition and synthesis
- **Real-time Transcription** - Hindi (hi-IN) and English (en-IN) support
- **Fallback Support** - Graceful degradation to text input when voice unavailable

**State Management:**
- **React Context API** - Three primary contexts:
  - `AppContext` - Global app state (farmer ID, language, online status)
  - `LanguageContext` - i18n wrapper with formatting utilities
  - `ChatContext` - Chat session and message management
- **Custom Hooks:**
  - `useChat` - Message handling and API communication
  - `useOfflineSync` - Background sync for pending queries
  - `useVoiceInput` - Speech recognition lifecycle
  - `useVoiceOutput` - Text-to-speech playback

**Offline-First Architecture:**
- Pending query queue in IndexedDB
- Automatic background sync when connectivity restored
- Session persistence across app restarts
- Optimistic UI updates with rollback on failure

**Offline and voice behaviour:**
- When **offline**, voice uses the **Web Speech API** only (device speech recognition and synthesis). When **online** and "Use AWS voice" is enabled in Settings, the app uses Amazon Transcribe (STT) and Amazon Polly (TTS) for supported languages (hi, en).
- Chat messages are stored locally; when offline, outgoing messages join a pending queue and sync when connectivity is restored.
- Quick actions that call REST (soil moisture, crop advice, market prices) show an error or cached data when offline, and the same query is still sent to chat for when the user navigates to the conversation.
- For best voice quality when online, the app uses AWS. When offline or when "Use AWS voice" is off, device (browser) voice is used.


### Backend Stack

**Core Technologies:**
- **Python 3.11+** - Modern Python with type hints
- **FastAPI** - High-performance async web framework
- **Uvicorn** - ASGI server with auto-reload
- **Boto3** - AWS SDK for Python
- **Pydantic 2.5** - Data validation and serialization

**API Architecture:**
- **RESTful Design** - 9 endpoints for farmer data, soil, crops, and chat
- **CORS Enabled** - Cross-origin support for frontend integration
- **Async/Await** - Non-blocking I/O for concurrent requests
- **Error Handling** - Structured HTTP exceptions with detailed messages

**Key Endpoints:**
- `GET /farmers` - List all registered farmers
- `GET /farmers/{farmer_id}` - Retrieve farmer profile
- `GET /soil-moisture/{farmer_id}` - NISAR satellite data integration
- `POST /crop-advice` - ML-driven crop recommendations
- `GET /market-prices` - Real-time market intelligence
- `GET /advice/{farmer_id}` - Aggregated advisory (soil + crops + prices)
- `POST /chat` - Conversational AI interface via Bedrock Agent

### AWS Cloud Infrastructure

**Serverless Functions (Lambda):**
- **get-soil-moisture** - Processes NISAR satellite imagery, returns moisture percentage and status
- **get-crop-advice** - Analyzes soil conditions, generates water-efficient crop recommendations
- **get-market-prices** - Fetches Agmarknet data, provides pricing intelligence

**Data Layer:**
- **DynamoDB Tables:**
  - `Farmers` - Farmer profiles (ID, location, land size, crops)
  - `SoilMoisture` - Historical moisture readings with timestamps
  - `CropRecommendations` - Generated advice with confidence scores
  - `Consultations` - Chat session history and context

**AI/ML Services:**
- **Amazon Bedrock Agent Runtime** - Orchestrates conversational AI
- **Claude (via Bedrock)** - Large language model for natural dialogue
- **Amazon Transcribe** - Speech-to-text (real-time for hi-IN/en-IN, batch for 6 other languages)
- **Amazon Polly** - Text-to-speech (Kajal Neural voice for Hindi, Aditi for English)
- **Amazon Translate** - Multi-language support across 8 Indian languages

**Region Configuration:**
- Primary: `us-east-1` (Bedrock availability)
- Configurable via environment variables


## Design System

**Custom Design System:** `piritiya-design-system/`

**Architecture:**
- **Token-based Design** - Single source of truth for colors, typography, spacing, animation
- **Component Library** - 15+ reusable UI components with inline styles
- **Icon System** - 25+ custom SVG icons (no external dependencies)
- **i18n System** - 8 Indian languages with AWS capability flags

**Visual Identity:**
- **Indian Tricolour Palette** - Saffron (#FF9933), Green (#138808), Navy (#000080)
- **Frosted Glass Aesthetic** - Backdrop blur, translucent cards, ambient gradient blobs
- **Typography:**
  - Lora (serif) - Display headings and editorial content
  - DM Sans (sans-serif) - UI text and controls
  - Noto Sans family - 7 Indian script fonts (Devanagari, Bengali, Gujarati, Kannada, Malayalam, Tamil, Telugu)

**Key Components:**
- `VoiceOrb` - Tricolour gradient orb with ripple animations (idle/listening states)
- `FrostedCard` - Glassmorphic card surface with backdrop blur
- `AmbientBg` - Animated radial gradient blobs
- `SoilGauge` - Semicircle gauge with status indicators
- `PillChip` - Frosted pill buttons for quick actions
- `ToggleSwitch` - iOS-style toggle for settings
- `LangToggle` - Language selector with native script display

**Animation System:**
- 10 custom keyframe animations (fadeUp, fadePulse, orbRipple, blob motion, etc.)
- Cubic-bezier easing curves for natural motion
- Duration tokens (fast: 0.15s, base: 0.25s, slow: 0.4s, slower: 0.7s)


## Internationalization (i18n)

**Supported Languages:** 8 Indian languages
- Hindi (हिन्दी) - Primary, full AWS support
- English - Secondary, full AWS support  
- Bengali (বাংলা), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം), Tamil (தமிழ்), Telugu (తెలుగు)

**Implementation:**
- Translation dictionary with 50+ UI strings per language
- Devanagari numeral conversion for Hindi (०१२३४५६७८९)
- Locale-aware number, currency, date/time formatting
- Language-specific font loading via Google Fonts
- Batch processing warning for non-real-time languages

## Data Flow Architecture

### User Query Flow:
1. **Voice Input** → Web Speech API → Text transcription
2. **Text Processing** → Frontend validation → API request
3. **Backend Routing** → FastAPI → Lambda invocation
4. **AI Processing** → Bedrock Agent → Claude LLM → Response generation
5. **Response Delivery** → Backend → Frontend → Voice synthesis (Polly)
6. **Offline Handling** → IndexedDB queue → Background sync when online

### Offline-First Strategy:
- **Write-through cache** - All queries saved to IndexedDB immediately
- **Pending queue** - Failed requests queued with retry metadata
- **Background sync** - Automatic retry every 30 seconds when online
- **Optimistic UI** - Instant feedback with rollback on failure
- **Session persistence** - Chat history survives app restarts


## Testing Strategy

**Frontend Testing:**
- **Vitest 2.0** - Fast unit test runner with native ESM support
- **Testing Library** - Component testing with user-centric queries
- **Fast-check 3.15** - Property-based testing for correctness validation
- **Coverage Tracking** - Code coverage reports via Vitest

**Backend Testing:**
- **Python unittest** - Standard library testing framework
- **API Integration Tests** - End-to-end endpoint validation
- **Lambda Function Tests** - Isolated serverless function testing

**Property-Based Testing (PBT):**
- Formal correctness properties defined in spec design documents
- Executable properties using fast-check generators
- Validates invariants across random input spaces
- Ensures robustness beyond example-based tests

## Security & Privacy

**Data Protection:**
- **No PII in logs** - Farmer IDs anonymized in error tracking
- **Client-side encryption** - Sensitive data encrypted in IndexedDB
- **HTTPS only** - All API communication over TLS
- **CORS policies** - Restricted origin access

**AWS Security:**
- **IAM roles** - Least-privilege access for Lambda functions
- **VPC isolation** - DynamoDB and Lambda in private subnets (production)
- **Secrets management** - Environment variables via AWS Systems Manager
- **API Gateway** - Rate limiting and throttling


## Performance Optimizations

**Frontend:**
- **Code Splitting** - Vendor, design system, and app code bundled separately
- **Tree Shaking** - Unused code eliminated via Vite/Rollup
- **Lazy Loading** - Route-based code splitting for screens
- **Asset Optimization** - Image compression, font subsetting
- **Bundle Size Target** - <200KB initial load (gzipped)

**Backend:**
- **Async I/O** - Non-blocking Lambda invocations
- **Connection Pooling** - Reused boto3 clients
- **Response Caching** - DynamoDB query result caching
- **Lambda Cold Start Mitigation** - Provisioned concurrency for critical functions

**Network:**
- **HTTP/2** - Multiplexed connections
- **Compression** - Gzip/Brotli for text responses
- **CDN** - CloudFront for static asset delivery (production)
- **API Proxy** - Vite dev server proxies `/api` to backend

## Accessibility (a11y)

**WCAG 2.1 Level AA Compliance:**
- **Keyboard Navigation** - All interactive elements accessible via keyboard
- **Screen Reader Support** - Semantic HTML, ARIA labels, live regions
- **Color Contrast** - 4.5:1 minimum for text, 3:1 for UI components
- **Touch Targets** - Minimum 44x44px for all interactive elements
- **Focus Indicators** - Visible focus states with green accent (#138808)
- **Voice Alternative** - Text input fallback for voice features
- **Error Messages** - Clear, actionable feedback in user's language

**Inclusive Design:**
- Mobile-first responsive layout (390px primary target)
- Large touch targets for rural users with varying tech literacy
- Bilingual interface (Hindi primary, English secondary)
- Visual + auditory feedback for all actions


## Development Methodology

**Spec-Driven Development:**
- **Requirements-First Workflow** - Business needs documented before technical design
- **Formal Specifications** - Structured requirements, design, and task documents
- **Property-Based Testing** - Correctness properties defined and validated
- **Iterative Refinement** - Continuous feedback loop between spec and implementation

**Project Organization:**
- `.kiro/specs/` - Three complete specs (backend API, chatbot frontend, design polish)
- Each spec contains: requirements.md, design.md, tasks.md, .config.kiro
- Task tracking with checkbox syntax for progress monitoring

## Deployment Architecture

**Development Environment:**
- Backend: `uvicorn main:app --reload` on localhost:8000
- Frontend: `npm run dev` on localhost:5173
- Local DynamoDB for testing (optional)

**Production Environment:**
- **Frontend:** Vite build → S3 bucket → CloudFront CDN
- **Backend:** FastAPI → AWS Lambda (containerized) or EC2
- **Lambda Functions:** Deployed via `deploy.sh` script with layer packaging
- **Database:** DynamoDB with on-demand billing
- **Monitoring:** CloudWatch logs and metrics

**CI/CD Pipeline (Planned):**
- GitHub Actions for automated testing
- Automated deployment on merge to main
- Environment-specific configurations (dev/staging/prod)


## Key Technical Features

### 1. Voice-First Interface
- **Dual-mode input** - Voice and text with seamless switching
- **Visual feedback** - Animated VoiceOrb with ripple effects during listening
- **Language detection** - Automatic language identification from speech
- **Error recovery** - Graceful fallback to text input on voice failure

### 2. Offline Capability
- **Service Worker** - Workbox-powered caching with multiple strategies
- **IndexedDB Storage** - Persistent local database for messages, sessions, settings
- **Sync Queue** - Automatic retry mechanism for failed requests
- **Status Indicators** - Real-time online/offline/syncing status display

### 3. Multi-Language Support
- **8 Indian Languages** - Full UI translation coverage
- **Script Rendering** - Native font support for Devanagari, Bengali, etc.
- **Numeral Conversion** - Devanagari numerals (०१२३४५६७८९) for Hindi
- **AWS Integration Flags** - Per-language capability indicators (Transcribe RT, Polly, Translate)

### 4. Conversational AI
- **AWS Bedrock Agent** - Orchestrates multi-step reasoning
- **Claude LLM** - Natural language understanding and generation
- **Session Management** - Persistent conversation context across interactions
- **Action Groups** - Lambda functions as agent tools (soil, crops, prices)

### 5. Satellite Data Integration
- **NISAR Mission** - 100m resolution L-band SAR imagery
- **Soil Moisture Retrieval** - Converts backscatter to volumetric water content
- **Geospatial Processing** - Farmer location → satellite pixel mapping
- **Temporal Analysis** - Historical trends for irrigation planning


## Technical Specifications

### Frontend Bundle Analysis
- **Initial Load:** ~180KB (gzipped)
- **Design System:** ~45KB (separate chunk)
- **Vendor Libraries:** ~120KB (React, React-DOM)
- **App Code:** ~15KB

### API Performance Targets
- **Response Time:** <500ms (p95)
- **Lambda Cold Start:** <2s
- **DynamoDB Queries:** <100ms
- **Bedrock Agent:** <3s for simple queries

### Browser Support
- **Modern Browsers:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **Mobile:** iOS 14+, Android 8+
- **PWA Features:** Service Worker, IndexedDB, Web Speech API
- **Graceful Degradation:** Fallbacks for unsupported features

### Data Storage Limits
- **IndexedDB:** ~50MB per origin (browser-dependent)
- **Service Worker Cache:** ~100MB (configurable)
- **Session History:** Last 100 messages per farmer
- **Offline Queue:** Up to 50 pending queries

## Environment Configuration

### Required Environment Variables

**Backend (.env):**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your_key>
AWS_SECRET_ACCESS_KEY=<your_secret>
BEDROCK_AGENT_ID=<agent_id>
BEDROCK_AGENT_ALIAS_ID=<alias_id>
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000
VITE_AWS_REGION=us-east-1
```

### AWS Resource Names
- Lambda Functions: `get-soil-moisture`, `get-crop-advice`, `get-market-prices`
- DynamoDB Tables: `Farmers`, `SoilMoisture`, `CropRecommendations`, `Consultations`
- Bedrock Agent: Configured via AWS Console with action groups


## Development Tools & Workflow

### Build Tools
- **Vite** - ES modules, instant HMR, optimized production builds
- **TypeScript Compiler** - Strict mode, path aliases, incremental builds
- **ESLint** - Code quality and consistency enforcement
- **PostCSS** - Tailwind CSS processing with autoprefixer

### Testing Tools
- **Vitest** - Unit and integration testing with native ESM
- **Testing Library** - Component testing with accessibility queries
- **Fast-check** - Property-based testing for correctness validation
- **JSDOM** - Browser environment simulation for tests

### Code Quality
- **TypeScript** - Static type checking across frontend
- **ESLint** - React hooks rules, React refresh plugin
- **Pydantic** - Runtime validation for Python backend
- **Type Hints** - Python 3.11+ type annotations

### Version Control
- **Git** - Source control with .gitignore for secrets
- **Branch Strategy** - Feature branches, main for production
- **.env.example** - Template for environment configuration

## Scalability Considerations

### Horizontal Scaling
- **Lambda Auto-scaling** - Concurrent execution based on demand
- **DynamoDB On-demand** - Automatic capacity adjustment
- **CloudFront CDN** - Global edge caching for static assets
- **API Gateway** - Request throttling and rate limiting

### Vertical Optimization
- **Connection Pooling** - Reused database connections
- **Query Optimization** - DynamoDB GSI for efficient lookups
- **Caching Strategy** - Multi-layer caching (browser, CDN, API)
- **Lazy Loading** - Deferred component and route loading

### Cost Optimization
- **Serverless Architecture** - Pay-per-use pricing model
- **DynamoDB On-demand** - No provisioned capacity costs
- **S3 Lifecycle Policies** - Automatic archival of old data
- **Lambda Memory Tuning** - Right-sized memory allocation


## Innovation Highlights

### 1. NISAR Satellite Integration
- **First-of-its-kind** - Direct integration with NASA-ISRO NISAR mission data
- **High Resolution** - 100m pixel resolution for precise field-level insights
- **L-band SAR** - Penetrates cloud cover and vegetation for reliable measurements
- **Real-time Processing** - Lambda functions process raw satellite data on-demand

### 2. Voice-First for Rural Users
- **Low Literacy Support** - Voice interface removes text input barriers
- **Native Language** - Hindi and 7 regional languages for accessibility
- **Offline Voice** - Web Speech API works without internet connectivity
- **Visual Feedback** - Animated orb provides clear interaction cues

### 3. Groundwater Conservation Focus
- **Water-Efficient Crops** - Recommendations prioritize low water consumption
- **Soil Moisture Thresholds** - Prevents over-irrigation based on real data
- **Market Intelligence** - Economic viability of water-efficient alternatives
- **Behavioral Nudges** - Conversational AI encourages sustainable practices

### 4. Offline-First Architecture
- **Rural Connectivity** - Works in areas with intermittent internet
- **Progressive Enhancement** - Core features work offline, enhanced when online
- **Background Sync** - Automatic data synchronization when connectivity restored
- **Local-First Data** - IndexedDB as primary data store, cloud as backup

## Technical Challenges Solved

### 1. Multi-Language Voice Support
**Challenge:** AWS Transcribe real-time only supports Hindi and English  
**Solution:** Batch processing fallback for 6 other languages with user notification

### 2. Offline Chat Sessions
**Challenge:** Maintaining conversation context without server  
**Solution:** IndexedDB session storage with pending query queue and sync reconciliation

### 3. Design System Integration
**Challenge:** Sharing design tokens between screens without duplication  
**Solution:** Custom design system package with token-based architecture and Vite alias resolution

### 4. Satellite Data Processing
**Challenge:** Converting raw NISAR backscatter to actionable moisture percentages  
**Solution:** Lambda function with geospatial libraries and calibration algorithms

### 5. Cross-Language Numeral Display
**Challenge:** Hindi users expect Devanagari numerals (०१२३४५६७८९)  
**Solution:** Runtime conversion function with language-aware formatting utilities


## Future Enhancements

### Phase 2 (Planned)
- **Real NISAR Data Integration** - Replace mock data with actual satellite feeds
- **Push Notifications** - Critical alerts for pest outbreaks, weather warnings
- **Geolocation Services** - Automatic farmer location detection
- **Image Recognition** - Crop disease identification via camera
- **Community Features** - Farmer-to-farmer knowledge sharing

### Phase 3 (Planned)
- **Predictive Analytics** - ML models for yield forecasting
- **IoT Integration** - Soil sensor data from field devices
- **Blockchain Traceability** - Crop origin and quality certification
- **Marketplace** - Direct farmer-to-buyer connections
- **Government Integration** - Subsidy and scheme eligibility checking

## Technical Debt & Known Issues

### Current Limitations
- **Mock Data** - NISAR satellite data currently simulated
- **Single Region** - AWS resources in us-east-1 only
- **No Authentication** - Farmer ID-based access without password protection
- **Limited Error Recovery** - Some edge cases in offline sync not handled
- **Browser Compatibility** - Web Speech API not supported in all browsers

### Planned Improvements
- Real-time NISAR data pipeline
- Multi-region deployment for latency reduction
- OAuth2/JWT authentication system
- Enhanced error handling and retry logic
- Polyfills for broader browser support

## Documentation

### Available Guides
- **Setup:** AWS account setup, Bedrock configuration, Phase 1 deployment
- **User Guides:** Getting started, quick reference, agent console creation
- **Troubleshooting:** Bedrock access, agent role permissions, fresh start procedures
- **Spec Documentation:** Complete requirements, design, and task breakdowns

### Code Documentation
- **Inline Comments** - JSDoc for functions, component prop descriptions
- **Type Definitions** - TypeScript interfaces for all data structures
- **README Files** - Per-directory documentation for context
- **Architecture Diagrams** - Visual representations in spec design documents

---

## Quick Start Commands

```bash
# Clone and setup
git clone <repository-url>
cd piritiya

# Backend setup
python3 -m venv venv
source venv/bin/activate
cd backend && pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup (new terminal)
cd frontend && npm install
npm run dev

# Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

**Project Status:** 🚧 Active Development  
**Team:** ProgrammingInsect  
**Hackathon:** AWS Sponsored  
**Target Region:** Uttar Pradesh, India  
**Primary Users:** Smallholder farmers (1-5 hectare landholdings)

**Tech Stack Summary:**  
React 19 + TypeScript + Vite | Python 3.11 + FastAPI | AWS Lambda + DynamoDB + Bedrock | Progressive Web App | Voice-First Interface | Offline-Capable | 8 Indian Languages | NISAR Satellite Integration

