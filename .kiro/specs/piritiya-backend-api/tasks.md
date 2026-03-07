# Implementation Plan: Piritiya Backend API and Infrastructure (RETROACTIVE)

## Overview

This is a RETROACTIVE tasks document that captures the implementation steps that were already completed for the Piritiya Backend API and Infrastructure. All tasks are marked as completed [x] since the system is fully implemented.

The implementation follows a serverless microservices architecture using:
- FastAPI REST API server
- AWS Lambda functions for business logic
- Amazon DynamoDB for data persistence
- AWS Bedrock Agent for conversational AI (optional)

## Tasks

- [x] 1. Project setup and dependencies
  - Created project directory structure (backend/, lambda_functions/, scripts/, data/)
  - Created requirements.txt for FastAPI backend (FastAPI 0.109.0, boto3 1.34.0, uvicorn 0.27.0)
  - Created .env.example for environment configuration
  - Set up Python 3.11 virtual environment
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 17.1, 17.2, 17.3, 17.4_

- [x] 2. DynamoDB table creation
  - [x] 2.1 Create DynamoDB table creation script
    - Implemented scripts/create_dynamodb_tables.py
    - Added error handling for ResourceInUseException
    - Added table tagging (Project=Piritiya, Environment=Development)
    - _Requirements: 8.3, 9.4, 10.5, 11.4, 16.1, 16.2_
  
  - [x] 2.2 Implement Farmers table schema
    - Partition key: farmer_id (String)
    - Attributes: farmer_name, location (nested), land_details (nested), phone_number, preferred_language, registration_date
    - Billing mode: PAY_PER_REQUEST
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 2.3 Implement NISARData table schema
    - Composite key: location_block (partition), measurement_date (sort)
    - Global Secondary Index: FarmerIdIndex on farmer_id
    - Attributes: moisture_index, moisture_category, trend, groundwater_status (nested), s3_raw_data_path, ttl
    - TTL enabled for automatic data expiration
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 2.4 Implement CropRecommendations table schema
    - Composite key: farmer_id (partition), season (sort)
    - Attributes: recommended_crops (array), crops_to_avoid (array), last_updated
    - Support for seasonal recommendations (Zaid, Rabi, Kharif)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 2.5 Implement Consultations table schema
    - Composite key: farmer_id (partition), timestamp (sort)
    - Global Secondary Index: ConsultationIdIndex on consultation_id
    - Attributes: consultation_id, query_text, response_text, data_sources_used, recommendation_type, session_id, response_time_ms
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 3. Mock data creation
  - [x] 3.1 Create farm data JSON file
    - Created data/farm_data.json with 3 farmer profiles
    - Included Hindi names in Devanagari script
    - Added location data for Lucknow, Kanpur, Varanasi districts
    - Included NISAR data with varying moisture levels and groundwater conditions
    - Added crop recommendations for Zaid season
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_
  
  - [x] 3.2 Create mock data loading script
    - Implemented scripts/load_mock_data.py
    - Added Decimal conversion for DynamoDB numeric types
    - Loaded farmer profiles, NISAR data, crop recommendations, and sample consultations
    - Added UTF-8 encoding support for Hindi text
    - _Requirements: 15.8, 16.3_

- [x] 4. Lambda function: get-soil-moisture
  - [x] 4.1 Implement Lambda handler and event parsing
    - Created lambda_functions/get_soil_moisture/lambda_function.py
    - Implemented dual event format handling (Bedrock Agent and direct invocation)
    - Added farmer_id parameter extraction
    - _Requirements: 12.1_
  
  - [x] 4.2 Implement farmer location lookup
    - Query Farmers table by farmer_id
    - Extract location data (district, block, village)
    - Construct location_block key as "{district}-{block}"
    - Handle 404 error when farmer not found
    - _Requirements: 12.2, 12.3_
  
  - [x] 4.3 Implement NISAR data retrieval
    - Query NISARData table with location_block
    - Sort by measurement_date descending, limit 1 (most recent)
    - Handle 404 error when no NISAR data exists
    - _Requirements: 12.4, 3.4, 3.5_
  
  - [x] 4.4 Implement Decimal to float conversion
    - Created decimal_to_float helper function
    - Convert all Decimal types for JSON serialization
    - _Requirements: 12.5_
  
  - [x] 4.5 Implement response formatting
    - Return moisture_index, moisture_category, trend, groundwater_status, groundwater_depth_meters, depletion_rate_cm_per_year, measurement_date, location, village, data_source, s3_raw_data_path
    - _Requirements: 12.6, 3.3, 3.6_
  
  - [x] 4.6 Configure Lambda function settings
    - Runtime: Python 3.11
    - Memory: 512MB
    - Timeout: 10 seconds
    - _Requirements: 12.7_

- [x] 5. Lambda function: get-crop-advice
  - [x] 5.1 Implement Lambda handler and parameter extraction
    - Created lambda_functions/get_crop_advice/lambda_function.py
    - Handle farmer_id and optional season parameters
    - Support both Bedrock Agent and direct invocation formats
    - _Requirements: 13.1_
  
  - [x] 5.2 Implement NISAR data retrieval for moisture and groundwater
    - Query Farmers table for location
    - Query NISARData table for moisture_index and groundwater_status
    - _Requirements: 13.2_
  
  - [x] 5.3 Implement crop recommendations retrieval
    - Query CropRecommendations table using farmer_id and season composite key
    - Handle missing recommendations gracefully
    - _Requirements: 13.3_
  
  - [x] 5.4 Implement Hindi reasoning generation
    - Created generate_reasoning function
    - Generate context-aware Hindi explanations based on moisture_index and groundwater_status
    - Include water conservation messaging
    - _Requirements: 13.4, 19.1, 20.5_
  
  - [x] 5.5 Implement sustainability alert generation
    - Generate Hindi sustainability alerts for Critical and Low groundwater status
    - Include water conservation recommendations
    - _Requirements: 13.5, 4.4, 19.2_
  
  - [x] 5.6 Implement recursive Decimal conversion
    - Created recursive decimal_to_float function for nested structures
    - Handle arrays and nested objects
    - _Requirements: 13.6_
  
  - [x] 5.7 Implement response formatting with Hindi text
    - Return farmer_id, season, location, moisture_index, groundwater_status, recommended_crops, crops_to_avoid, reasoning, sustainability_alert, last_updated
    - Use ensure_ascii=False to preserve Hindi Unicode characters
    - _Requirements: 13.7, 19.6_
  
  - [x] 5.8 Configure Lambda function settings
    - Runtime: Python 3.11
    - Memory: 512MB
    - Timeout: 10 seconds
    - _Requirements: 13.8_

- [x] 6. Lambda function: get-market-prices
  - [x] 6.1 Implement Lambda handler and parameter extraction
    - Created lambda_functions/get_market_prices/lambda_function.py
    - Handle crop_names array and optional district parameters
    - Support both string (comma-separated) and array formats
    - _Requirements: 14.1_
  
  - [x] 6.2 Create mock price database
    - Implemented PRICE_DATABASE with 10 crops (Moong, Urad, Arhar, Summer Rice, Wheat, Mustard, Bajra, Sugarcane, Potato, Tomato)
    - Include price, trend, and change_percent for each crop
    - _Requirements: 14.2, 5.3_
  
  - [x] 6.3 Implement case-insensitive crop matching
    - Normalize crop names for lookup
    - Handle variations in crop name spelling
    - _Requirements: 14.3_
  
  - [x] 6.4 Implement district-mandi mapping
    - Created DISTRICT_MANDIS dictionary
    - Map district names to mandi (market) names
    - _Requirements: 14.4_
  
  - [x] 6.5 Implement Hindi crop name mapping
    - Created get_hindi_name helper function
    - Map English crop names to Hindi (Devanagari script)
    - _Requirements: 19.3, 19.5_
  
  - [x] 6.6 Implement response formatting
    - Return prices array with crop, crop_hindi, price_per_quintal, mandi, trend, change_percent, unit
    - Include source, last_updated, currency, disclaimer note
    - Handle missing crops with price 0 and note
    - _Requirements: 14.5, 14.6, 14.7, 5.4, 5.5, 5.6_
  
  - [x] 6.7 Configure Lambda function settings
    - Runtime: Python 3.11
    - Memory: 512MB
    - Timeout: 10 seconds
    - _Requirements: 14.8_

- [x] 7. FastAPI backend implementation
  - [x] 7.1 Initialize FastAPI application
    - Created backend/main.py
    - Set API title "Piritiya API" and version "1.0.0"
    - _Requirements: 1.5_
  
  - [x] 7.2 Configure CORS middleware
    - Allow all origins (*)
    - Allow all methods and headers
    - _Requirements: 1.3_
  
  - [x] 7.3 Initialize AWS clients
    - Initialize boto3 lambda_client for Lambda invocations
    - Initialize boto3 dynamodb resource for DynamoDB access
    - Configure AWS_REGION from environment variable (default: us-east-1)
    - _Requirements: 17.1, 17.4_
  
  - [x] 7.4 Create Pydantic request models
    - SoilMoistureRequest (farmer_id)
    - CropAdviceRequest (farmer_id, optional soil_moisture)
    - MarketPriceRequest (optional crop, optional district)
    - _Requirements: 18.1_
  
  - [x] 7.5 Implement Lambda invocation helper
    - Created invoke_lambda function
    - Synchronous invocation (RequestResponse)
    - JSON payload serialization and response parsing
    - Error handling with HTTPException
    - _Requirements: 6.6_
  
  - [x] 7.6 Implement root endpoint (/)
    - Return API metadata and endpoint list
    - _Requirements: 1.1_
  
  - [x] 7.7 Implement health check endpoint (/health)
    - Return service status
    - _Requirements: 1.2_
  
  - [x] 7.8 Implement farmers list endpoint (GET /farmers)
    - Scan Farmers table
    - Return list of all farmer profiles
    - Error handling for DynamoDB access failures
    - _Requirements: 2.1, 2.4_
  
  - [x] 7.9 Implement farmer detail endpoint (GET /farmers/{farmer_id})
    - Get farmer by farmer_id from Farmers table
    - Return 404 if farmer not found
    - Error handling for DynamoDB access failures
    - _Requirements: 2.2, 2.3, 2.5_
  
  - [x] 7.10 Implement soil moisture endpoint (GET /soil-moisture/{farmer_id})
    - Invoke get-soil-moisture Lambda function
    - Pass farmer_id parameter
    - _Requirements: 3.1_
  
  - [x] 7.11 Implement crop advice endpoint (POST /crop-advice)
    - Invoke get-crop-advice Lambda function
    - Pass farmer_id and optional soil_moisture parameters
    - _Requirements: 4.1_
  
  - [x] 7.12 Implement market prices endpoint (GET /market-prices)
    - Invoke get-market-prices Lambda function
    - Pass optional crop and district parameters
    - _Requirements: 5.1_
  
  - [x] 7.13 Implement aggregated advice endpoint (GET /advice/{farmer_id})
    - Invoke get-soil-moisture Lambda to get moisture data
    - Invoke get-crop-advice Lambda with soil_moisture from previous call
    - Invoke get-market-prices Lambda to get current prices
    - Aggregate all responses into single response
    - Error handling for Lambda invocation failures
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [x] 7.14 Implement chatbot endpoint (POST /chat)
    - Generate session_id if not provided (format: "session-{timestamp}")
    - Read BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID from environment
    - Return 500 error if Bedrock not configured
    - Initialize bedrock-agent-runtime client
    - Invoke Bedrock Agent with message and session_id
    - Process streaming response chunks
    - Return response text, session_id, and original message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 7.15 Configure server settings
    - Host: 0.0.0.0
    - Port: 8000
    - _Requirements: 1.4_

- [x] 8. Deployment scripts and IAM configuration
  - [x] 8.1 Create Lambda deployment script
    - Created lambda_functions/deploy.sh
    - Support AWS_REGION environment variable
    - _Requirements: 16.7_
  
  - [x] 8.2 Implement IAM role creation
    - Create PiritiyaLambdaExecutionRole if not exists
    - Create trust policy for Lambda service
    - Attach AWSLambdaBasicExecutionRole policy
    - Attach AmazonDynamoDBFullAccess policy
    - Attach AmazonS3ReadOnlyAccess policy
    - _Requirements: 16.4, 16.5_
  
  - [x] 8.3 Implement Lambda function packaging
    - Install dependencies from requirements.txt to package directory
    - Create deployment zip with dependencies and lambda_function.py
    - Clean up temporary package directory
    - _Requirements: 16.6_
  
  - [x] 8.4 Implement Lambda function deployment
    - Check if function exists (create or update)
    - Create function with Python 3.11 runtime, 512MB memory, 10s timeout
    - Update function code if already exists
    - Deploy all 3 Lambda functions (get-soil-moisture, get-crop-advice, get-market-prices)
    - _Requirements: 16.7_

- [x] 9. Error handling and validation
  - [x] 9.1 Implement FastAPI error handling
    - HTTP 400 for missing required parameters
    - HTTP 404 for resource not found
    - HTTP 500 for AWS service failures
    - Consistent error message format
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 9.2 Implement Lambda error handling
    - KeyError handling for missing required fields (return 400)
    - Generic exception handling (return 500)
    - CloudWatch logging with print statements
    - _Requirements: 18.4, 18.5, 18.6_

- [x] 10. Hindi language support
  - [x] 10.1 Implement Hindi text generation in crop advice
    - Generate reasoning text in Hindi (Devanagari script)
    - Generate sustainability alerts in Hindi
    - _Requirements: 19.1, 19.2_
  
  - [x] 10.2 Implement Hindi crop names in market prices
    - Include crop_hindi field with Hindi crop names
    - _Requirements: 19.3_
  
  - [x] 10.3 Configure JSON serialization for Unicode
    - Use ensure_ascii=False in json.dumps to preserve Unicode characters
    - _Requirements: 19.6_
  
  - [x] 10.4 Add Hindi names in mock data
    - Include farmer names in Hindi (Devanagari script)
    - Include crop names in Hindi (crop_name_hindi field)
    - _Requirements: 19.4, 19.5_

- [x] 11. Water conservation and sustainability features
  - [x] 11.1 Implement sustainability scores
    - Add sustainability_score (0-100) to crop recommendations
    - Base scores on water efficiency
    - _Requirements: 20.1_
  
  - [x] 11.2 Implement Critical groundwater recommendations
    - Recommend crops with water_requirement_mm below 500mm for Critical status
    - Include crops_to_avoid list with high water requirement crops (>1000mm)
    - Add estimated_groundwater_depletion_meters for crops to avoid
    - _Requirements: 20.2, 20.3, 20.4_
  
  - [x] 11.3 Implement water conservation reasoning
    - Generate reasoning that explains water conservation benefits
    - Prioritize nitrogen-fixing crops (Moong, Urad, Arhar) for soil health
    - _Requirements: 20.5, 20.6_

- [x] 12. Testing and documentation
  - [x] 12.1 Create backend requirements.txt
    - FastAPI 0.109.0
    - boto3 1.34.0
    - uvicorn 0.27.0
    - pydantic 2.5.0
    - python-dotenv 1.0.0
  
  - [x] 12.2 Create environment configuration template
    - Created .env.example with AWS_REGION, BEDROCK_AGENT_ID, BEDROCK_AGENT_ALIAS_ID
  
  - [x] 12.3 Create project documentation
    - Created README.md with project overview
    - Created PROJECT_STRUCTURE.md with directory structure
    - Created docs/ directory with setup guides

- [x] 13. Checkpoint - Verify deployment
  - All DynamoDB tables created successfully
  - Mock data loaded into all tables
  - All 3 Lambda functions deployed
  - IAM role and permissions configured
  - FastAPI backend running on port 8000
  - All endpoints tested and working

## Notes

- All tasks are marked as completed [x] since this is a retroactive documentation of existing implementation
- The system is fully functional with mock data
- Bedrock Agent requires manual setup in AWS Console (not fully automated)
- Future enhancements include: authentication, real NISAR data integration, real Agmarknet API integration, CI/CD pipeline, monitoring and alerting
- The implementation prioritizes water conservation and sustainable agriculture in water-stressed regions
- Hindi language support is implemented throughout for farmer-facing content
- Error handling follows consistent patterns across all components
- All Lambda functions use Python 3.11 runtime with 512MB memory and 10 second timeout
- DynamoDB tables use PAY_PER_REQUEST billing mode for cost-effective development

## Implementation Summary

The Piritiya Backend API and Infrastructure was successfully implemented with:
- 1 FastAPI REST API server with 9 endpoints
- 3 AWS Lambda functions for business logic
- 4 DynamoDB tables for data persistence
- Mock data for 3 farmers across different districts
- Hindi language support for farmer-facing content
- Water conservation focus with sustainability scores
- Comprehensive error handling and validation
- Deployment scripts for automated infrastructure setup
- Optional Bedrock Agent integration for conversational AI

Total implementation: 13 major tasks with 60+ sub-tasks completed.
