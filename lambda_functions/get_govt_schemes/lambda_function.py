"""
Lambda Function: get-govt-schemes
Returns government schemes for farmers: DynamoDB-first by district, hardcoded fallback, farmer-profile filtering.
"""

import json
import boto3
import os
from decimal import Decimal
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

SCHEMES = [
    {
        "name": "PM-KISAN",
        "emoji": "💰",
        "benefit": "₹6,000/year direct to bank account",
        "eligibility": "All small and marginal farmers",
        "how_to_apply": "pmkisan.gov.in or nearest CSC center",
        "deadline": "Ongoing"
    },
    {
        "name": "PMFBY — Crop Insurance",
        "emoji": "🛡️",
        "benefit": "Full crop loss coverage, 1.5% premium for Rabi",
        "eligibility": "All farmers growing notified crops",
        "how_to_apply": "pmfby.gov.in or bank branch before sowing",
        "deadline": "Enroll before sowing season"
    },
    {
        "name": "Kisan Credit Card",
        "emoji": "💳",
        "benefit": "Loan up to ₹3 lakh at 4% interest",
        "eligibility": "All farmers with land records",
        "how_to_apply": "Any nationalized bank with land documents",
        "deadline": "Ongoing"
    },
    {
        "name": "PM Kusum — Solar Pump",
        "emoji": "☀️",
        "benefit": "90% subsidy on solar irrigation pump",
        "eligibility": "Farmers with no grid electricity or high bills",
        "how_to_apply": "upagricultural.com or District Agriculture Office",
        "deadline": "Apply before March 31"
    },
    {
        "name": "Mukhyamantri Krishak Durghatna Kalyan Yojana",
        "emoji": "🏥",
        "benefit": "₹5 lakh accident insurance for farmer and family",
        "eligibility": "All UP farmers",
        "how_to_apply": "Tehsil office with Khatoni and Aadhaar",
        "deadline": "Ongoing"
    },
    {
        "name": "Soil Health Card",
        "emoji": "🧪",
        "benefit": "Free soil testing + fertilizer recommendation",
        "eligibility": "All farmers",
        "how_to_apply": "Nearest Krishi Vigyan Kendra",
        "deadline": "Ongoing"
    }
]


def decimal_to_native(obj):
    if isinstance(obj, Decimal):
        return float(obj) if obj % 1 else int(obj)
    if isinstance(obj, dict):
        return {k: decimal_to_native(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [decimal_to_native(item) for item in obj]
    return obj


def normalize_db_scheme(item):
    """Map DynamoDB item to same shape as hardcoded scheme."""
    return {
        "name": item.get("name") or item.get("scheme_name") or "",
        "emoji": item.get("emoji") or "📋",
        "benefit": item.get("benefit") or "",
        "eligibility": item.get("eligibility") or "",
        "how_to_apply": item.get("how_to_apply") or item.get("application_method") or "",
        "deadline": item.get("deadline") or "Ongoing"
    }


def get_schemes_from_dynamodb(district):
    """Query GovtSchemes by district. Return list of schemes or empty on any failure."""
    try:
        table = dynamodb.Table('GovtSchemes')
        response = table.query(KeyConditionExpression=Key('district').eq(district))
        items = response.get('Items') or []
        return [normalize_db_scheme(decimal_to_native(item)) for item in items]
    except Exception:
        return []


def get_farmer_profile(farmer_id):
    """Fetch farmer from Farmers table. Return item dict or None."""
    try:
        table = dynamodb.Table('Farmers')
        response = table.get_item(Key={'farmer_id': farmer_id})
        item = response.get('Item')
        return decimal_to_native(item) if item else None
    except Exception:
        return None


def farmer_has_kharif_crops(farmer):
    """True if farmer has Rice or Sugarcane in recommended_crops, crops_to_avoid, or similar."""
    if not farmer or not isinstance(farmer, dict):
        return False
    crop_lists = [
        farmer.get('recommended_crops') or [],
        farmer.get('crops_to_avoid') or [],
        farmer.get('current_crops') or [],
    ]
    for lst in crop_lists:
        if not isinstance(lst, list):
            continue
        for c in lst:
            name = (c.get('crop_name') or c.get('crop_name_hindi') or c) if isinstance(c, dict) else str(c)
            if not isinstance(name, str):
                continue
            name_lower = name.lower()
            if 'rice' in name_lower or 'sugarcane' in name_lower or 'धान' in name or 'गन्ना' in name:
                return True
    return False


def farmer_mentions_solar(farmer):
    """True if profile mentions solar (e.g. irrigation_source)."""
    if not farmer or not isinstance(farmer, dict):
        return False
    irrigation = (farmer.get('land_details') or {}).get('irrigation_source') or ''
    if isinstance(irrigation, str) and 'solar' in irrigation.lower():
        return True
    profile_str = json.dumps(farmer, default=str).lower()
    return 'solar' in profile_str


def is_up_state(farmer):
    """True if farmer is in Uttar Pradesh."""
    if not farmer or not isinstance(farmer, dict):
        return False
    state = (farmer.get('location') or {}).get('state') or ''
    return 'uttar pradesh' in state.lower() or 'up' == state.strip().upper()


def filter_schemes_by_profile(schemes, farmer):
    """
    Apply inclusion rules:
    - Land < 2 ha → include PM-KISAN
    - Kharif (Rice/Sugarcane) → include PMFBY and add Kharif deadline note
    - No solar mentioned → include PM Kusum
    - UP state → include Mukhyamantri
    - Always include PMFBY, KCC and Soil Health Card
    """
    if not schemes:
        return schemes
    land_hectares = None
    if farmer and isinstance(farmer, dict):
        land_hectares = (farmer.get('land_details') or {}).get('total_area_hectares')
        if land_hectares is not None and not isinstance(land_hectares, (int, float)):
            land_hectares = None

    include_pm_kisan = land_hectares is not None and land_hectares < 2
    kharif_crops = farmer_has_kharif_crops(farmer)
    include_pm_kusum = not farmer_mentions_solar(farmer)
    include_mukhyamantri = is_up_state(farmer)

    result = []
    for s in schemes:
        name = (s.get('name') or '').strip()
        if 'PM-KISAN' in name or name == 'PM-KISAN':
            if include_pm_kisan:
                result.append(s)
        elif 'PMFBY' in name or 'Crop Insurance' in name:
            scheme_copy = dict(s)
            if kharif_crops:
                scheme_copy['deadline'] = (scheme_copy.get('deadline') or '') + ' (PMFBY Kharif deadline)'
            result.append(scheme_copy)
        elif 'Kisan Credit' in name or 'KCC' in name or 'Soil Health' in name:
            result.append(s)
        elif 'Kusum' in name or 'Solar' in name:
            if include_pm_kusum:
                result.append(s)
        elif 'Mukhyamantri' in name or 'Durghatna' in name:
            if include_mukhyamantri:
                result.append(s)
        else:
            result.append(s)
    return result


def build_formatted_summary(schemes):
    """Build a single string for Bedrock with each scheme clearly separated."""
    lines = []
    for i, s in enumerate(schemes):
        if i > 0:
            lines.append("---")
        lines.append(f"{s.get('emoji', '')} **{s.get('name', '')}**")
        lines.append(f"Benefit: {s.get('benefit', '')}")
        lines.append(f"Eligibility: {s.get('eligibility', '')}")
        lines.append(f"How to apply: {s.get('how_to_apply', '')}")
        lines.append(f"Deadline: {s.get('deadline', '')}")
    return "\n".join(lines)


def lambda_handler(event, context):
    """
    get-govt-schemes: DynamoDB-first by district, hardcoded fallback, farmer filtering.
    Returns formatted string for Bedrock and raw schemes array for frontend.
    """
    event = event or {}
    is_bedrock_agent = isinstance(event, dict) and (
        'parameters' in event or 'actionGroup' in event or event.get('messageVersion') == '1.0'
    )

    farmer_id = None
    district = None

    if is_bedrock_agent:
        for param in event.get('parameters') or []:
            if isinstance(param, dict) and param.get('name') == 'farmer_id':
                farmer_id = param.get('value')
            elif isinstance(param, dict) and param.get('name') == 'district':
                district = param.get('value')
    else:
        farmer_id = event.get('farmer_id')
        district = event.get('district')

    farmer = get_farmer_profile(farmer_id) if farmer_id else None
    if farmer and not district:
        district = (farmer.get('location') or {}).get('district') or 'Lucknow'
    if not district:
        district = 'Lucknow'

    schemes_from_db = get_schemes_from_dynamodb(district)
    if schemes_from_db:
        schemes = schemes_from_db
    else:
        schemes = [dict(s) for s in SCHEMES]

    schemes = filter_schemes_by_profile(schemes, farmer)
    formatted_summary = build_formatted_summary(schemes)

    response_body = {
        "formatted_summary": formatted_summary,
        "schemes": schemes,
        "district": district
    }
    body_str = json.dumps(response_body, ensure_ascii=False)

    if is_bedrock_agent:
        return {
            "messageVersion": "1.0",
            "response": {
                "actionGroup": event.get("actionGroup", "GovtSchemesActionGroup"),
                "function": event.get("function", "get_govt_schemes"),
                "functionResponse": {
                    "responseBody": {
                        "TEXT": {
                            "body": body_str
                        }
                    }
                }
            }
        }
    return {
        "statusCode": 200,
        "body": body_str
    }
