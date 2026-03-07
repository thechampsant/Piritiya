# Workaround: Chatbot Without Bedrock Agent

Since we're having persistent permission issues with Bedrock Agent, here's a working alternative that gives you 80% of the functionality:

## Simple Chatbot Using Direct Lambda Calls

Instead of using Bedrock Agent for orchestration, we can:
1. Parse user intent in FastAPI
2. Call appropriate Lambda functions directly
3. Format responses conversationally

This works with your current permissions!

## Implementation

```python
# Add to backend/main.py

import re

@app.post("/chat-simple")
async def simple_chat(message: str, session_id: Optional[str] = None):
    """
    Simple chatbot without Bedrock Agent
    Uses pattern matching to route to appropriate Lambda functions
    """
    from datetime import datetime
    
    if not session_id:
        session_id = f"session-{int(datetime.now().timestamp())}"
    
    message_lower = message.lower()
    
    # Extract farmer ID if present
    farmer_id_match = re.search(r'(UP-[A-Z]+-[A-Z]+-\d+|F\d+)', message, re.IGNORECASE)
    farmer_id = farmer_id_match.group(1) if farmer_id_match else None
    
    response_text = ""
    
    try:
        # Pattern 1: Soil moisture query
        if any(word in message_lower for word in ['soil', 'moisture', 'नमी', 'मिट्टी']):
            if farmer_id:
                result = invoke_lambda('get-soil-moisture', {'farmer_id': farmer_id})
                if result.get('statusCode') == 200:
                    import json
                    data = json.loads(result['body'])
                    response_text = f"Soil moisture for {farmer_id}:\n"
                    response_text += f"- Moisture Index: {data['moisture_index']}%\n"
                    response_text += f"- Category: {data['moisture_category']}\n"
                    response_text += f"- Groundwater Status: {data['groundwater_status']}\n"
                    response_text += f"- Trend: {data['trend']}\n"
                else:
                    response_text = "Farmer not found. Please check the Farmer ID."
            else:
                response_text = "Please provide your Farmer ID to check soil moisture."
        
        # Pattern 2: Crop advice query
        elif any(word in message_lower for word in ['crop', 'plant', 'फसल', 'सलाह', 'recommendation']):
            if farmer_id:
                result = invoke_lambda('get-crop-advice', {'farmer_id': farmer_id})
                if result.get('statusCode') == 200:
                    import json
                    data = json.loads(result['body'])
                    response_text = f"Crop recommendations for {farmer_id}:\n\n"
                    response_text += f"Season: {data['season']}\n"
                    response_text += f"Location: {data['location']}\n\n"
                    response_text += "Recommended Crops:\n"
                    for crop in data['recommended_crops'][:2]:
                        response_text += f"- {crop['crop_name']} ({crop['crop_name_hindi']})\n"
                        response_text += f"  Water: {crop['water_requirement_mm']}mm\n"
                        response_text += f"  Price: ₹{crop['market_price_per_quintal']}/quintal\n"
                        response_text += f"  Reason: {crop['reason']}\n\n"
                    
                    if data.get('reasoning'):
                        response_text += f"\n{data['reasoning']}\n"
                    
                    if data.get('sustainability_alert'):
                        response_text += f"\n{data['sustainability_alert']}"
                else:
                    response_text = "Could not get crop advice. Please check Farmer ID."
            else:
                response_text = "Please provide your Farmer ID for crop recommendations."
        
        # Pattern 3: Market prices query
        elif any(word in message_lower for word in ['price', 'market', 'कीमत', 'बाजार']):
            result = invoke_lambda('get-market-prices', {})
            if result.get('statusCode') == 200:
                import json
                data = json.loads(result['body'])
                response_text = "Current Market Prices:\n\n"
                for price in data.get('prices', [])[:5]:
                    response_text += f"- {price['crop_name']}: ₹{price['price_per_quintal']}/quintal\n"
                    response_text += f"  Market: {price['market_name']}, {price['district']}\n\n"
            else:
                response_text = "Could not fetch market prices."
        
        # Pattern 4: General greeting
        elif any(word in message_lower for word in ['hello', 'hi', 'नमस्ते', 'help']):
            response_text = """Hello! I'm Piritiya, your agricultural advisor.

I can help you with:
1. Soil moisture status - Ask: "What is my soil moisture?" (provide Farmer ID)
2. Crop recommendations - Ask: "What crops should I plant?"
3. Market prices - Ask: "What are current market prices?"

Please provide your Farmer ID (format: UP-DISTRICT-BLOCK-XXXXX) for personalized advice."""
        
        else:
            response_text = "I can help you with soil moisture, crop recommendations, and market prices. What would you like to know?"
        
        return {
            "response": response_text,
            "session_id": session_id,
            "message": message,
            "farmer_id": farmer_id
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## Test It

```bash
# Restart the server
# Then test:
curl -X POST "http://localhost:8000/chat-simple?message=What%20is%20the%20soil%20moisture%20for%20farmer%20UP-LUCKNOW-MALIHABAD-00001"
```

## Benefits

✅ Works with current permissions  
✅ No Bedrock Agent needed  
✅ Fast responses  
✅ Easy to customize  
✅ Can add more patterns as needed  

## Limitations

❌ Not as intelligent as Bedrock Agent  
❌ Pattern matching instead of AI reasoning  
❌ Can't handle complex multi-step queries  

## When to Use This

- **Now:** Get your chatbot working immediately
- **Later:** Switch to Bedrock Agent once permissions are sorted

This gives you a working chatbot interface while we figure out the Bedrock permissions!
