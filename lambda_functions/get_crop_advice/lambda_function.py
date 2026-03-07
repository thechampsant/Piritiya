"""
Lambda Function: get-crop-advice
Provides crop recommendations based on soil moisture and season
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [decimal_to_float(item) for item in obj]
    return obj

def generate_reasoning(moisture_index, groundwater_status, season):
    """Generate human-readable reasoning for recommendations"""
    
    if groundwater_status == 'Critical' and moisture_index < 40:
        return (
            f"आपके क्षेत्र में भूजल स्तर गंभीर (Critical) है और मिट्टी की नमी केवल {moisture_index}% है। "
            f"पानी की अधिक खपत वाली फसलें जैसे गर्मी का धान लगाने से भूजल और कम हो जाएगा। "
            f"हम कम पानी में उगने वाली फसलों की सलाह देते हैं जो 60-70% कम पानी में उगाई जा सकती हैं।"
        )
    elif groundwater_status == 'Low' and moisture_index < 50:
        return (
            f"आपके क्षेत्र में भूजल स्तर कम (Low) है और मिट्टी की नमी {moisture_index}% है। "
            f"मध्यम पानी की आवश्यकता वाली फसलें उपयुक्त हैं। "
            f"अधिक पानी वाली फसलों से बचें।"
        )
    elif groundwater_status == 'Moderate':
        return (
            f"आपके क्षेत्र में भूजल स्तर मध्यम (Moderate) है और मिट्टी की नमी {moisture_index}% है। "
            f"आप विभिन्न प्रकार की फसलें उगा सकते हैं, लेकिन जल संरक्षण का ध्यान रखें।"
        )
    else:
        return (
            f"आपके क्षेत्र में भूजल स्तर अच्छा (Good) है और मिट्टी की नमी {moisture_index}% है। "
            f"आप अपनी पसंद की फसलें उगा सकते हैं।"
        )

def lambda_handler(event, context):
    """
    Get crop recommendations for a farmer
    
    Input from Bedrock Agent:
    {
        "messageVersion": "1.0",
        "actionGroup": "CropAdviceActionGroup",
        "function": "get_crop_advice",
        "parameters": [
            {"name": "farmer_id", "type": "string", "value": "UP-LUCKNOW-MALIHABAD-00001"},
            {"name": "season", "type": "string", "value": "Zaid"}
        ]
    }
    
    Output for Bedrock Agent:
    {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": "CropAdviceActionGroup",
            "function": "get_crop_advice",
            "functionResponse": {
                "responseBody": {
                    "TEXT": {
                        "body": "JSON string with crop recommendations"
                    }
                }
            }
        }
    }
    """
    
    try:
        # Extract parameters
        farmer_id = None
        season = None
        is_bedrock_agent = False
        
        # Handle Bedrock Agent format (new format with parameters)
        if 'parameters' in event:
            is_bedrock_agent = True
            for param in event['parameters']:
                if param['name'] == 'farmer_id':
                    farmer_id = param['value']
                elif param['name'] == 'season':
                    season = param['value']
        # Handle direct invocation
        else:
            farmer_id = event.get('farmer_id')
            season = event.get('season')
        
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
        
        # Get farmer location
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
        
        # Get NISAR data for moisture and groundwater status
        nisar_table = dynamodb.Table('NISARData')
        nisar_response = nisar_table.query(
            KeyConditionExpression='location_block = :location',
            ExpressionAttributeValues={':location': location_block},
            ScanIndexForward=False,
            Limit=1
        )
        
        if not nisar_response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': f'No NISAR data found for {location_block}'})
            }
        
        nisar_data = nisar_response['Items'][0]
        moisture_index = int(nisar_data['moisture_index'])
        groundwater_status = nisar_data['groundwater_status']['status']
        
        # Get crop recommendations from cache
        recommendations_table = dynamodb.Table('CropRecommendations')
        
        # If season not provided, use current season from farmer data
        if not season:
            season = farmer_data.get('current_season', 'Zaid (Summer)')
        
        rec_response = recommendations_table.get_item(
            Key={
                'farmer_id': farmer_id,
                'season': season
            }
        )
        
        if 'Item' in rec_response:
            recommendations = rec_response['Item']
        else:
            # Return empty recommendations if not found
            recommendations = {
                'recommended_crops': [],
                'crops_to_avoid': []
            }
        
        # Generate reasoning
        reasoning = generate_reasoning(moisture_index, groundwater_status, season)
        
        # Generate sustainability alert
        sustainability_alert = None
        if groundwater_status in ['Critical', 'Low']:
            sustainability_alert = (
                "⚠️ चेतावनी: आपके क्षेत्र में भूजल संकट है। "
                "कृपया पानी की बचत करने वाली फसलें चुनें और ड्रिप सिंचाई का उपयोग करें।"
            )
        
        # Construct result
        result = {
            'farmer_id': farmer_id,
            'season': season,
            'location': f"{location['block']}, {location['district']}",
            'moisture_index': moisture_index,
            'groundwater_status': groundwater_status,
            'recommended_crops': decimal_to_float(recommendations.get('recommended_crops', [])),
            'crops_to_avoid': decimal_to_float(recommendations.get('crops_to_avoid', [])),
            'reasoning': reasoning,
            'sustainability_alert': sustainability_alert,
            'last_updated': recommendations.get('last_updated', datetime.now().isoformat())
        }
        
        result_json = json.dumps(result, ensure_ascii=False)
        
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
