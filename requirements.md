# Piritiya - Requirements Specification

## Project Overview

Piritiya is a Sovereign AI solution designed to prevent groundwater depletion in Uttar Pradesh by providing intelligent crop recommendations to farmers. The system integrates Amazon Bedrock, India's AgriStack, and NISAR Satellite Data to advise against water-intensive crops when soil moisture is critical.

## 1. Functional Requirements

### FR-1: Voice Input Processing
**Priority:** High  
**Description:** The system must accept voice input from farmers in both Hindi and English languages.

**Acceptance Criteria:**
- System accepts audio input through the Streamlit interface
- Audio is processed using Amazon Transcribe simulation logic
- Both Hindi and English languages are supported
- Voice input is converted to text with >85% accuracy for clear speech
- System provides visual feedback during voice recording

### FR-2: Farmer Identification
**Priority:** High  
**Description:** The system must identify and authenticate farmers using a unique Farmer ID that simulates AgriStack integration.

**Acceptance Criteria:**
- Each farmer has a unique Farmer ID (format: `UP-DISTRICT-BLOCK-XXXXX`)
- System validates Farmer ID against the mock AgriStack database
- Farmer profile includes: name, location (district/block), land size, current crops
- Invalid Farmer IDs trigger appropriate error messages
- System maintains session state for authenticated farmers

### FR-3: Real-Time Soil Moisture Retrieval
**Priority:** High  
**Description:** The system must retrieve current soil moisture status from NISAR mock dataset stored in AWS S3.

**Acceptance Criteria:**
- System fetches soil moisture data at 100m resolution from S3
- Data includes NISAR moisture index (0-100 scale)
- Groundwater status is categorized as: Critical, Low, Moderate, Good
- Data is retrieved within 2 seconds of request
- System handles S3 connectivity failures gracefully
- Cache mechanism for recently accessed data (5-minute TTL)

### FR-4: Crop Recommendation Engine
**Priority:** High  
**Description:** The system must provide sustainable crop recommendations by cross-referencing soil moisture with market prices.

**Acceptance Criteria:**
- System identifies water-intensive crops (e.g., Satha Dhan/Summer Rice)
- Recommendations consider: soil moisture, groundwater status, market prices, season
- System explicitly warns against water-guzzling crops when moisture is critical
- Alternative crop suggestions include water requirement and expected yield
- Market price data simulates Agmarknet integration
- Recommendations are ranked by sustainability score and profitability

### FR-5: Government Subsidy Information
**Priority:** Medium  
**Description:** The system must provide accurate information about government schemes and subsidies using Bedrock Knowledge Base.

**Acceptance Criteria:**
- Knowledge Base is indexed with government scheme PDFs (PM-KISAN, PMFBY, etc.)
- System retrieves relevant schemes based on farmer query
- Responses cite specific scheme names and document sources
- Information includes: eligibility criteria, application process, subsidy amount
- System handles queries about crop insurance, loan waivers, and input subsidies

### FR-6: Voice Response Generation
**Priority:** High  
**Description:** The system must generate voice responses in the farmer's preferred language using Amazon Polly.

**Acceptance Criteria:**
- Text responses are converted to speech using Amazon Polly simulation
- Voice output supports Hindi and English
- Audio quality is clear and understandable
- Response includes natural pauses and appropriate intonation
- Farmer can replay the audio response

### FR-7: Multi-Turn Conversation
**Priority:** Medium  
**Description:** The system must maintain conversation context for follow-up questions.

**Acceptance Criteria:**
- System remembers previous queries within a session
- Farmers can ask clarifying questions without repeating context
- Conversation history is displayed in the UI
- Session expires after 30 minutes of inactivity

## 2. Non-Functional Requirements

### NFR-1: Performance - Response Latency
**Priority:** High  
**Description:** Voice responses must be generated within 5 seconds from query submission.

**Metrics:**
- Voice-to-text processing: <1.5 seconds
- Bedrock Agent processing: <2 seconds
- Lambda data fetch: <1 second
- Text-to-speech generation: <0.5 seconds
- Total end-to-end latency: <5 seconds (95th percentile)

**Testing Criteria:**
- Load testing with 50 concurrent users
- Performance monitoring with CloudWatch metrics
- Latency alerts for responses exceeding 7 seconds

### NFR-2: Availability - Offline Capability
**Priority:** High  
**Description:** The system must account for low-bandwidth rural connectivity using Edge AI principles.

**Requirements:**
- Progressive Web App (PWA) capabilities for offline access
- Local caching of frequently accessed data (schemes, crop database)
- Graceful degradation when cloud services are unavailable
- Offline mode provides basic recommendations using cached data
- Queue mechanism for syncing data when connectivity is restored
- Minimum bandwidth requirement: 2G connectivity (50 kbps)

**Edge AI Strategy:**
- Cache last 7 days of soil moisture data locally
- Store government scheme summaries for offline access
- Implement retry logic with exponential backoff
- Display clear indicators for offline/online status

### NFR-3: Accuracy - Source Citation
**Priority:** High  
**Description:** All recommendations must cite specific data sources and government schemes.

**Requirements:**
- Crop recommendations include: NISAR data timestamp, moisture index value
- Government scheme responses cite: scheme name, document name, page number
- Market price data includes: source (Agmarknet), date, mandi location
- Confidence scores displayed for AI-generated recommendations (>80% threshold)
- System logs all data sources for audit trail

**Validation:**
- Manual review of 100 sample responses for citation accuracy
- Automated tests verify presence of source citations
- User feedback mechanism to report inaccurate information

### NFR-4: Scalability
**Priority:** Medium  
**Description:** System must handle growing user base across Uttar Pradesh.

**Requirements:**
- Support 10,000 concurrent farmers during peak hours (sowing season)
- S3 data storage scales to accommodate state-wide NISAR coverage
- Lambda functions auto-scale based on demand
- Knowledge Base supports 1000+ government documents
- Database design supports 5 million farmer profiles

### NFR-5: Security & Privacy
**Priority:** High  
**Description:** Farmer data must be protected according to AgriStack privacy guidelines.

**Requirements:**
- Farmer ID authentication before data access
- Encryption at rest (S3, DynamoDB) and in transit (TLS 1.3)
- No PII (Personally Identifiable Information) stored in logs
- Compliance with India's Digital Personal Data Protection Act 2023
- Audit logs for all data access operations
- Data retention policy: 3 years for recommendations, 7 years for transactions

### NFR-6: Usability
**Priority:** High  
**Description:** Interface must be accessible to farmers with limited digital literacy.

**Requirements:**
- Voice-first interface minimizes typing requirements
- Simple visual design with large buttons and clear icons
- Support for regional language (Hindi) throughout UI
- Audio instructions for first-time users
- Maximum 3 clicks to reach any feature
- Accessibility compliance for visually impaired users

### NFR-7: Maintainability
**Priority:** Medium  
**Description:** System architecture must support easy updates and debugging.

**Requirements:**
- Modular Lambda functions for each action group
- Comprehensive CloudWatch logging and monitoring
- Infrastructure as Code (IaC) using AWS CDK or Terraform
- Automated testing with >80% code coverage
- Documentation for all API endpoints and data schemas
- Version control for Knowledge Base documents

## 3. Technical Constraints

### TC-1: Mandatory AWS Services
- **Orchestrator:** Amazon Bedrock Agents (no alternatives)
- **Model:** Claude 3.5 Sonnet via Bedrock
- **RAG:** Knowledge Bases for Amazon Bedrock
- **Storage:** AWS S3 for NISAR data
- **Compute:** AWS Lambda (Python runtime)
- **Frontend:** Streamlit (Python)

### TC-2: Data Sources
- **NISAR Data:** Mock dataset at 100m resolution (JSON format)
- **AgriStack:** Simulated farmer database
- **Agmarknet:** Simulated market price API
- **Government Schemes:** PDF documents indexed in Knowledge Base

### TC-3: Language Support
- Primary: Hindi (Devanagari script)
- Secondary: English
- Future: Bhojpuri, Awadhi (UP regional languages)

## 4. User Stories

### US-1: Crop Advisory
**As a** farmer in Uttar Pradesh  
**I want to** ask Piritiya if I should plant summer rice this season  
**So that** I can avoid depleting groundwater and save costs

**Acceptance Criteria:**
- Farmer speaks query in Hindi: "Kya main is saal garmi mein dhan laga sakta hoon?"
- System checks soil moisture for farmer's block
- If moisture is critical, system warns against summer rice
- System suggests alternative crops (e.g., pulses, millets)
- Response includes market prices and water requirements

### US-2: Subsidy Information
**As a** farmer  
**I want to** learn about crop insurance schemes  
**So that** I can protect myself from crop failure

**Acceptance Criteria:**
- Farmer asks: "Fasal bima yojana ke baare mein bataiye"
- System retrieves PMFBY (Pradhan Mantri Fasal Bima Yojana) details
- Response includes: premium amount, coverage, claim process
- System cites official government document
- Farmer can ask follow-up questions about eligibility

### US-3: Soil Health Check
**As a** farmer  
**I want to** check current soil moisture in my field  
**So that** I can plan irrigation schedule

**Acceptance Criteria:**
- Farmer provides Farmer ID
- System fetches latest NISAR data for farmer's location
- Response includes: moisture index, groundwater status, last updated time
- Visual indicator (color-coded) shows moisture level
- System suggests optimal irrigation timing

## 5. Out of Scope (Phase 1)

- Real-time NISAR satellite data integration (using mock data)
- Actual AgriStack API integration (simulated)
- Payment gateway for scheme applications
- Mobile app (iOS/Android native)
- Weather forecast integration
- Pest and disease detection
- Soil testing lab integration
- Direct mandi linkage for crop selling

## 6. Success Metrics

### Adoption Metrics
- 1,000 active farmers in pilot phase (3 months)
- 60% user retention rate month-over-month
- Average 5 queries per farmer per week during sowing season

### Impact Metrics
- 30% reduction in summer rice cultivation in pilot blocks
- 20% increase in awareness of government schemes
- 50% reduction in groundwater extraction (estimated)

### Technical Metrics
- 99.5% system uptime
- <5 second average response time
- <2% error rate in voice transcription
- >90% user satisfaction score

## 7. Assumptions & Dependencies

### Assumptions
- Farmers have access to smartphones with internet connectivity
- Basic digital literacy for using Streamlit web interface
- Government scheme PDFs are publicly available
- Mock NISAR data accurately represents real satellite patterns

### Dependencies
- AWS account with Bedrock access in supported region
- Claude 3.5 Sonnet model availability
- S3 bucket provisioned for NISAR data
- Lambda execution role with appropriate permissions
- Knowledge Base created and indexed with scheme documents

## 8. Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Bedrock service unavailable | High | Low | Implement fallback to cached responses |
| Poor voice recognition in noisy environments | Medium | High | Add noise cancellation, text input option |
| Farmer distrust of AI recommendations | High | Medium | Cite sources, provide explanation, human expert validation |
| S3 data fetch latency | Medium | Medium | Implement caching layer, CDN for static data |
| Knowledge Base indexing errors | Medium | Low | Automated validation scripts, manual review process |

## 9. Compliance & Regulations

- **Data Protection:** Compliance with Digital Personal Data Protection Act 2023
- **Agricultural Guidelines:** Adherence to Ministry of Agriculture advisories
- **AI Ethics:** Transparent AI decision-making, no discriminatory recommendations
- **Accessibility:** WCAG 2.1 Level AA compliance for web interface

## 10. Glossary

- **AgriStack:** India's unified digital infrastructure for agriculture
- **NISAR:** NASA-ISRO Synthetic Aperture Radar satellite for Earth observation
- **Satha Dhan:** Summer rice, a water-intensive crop planted in May-June
- **Bedrock Agent:** AWS service for orchestrating AI workflows
- **Knowledge Base:** Vector database for RAG (Retrieval-Augmented Generation)
- **Action Group:** Bedrock Agent component that defines Lambda function calls
- **Agmarknet:** Government portal for agricultural market prices
