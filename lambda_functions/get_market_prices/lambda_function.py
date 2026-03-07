"""
Lambda Function: get-market-prices
Fetches current market prices for crops (simulating Agmarknet)
"""

import json
from datetime import datetime

# Mock price database (simulating Agmarknet API)
PRICE_DATABASE = {
    'Moong': {'price': 7500, 'trend': 'Stable', 'change_percent': 0},
    'Urad': {'price': 8200, 'trend': 'Rising', 'change_percent': 5},
    'Arhar': {'price': 6800, 'trend': 'Stable', 'change_percent': 0},
    'Summer Rice': {'price': 2100, 'trend': 'Falling', 'change_percent': -3},
    'Wheat': {'price': 2100, 'trend': 'Stable', 'change_percent': 0},
    'Mustard': {'price': 5500, 'trend': 'Rising', 'change_percent': 8},
    'Bajra': {'price': 2500, 'trend': 'Stable', 'change_percent': 0},
    'Sugarcane': {'price': 350, 'trend': 'Stable', 'change_percent': 0},  # per quintal
    'Potato': {'price': 1200, 'trend': 'Falling', 'change_percent': -10},
    'Tomato': {'price': 2500, 'trend': 'Rising', 'change_percent': 15}
}

# District-wise mandi mapping
DISTRICT_MANDIS = {
    'Lucknow': 'Lucknow Mandi',
    'Kanpur': 'Kanpur Mandi',
    'Varanasi': 'Varanasi Mandi',
    'Agra': 'Agra Mandi',
    'Meerut': 'Meerut Mandi'
}

def lambda_handler(event, context):
    """
    Fetch market prices for specified crops
    
    Input from Bedrock Agent:
    {
        "messageVersion": "1.0",
        "actionGroup": "MarketPricesActionGroup",
        "function": "get_market_prices",
        "parameters": [
            {"name": "crop_names", "type": "string", "value": "Moong,Urad"},
            {"name": "district", "type": "string", "value": "Lucknow"}
        ]
    }
    
    Output for Bedrock Agent:
    {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": "MarketPricesActionGroup",
            "function": "get_market_prices",
            "functionResponse": {
                "responseBody": {
                    "TEXT": {
                        "body": "JSON string with market prices"
                    }
                }
            }
        }
    }
    """
    
    try:
        # Extract parameters
        crop_names = None
        district = 'Lucknow'  # Default
        is_bedrock_agent = False
        
        # Handle Bedrock Agent format (new format with parameters)
        if 'parameters' in event:
            is_bedrock_agent = True
            for param in event['parameters']:
                if param['name'] == 'crop_names':
                    # Handle both string and list formats
                    value = param['value']
                    if isinstance(value, str):
                        crop_names = [c.strip() for c in value.split(',')]
                    else:
                        crop_names = value
                elif param['name'] == 'district':
                    district = param['value']
        # Handle direct invocation
        else:
            crop_names = event.get('crop_names', [])
            district = event.get('district', 'Lucknow')
        
        if not crop_names:
            error_msg = json.dumps({'error': 'crop_names is required'})
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
        
        # Get mandi name
        mandi = DISTRICT_MANDIS.get(district, f"{district} Mandi")
        
        # Fetch prices for each crop
        prices = []
        for crop_name in crop_names:
            # Normalize crop name (handle variations)
            crop_key = crop_name.strip()
            
            # Try to find in database (case-insensitive)
            price_data = None
            for key, value in PRICE_DATABASE.items():
                if key.lower() == crop_key.lower():
                    price_data = value
                    crop_key = key
                    break
            
            if price_data:
                prices.append({
                    'crop': crop_key,
                    'crop_hindi': get_hindi_name(crop_key),
                    'price_per_quintal': price_data['price'],
                    'mandi': mandi,
                    'trend': price_data['trend'],
                    'change_percent': price_data['change_percent'],
                    'unit': 'per quintal (100 kg)'
                })
            else:
                # Return unknown price
                prices.append({
                    'crop': crop_key,
                    'price_per_quintal': 0,
                    'mandi': mandi,
                    'trend': 'Unknown',
                    'change_percent': 0,
                    'note': 'Price data not available'
                })
        
        result = {
            'prices': prices,
            'district': district,
            'mandi': mandi,
            'source': 'Agmarknet (Simulated)',
            'last_updated': datetime.now().isoformat(),
            'currency': 'INR',
            'note': 'Prices are indicative and may vary by quality and variety'
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

def get_hindi_name(crop_name):
    """Get Hindi name for crop"""
    hindi_names = {
        'Moong': 'मूंग',
        'Urad': 'उड़द',
        'Arhar': 'अरहर',
        'Summer Rice': 'गर्मी का धान',
        'Wheat': 'गेहूं',
        'Mustard': 'सरसों',
        'Bajra': 'बाजरा',
        'Sugarcane': 'गन्ना',
        'Potato': 'आलू',
        'Tomato': 'टमाटर'
    }
    return hindi_names.get(crop_name, crop_name)
