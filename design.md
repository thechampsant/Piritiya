# Piritiya - System Design Document

## 1. System Architecture Overview

Piritiya follows a serverless, event-driven architecture leveraging AWS managed services for scalability and reliability.

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FARMER (User)                                │
│                    Voice Input (Hindi/English)                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STREAMLIT FRONTEND (Python)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Voice Input  │  │  Chat UI     │  │ Visualization│              │
│  │  Component   │  │  Component   │  │  Dashboard   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              AMAZON TRANSCRIBE (Voice-to-Text)                       │
│                   Simulated Logic in Streamlit                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  AMAZON BEDROCK AGENT (Orchestrator)                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Claude 3.5/4.5 Sonnet (Foundation Model)            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐  │
│  │   Action Groups      │    │  Knowledge Base (RAG)            │  │
│  │  - Soil Data Fetch   │    │  - Government Scheme PDFs        │  │
│  │  - Crop Recommend    │    │  - Vector Embeddings             │  │
│  │  - Market Price      │    │  - OpenSearch Serverless         │  │
│  └──────────┬───────────┘    └──────────────┬───────────────────┘  │
└─────────────┼──────────────────────────────┼────────────────────────┘
              │                               │
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│   AWS LAMBDA FUNCTIONS   │    │  KNOWLEDGE BASE RETRIEVAL        │
│   (Python 3.11)          │    │  (Semantic Search)               │
│                          │    └──────────────────────────────────┘
│  ┌────────────────────┐  │
│  │ get_soil_moisture  │  │
│  │ get_crop_advice    │  │
│  │ get_market_prices  │  │
│  └─────────┬──────────┘  │
└────────────┼─────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│                         AWS S3 BUCKET                             │
│  ┌────────────────────┐  ┌────────────────────┐                 │
│  │  farm_data.json    │  │  scheme_docs/      │                 │
│  │  (NISAR Mock Data) │  │  (PDF Documents)   │                 │
│  └────────────────────┘  └────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────────┐
│              RESPONSE GENERATION & SYNTHESIS                      │
│                    (Claude 3.5 Sonnet)                            │
└────────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              AMAZON POLLY (Text-to-Speech)                       │
│                   Simulated Logic in Streamlit                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUDIO RESPONSE TO FARMER                      │
└─────────────────────────────────────────────────────────────────┘
```


### 1.2 Request Flow Sequence

```
1. Farmer speaks query → Streamlit captures audio
2. Audio → Amazon Transcribe simulation → Text (Hindi/English)
3. Text + Farmer ID → Bedrock Agent (Supervisor)
4. Bedrock Agent analyzes intent using Claude 3.5 Sonnet
5. Agent determines required actions:
   a. Soil moisture query → Invokes Lambda via Action Group
   b. Government scheme query → Queries Knowledge Base
   c. Crop recommendation → Combines both sources
6. Lambda function:
   - Receives parameters from Bedrock Agent
   - Fetches data from S3 (farm_data.json)
   - Processes and returns structured response
7. Knowledge Base:
   - Performs semantic search on indexed PDFs
   - Returns relevant document chunks with citations
8. Claude 3.5 Sonnet synthesizes final response:
   - Combines data from Lambda and Knowledge Base
   - Generates natural language answer in Hindi/English
   - Includes source citations
9. Response text → Amazon Polly simulation → Audio
10. Audio + Text displayed in Streamlit UI
```

### 1.3 Component Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| Streamlit Frontend | User interface, voice I/O simulation, session management | Python, Streamlit |
| Amazon Transcribe | Voice-to-text conversion (simulated) | AWS Transcribe API |
| Bedrock Agent | Orchestration, intent recognition, action routing | Amazon Bedrock Agents |
| Claude 3.5 Sonnet | Natural language understanding, response generation | Bedrock Foundation Model |
| Action Groups | Define Lambda function schemas and invocation | Bedrock Agent Configuration |
| AWS Lambda | Business logic, data fetching, processing | Python 3.11 |
| Knowledge Base | Document retrieval, semantic search | Bedrock Knowledge Base + OpenSearch |
| AWS S3 | Data storage (NISAR data, PDFs) | S3 Standard |
| Amazon Polly | Text-to-speech conversion (simulated) | AWS Polly API |

## 2. Data Model

### 2.1 NISAR Mock Dataset Schema (farm_data.json)

```json
{
  "metadata": {
    "dataset_version": "1.0",
    "last_updated": "2026-02-15T06:00:00Z",
    "resolution_meters": 100,
    "coverage_area": "Uttar Pradesh",
    "data_source": "NISAR Satellite (Mock)",
    "update_frequency": "daily"
  },
  "farmers": [
    {
      "farmer_id": "UP-LUCKNOW-MALIHABAD-00001",
      "farmer_name": "राम प्रसाद वर्मा",
      "location": {
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "block": "Malihabad",
        "village": "Nagram",
        "coordinates": {
          "latitude": 26.9124,
          "longitude": 80.9466
        }
      },
      "land_details": {
        "total_area_hectares": 2.5,
        "soil_type": "Loamy",
        "irrigation_source": "Tubewell"
      },
      "nisar_data": {
        "moisture_index": 35,
        "measurement_date": "2026-02-14T10:30:00Z",
        "moisture_category": "Low",
        "trend": "Decreasing"
      },
      "groundwater_status": {
        "status": "Critical",
        "depth_meters": 45.2,
        "depletion_rate_cm_per_year": 1.8,
        "safe_extraction_limit_cubic_meters": 5000
      },
      "recommended_crops": [
        {
          "crop_name": "Moong (Green Gram)",
          "crop_name_hindi": "मूंग",
          "water_requirement_mm": 350,
          "duration_days": 60,
          "expected_yield_quintal_per_hectare": 8,
          "market_price_per_quintal": 7500,
          "sustainability_score": 92,
          "reason": "Low water requirement, nitrogen-fixing, suitable for summer"
        },
        {
          "crop_name": "Urad (Black Gram)",
          "crop_name_hindi": "उड़द",
          "water_requirement_mm": 400,
          "duration_days": 70,
          "expected_yield_quintal_per_hectare": 10,
          "market_price_per_quintal": 8200,
          "sustainability_score": 88,
          "reason": "Moderate water need, improves soil health"
        }
      ],
      "crops_to_avoid": [
        {
          "crop_name": "Summer Rice (Satha Dhan)",
          "crop_name_hindi": "गर्मी का धान",
          "water_requirement_mm": 1200,
          "reason": "Extremely high water requirement, will deplete groundwater critically",
          "estimated_groundwater_depletion_meters": 3.5
        }
      ],
      "current_season": "Zaid (Summer)",
      "last_consultation_date": "2026-02-10T14:20:00Z"
    }
  ]
}
```

### 2.2 Database Schema (DynamoDB - Optional for Production)

```
Table: Farmers
- farmer_id (String, Partition Key)
- farmer_name (String)
- location (Map)
- land_details (Map)
- phone_number (String)
- preferred_language (String)
- registration_date (String)

Table: Consultations
- consultation_id (String, Partition Key)
- farmer_id (String, Sort Key)
- timestamp (String)
- query_text (String)
- response_text (String)
- data_sources_used (List)
- recommendation_type (String)

Table: NISARData
- location_block (String, Partition Key)
- measurement_date (String, Sort Key)
- moisture_index (Number)
- groundwater_status (String)
- raw_data_s3_path (String)
```

### 2.3 Knowledge Base Document Structure

```
s3://piritiya-knowledge-base/
├── schemes/
│   ├── pm-kisan.pdf
│   ├── pmfby-crop-insurance.pdf
│   ├── kisan-credit-card.pdf
│   └── soil-health-card.pdf
├── advisories/
│   ├── groundwater-management-up.pdf
│   ├── zaid-crop-guidelines.pdf
│   └── sustainable-agriculture-practices.pdf
└── metadata/
    └── document_index.json
```

## 3. Component Interaction Details

### 3.1 Bedrock Agent Configuration

```yaml
Agent Name: PiritiyaAgent
Foundation Model: anthropic.claude-3-5-sonnet-20241022-v2:0
Instruction: |
  You are Piritiya, an AI assistant for Indian farmers in Uttar Pradesh.
  Your goal is to prevent groundwater depletion by recommending sustainable crops.
  
  Guidelines:
  - Always check soil moisture before recommending crops
  - Warn against water-intensive crops when groundwater is critical
  - Cite government schemes with document names
  - Respond in Hindi or English based on user preference
  - Be empathetic and supportive in your tone
  
Action Groups:
  - Name: SoilMoistureActionGroup
    Description: Fetch real-time soil moisture data from NISAR
    Lambda: arn:aws:lambda:region:account:function:get-soil-moisture
    
  - Name: CropRecommendationActionGroup
    Description: Get crop recommendations based on soil and market data
    Lambda: arn:aws:lambda:region:account:function:get-crop-advice
    
  - Name: MarketPriceActionGroup
    Description: Fetch current market prices for crops
    Lambda: arn:aws:lambda:region:account:function:get-market-prices

Knowledge Base:
  - ID: kb-piritiya-schemes
  - Description: Government agricultural schemes and advisories
  - Retrieval Configuration:
      - Number of results: 5
      - Search type: Semantic
```

### 3.2 Action Group Schema (OpenAPI Specification)

```yaml
openapi: 3.0.0
info:
  title: Piritiya Action Group API
  version: 1.0.0

paths:
  /get-soil-moisture:
    post:
      summary: Retrieve soil moisture data for a farmer
      operationId: getSoilMoisture
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                farmer_id:
                  type: string
                  description: Unique farmer identifier
              required:
                - farmer_id
      responses:
        '200':
          description: Soil moisture data retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  moisture_index:
                    type: number
                  groundwater_status:
                    type: string
                  measurement_date:
                    type: string
                  location:
                    type: string

  /get-crop-advice:
    post:
      summary: Get crop recommendations
      operationId: getCropAdvice
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                farmer_id:
                  type: string
                season:
                  type: string
                  enum: [Rabi, Kharif, Zaid]
              required:
                - farmer_id
      responses:
        '200':
          description: Crop recommendations generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  recommended_crops:
                    type: array
                  crops_to_avoid:
                    type: array
                  reasoning:
                    type: string

  /get-market-prices:
    post:
      summary: Fetch current market prices
      operationId: getMarketPrices
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                crop_names:
                  type: array
                  items:
                    type: string
                district:
                  type: string
              required:
                - crop_names
      responses:
        '200':
          description: Market prices retrieved
          content:
            application/json:
              schema:
                type: object
                properties:
                  prices:
                    type: array
                  source:
                    type: string
                  last_updated:
                    type: string
```


### 3.3 Lambda Function Architecture

#### Lambda: get-soil-moisture

```python
# Function: get-soil-moisture
# Runtime: Python 3.11
# Memory: 512 MB
# Timeout: 10 seconds

import json
import boto3
from datetime import datetime

s3_client = boto3.client('s3')
BUCKET_NAME = 'piritiya-data'
DATA_FILE = 'farm_data.json'

def lambda_handler(event, context):
    """
    Fetch soil moisture data for a specific farmer
    
    Input: {"farmer_id": "UP-LUCKNOW-MALIHABAD-00001"}
    Output: {
        "moisture_index": 35,
        "groundwater_status": "Critical",
        "measurement_date": "2026-02-14T10:30:00Z",
        "location": "Malihabad, Lucknow"
    }
    """
    try:
        # Extract farmer_id from Bedrock Agent event
        farmer_id = event.get('requestBody', {}).get('content', {}).get('application/json', {}).get('properties', [{}])[0].get('value')
        
        # Fetch data from S3
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=DATA_FILE)
        data = json.loads(response['Body'].read())
        
        # Find farmer data
        farmer_data = next((f for f in data['farmers'] if f['farmer_id'] == farmer_id), None)
        
        if not farmer_data:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Farmer not found'})
            }
        
        # Extract relevant information
        result = {
            'moisture_index': farmer_data['nisar_data']['moisture_index'],
            'moisture_category': farmer_data['nisar_data']['moisture_category'],
            'groundwater_status': farmer_data['groundwater_status']['status'],
            'groundwater_depth_meters': farmer_data['groundwater_status']['depth_meters'],
            'measurement_date': farmer_data['nisar_data']['measurement_date'],
            'location': f"{farmer_data['location']['block']}, {farmer_data['location']['district']}",
            'data_source': 'NISAR Satellite (100m resolution)'
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
```

#### Lambda: get-crop-advice

```python
# Function: get-crop-advice
# Runtime: Python 3.11
# Memory: 512 MB
# Timeout: 10 seconds

def lambda_handler(event, context):
    """
    Generate crop recommendations based on soil moisture and season
    
    Input: {"farmer_id": "UP-LUCKNOW-MALIHABAD-00001", "season": "Zaid"}
    Output: {
        "recommended_crops": [...],
        "crops_to_avoid": [...],
        "reasoning": "..."
    }
    """
    try:
        farmer_id = extract_parameter(event, 'farmer_id')
        season = extract_parameter(event, 'season', default='Zaid')
        
        # Fetch farmer data from S3
        farmer_data = get_farmer_data(farmer_id)
        
        # Apply recommendation logic
        moisture_index = farmer_data['nisar_data']['moisture_index']
        groundwater_status = farmer_data['groundwater_status']['status']
        
        result = {
            'recommended_crops': farmer_data['recommended_crops'],
            'crops_to_avoid': farmer_data['crops_to_avoid'],
            'reasoning': generate_reasoning(moisture_index, groundwater_status, season),
            'sustainability_alert': check_sustainability_alert(groundwater_status)
        }
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def generate_reasoning(moisture_index, groundwater_status, season):
    """Generate human-readable reasoning for recommendations"""
    if groundwater_status == 'Critical' and moisture_index < 40:
        return (
            f"Your area's groundwater is at CRITICAL level with soil moisture at {moisture_index}%. "
            f"We strongly advise against water-intensive crops like summer rice. "
            f"Recommended crops require 60-70% less water and will help preserve groundwater."
        )
    # Additional logic for other scenarios
    return "Recommendations based on current soil and groundwater conditions."
```

#### Lambda: get-market-prices

```python
# Function: get-market-prices
# Runtime: Python 3.11
# Memory: 256 MB
# Timeout: 5 seconds

def lambda_handler(event, context):
    """
    Fetch market prices for specified crops (simulating Agmarknet)
    
    Input: {"crop_names": ["Moong", "Urad"], "district": "Lucknow"}
    Output: {
        "prices": [
            {"crop": "Moong", "price_per_quintal": 7500, "mandi": "Lucknow"},
            {"crop": "Urad", "price_per_quintal": 8200, "mandi": "Lucknow"}
        ],
        "source": "Agmarknet (Simulated)",
        "last_updated": "2026-02-15T06:00:00Z"
    }
    """
    # Mock implementation - in production, would call Agmarknet API
    crop_names = extract_parameter(event, 'crop_names')
    district = extract_parameter(event, 'district', default='Lucknow')
    
    # Simulated price data
    price_database = {
        'Moong': 7500,
        'Urad': 8200,
        'Arhar': 6800,
        'Summer Rice': 2100,
        'Bajra': 2500
    }
    
    prices = [
        {
            'crop': crop,
            'price_per_quintal': price_database.get(crop, 0),
            'mandi': district,
            'trend': 'Stable'
        }
        for crop in crop_names
    ]
    
    return {
        'statusCode': 200,
        'body': json.dumps({
            'prices': prices,
            'source': 'Agmarknet (Simulated)',
            'last_updated': datetime.now().isoformat()
        })
    }
```

### 3.4 Bedrock Agent Invocation Flow

```
Step 1: User Query Received
├─ Input: "Kya main garmi mein dhan laga sakta hoon?"
├─ Farmer ID: "UP-LUCKNOW-MALIHABAD-00001"
└─ Language: Hindi

Step 2: Bedrock Agent Processes Query
├─ Claude 3.5 Sonnet analyzes intent
├─ Identifies: Crop recommendation query for summer rice
└─ Determines required actions:
    ├─ Action 1: Get soil moisture data
    └─ Action 2: Get crop recommendations

Step 3: Action Group Execution
├─ Bedrock Agent invokes Lambda: get-soil-moisture
│   ├─ Request: {"farmer_id": "UP-LUCKNOW-MALIHABAD-00001"}
│   └─ Response: {"moisture_index": 35, "groundwater_status": "Critical"}
│
└─ Bedrock Agent invokes Lambda: get-crop-advice
    ├─ Request: {"farmer_id": "UP-LUCKNOW-MALIHABAD-00001", "season": "Zaid"}
    └─ Response: {"recommended_crops": [...], "crops_to_avoid": ["Summer Rice"]}

Step 4: Knowledge Base Query (if needed)
├─ Query: "Government schemes for alternative crops"
├─ Semantic search in indexed PDFs
└─ Returns: PM-KISAN details, PMFBY information

Step 5: Response Synthesis
├─ Claude 3.5 Sonnet combines:
│   ├─ Soil moisture data
│   ├─ Crop recommendations
│   └─ Government scheme information
│
└─ Generates natural language response in Hindi:
    "आपके क्षेत्र में भूजल स्तर गंभीर है और मिट्टी की नमी केवल 35% है।
     गर्मी में धान लगाने से भूजल और कम हो जाएगा।
     हम मूंग या उड़द की सलाह देते हैं जो 70% कम पानी में उगाई जा सकती है।"

Step 6: Response Delivery
├─ Text response sent to Streamlit
├─ Amazon Polly converts to Hindi audio
└─ Both text and audio displayed to farmer
```

## 4. Frontend Design (Streamlit)

### 4.1 Application Structure

```
streamlit_app/
├── app.py                    # Main Streamlit application
├── components/
│   ├── voice_input.py        # Voice recording and transcription
│   ├── chat_interface.py     # Chat UI component
│   ├── visualization.py      # Data visualization dashboard
│   └── audio_player.py       # Audio response playback
├── services/
│   ├── bedrock_client.py     # Bedrock Agent API calls
│   ├── transcribe_sim.py     # Transcribe simulation
│   └── polly_sim.py          # Polly simulation
├── utils/
│   ├── session_manager.py    # Session state management
│   ├── language_handler.py   # Hindi/English switching
│   └── cache_manager.py      # Offline data caching
└── config/
    └── settings.py           # Configuration parameters
```

### 4.2 User Interface Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Piritiya - पिरितिया                          [Hi] [En]     │
│  Farmer ID: UP-LUCKNOW-MALIHABAD-00001                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Soil Moisture: 35% [████░░░░░░] CRITICAL          │    │
│  │  Groundwater: 45.2m depth (Critical)               │    │
│  │  Last Updated: 14 Feb 2026, 10:30 AM               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Chat History                                       │    │
│  │  ────────────────────────────────────────────────  │    │
│  │  🧑 You: Kya main garmi mein dhan laga sakta hoon? │    │
│  │                                                      │    │
│  │  🤖 Piritiya: आपके क्षेत्र में भूजल स्तर गंभीर है।│    │
│  │     गर्मी में धान लगाने से भूजल और कम हो जाएगा।  │    │
│  │     हम मूंग या उड़द की सलाह देते हैं...           │    │
│  │     [🔊 Play Audio Response]                        │    │
│  │                                                      │    │
│  │  Sources: NISAR Data (14 Feb), PM-KISAN Scheme     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [🎤 Hold to Speak]  or  [Type your question...]   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Recommended Crops:                                         │
│  • Moong (मूंग) - ₹7,500/quintal - Water: 350mm           │
│  • Urad (उड़द) - ₹8,200/quintal - Water: 400mm            │
│                                                              │
│  ⚠️ Avoid: Summer Rice (1200mm water needed)               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Voice Input Simulation Logic

```python
# Pseudo-code for voice input handling
def handle_voice_input():
    """Simulate Amazon Transcribe functionality"""
    
    # Record audio from microphone
    audio_data = record_audio(duration=5)
    
    # In production: Call Amazon Transcribe
    # transcribe_client.start_transcription_job(...)
    
    # For demo: Use local speech recognition or mock
    if DEMO_MODE:
        text = mock_transcribe(audio_data, language='hi-IN')
    else:
        text = call_transcribe_api(audio_data, language='hi-IN')
    
    return text

def mock_transcribe(audio_data, language):
    """Mock transcription for demo purposes"""
    # Simulate processing delay
    time.sleep(1)
    
    # Return pre-defined transcriptions for demo
    sample_queries = [
        "Kya main garmi mein dhan laga sakta hoon?",
        "Mujhe PM-KISAN yojana ke baare mein bataiye",
        "Mere khet ki mitti ki nami kitni hai?"
    ]
    
    return random.choice(sample_queries)
```

### 4.4 Bedrock Agent Integration

```python
# services/bedrock_client.py
import boto3
import json

class BedrockAgentClient:
    def __init__(self):
        self.client = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        self.agent_id = 'AGENT_ID_HERE'
        self.agent_alias_id = 'AGENT_ALIAS_ID_HERE'
    
    def invoke_agent(self, query, farmer_id, session_id):
        """
        Invoke Bedrock Agent with user query
        
        Args:
            query: User's question (text)
            farmer_id: Unique farmer identifier
            session_id: Session ID for conversation continuity
        
        Returns:
            Agent response with text and citations
        """
        try:
            response = self.client.invoke_agent(
                agentId=self.agent_id,
                agentAliasId=self.agent_alias_id,
                sessionId=session_id,
                inputText=query,
                sessionState={
                    'sessionAttributes': {
                        'farmer_id': farmer_id,
                        'language': 'hindi'
                    }
                }
            )
            
            # Parse streaming response
            result = self._parse_agent_response(response)
            return result
            
        except Exception as e:
            return {
                'error': str(e),
                'fallback_response': 'क्षमा करें, कुछ गड़बड़ हो गई। कृपया पुनः प्रयास करें।'
            }
    
    def _parse_agent_response(self, response):
        """Parse Bedrock Agent streaming response"""
        completion = ""
        citations = []
        
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                completion += chunk.get('bytes', b'').decode('utf-8')
            
            if 'trace' in event:
                trace = event['trace']
                # Extract citations from trace
                if 'orchestrationTrace' in trace:
                    orch_trace = trace['orchestrationTrace']
                    if 'observation' in orch_trace:
                        citations.extend(self._extract_citations(orch_trace))
        
        return {
            'response_text': completion,
            'citations': citations,
            'timestamp': datetime.now().isoformat()
        }
```


## 5. Knowledge Base Configuration

### 5.1 Knowledge Base Setup

```yaml
Knowledge Base Name: piritiya-schemes-kb
Embedding Model: amazon.titan-embed-text-v2:0
Vector Store: Amazon OpenSearch Serverless
Chunking Strategy:
  Type: Fixed-size
  Chunk Size: 300 tokens
  Overlap: 20%

Data Source:
  Type: S3
  Bucket: piritiya-knowledge-base
  Prefix: schemes/
  File Types: PDF
  
Metadata Fields:
  - scheme_name
  - ministry
  - year
  - state
  - document_type
```

### 5.2 Document Indexing Process

```
1. Upload PDFs to S3 bucket
   └─ s3://piritiya-knowledge-base/schemes/

2. Knowledge Base automatically:
   ├─ Extracts text from PDFs
   ├─ Splits into chunks (300 tokens)
   ├─ Generates embeddings using Titan
   └─ Stores in OpenSearch Serverless

3. Metadata extraction:
   ├─ Document title → scheme_name
   ├─ Parse ministry from header
   └─ Extract year from document

4. Indexing status:
   └─ Monitor via CloudWatch logs
```

### 5.3 Retrieval Configuration

```python
# Knowledge Base query configuration
retrieval_config = {
    'vectorSearchConfiguration': {
        'numberOfResults': 5,
        'overrideSearchType': 'SEMANTIC'
    }
}

# Example query to Knowledge Base
def query_knowledge_base(query, kb_id):
    """Query Bedrock Knowledge Base"""
    bedrock_agent = boto3.client('bedrock-agent-runtime')
    
    response = bedrock_agent.retrieve(
        knowledgeBaseId=kb_id,
        retrievalQuery={
            'text': query
        },
        retrievalConfiguration=retrieval_config
    )
    
    # Extract relevant chunks
    results = []
    for result in response['retrievalResults']:
        results.append({
            'content': result['content']['text'],
            'source': result['location']['s3Location']['uri'],
            'score': result['score']
        })
    
    return results
```

## 6. Deployment Architecture

### 6.1 AWS Infrastructure

```
Region: us-east-1 (or ap-south-1 for India)

VPC Configuration:
├─ Public Subnets (for Streamlit on EC2/ECS)
└─ Private Subnets (for Lambda functions)

IAM Roles:
├─ BedrockAgentRole
│   ├─ Permissions: bedrock:InvokeModel, bedrock:Retrieve
│   └─ Trust: bedrock.amazonaws.com
│
├─ LambdaExecutionRole
│   ├─ Permissions: s3:GetObject, logs:CreateLogGroup
│   └─ Trust: lambda.amazonaws.com
│
└─ StreamlitEC2Role
    ├─ Permissions: bedrock-agent-runtime:InvokeAgent
    └─ Trust: ec2.amazonaws.com

S3 Buckets:
├─ piritiya-data (NISAR mock data)
├─ piritiya-knowledge-base (PDF documents)
└─ piritiya-logs (application logs)

Lambda Functions:
├─ get-soil-moisture (512 MB, 10s timeout)
├─ get-crop-advice (512 MB, 10s timeout)
└─ get-market-prices (256 MB, 5s timeout)

Bedrock Resources:
├─ Agent: PiritiyaAgent
├─ Knowledge Base: piritiya-schemes-kb
└─ Model: Claude 3.5 Sonnet

Monitoring:
├─ CloudWatch Logs (Lambda, Bedrock)
├─ CloudWatch Metrics (Latency, Errors)
└─ X-Ray (Distributed tracing)
```

### 6.2 Deployment Options

#### Option 1: EC2 Deployment (Recommended for Hackathon)

```bash
# EC2 Instance: t3.medium (2 vCPU, 4 GB RAM)
# OS: Amazon Linux 2023

# Installation script
sudo yum update -y
sudo yum install python3.11 -y
pip3 install streamlit boto3 pandas

# Run Streamlit
streamlit run app.py --server.port 8501 --server.address 0.0.0.0
```

#### Option 2: ECS Fargate (Production)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

#### Option 3: Lambda + API Gateway (Serverless)

```yaml
# For API-only deployment (no Streamlit UI)
API Gateway:
  - POST /query
    └─ Lambda: streamlit-backend
        └─ Invokes Bedrock Agent
        └─ Returns JSON response
```

### 6.3 Environment Configuration

```python
# config/settings.py
import os

class Config:
    # AWS Configuration
    AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
    BEDROCK_AGENT_ID = os.getenv('BEDROCK_AGENT_ID')
    BEDROCK_AGENT_ALIAS_ID = os.getenv('BEDROCK_AGENT_ALIAS_ID')
    KNOWLEDGE_BASE_ID = os.getenv('KNOWLEDGE_BASE_ID')
    
    # S3 Configuration
    S3_BUCKET_DATA = 'piritiya-data'
    S3_BUCKET_KB = 'piritiya-knowledge-base'
    FARM_DATA_KEY = 'farm_data.json'
    
    # Lambda Functions
    LAMBDA_SOIL_MOISTURE = 'get-soil-moisture'
    LAMBDA_CROP_ADVICE = 'get-crop-advice'
    LAMBDA_MARKET_PRICES = 'get-market-prices'
    
    # Application Settings
    DEFAULT_LANGUAGE = 'hindi'
    SESSION_TIMEOUT_MINUTES = 30
    CACHE_TTL_SECONDS = 300
    
    # Performance Thresholds
    MAX_RESPONSE_TIME_SECONDS = 5
    MOISTURE_CRITICAL_THRESHOLD = 40
    GROUNDWATER_CRITICAL_DEPTH = 40  # meters
```

## 7. Offline Capability Design

### 7.1 Progressive Web App (PWA) Configuration

```javascript
// public/service-worker.js
const CACHE_NAME = 'piritiya-v1';
const OFFLINE_CACHE = [
  '/static/css/main.css',
  '/static/js/main.js',
  '/offline-data/schemes-summary.json',
  '/offline-data/crop-database.json'
];

// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_CACHE);
    })
  );
});

// Serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 7.2 Local Data Caching Strategy

```python
# utils/cache_manager.py
import json
import time
from pathlib import Path

class OfflineCache:
    def __init__(self, cache_dir='./offline_cache'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
    
    def cache_farmer_data(self, farmer_id, data):
        """Cache farmer data locally for offline access"""
        cache_file = self.cache_dir / f"{farmer_id}.json"
        cache_entry = {
            'data': data,
            'cached_at': time.time(),
            'ttl': 86400  # 24 hours
        }
        with open(cache_file, 'w') as f:
            json.dump(cache_entry, f)
    
    def get_cached_data(self, farmer_id):
        """Retrieve cached data if available and not expired"""
        cache_file = self.cache_dir / f"{farmer_id}.json"
        
        if not cache_file.exists():
            return None
        
        with open(cache_file, 'r') as f:
            cache_entry = json.load(f)
        
        # Check if cache is expired
        if time.time() - cache_entry['cached_at'] > cache_entry['ttl']:
            return None
        
        return cache_entry['data']
    
    def cache_schemes_summary(self):
        """Cache government schemes for offline access"""
        schemes_summary = {
            'PM-KISAN': {
                'description': 'Direct income support of ₹6000/year',
                'eligibility': 'All landholding farmers',
                'application': 'Online via pmkisan.gov.in'
            },
            'PMFBY': {
                'description': 'Crop insurance scheme',
                'premium': '2% for Kharif, 1.5% for Rabi',
                'coverage': 'All notified crops'
            }
        }
        
        cache_file = self.cache_dir / 'schemes_summary.json'
        with open(cache_file, 'w') as f:
            json.dump(schemes_summary, f)
```

### 7.3 Offline Mode UI

```python
# components/offline_indicator.py
import streamlit as st

def show_offline_mode():
    """Display offline mode indicator"""
    st.warning("""
    🔌 Offline Mode Active
    
    You are currently offline. Piritiya is using cached data:
    - Last soil moisture update: 2 hours ago
    - Government schemes: Cached summaries available
    - Crop recommendations: Based on last known data
    
    Connect to internet for real-time updates.
    """)

def check_connectivity():
    """Check if AWS services are reachable"""
    try:
        # Attempt to call Bedrock Agent
        response = bedrock_client.invoke_agent(
            query="test",
            farmer_id="test",
            session_id="connectivity-check"
        )
        return True
    except:
        return False
```

## 8. Performance Optimization

### 8.1 Latency Breakdown & Targets

```
Target: <5 seconds end-to-end

Component Latency Budget:
├─ Voice Input (Transcribe): 1.5s
├─ Bedrock Agent Processing: 2.0s
│   ├─ Intent Recognition: 0.3s
│   ├─ Lambda Invocation: 0.8s
│   ├─ Knowledge Base Query: 0.5s
│   └─ Response Generation: 0.4s
├─ Text-to-Speech (Polly): 0.5s
└─ Network Overhead: 1.0s

Optimization Strategies:
├─ Lambda: Provisioned concurrency for cold start elimination
├─ S3: CloudFront CDN for faster data retrieval
├─ Bedrock: Batch requests when possible
└─ Caching: Redis for frequently accessed data
```

### 8.2 Caching Strategy

```python
# Implement multi-level caching
class CacheStrategy:
    def __init__(self):
        self.memory_cache = {}  # In-memory (fastest)
        self.local_cache = OfflineCache()  # Local disk
        self.s3_cache = S3Cache()  # S3 (source of truth)
    
    def get_farmer_data(self, farmer_id):
        """Retrieve data with cache hierarchy"""
        
        # Level 1: Memory cache (instant)
        if farmer_id in self.memory_cache:
            if not self._is_expired(self.memory_cache[farmer_id]):
                return self.memory_cache[farmer_id]['data']
        
        # Level 2: Local disk cache (fast)
        cached_data = self.local_cache.get_cached_data(farmer_id)
        if cached_data:
            self.memory_cache[farmer_id] = cached_data
            return cached_data
        
        # Level 3: Fetch from S3 (slower)
        fresh_data = self.s3_cache.fetch_from_s3(farmer_id)
        
        # Update all cache levels
        self.memory_cache[farmer_id] = fresh_data
        self.local_cache.cache_farmer_data(farmer_id, fresh_data)
        
        return fresh_data
```

### 8.3 Lambda Optimization

```python
# Lambda optimization techniques

# 1. Connection pooling (outside handler)
s3_client = boto3.client('s3')
data_cache = {}

def lambda_handler(event, context):
    """Optimized Lambda handler"""
    
    # 2. Early validation
    farmer_id = extract_parameter(event, 'farmer_id')
    if not farmer_id:
        return error_response('Missing farmer_id')
    
    # 3. Use cache
    if farmer_id in data_cache:
        cache_entry = data_cache[farmer_id]
        if time.time() - cache_entry['timestamp'] < 300:  # 5 min TTL
            return success_response(cache_entry['data'])
    
    # 4. Parallel operations
    with ThreadPoolExecutor(max_workers=3) as executor:
        soil_future = executor.submit(fetch_soil_data, farmer_id)
        weather_future = executor.submit(fetch_weather_data, farmer_id)
        market_future = executor.submit(fetch_market_data, farmer_id)
        
        soil_data = soil_future.result()
        weather_data = weather_future.result()
        market_data = market_future.result()
    
    # 5. Update cache
    result = combine_data(soil_data, weather_data, market_data)
    data_cache[farmer_id] = {
        'data': result,
        'timestamp': time.time()
    }
    
    return success_response(result)
```

## 9. Security & Compliance

### 9.1 Data Protection

```
Encryption:
├─ At Rest:
│   ├─ S3: AES-256 (SSE-S3)
│   ├─ DynamoDB: AWS managed keys
│   └─ OpenSearch: Encryption enabled
│
└─ In Transit:
    ├─ TLS 1.3 for all API calls
    ├─ HTTPS for Streamlit UI
    └─ VPC endpoints for AWS services

Access Control:
├─ IAM Policies: Least privilege principle
├─ S3 Bucket Policies: Deny public access
├─ Lambda: VPC isolation
└─ Bedrock: Resource-based policies

Data Privacy:
├─ No PII in CloudWatch logs
├─ Farmer ID anonymization in analytics
├─ Data retention: 3 years (configurable)
└─ GDPR-style data deletion on request
```

### 9.2 Authentication & Authorization

```python
# Farmer authentication (simulated AgriStack)
class FarmerAuth:
    def authenticate(self, farmer_id, phone_number):
        """Verify farmer identity"""
        # In production: Call AgriStack API
        # For demo: Validate against local database
        
        farmer = self.get_farmer_by_id(farmer_id)
        if not farmer:
            return {'authenticated': False, 'error': 'Farmer not found'}
        
        # Verify phone number (last 4 digits)
        if farmer['phone'][-4:] != phone_number[-4:]:
            return {'authenticated': False, 'error': 'Invalid credentials'}
        
        # Generate session token
        session_token = self.generate_token(farmer_id)
        
        return {
            'authenticated': True,
            'session_token': session_token,
            'farmer_name': farmer['name'],
            'location': farmer['location']
        }
    
    def authorize_data_access(self, farmer_id, requested_data):
        """Ensure farmer can only access their own data"""
        if requested_data['farmer_id'] != farmer_id:
            raise PermissionError('Unauthorized data access')
        
        return True
```

## 10. Monitoring & Observability

### 10.1 CloudWatch Metrics

```python
# Custom metrics for monitoring
import boto3

cloudwatch = boto3.client('cloudwatch')

def publish_metrics(metric_name, value, unit='Count'):
    """Publish custom metrics to CloudWatch"""
    cloudwatch.put_metric_data(
        Namespace='Piritiya',
        MetricData=[
            {
                'MetricName': metric_name,
                'Value': value,
                'Unit': unit,
                'Timestamp': datetime.now()
            }
        ]
    )

# Key metrics to track:
# - ResponseLatency (Milliseconds)
# - BedrockInvocations (Count)
# - LambdaErrors (Count)
# - CacheHitRate (Percent)
# - ActiveFarmers (Count)
# - CriticalGroundwaterAlerts (Count)
```

### 10.2 Logging Strategy

```python
import logging
import json

# Structured logging
logger = logging.getLogger('piritiya')
logger.setLevel(logging.INFO)

def log_query(farmer_id, query, response, latency):
    """Log user interactions for analysis"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'farmer_id': farmer_id,  # Anonymized in production
        'query_type': classify_query(query),
        'response_length': len(response),
        'latency_ms': latency,
        'data_sources': extract_sources(response),
        'groundwater_status': get_groundwater_status(farmer_id)
    }
    
    logger.info(json.dumps(log_entry))

# Log levels:
# INFO: Normal operations, user queries
# WARNING: High latency, cache misses
# ERROR: Lambda failures, Bedrock errors
# CRITICAL: System unavailability
```

## 11. Testing Strategy

### 11.1 Unit Tests

```python
# tests/test_lambda_functions.py
import pytest
from lambda_functions import get_soil_moisture

def test_get_soil_moisture_success():
    """Test successful soil moisture retrieval"""
    event = {
        'requestBody': {
            'content': {
                'application/json': {
                    'properties': [{'value': 'UP-LUCKNOW-MALIHABAD-00001'}]
                }
            }
        }
    }
    
    response = get_soil_moisture.lambda_handler(event, None)
    
    assert response['statusCode'] == 200
    body = json.loads(response['body'])
    assert 'moisture_index' in body
    assert body['groundwater_status'] in ['Critical', 'Low', 'Moderate', 'Good']

def test_get_soil_moisture_invalid_farmer():
    """Test error handling for invalid farmer ID"""
    event = {
        'requestBody': {
            'content': {
                'application/json': {
                    'properties': [{'value': 'INVALID-ID'}]
                }
            }
        }
    }
    
    response = get_soil_moisture.lambda_handler(event, None)
    assert response['statusCode'] == 404
```

### 11.2 Integration Tests

```python
# tests/test_bedrock_integration.py
def test_end_to_end_query():
    """Test complete flow from query to response"""
    
    # Setup
    bedrock_client = BedrockAgentClient()
    farmer_id = 'UP-LUCKNOW-MALIHABAD-00001'
    query = 'Kya main garmi mein dhan laga sakta hoon?'
    
    # Execute
    start_time = time.time()
    response = bedrock_client.invoke_agent(query, farmer_id, 'test-session')
    latency = time.time() - start_time
    
    # Assert
    assert 'response_text' in response
    assert latency < 5.0  # Must respond within 5 seconds
    assert 'धान' in response['response_text']  # Should mention rice in Hindi
    assert len(response['citations']) > 0  # Must include sources
```

## 12. Future Enhancements

### Phase 2 Features:
- Real NISAR satellite data integration via NASA API
- Actual AgriStack API integration for farmer verification
- Weather forecast integration (IMD API)
- Pest and disease detection using computer vision
- Multi-crop planning across seasons
- Community features (farmer forums, success stories)

### Phase 3 Features:
- Mobile app (React Native)
- SMS-based interface for feature phones
- Integration with mandi platforms for direct selling
- Soil testing lab integration
- Drone imagery analysis for precision agriculture
- Blockchain for transparent subsidy distribution

---

## Document Version
Version: 1.0  
Last Updated: February 15, 2026  
Author: Piritiya Development Team  
Status: Ready for Implementation
