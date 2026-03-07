"""
Lambda Function: get-soil-moisture
Fetches soil moisture data for a specific farmer from DynamoDB
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Helper function to convert Decimal to float for JSON serialization
def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Fetch soil moisture data for a farmer
    
    Input from Bedrock Agent:
    {
        "messageVersion": "1.0",
        "agent": {...},
        "actionGroup": "SoilMoistureActionGroup",
        "function": "get_soil_moisture",
        "parameters": [
            {"name": "farmer_id", "type": "string", "value": "UP-LUCKNOW-MALIHABAD-00001"}
        ]
    }
    
    Output for Bedrock Agent:
    {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": "SoilMoistureActionGroup",
            "function": "get_soil_moisture",
            "functionResponse": {
                "responseBody": {
                    "TEXT": {
                        "body": "JSON string with soil moisture data"
                    }
                }
            }
        }
    }
    """
    
    try:
        # Extract farmer_id from event
        farmer_id = None
        is_bedrock_agent = False
        
        # Handle Bedrock Agent format (new format with parameters)
        if 'parameters' in event:
            is_bedrock_agent = True
            for param in event['parameters']:
                if param['name'] == 'farmer_id':
                    farmer_id = param['value']
                    break
        # Handle direct invocation format
        elif 'farmer_id' in event:
            farmer_id = event['farmer_id']
        
        if not farmer_id:
            error_msg = json.dumps({'error': 'farmer_id is required'})
            if is_bedrock_agent:
                return {
                    "messageVersion": "1.0",
                    "response": {
                        "actionGroup": event.get("actionGroup", ""),
                        "function": event.get("function", ""),
                        "functionResponse": {
                            "responseBody": {
                                "TEXT": {
                                    "body": error_msg
                                }
                            }
                        }
                    }
                }
            return {
                'statusCode': 400,
                'body': error_msg
            }
        
        # Get farmer data to find location
        farmers_table = dynamodb.Table('Farmers')
        farmer_response = farmers_table.get_item(Key={'farmer_id': farmer_id})
        
        if 'Item' not in farmer_response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'Farmer {farmer_id} not found'})
            }
        
        farmer_data = farmer_response['Item']
        location = farmer_data['location']
        location_block = f"{location['district']}-{location['block']}"
        
        # Get NISAR data from NISARData table
        nisar_table = dynamodb.Table('NISARData')
        
        # Query for latest data for this location
        nisar_response = nisar_table.query(
            KeyConditionExpression='location_block = :location',
            ExpressionAttributeValues={
                ':location': location_block
            },
            ScanIndexForward=False,  # Sort descending by date
            Limit=1
        )
        
        if not nisar_response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'No NISAR data found for location {location_block}'})
            }
        
        nisar_data = nisar_response['Items'][0]
        
        # Construct response
        result = {
            'moisture_index': int(nisar_data['moisture_index']),
            'moisture_category': nisar_data['moisture_category'],
            'trend': nisar_data.get('trend', 'Unknown'),
            'groundwater_status': nisar_data['groundwater_status']['status'],
            'groundwater_depth_meters': float(nisar_data['groundwater_status']['depth_meters']),
            'depletion_rate_cm_per_year': float(nisar_data['groundwater_status']['depletion_rate_cm_per_year']),
            'measurement_date': nisar_data['measurement_date'],
            'location': f"{location['block']}, {location['district']}",
            'village': location.get('village', 'N/A'),
            'data_source': 'NISAR Satellite (100m resolution)',
            's3_raw_data_path': nisar_data.get('s3_raw_data_path', '')
        }
        
        result_json = json.dumps(result, default=decimal_to_float)
        
        # Return Bedrock Agent format if called by agent
        if is_bedrock_agent:
            return {
                "messageVersion": "1.0",
                "response": {
                    "actionGroup": event.get("actionGroup", ""),
                    "function": event.get("function", ""),
                    "functionResponse": {
                        "responseBody": {
                            "TEXT": {
                                "body": result_json
                            }
                        }
                    }
                }
            }
        
        # Return standard format for direct invocation
        return {
            'statusCode': 200,
            'body': result_json
        }
        
    except KeyError as e:
        error_msg = json.dumps({'error': f'Missing required field: {str(e)}'})
        if is_bedrock_agent:
            return {
                "messageVersion": "1.0",
                "response": {
                    "actionGroup": event.get("actionGroup", ""),
                    "function": event.get("function", ""),
                    "functionResponse": {
                        "responseBody": {
                            "TEXT": {
                                "body": error_msg
                            }
                        }
                    }
                }
            }
        return {
            'statusCode': 400,
            'body': error_msg
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        error_msg = json.dumps({'error': f'Internal server error: {str(e)}'})
        if is_bedrock_agent:
            return {
                "messageVersion": "1.0",
                "response": {
                    "actionGroup": event.get("actionGroup", ""),
                    "function": event.get("function", ""),
                    "functionResponse": {
                        "responseBody": {
                            "TEXT": {
                                "body": error_msg
                            }
                        }
                    }
                }
            }
        return {
            'statusCode': 500,
            'body': error_msg
        }
