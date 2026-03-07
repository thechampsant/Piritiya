"""
Lambda Function: get-market-prices
Fetches current market prices from data.gov.in (Current Daily Mandi Price API).
Falls back to mock data if the API is unavailable.
"""

import json
import os
import urllib.request
import urllib.parse
from datetime import datetime

# data.gov.in API (Current Daily Price of Various Commodities from Various Markets)
DATA_GOV_IN_BASE_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
DATA_GOV_IN_API_KEY = os.environ.get(
    "DATA_GOV_IN_API_KEY",
    "579b464db66ec23bdd000001a8f6381be1f3481364682fd412f0383f",
)

# Mock price database (fallback when API fails)
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

# District-wise mandi mapping (for mock fallback)
DISTRICT_MANDIS = {
    'Lucknow': 'Lucknow Mandi',
    'Kanpur': 'Kanpur Mandi',
    'Varanasi': 'Varanasi Mandi',
    'Agra': 'Agra Mandi',
    'Meerut': 'Meerut Mandi'
}


def fetch_data_gov_in(limit=50, offset=0, state_filter=None, district_filter=None, commodity_filter=None):
    """
    GET data.gov.in resource API. Returns (data_dict, None) on success or (None, error_msg) on failure.
    """
    params = {
        "api-key": DATA_GOV_IN_API_KEY,
        "format": "json",
        "limit": limit,
        "offset": offset,
    }
    if state_filter:
        params["filters[state.keyword]"] = state_filter
    if district_filter:
        params["filters[district]"] = district_filter
    if commodity_filter:
        params["filters[commodity]"] = commodity_filter
    url = DATA_GOV_IN_BASE_URL + "?" + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status != 200:
                return None, f"API returned HTTP {resp.status}"
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            records = data.get("records") if isinstance(data.get("records"), list) else []
            return {"records": records, "data": data}, None
    except Exception as e:
        return None, str(e)


def map_record_to_price(record):
    """Map one data.gov.in record to our price object shape."""
    commodity = (record.get("commodity") or "").strip() or "Unknown"
    market = (record.get("market") or "").strip() or "Unknown"
    modal = record.get("modal_price")
    if modal is not None:
        try:
            price_per_quintal = int(float(modal))
        except (TypeError, ValueError):
            price_per_quintal = 0
    else:
        min_p = record.get("min_price")
        max_p = record.get("max_price")
        try:
            if min_p is not None and max_p is not None:
                price_per_quintal = int((float(min_p) + float(max_p)) / 2)
            else:
                price_per_quintal = 0
        except (TypeError, ValueError):
            price_per_quintal = 0
    return {
        "crop": commodity,
        "crop_hindi": get_hindi_name(commodity),
        "price_per_quintal": price_per_quintal,
        "mandi": market,
        "trend": "Unknown",
        "change_percent": 0,
        "unit": "per quintal (100 kg)",
    }


def build_result_from_api(records, district=None, mandi=None, crop_names=None):
    """Build the standard result dict from API records, optionally filtering by crop_names."""
    prices = []
    for rec in records:
        p = map_record_to_price(rec)
        if crop_names:
            if not any(c and c.strip().lower() == (p["crop"] or "").lower() for c in crop_names):
                continue
        prices.append(p)
    first_district = (records[0].get("district") or "").strip() if records else ""
    first_market = (records[0].get("market") or "").strip() if records else ""
    return {
        "prices": prices,
        "district": district or first_district or "N/A",
        "mandi": mandi or first_market or "N/A",
        "source": "data.gov.in",
        "last_updated": datetime.now().isoformat(),
        "currency": "INR",
        "note": "Prices from Current Daily Price of Various Commodities from Various Markets (Mandi).",
    }


def run_mock_fallback(crop_names, district):
    """Return result using PRICE_DATABASE mock."""
    mandi = DISTRICT_MANDIS.get(district, f"{district} Mandi")
    prices = []
    for crop_name in crop_names:
        crop_key = crop_name.strip()
        price_data = None
        for key, value in PRICE_DATABASE.items():
            if key.lower() == crop_key.lower():
                price_data = value
                crop_key = key
                break
        if price_data:
            prices.append({
                "crop": crop_key,
                "crop_hindi": get_hindi_name(crop_key),
                "price_per_quintal": price_data["price"],
                "mandi": mandi,
                "trend": price_data["trend"],
                "change_percent": price_data["change_percent"],
                "unit": "per quintal (100 kg)",
            })
        else:
            prices.append({
                "crop": crop_key,
                "price_per_quintal": 0,
                "mandi": mandi,
                "trend": "Unknown",
                "change_percent": 0,
                "note": "Price data not available",
            })
    return {
        "prices": prices,
        "district": district,
        "mandi": mandi,
        "source": "Agmarknet (Simulated)",
        "last_updated": datetime.now().isoformat(),
        "currency": "INR",
        "note": "Prices are indicative and may vary by quality and variety",
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
    # Detect Bedrock Agent invocation first (so we always return correct response format)
    event = event or {}
    is_bedrock_agent = isinstance(event, dict) and (
        "parameters" in event or "actionGroup" in event or event.get("messageVersion") == "1.0"
    )

    try:
        crop_names = None
        district = "Lucknow"

        if is_bedrock_agent:
            for param in event.get("parameters") or []:
                pname = param.get("name") if isinstance(param, dict) else None
                value = param.get("value") if isinstance(param, dict) else None
                if pname == "crop_names":
                    if isinstance(value, str):
                        crop_names = [c.strip() for c in value.split(",") if c.strip()]
                    else:
                        crop_names = value if isinstance(value, list) else []
                elif pname == "district" and value:
                    district = value
            # Optional: parse from requestBody if Bedrock sends body params there
            req_body = event.get("requestBody") or {}
            content = (req_body.get("content") or {}).get("application/json") or {}
            for prop in content.get("properties") or []:
                if isinstance(prop, dict):
                    if prop.get("name") == "crop_names" and "value" in prop:
                        v = prop["value"]
                        crop_names = [c.strip() for c in str(v).split(",") if c.strip()] if v else (crop_names or [])
                    elif prop.get("name") == "district" and prop.get("value"):
                        district = prop["value"]
        else:
            crop_names = event.get("crop_names") or []
            district = event.get("district") or "Lucknow"
            if not crop_names and event.get("crop"):
                crop_names = [event["crop"].strip()] if event["crop"] else []

        # Optional filters for data.gov.in (state for UP districts)
        state_filter = None
        district_filter = None
        if district:
            district_filter = district
            if district in DISTRICT_MANDIS or "Lucknow" in (district or ""):
                state_filter = "Uttar Pradesh"

        # Try data.gov.in API first (filter by crop_names in code after fetch)
        data, err = fetch_data_gov_in(
            limit=50,
            offset=0,
            state_filter=state_filter,
            district_filter=district_filter,
            commodity_filter=None,
        )
        if data and data.get("records"):
            mandi = (data["records"][0].get("market") or "").strip() if data["records"] else (DISTRICT_MANDIS.get(district, f"{district} Mandi"))
            result = build_result_from_api(
                data["records"],
                district=district,
                mandi=mandi,
                crop_names=crop_names if crop_names else None,
            )
        else:
            # Fallback to mock: need at least one crop for mock
            mock_crops = crop_names if crop_names else list(PRICE_DATABASE.keys())[:5]
            result = run_mock_fallback(mock_crops, district)

        result_json = json.dumps(result, ensure_ascii=False)
        body_str = result_json if isinstance(result_json, str) else json.dumps(result_json)

        # Return Bedrock Agent format if called by agent (required to avoid dependencyFailedException)
        if is_bedrock_agent:
            return {
                "messageVersion": "1.0",
                "response": {
                    "actionGroup": event.get("actionGroup") or "MarketPricesActionGroup",
                    "function": event.get("function") or "get_market_prices",
                    "functionResponse": {
                        "responseBody": {
                            "TEXT": {
                                "body": body_str
                            }
                        }
                    }
                }
            }

        # Return standard format for direct invocation only
        return {
            "statusCode": 200,
            "body": body_str
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        error_msg = json.dumps({"error": f"Internal server error: {str(e)}"})
        if is_bedrock_agent:
            return {
                "messageVersion": "1.0",
                "response": {
                    "actionGroup": event.get("actionGroup") or "MarketPricesActionGroup",
                    "function": event.get("function") or "get_market_prices",
                    "functionResponse": {
                        "responseBody": {
                            "TEXT": {
                                "body": error_msg
                            }
                        }
                    }
                }
            }
        return {"statusCode": 500, "body": error_msg}

def get_hindi_name(crop_name):
    """Get Hindi name for crop (used for display; unknown commodities returned as-is)."""
    if not crop_name:
        return crop_name or ""
    hindi_names = {
        "Moong": "मूंग",
        "Urad": "उड़द",
        "Arhar": "अरहर",
        "Summer Rice": "गर्मी का धान",
        "Wheat": "गेहूं",
        "Mustard": "सरसों",
        "Bajra": "बाजरा",
        "Sugarcane": "गन्ना",
        "Potato": "आलू",
        "Tomato": "टमाटर",
        "Onion": "प्याज",
        "Brinjal": "बैंगन",
        "Cluster beans": "ग्वार फली",
    }
    return hindi_names.get(crop_name, crop_name)
