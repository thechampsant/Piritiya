# Requirements Document: Piritiya Backend API and Infrastructure

## Introduction

This is a RETROACTIVE requirements document that captures the existing implementation of the Piritiya Backend API and Infrastructure. The system is an agricultural advisory platform for Uttar Pradesh farmers that integrates NISAR satellite soil moisture data, groundwater status information, crop recommendations, and market prices. The backend is built with FastAPI and uses AWS services (Lambda, DynamoDB, Bedrock Agent) to provide REST API endpoints and a conversational chatbot interface.

## Glossary

- **FastAPI_Backend**: The main REST API server built with Python FastAPI framework
- **Lambda_Function**: AWS Lambda serverless function that executes business logic
- **DynamoDB_Table**: AWS NoSQL database table for storing structured data
- **NISAR_Data**: Soil moisture measurements from NASA-ISRO SAR satellite at 100m resolution
- **Bedrock_Agent**: AWS conversational AI agent for chatbot functionality
- **Farmer_Profile**: User account containing farmer identity, location, and land details
- **Crop_Recommendation**: Suggested crops based on soil moisture and groundwater status
- **Market_Price**: Current commodity prices from Agmarknet-style data source
- **Groundwater_Status**: Classification of groundwater availability (Critical, Low, Moderate, Good)
- **Moisture_Index**: Percentage value (0-100) representing soil moisture level
- **Sustainability_Score**: Rating (0-100) indicating water efficiency of a crop
- **Mock_Data**: Sample data for development and testing purposes
- **Deployment_Script**: Automated script for deploying infrastructure to AWS

---

## Requirements

### Requirement 1: FastAPI REST API Server

**User Story:** As a frontend developer, I want a REST API server with documented endpoints, so that I can integrate the agricultural advisory features into the web application.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose a root endpoint (/) that returns API metadata and available endpoints
2. THE FastAPI_Backend SHALL expose a health check endpoint (/health) that returns service status
3. THE FastAPI_Backend SHALL include CORS middleware that allows cross-origin requests from any origin
4. THE FastAPI_Backend SHALL run on port 8000 with host 0.0.0.0
5. THE FastAPI_Backend SHALL include API title "Piritiya API" and version "1.0.0"

### Requirement 2: Farmer Profile Management

**User Story:** As a system administrator, I want to store and retrieve farmer profiles, so that I can manage user accounts and their agricultural data.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose GET /farmers endpoint that returns a list of all farmer profiles
2. THE FastAPI_Backend SHALL expose GET /farmers/{farmer_id} endpoint that returns a specific farmer's profile
3. WHEN a farmer_id does not exist, THE FastAPI_Backend SHALL return HTTP 404 status code
4. THE FastAPI_Backend SHALL retrieve farmer data from the Farmers DynamoDB_Table
5. WHEN DynamoDB access fails, THE FastAPI_Backend SHALL return HTTP 500 status code with error details

### Requirement 3: Soil Moisture Data Retrieval

**User Story:** As a farmer, I want to view current soil moisture levels for my land, so that I can make informed irrigation decisions.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose GET /soil-moisture/{farmer_id} endpoint that invokes the get-soil-moisture Lambda_Function
2. THE Lambda_Function SHALL retrieve NISAR_Data from the NISARData DynamoDB_Table based on farmer location
3. THE Lambda_Function SHALL return moisture_index, moisture_category, trend, groundwater_status, and measurement_date
4. THE Lambda_Function SHALL query for the most recent measurement by sorting measurement_date in descending order
5. WHEN no NISAR_Data exists for a location, THE Lambda_Function SHALL return HTTP 404 status code
6. THE Lambda_Function SHALL include s3_raw_data_path reference to raw satellite data files

### Requirement 4: Crop Recommendation Engine

**User Story:** As a farmer, I want crop recommendations based on soil moisture and groundwater status, so that I can choose sustainable crops that conserve water.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose POST /crop-advice endpoint that accepts farmer_id and optional soil_moisture parameters
2. THE Lambda_Function SHALL retrieve crop recommendations from the CropRecommendations DynamoDB_Table
3. THE Lambda_Function SHALL generate Hindi language reasoning text explaining the recommendations
4. WHEN groundwater_status is "Critical" and moisture_index is below 40, THE Lambda_Function SHALL include a sustainability alert warning
5. THE Lambda_Function SHALL return recommended_crops list with crop names, water requirements, duration, yield, and sustainability scores
6. THE Lambda_Function SHALL return crops_to_avoid list with reasons for avoidance
7. THE Lambda_Function SHALL support season parameter (Zaid, Rabi, Kharif) for seasonal recommendations

### Requirement 5: Market Price Information

**User Story:** As a farmer, I want current market prices for crops, so that I can make profitable planting decisions.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose GET /market-prices endpoint that accepts optional crop and district parameters
2. THE Lambda_Function SHALL return mock market prices simulating Agmarknet API data
3. THE Lambda_Function SHALL support price queries for at least 10 crops (Moong, Urad, Arhar, Summer Rice, Wheat, Mustard, Bajra, Sugarcane, Potato, Tomato)
4. THE Lambda_Function SHALL include price_per_quintal, trend (Rising/Falling/Stable), and change_percent for each crop
5. THE Lambda_Function SHALL include Hindi crop names (crop_hindi field) for localization
6. THE Lambda_Function SHALL return prices in INR currency with "per quintal (100 kg)" unit

### Requirement 6: Complete Agricultural Advice Aggregation

**User Story:** As a farmer, I want comprehensive advice combining soil moisture, crop recommendations, and market prices, so that I can make holistic farming decisions.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose GET /advice/{farmer_id} endpoint that aggregates data from three Lambda_Functions
2. THE FastAPI_Backend SHALL invoke get-soil-moisture Lambda_Function to retrieve moisture data
3. THE FastAPI_Backend SHALL invoke get-crop-advice Lambda_Function with soil_moisture parameter from previous call
4. THE FastAPI_Backend SHALL invoke get-market-prices Lambda_Function to retrieve current prices
5. THE FastAPI_Backend SHALL return a combined response containing soil_moisture, crop_advice, and market_prices sections
6. WHEN any Lambda_Function invocation fails, THE FastAPI_Backend SHALL return HTTP 500 status code

### Requirement 7: Conversational Chatbot Interface

**User Story:** As a farmer, I want to ask questions in natural language, so that I can get agricultural advice through a conversational interface.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL expose POST /chat endpoint that accepts message and optional session_id parameters
2. THE FastAPI_Backend SHALL invoke Bedrock_Agent using agentId and aliasId from environment variables
3. WHEN session_id is not provided, THE FastAPI_Backend SHALL generate a unique session identifier using timestamp
4. THE FastAPI_Backend SHALL process streaming response from Bedrock_Agent and return complete text
5. WHEN BEDROCK_AGENT_ID or BEDROCK_AGENT_ALIAS_ID environment variables are not set, THE FastAPI_Backend SHALL return HTTP 500 status code with configuration error message
6. THE FastAPI_Backend SHALL return response text, session_id, and original message in the response

### Requirement 8: DynamoDB Table Schema - Farmers

**User Story:** As a backend developer, I want a Farmers table schema, so that I can store farmer profile information.

#### Acceptance Criteria

1. THE DynamoDB_Table named "Farmers" SHALL use farmer_id as the partition key (String type)
2. THE DynamoDB_Table SHALL store farmer_name, location (state, district, block, village, coordinates), land_details (total_area_hectares, soil_type, irrigation_source), phone_number, preferred_language, and registration_date
3. THE DynamoDB_Table SHALL use PAY_PER_REQUEST billing mode
4. THE DynamoDB_Table SHALL include Project tag "Piritiya" and Environment tag "Development"

### Requirement 9: DynamoDB Table Schema - NISARData

**User Story:** As a backend developer, I want a NISARData table schema, so that I can store soil moisture measurements from NISAR satellite.

#### Acceptance Criteria

1. THE DynamoDB_Table named "NISARData" SHALL use location_block as partition key and measurement_date as sort key (both String type)
2. THE DynamoDB_Table SHALL include a Global Secondary Index named "FarmerIdIndex" with farmer_id as partition key
3. THE DynamoDB_Table SHALL store moisture_index, moisture_category, trend, groundwater_status (status, depth_meters, depletion_rate_cm_per_year), s3_raw_data_path, and ttl fields
4. THE DynamoDB_Table SHALL use PAY_PER_REQUEST billing mode
5. THE DynamoDB_Table SHALL support TTL (time-to-live) for automatic data expiration after 30 days

### Requirement 10: DynamoDB Table Schema - CropRecommendations

**User Story:** As a backend developer, I want a CropRecommendations table schema, so that I can cache crop recommendations by farmer and season.

#### Acceptance Criteria

1. THE DynamoDB_Table named "CropRecommendations" SHALL use farmer_id as partition key and season as sort key (both String type)
2. THE DynamoDB_Table SHALL store recommended_crops array (crop_name, crop_name_hindi, water_requirement_mm, duration_days, expected_yield_quintal_per_hectare, market_price_per_quintal, sustainability_score, reason)
3. THE DynamoDB_Table SHALL store crops_to_avoid array (crop_name, crop_name_hindi, water_requirement_mm, reason, estimated_groundwater_depletion_meters)
4. THE DynamoDB_Table SHALL store last_updated timestamp
5. THE DynamoDB_Table SHALL use PAY_PER_REQUEST billing mode

### Requirement 11: DynamoDB Table Schema - Consultations

**User Story:** As a backend developer, I want a Consultations table schema, so that I can store chatbot conversation history and consultation records.

#### Acceptance Criteria

1. THE DynamoDB_Table named "Consultations" SHALL use farmer_id as partition key and timestamp as sort key (both String type)
2. THE DynamoDB_Table SHALL include a Global Secondary Index named "ConsultationIdIndex" with consultation_id as partition key
3. THE DynamoDB_Table SHALL store consultation_id, query_text, response_text, data_sources_used array, recommendation_type, session_id, and response_time_ms
4. THE DynamoDB_Table SHALL use PAY_PER_REQUEST billing mode

### Requirement 12: Lambda Function - get-soil-moisture

**User Story:** As a backend developer, I want a Lambda function that fetches soil moisture data, so that I can provide NISAR satellite measurements to farmers.

#### Acceptance Criteria

1. THE Lambda_Function named "get-soil-moisture" SHALL accept farmer_id parameter in both Bedrock Agent format and direct invocation format
2. THE Lambda_Function SHALL query Farmers DynamoDB_Table to retrieve farmer location
3. THE Lambda_Function SHALL construct location_block key as "{district}-{block}" format
4. THE Lambda_Function SHALL query NISARData DynamoDB_Table with location_block and retrieve the most recent measurement
5. THE Lambda_Function SHALL convert Decimal types to float for JSON serialization
6. THE Lambda_Function SHALL return moisture_index, moisture_category, trend, groundwater_status, groundwater_depth_meters, depletion_rate_cm_per_year, measurement_date, location, village, data_source, and s3_raw_data_path
7. THE Lambda_Function SHALL use Python 3.11 runtime with 512MB memory and 10 second timeout

### Requirement 13: Lambda Function - get-crop-advice

**User Story:** As a backend developer, I want a Lambda function that generates crop recommendations, so that I can provide water-efficient crop suggestions based on soil and groundwater conditions.

#### Acceptance Criteria

1. THE Lambda_Function named "get-crop-advice" SHALL accept farmer_id and optional season parameters
2. THE Lambda_Function SHALL retrieve NISAR_Data to determine moisture_index and groundwater_status
3. THE Lambda_Function SHALL query CropRecommendations DynamoDB_Table using farmer_id and season as composite key
4. THE Lambda_Function SHALL generate Hindi language reasoning text using the generate_reasoning function
5. WHEN groundwater_status is "Critical" or "Low", THE Lambda_Function SHALL include a sustainability alert in Hindi
6. THE Lambda_Function SHALL return farmer_id, season, location, moisture_index, groundwater_status, recommended_crops, crops_to_avoid, reasoning, sustainability_alert, and last_updated
7. THE Lambda_Function SHALL use ensure_ascii=False for JSON serialization to preserve Hindi characters
8. THE Lambda_Function SHALL use Python 3.11 runtime with 512MB memory and 10 second timeout

### Requirement 14: Lambda Function - get-market-prices

**User Story:** As a backend developer, I want a Lambda function that returns market prices, so that I can provide farmers with current commodity pricing information.

#### Acceptance Criteria

1. THE Lambda_Function named "get-market-prices" SHALL accept crop_names array and optional district parameters
2. THE Lambda_Function SHALL maintain a mock price database with at least 10 crops
3. THE Lambda_Function SHALL support case-insensitive crop name matching
4. THE Lambda_Function SHALL map district names to mandi (market) names
5. THE Lambda_Function SHALL return prices array with crop, crop_hindi, price_per_quintal, mandi, trend, change_percent, and unit fields
6. WHEN a crop is not found in the database, THE Lambda_Function SHALL return price 0 with note "Price data not available"
7. THE Lambda_Function SHALL include source "Agmarknet (Simulated)", last_updated timestamp, currency "INR", and disclaimer note
8. THE Lambda_Function SHALL use Python 3.11 runtime with 512MB memory and 10 second timeout

### Requirement 15: Mock Data for Development

**User Story:** As a developer, I want realistic mock data, so that I can test the system without requiring actual NISAR satellite data or live Agmarknet feeds.

#### Acceptance Criteria

1. THE Mock_Data SHALL include 3 farmer profiles from different districts (Lucknow, Kanpur, Varanasi)
2. THE Mock_Data SHALL include farmer names in Hindi (Devanagari script)
3. THE Mock_Data SHALL include NISAR_Data with moisture_index values representing Low, Moderate, and Critical groundwater conditions
4. THE Mock_Data SHALL include groundwater_status with depth_meters and depletion_rate_cm_per_year fields
5. THE Mock_Data SHALL include recommended_crops with water_requirement_mm, sustainability_score, and Hindi names
6. THE Mock_Data SHALL include crops_to_avoid for farmers in Critical groundwater areas
7. THE Mock_Data SHALL include at least one sample consultation record in the Consultations table
8. THE Mock_Data SHALL be loadable via the load_mock_data.py script

### Requirement 16: Infrastructure Deployment Scripts

**User Story:** As a DevOps engineer, I want automated deployment scripts, so that I can create DynamoDB tables and deploy Lambda functions to AWS.

#### Acceptance Criteria

1. THE Deployment_Script named "create_dynamodb_tables.py" SHALL create all 4 DynamoDB tables (Farmers, NISARData, CropRecommendations, Consultations)
2. THE Deployment_Script SHALL handle ResourceInUseException gracefully when tables already exist
3. THE Deployment_Script named "load_mock_data.py" SHALL load farmer profiles, NISAR data, crop recommendations, and sample consultations
4. THE Deployment_Script named "deploy.sh" SHALL create IAM role "PiritiyaLambdaExecutionRole" with necessary policies
5. THE Deployment_Script SHALL attach AWSLambdaBasicExecutionRole, AmazonDynamoDBFullAccess, and AmazonS3ReadOnlyAccess policies to the Lambda execution role
6. THE Deployment_Script SHALL package Lambda functions with dependencies from requirements.txt
7. THE Deployment_Script SHALL create or update Lambda functions using AWS CLI
8. THE Deployment_Script SHALL support AWS_REGION environment variable with default "us-east-1"

### Requirement 17: AWS Region Configuration

**User Story:** As a system administrator, I want configurable AWS region support, so that I can deploy the system in regions where Bedrock services are available.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL read AWS_REGION from environment variable with default "us-east-1"
2. THE Lambda_Functions SHALL read AWS_REGION from environment variable with default "us-east-1"
3. THE Deployment_Scripts SHALL support AWS_REGION environment variable
4. THE FastAPI_Backend SHALL initialize boto3 clients (lambda_client, dynamodb, bedrock_agent) with the configured region

### Requirement 18: Error Handling and Validation

**User Story:** As a backend developer, I want consistent error handling, so that API consumers receive meaningful error messages.

#### Acceptance Criteria

1. WHEN a required parameter is missing, THE FastAPI_Backend SHALL return HTTP 400 status code with error message
2. WHEN a resource is not found, THE FastAPI_Backend SHALL return HTTP 404 status code with error message
3. WHEN an AWS service call fails, THE FastAPI_Backend SHALL return HTTP 500 status code with error details
4. THE Lambda_Functions SHALL catch KeyError exceptions and return HTTP 400 status code with "Missing required field" message
5. THE Lambda_Functions SHALL catch generic exceptions and return HTTP 500 status code with "Internal server error" message
6. THE Lambda_Functions SHALL log errors to CloudWatch using print statements

### Requirement 19: Hindi Language Support

**User Story:** As a farmer in Uttar Pradesh, I want responses in Hindi, so that I can understand agricultural advice in my preferred language.

#### Acceptance Criteria

1. THE Lambda_Function get-crop-advice SHALL generate reasoning text in Hindi (Devanagari script)
2. THE Lambda_Function get-crop-advice SHALL generate sustainability alerts in Hindi
3. THE Lambda_Function get-market-prices SHALL include crop_hindi field with Hindi crop names
4. THE Mock_Data SHALL include farmer names in Hindi
5. THE Mock_Data SHALL include crop names in Hindi (crop_name_hindi field)
6. THE Lambda_Functions SHALL use ensure_ascii=False in json.dumps to preserve Unicode characters

### Requirement 20: Sustainability and Water Conservation Focus

**User Story:** As an agricultural advisor, I want the system to prioritize water-efficient crops, so that farmers in water-stressed areas can practice sustainable agriculture.

#### Acceptance Criteria

1. THE Crop_Recommendation SHALL include sustainability_score (0-100) based on water efficiency
2. WHEN groundwater_status is "Critical", THE Crop_Recommendation SHALL recommend crops with water_requirement_mm below 500mm
3. WHEN groundwater_status is "Critical", THE Crop_Recommendation SHALL include crops_to_avoid list with high water requirement crops (>1000mm)
4. THE Crop_Recommendation SHALL include estimated_groundwater_depletion_meters for crops to avoid
5. THE Lambda_Function get-crop-advice SHALL generate reasoning that explains water conservation benefits
6. THE Crop_Recommendation SHALL prioritize nitrogen-fixing crops (Moong, Urad, Arhar) for soil health

---

## Future Requirements (Not Yet Implemented)

### Requirement 21: Bedrock Agent Configuration (MANUAL SETUP REQUIRED)

**User Story:** As a system administrator, I want automated Bedrock Agent setup, so that the chatbot functionality works without manual AWS Console configuration.

#### Acceptance Criteria

1. THE Deployment_Script SHALL create Bedrock Agent with action groups for soil moisture, crop advice, and market prices
2. THE Deployment_Script SHALL configure Lambda function associations for each action group
3. THE Deployment_Script SHALL create agent alias and publish agent version
4. THE Deployment_Script SHALL configure IAM permissions for Bedrock Agent to invoke Lambda functions
5. THE Deployment_Script SHALL output BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID for .env configuration

**Current Status:** Bedrock Agent must be created manually in AWS Console. Scripts exist but require manual intervention.

### Requirement 22: Automated Testing

**User Story:** As a developer, I want automated tests for Lambda functions, so that I can verify business logic correctness.

#### Acceptance Criteria

1. THE Test_Suite SHALL include unit tests for each Lambda function
2. THE Test_Suite SHALL mock DynamoDB responses for isolated testing
3. THE Test_Suite SHALL test error handling paths (missing parameters, not found resources)
4. THE Test_Suite SHALL test Bedrock Agent event format parsing
5. THE Test_Suite SHALL test Hindi text generation and Unicode handling

**Current Status:** Manual testing scripts exist (test_api.py, test_chatbot.py) but no automated test suite.

### Requirement 23: CI/CD Pipeline

**User Story:** As a DevOps engineer, I want a CI/CD pipeline, so that code changes are automatically tested and deployed.

#### Acceptance Criteria

1. THE CI_Pipeline SHALL run automated tests on every pull request
2. THE CI_Pipeline SHALL deploy to staging environment on merge to main branch
3. THE CI_Pipeline SHALL require manual approval for production deployment
4. THE CI_Pipeline SHALL run security scanning on dependencies
5. THE CI_Pipeline SHALL validate CloudFormation/Terraform templates

**Current Status:** No CI/CD pipeline exists. Deployment is manual via shell scripts.

### Requirement 24: Monitoring and Logging

**User Story:** As a system administrator, I want centralized monitoring and logging, so that I can troubleshoot issues and track system health.

#### Acceptance Criteria

1. THE Monitoring_System SHALL collect Lambda function metrics (invocation count, duration, errors)
2. THE Monitoring_System SHALL create CloudWatch alarms for error rate thresholds
3. THE Monitoring_System SHALL aggregate logs from all Lambda functions
4. THE Monitoring_System SHALL track API endpoint response times
5. THE Monitoring_System SHALL send alerts to SNS topic when errors occur

**Current Status:** Only basic CloudWatch Logs are available. No custom metrics or alarms configured.

### Requirement 25: Authentication and Authorization

**User Story:** As a security engineer, I want API authentication, so that only authorized users can access farmer data.

#### Acceptance Criteria

1. THE FastAPI_Backend SHALL require JWT tokens for all endpoints except /health
2. THE FastAPI_Backend SHALL validate farmer_id in JWT matches farmer_id in request path
3. THE FastAPI_Backend SHALL implement role-based access control (farmer, advisor, admin roles)
4. THE FastAPI_Backend SHALL rate limit requests per user to prevent abuse
5. THE FastAPI_Backend SHALL log authentication failures for security monitoring

**Current Status:** No authentication or authorization implemented. API is open to all requests.

### Requirement 26: Production Deployment Configuration

**User Story:** As a DevOps engineer, I want production-ready deployment configuration, so that the system can handle real-world traffic and data volumes.

#### Acceptance Criteria

1. THE Deployment_Configuration SHALL use Infrastructure as Code (CloudFormation or Terraform)
2. THE Deployment_Configuration SHALL configure VPC, subnets, and security groups
3. THE Deployment_Configuration SHALL use DynamoDB provisioned capacity with auto-scaling
4. THE Deployment_Configuration SHALL configure Lambda reserved concurrency limits
5. THE Deployment_Configuration SHALL use API Gateway with custom domain and SSL certificate
6. THE Deployment_Configuration SHALL configure S3 bucket for NISAR raw data storage
7. THE Deployment_Configuration SHALL implement backup and disaster recovery procedures

**Current Status:** Only development deployment scripts exist. No production infrastructure configuration.

### Requirement 27: Real NISAR Data Integration

**User Story:** As a data engineer, I want integration with real NISAR satellite data, so that farmers receive actual soil moisture measurements instead of mock data.

#### Acceptance Criteria

1. THE Data_Pipeline SHALL download NISAR L2 soil moisture products from NASA Earthdata
2. THE Data_Pipeline SHALL process GeoTIFF files and extract moisture values for Uttar Pradesh
3. THE Data_Pipeline SHALL map 100m resolution pixels to farmer locations using coordinates
4. THE Data_Pipeline SHALL store raw GeoTIFF files in S3 with references in DynamoDB
5. THE Data_Pipeline SHALL run daily to update NISARData table with latest measurements
6. THE Data_Pipeline SHALL handle missing data and cloud cover gaps

**Current Status:** Only mock NISAR data exists. No integration with actual satellite data feeds.

### Requirement 28: Real Agmarknet API Integration

**User Story:** As a data engineer, I want integration with real Agmarknet API, so that farmers receive actual market prices instead of mock data.

#### Acceptance Criteria

1. THE Data_Pipeline SHALL fetch daily market prices from Agmarknet API
2. THE Data_Pipeline SHALL parse commodity prices for Uttar Pradesh mandis
3. THE Data_Pipeline SHALL calculate price trends (7-day moving average)
4. THE Data_Pipeline SHALL store historical prices for trend analysis
5. THE Data_Pipeline SHALL handle API rate limits and failures gracefully

**Current Status:** Only mock market prices exist. No integration with actual Agmarknet API.

---

## Technical Stack Summary

- **Backend Framework:** Python 3.11, FastAPI 0.109.0, Uvicorn 0.27.0
- **AWS Services:** Lambda, DynamoDB, Bedrock Agent Runtime, S3 (referenced)
- **AWS SDK:** boto3 1.34.0
- **Data Validation:** Pydantic 2.5.0
- **Configuration:** python-dotenv 1.0.0
- **Deployment:** Bash scripts, AWS CLI
- **Region:** us-east-1 (US East N. Virginia) - configurable via environment variable
- **Data Sources:** NISAR Satellite (mock), Agmarknet (mock)
- **Languages:** English (API), Hindi (user-facing content)

---

## Data Model Summary

**Farmers Table:**
- Primary Key: farmer_id (String)
- Attributes: farmer_name, location (nested), land_details (nested), phone_number, preferred_language, registration_date

**NISARData Table:**
- Primary Key: location_block (String), measurement_date (String)
- GSI: FarmerIdIndex on farmer_id
- Attributes: moisture_index, moisture_category, trend, groundwater_status (nested), s3_raw_data_path, ttl

**CropRecommendations Table:**
- Primary Key: farmer_id (String), season (String)
- Attributes: recommended_crops (array), crops_to_avoid (array), last_updated

**Consultations Table:**
- Primary Key: farmer_id (String), timestamp (String)
- GSI: ConsultationIdIndex on consultation_id
- Attributes: consultation_id, query_text, response_text, data_sources_used, recommendation_type, session_id, response_time_ms

---

## API Endpoints Summary

1. `GET /` - API metadata and endpoint list
2. `GET /health` - Health check
3. `GET /farmers` - List all farmers
4. `GET /farmers/{farmer_id}` - Get farmer profile
5. `GET /soil-moisture/{farmer_id}` - Get soil moisture data
6. `POST /crop-advice` - Get crop recommendations
7. `GET /market-prices` - Get market prices
8. `GET /advice/{farmer_id}` - Get complete advice (aggregated)
9. `POST /chat` - Chatbot interface (requires Bedrock Agent setup)

---

## Deployment Instructions

1. Create DynamoDB tables: `python scripts/create_dynamodb_tables.py`
2. Load mock data: `python scripts/load_mock_data.py`
3. Deploy Lambda functions: `./lambda_functions/deploy.sh`
4. Configure environment variables in `.env`:
   - `AWS_REGION=us-east-1`
   - `BEDROCK_AGENT_ID=<agent_id>` (manual setup required)
   - `BEDROCK_AGENT_ALIAS_ID=<alias_id>` (manual setup required)
5. Start FastAPI server: `cd backend && uvicorn main:app --reload`
6. Test API: `curl http://localhost:8000/health`

---

## Known Limitations

1. Bedrock Agent requires manual setup in AWS Console
2. No authentication or authorization implemented
3. No automated tests or CI/CD pipeline
4. Mock data only - no real NISAR or Agmarknet integration
5. No monitoring or alerting configured
6. No production deployment configuration
7. CORS allows all origins (security risk for production)
8. No rate limiting or request throttling
9. No data validation on DynamoDB writes
10. No backup or disaster recovery procedures
